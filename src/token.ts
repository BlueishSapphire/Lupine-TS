import { Position } from "./position.js";



export abstract class Token {
	abstract name: string;

	constructor (public value: string, public position: Position) { }

	toString(): string {
		return `${this.name}(${this.value})`;
	}
}

export class Operator extends Token {
	public name = "OPERATOR";
	constructor (value: string, position: Position) { super(value, position); }
}
export class Punctuation extends Token {
	public name = "PUNCTUATION";
	constructor (value: string, position: Position) { super(value, position); }
}
export class Grouping extends Token {
	public name = "GROUPING";
	constructor (value: string, position: Position) { super(value, position); }
}
export class Quote extends Token {
	public name = "QUOTE";
	constructor (value: string, position: Position) { super(value, position); }
}
export class String extends Token {
	public name = "STRING";
	constructor (value: string, position: Position) { super(value, position); }
}
export class Number extends Token {
	public name = "NUMBER";
	constructor (value: string, position: Position) { super(value, position); }
}
export class Identifier extends Token {
	public name = "IDENTIFIER";
	constructor (value: string, position: Position) { super(value, position); }
}
export class Keyword extends Token {
	public name = "KEYWORD";
	constructor (value: string, position: Position) { super(value, position); }
}
export class Boolean extends Token {
	public name = "BOOLEAN";
	constructor (value: string, position: Position) { super(value, position); }
}
export class Null extends Token {
	public name = "NULL";
	constructor (value: string, position: Position) { super(value, position); }
}
export class EOF extends Token {
	public name = "EOF";
	constructor (position: Position) { super("\0", position); }
}