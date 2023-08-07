import { Position } from "./position";



const SMALL_OUTPUT_STRINGS = true;



export abstract class Node {
	constructor(
		public position: Position
	) { }
}

export class Parameter extends Node {
	constructor(
		public position: Position,
		public variable: Variable,
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `${this.variable}` : `Param(${this.variable})`;
	}
}

export class DefaultedParameter extends Node {
	constructor(
		public position: Position,
		public variable: Variable,
		public _default: Expression,
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `${this.variable} = ${this._default}` : `Param(${this.variable}, ${this._default})`;
	}
}

export class Value extends Node { }

export class String extends Value {
	constructor(
		public position: Position,
		public value: string
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `"${this.value}"` : `Str(${this.value})`;
	}
}

export class Number extends Value {
	constructor(
		public position: Position,
		public value: number
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? this.value.toString() : `Num(${this.value})`;
	}
}

export class Boolean extends Value {
	constructor(
		public position: Position,
		public value: boolean
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? this.value.toString() : `Bool(${this.value})`;
	}
}

export class Null extends Value {
	constructor(
		public position: Position,
	) { super(position); }

	toString(): string {
		return `null`;
	}
}

export class Variable extends Value {
	constructor(
		public position: Position,
		public name: string
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? this.name : `Var(${this.name})`;
	}
}

export class Array extends Value {
	constructor(
		public position: Position,
		public values: Value[]
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `[${this.values.join(", ")}]` : `Arr(${this.values})`;
	}
}

export class Expression extends Node { }

export class PrefixOp extends Expression {
	constructor(
		public position: Position,
		public op: string,
		public value: Node
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `(${this.op}${this.value})` : `Pre(op=${this.op}; val=${this.value})`;
	}
}

export class PostfixOp extends Expression {
	constructor(
		public position: Position,
		public op: string,
		public value: Expression | Value
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `(${this.value}${this.op})` : `Post(op=${this.op}; val=${this.value})`;
	}
}

export class BinaryOp extends Expression {
	constructor(
		public position: Position,
		public op: string,
		public left: Expression | Value,
		public right: Expression | Value
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `(${this.left} ${this.op} ${this.right})` : `Bin(op=${this.op}; left=${this.left}; right=${this.right})`;
	}
}



export class Statement extends Node { }

export class Return extends Statement {
	constructor(
		public position: Position,
		public value: Expression | Value
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `return ${this.value}` : `Return(${this.value})`;
	}
}

export class Break extends Statement {
	constructor(
		public position: Position,
	) { super(position); }

	toString(): string {
		return `break`;
	}
}

export class Continue extends Statement {
	constructor(
		public position: Position,
	) { super(position); }

	toString(): string {
		return `continue`;
	}
}

export class Import extends Statement {
	constructor(
		public position: Position,
		public target: Variable,
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `import ${this.target}` : `Import(${this.target})`;
	}
}

export class Assignment extends Statement {
	constructor(
		public position: Position,
		public op: string,
		public variable: Variable,
		public value: Expression | Value
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `(${this.variable} ${this.op} ${this.value})` : `Assign(op=${this.op}; var=${this.variable}; val=${this.value})`;
	}
}

export class Const extends Statement {
	constructor(
		public position: Position,
		public variable: Variable,
		public value: Expression | Value
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `(const ${this.variable} = ${this.value})` : `Const(var=${this.variable}, val=${this.value})`;
	}
}

export class LetValue extends Statement {
	constructor(
		public position: Position,
		public variable: Variable,
		public value: Expression | Value
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `(let ${this.variable} = ${this.value})` : `Let(var=${this.variable}, val=${this.value})`;
	}
}

export class LetVariable extends Statement {
	constructor(
		public position: Position,
		public variable: Variable
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `(let ${this.variable})` : `Let(${this.variable})`;
	}
}

export class AnonFuncDecl extends Node {
	constructor(
		public position: Position,
		public params: Parameter[],
		public body: Program
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `fn (${this.params.join(", ")}) ${this.body}` : `AnonFunc(${this.params.join(",")}){ ${this.body} }`;
	}
}

export class AnonFuncCall extends Node {
	constructor(
		public position: Position,
		public decl: AnonFuncDecl,
		public args: (Expression | Value)[]
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `${this.decl}(${this.args.join(", ")})` : `AnonFuncCall(args=${this.args.join(",")}; decl=${this.decl})`;
	}
}

export class NamedFuncDecl extends Node {
	constructor(
		public position: Position,
		public variable: Variable,
		public params: Parameter[],
		public body: Program
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `fn ${this.variable}(${this.params.join(", ")}) { ${this.body} }` : `Func(${this.variable}, args=${this.params.join(",")}){ ${this.body} }`;
	}
}

export class NamedFuncCall extends Node {
	constructor(
		public position: Position,
		public func: Variable,
		public args: (Expression | Value)[]
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `${this.func}(${this.args.join(", ")})` : `FuncCall(func=${this.func}, args=${this.args.join(",")})`;
	}
}

export class If extends Node {
	constructor(
		public position: Position,
		public condition: Expression | Value,
		public body: Program,
		public elseifs: ElseIf[] = [],
		public _else: Else | undefined = undefined,
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `if ${this.condition} ${this.body} ${this.elseifs.join(" ")} ${this._else}` : `If(${this.condition}){ ${this.body} } ${this.elseifs.join(" ")} ${this._else}`;
	}
}

export class Else extends Node {
	constructor(
		public position: Position,
		public body: Program
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `else ${this.body}` : `Else(${this.body})`;
	}
}

export class ElseIf extends Node {
	constructor(
		public position: Position,
		public condition: Expression | Value,
		public body: Program,
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `else if ${this.condition} ${this.body}` : `ElseIf(${this.condition}){ ${this.body} }`;
	}
}

export class Loop extends Node {
	constructor(
		public position: Position,
		public body: Program
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `loop ${this.body}` : `Loop{ ${this.body} }`;
	}
}

export class While extends Node {
	constructor(
		public position: Position,
		public condition: Expression | Value,
		public body: Program
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `while ${this.condition} ${this.body}` : `While(${this.condition}){ ${this.body} }`;
	}
}

export class For extends Node {
	constructor(
		public position: Position,
		public variable: Variable,
		public array: Expression | Value,
		public body: Program
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `for ${this.variable} -> ${this.array} ${this.body}` : `For(${this.variable} in ${this.array}){ ${this.body} }`;
	}
}

export class Program extends Node {
	constructor(
		public position: Position,
		public children: Node[]
	) { super(position); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `{\n  ${this.children.map(child => child.toString().split("\n").join("\n  ")).join("\n  ")}\n}` : `Program(\n  ${this.children.join("\n  ")}\n)`;
	}
}
