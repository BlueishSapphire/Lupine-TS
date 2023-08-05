const SMALL_OUTPUT_STRINGS = true;

export abstract class Node {
	constructor() { }
}

export class Value extends Node { }

export class String extends Value {
	constructor(
		public value: string
	) { super(); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? this.value : `Str(${this.value})`;
	}
}

export class Number extends Value {
	constructor(
		public value: number
	) { super(); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? this.value.toString() : `Num(${this.value})`;
	}
}

export class Boolean extends Value {
	constructor(
		public value: boolean
	) { super(); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? this.value.toString() : `Bool(${this.value})`;
	}
}

export class Null extends Value {
	constructor() { super(); }

	toString(): string {
		return `Null`;
	}
}

export class Variable extends Value {
	constructor(
		public name: string
	) { super(); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? this.name : `Var(${this.name})`;
	}
}

export class Array extends Value {
	constructor(
		public values: Value[]
	) { super(); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `[${this.values.join(", ")}]` : `Arr(${this.values})`;
	}
}

export class Expression extends Node { }

export class PrefixOp extends Expression {
	constructor(
		public op: string,
		public value: Node
	) { super(); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `(${this.op}${this.value})` : `Pre(op=${this.op}; val=${this.value})`;
	}
}

export class PostfixOp extends Expression {
	constructor(
		public op: string,
		public value: Expression | Value
	) { super(); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `(${this.value}${this.op})` : `Post(op=${this.op}; val=${this.value})`;
	}
}

export class BinaryOp extends Expression {
	constructor(
		public op: string,
		public left: Expression | Value,
		public right: Expression | Value
	) { super(); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `(${this.left} ${this.op} ${this.right})` : `Bin(op=${this.op}; left=${this.left}; right=${this.right})`;
	}
}

export class Statement extends Node { }

export class Assignment extends Statement {
	constructor(
		public op: string,
		public variable: Variable,
		public value: Expression | Value
	) { super(); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `(${this.variable} = ${this.value})` : `Assign(var=${this.variable}; val=${this.value})`;
	}
}

export class Const extends Statement {
	constructor(
		public variable: Variable,
		public value: Expression | Value
	) { super(); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `(const ${this.variable} = ${this.value})` : `Const(var=${this.variable}, val=${this.value})`;
	}
}

export class LetValue extends Statement {
	constructor(
		public variable: Variable,
		public value: Expression | Value
	) { super(); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `(let ${this.variable}) = ${this.value})` : `Let(var=${this.variable}, val=${this.value})`;
	}
}

export class LetVariable extends Statement {
	constructor(
		public variable: Variable
	) { super(); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `(let ${this.variable})` : `Let(${this.variable})`;
	}
}

export class AnonFuncDecl extends Node {
	constructor(
		public args: Variable[],
		public body: Program
	) { super(); }

	toString(): string {
		return `AnonFunc(${this.args.join(",")}){ ${this.body} }`;
	}
}

export class AnonFuncCall extends Node {
	constructor(
		public decl: AnonFuncDecl,
		public args: (Expression | Value)[]
	) { super(); }

	toString(): string {
		return `AnonFuncCall(args=${this.args.join(",")}; decl=${this.decl})`;
	}
}

export class NamedFuncDecl extends Node {
	constructor(
		public name: Variable,
		public args: Variable[],
		public body: Program
	) { super(); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `fn ${this.name}(${this.args.join(", ")}) { ${this.body} }` : `Func(${this.name}, args=${this.args.join(",")}){ ${this.body} }`;
	}
}

export class NamedFuncCall extends Node {
	constructor(
		public func: Variable,
		public args: (Expression | Value)[]
	) { super(); }

	toString(): string {
		return SMALL_OUTPUT_STRINGS ? `${this.func}(${this.args.join(", ")})` : `FuncCall(func=${this.func}, args=${this.args.join(",")})`;
	}
}

export class If extends Node {
	constructor(
		public condition: Expression | Value,
		public body: Program,
		public elseifs: ElseIf[],
		public _else: Else,
	) { super(); }

	toString(): string {
		return `If(${this.condition}){ ${this.body} } ${this.elseifs.join(" ")} ${this._else}`;
	}
}

export class Else extends Node {
	constructor(
		public body: Program
	) { super(); }

	toString(): string {
		return `Else(${this.body})`;
	}
}

export class ElseIf extends Node {
	constructor(
		public condition: Expression | Value,
		public body: Program,
	) { super(); }

	toString(): string {
		return `ElseIf(${this.condition}){ ${this.body} }`;
	}
}

export class Loop extends Node {
	constructor(
		public body: Program
	) { super(); }

	toString(): string {
		return `Loop{ ${this.body} }`;
	}
}

export class While extends Node {
	constructor(
		public condition: Expression | Value,
		public body: Program
	) { super(); }

	toString(): string {
		return `While(${this.condition}){ ${this.body} }`;
	}
}

export class Program extends Node {
	constructor(public children: Node[]) { super(); }

	toString(): string {
		return `Program(\n${this.children.join("\n")}\n)`;
	}
}
