import * as ast from "./ast";
import * as ops from "./ops";
import * as err from "./errors";



const isDev: boolean = process.env.NODE_ENV === 'development';
const log = isDev ? console.log.bind(null, "[TypeChecker]") : () => {};



enum Type {
	Null = "Null",
	Int = "Int",
	Float = "Float",
	Str = "Str",
	Bool = "Bool",
	Fn = "Fn",
	Void = "Void",
}

enum State {
	InitConst = "InitConst",
	InitLet = "InitLet",
	UninitLet = "UninitLet",
}

class Scope {
	public vars: Variable[];
	public children: Scope[];

	constructor(
		public name: string,
		public parent: Scope | undefined = undefined,
	) {
		this.vars = [];
		this.children = [];
	}

	get fullname(): string {
		return this.parent === undefined ? this.name : this.parent.fullname + ":" + this.name;
	}

	new(name: string): Scope {
		const s = new Scope(name, this);
		this.children.push(s);
		return s
	}

	var(name: string, state: State, type: Type | undefined = undefined): Variable {
		const v = new Variable(this, name, state, type);
		this.vars.push(v);
		return v;
	}

	has(name: string): boolean {
		return this.vars.filter(v => v.name === name).length > 0;
	}

	toString(): string {
		return `${this.fullname} (\n  ${this.vars.join("\n  ")}\n) {\n  ${this.children.map(c => c.toString().split("\n").join("\n  "))}\n}`;
	}
}

class Variable {
	constructor(
		public scope: Scope,
		public name: string,
		public state: State,
		public type: Type | undefined = undefined,
	) { }

	toString(): string {
		return `var(${this.name}, ${this.state})`;
	}
}

function getType(scope: Scope, node: ast.Node): Type {
	log("Getting type");
	
	if (node instanceof ast.Boolean) {
		log("-> bool");
		return Type.Bool;
	} else if (node instanceof ast.Null) {
		log("-> null");
		return Type.Null;
	} else if (node instanceof ast.Number) {
		// wow there is probably a much better way to do this...
		// but it's back in the parser and I'm too lazy
		if (node.value % 1 === 0) {
			log("-> int");
			return Type.Int;
		} else {
			log("-> float");
			return Type.Float;
		}
	} else if (node instanceof ast.AnonFuncDecl) {
		log("-> fn");
		return Type.Fn;
	} else if (node instanceof ast.String) {
		log("-> str");
		return Type.Str;
	} else if (node instanceof ast.PrefixOp || node instanceof ast.PostfixOp) {
		log("-> unary operator");
		return getType(scope, node.value);
	} else if (node instanceof ast.BinaryOp) {
		log("-> binary operator");

		const isComparison = ops.COMPARE.includes(node.op);
		const leftType = getType(scope, node.left);
		const rightType = getType(scope, node.right);
		
		if (leftType !== rightType)
			throw new err.MismatchedTypesError(node.position, leftType, rightType);
		
		return isComparison ? Type.Bool : leftType;
	} else if (node instanceof ast.Variable) {
		const v = getVar(scope, node.name);

		if (v === undefined || v.type === undefined)
			throw new err.ReferenceToUninitializedVariable(node.position, node.name);
		
		return v.type;

	} else {
		log(node);
		throw new err.InternalTypeCheckerError(node.position, "getType called on unexpected syntax node");
	}
}

function getVar(scope: Scope, v: string): Variable | undefined {
	if (scope.has(v)) return scope.vars.filter(_var => _var.name === v)[0];
	if (scope.parent === undefined) return undefined;
	return getVar(scope.parent, v);
}

export class TypeChecker {
	public scope: Scope;

	constructor(private input: ast.Program) {
		this.scope = new Scope(".");

		// global functions and variables
		// (should all be InitConst)
		this.scope.var("print", State.InitConst, Type.Fn);
		this.scope.var("printf", State.InitConst, Type.Fn);
		this.scope.var("println", State.InitConst, Type.Fn);
		this.scope.var("printlnf", State.InitConst, Type.Fn);
	}

	public initialPass(): void {
		this.scope = this.scope.new("program");
		this._initialPass(this.input);
		log("current root scope:\n" + this.scope);
	}

	private _initialPass(input: ast.Program): void {
		log("Running initial pass on program");

		input.children.forEach(child => {
			log("Next child");

			if (child instanceof ast.LetVariable) {
				this.scope.var(child.variable.name, State.UninitLet);
			} else if (child instanceof ast.LetValue) {
				this.scope.var(
					child.variable.name,
					State.InitLet,
					getType(this.scope, child.value)
				);
			} else if (child instanceof ast.Const) {
				this.scope.var(
					child.variable.name,
					State.InitConst,
					getType(this.scope, child.value)
				);
			} else if (child instanceof ast.Assignment) {
				const v = getVar(this.scope, child.variable.name);

				if (v === undefined)
					throw new err.AssignmentToUninitializedVariable(child.position, child.variable.name);
				if (v.state === State.InitConst)
					throw new err.AssignmentToConstantVariable(child.position, child.variable.name);
				
				if (v.type === undefined) {
					v.type = getType(this.scope, child.value);
				} else if (v.type !== getType(this.scope, child.value)) {
					throw new err.MismatchedTypesError(child.position, v.type, getType(this.scope, child.value));
				}
			} else if (child instanceof ast.For) {
				this.scope = this.scope.new("for");
				
				this.scope.var(
					child.variable.name,
					State.InitConst,
					getType(this.scope, child.array)
				);
				
				this._initialPass(child.body);
			} else if (child instanceof ast.NamedFuncDecl) {
				this.scope.var(
					child.variable.name,
					State.InitConst,
					Type.Fn
				);

				this.scope = this.scope.new(`fn_${child.variable.name}`);

				child.params.forEach(param => {
					this.scope.var(param.variable.name, State.InitConst)
				});

				this._initialPass(child.body);
			} else if (child instanceof ast.While) {
				this.scope = this.scope.new("while");
				
				this._initialPass(child.body);
			} else if (child instanceof ast.NamedFuncCall) {
				const v = getVar(this.scope, child.func.name);

				if (v === undefined)
					throw new err.FunctionIsNotDefinedError(child.position, child.func.name);

				if (v.type !== Type.Fn)
					throw new err.VariableIsNotCallableError(child.position, child.func.name);
			}
		});

		if (this.scope.parent === undefined) {
			log("Done checking types");
		} else {
			this.scope = this.scope.parent;
		}
	}
}