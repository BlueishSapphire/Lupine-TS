export abstract class Token {
	abstract name: string;

	constructor (public value: string) { }

	toString(): string {
		return `${this.name}(${this.value})`;
	}
}

export class Operator extends Token {
	public name = "OPERATOR";
	constructor (value: string) { super(value); }
}
export class Punctuation extends Token {
	public name = "PUNCTUATION";
	constructor (value: string) { super(value); }
}
export class Grouping extends Token {
	public name = "GROUPING";
	constructor (value: string) { super(value); }
}
export class Quote extends Token {
	public name = "QUOTE";
	constructor (value: string) { super(value); }
}
export class String extends Token {
	public name = "STRING";
	constructor (value: string) { super(value); }
}
export class Number extends Token {
	public name = "NUMBER";
	constructor (value: string) { super(value); }
}
export class Identifier extends Token {
	public name = "IDENTIFIER";
	constructor (value: string) { super(value); }
}
export class Keyword extends Token {
	public name = "KEYWORD";
	constructor (value: string) { super(value); }
}
export class Boolean extends Token {
	public name = "BOOLEAN";
	constructor (value: string) { super(value); }
}
export class Null extends Token {
	public name = "NULL";
	constructor (value: string) { super(value); }
}
export class EOF extends Token {
	public name = "EOF";
	constructor () { super("\0"); }
}