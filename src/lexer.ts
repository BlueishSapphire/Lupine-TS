import * as err from "./errors";
import * as ops from "./ops";
import { Position } from "./position";
import * as tok from "./token";



const log = console.log.bind(null, "[Lexer]");



const isNewline = (s: string): boolean => /[\n\r]/g.test(s);
const isWhiteSpace = (s: string) => /^\s$/.test(s);

const isGrouping = (s: string): boolean => ["(", ")", "[", "]", "{", "}"].includes(s);
const isQuote = (s: string): boolean => ["'", '"'].includes(s);
const isLineComment = (s: string): boolean => ["#"].includes(s);
const isPunctuation = (s: string): boolean => [",", ":", ";"].includes(s);

const isNumberStart = (s: string): boolean => /^[0-9]$/.test(s);
const isDecDigit = (s: string): boolean => /^[0-9_]$/.test(s);
const isHexDigit = (s: string): boolean => /^[0-9A-Fa-f_]$/.test(s);
const isBinDigit = (s: string): boolean => /^[0-1_]$/.test(s);

const isIdentifierStart = (s: string): boolean => /^[A-Za-z_]$/.test(s);
const isIdentifier = (s: string): boolean => /^[A-Za-z_0-9]$/.test(s);



const KEYWORDS = [
	"const",
	"let",
	"if",
	"else",
	"for",
	"while",
	"loop",
	"fn",
	"class",
	"return",
];
const isKeyword = (s: string): boolean => KEYWORDS.includes(s);
const isBoolean = (s: string): boolean => ["true", "false"].includes(s);
const isNull = (s: string): boolean => ["null"].includes(s);



class Lexer {
	private index: number;
	private line: number;
	private column: number;

	constructor(public input: string) {
		this.index = 0;
		this.line = 1;
		this.column = 0;
	}

	private isEOF(): boolean {
		return this.index >= this.input.length;
	}

	private canPeek(): boolean {
		return this.index + 1 < this.input.length;
	}

	private expectNotEOF(): void {
		if (this.isEOF()) {
			throw new err.UnexpectedEOFError(this.pos());
		}
	}

	private expectPeek(): void {
		if (!this.canPeek()) {
			throw new err.UnexpectedEOFError(this.pos());
		}
	}

	private current(): string {
		this.expectNotEOF();
		return this.input[this.index];
	}

	private peek(): string {
		this.expectPeek();
		return this.input[this.index + 1];
	}

	private next(): void {
		this.index++;
		this.column++;
	}

	private pos(): Position {
		return new Position(this.line, this.column);
	}

	private skipLine(): void {
		while (this.canPeek() && !isNewline(this.peek())) {
			this.next();
		}
	}

	tokenize(): tok.Token[] {
		let tokens: tok.Token[] = [];

		while (!this.isEOF()) {
			let current = this.current();
			if (isNewline(current)) {
				this.line++;
				this.column = 0;
			}

			if (isWhiteSpace(current)) {
				// log(`Found whitespace`);
				this.next();
			} else if (isLineComment(current)) {
				log(`Found single-line comment`);
				log(`-> skipping line`);
				this.skipLine();
				this.next();
			} else if (isGrouping(current)) {
				log(`Found grouping`);
				tokens.push(new tok.Grouping(current, this.pos()));
				this.next();
			} else if (isPunctuation(current)) {
				log(`Found punctuation`);
				tokens.push(new tok.Punctuation(current, this.pos()));
				this.next();
			} else if (isNumberStart(current)) {
				log(`Found number`);
				tokens.push(this.tokenizeNumber());
			} else if (isIdentifierStart(current)) {
				log(`Found identifier`);
				tokens.push(this.tokenizeIdentifier());
			} else if (isQuote(current)) {
				log(`Found quote`);
				let quote = current;

				tokens.push(new tok.Quote(current, this.pos()));
				this.next();

				log(`Found string`);
				tokens.push(this.tokenizeString(quote));

				if (this.isEOF()) {
					throw new err.UnterminatedStringError(this.pos());
				}
				log(`Found quote`);
				tokens.push(new tok.Quote(current, this.pos()));
				this.next();
			} else {
				if (!ops.isOperator(current)) {
					throw new err.InvalidCharacterError(this.pos(), this.current());
				}

				log(`Found operator (${current})`);

				let value = current;
				this.next();

				current = this.current();
				while (ops.isOperator(value + current)) {
					value += current;
					log(`-> longer operator (${value})`);
					this.next();
					current = this.current();
				}

				tokens.push(new tok.Operator(value, this.pos()));
			}
		}

		log(`Found EOF`);
		tokens.push(new tok.EOF(this.pos()));

		return tokens;
	}

	private eatCharsOfType(isType: (_: string) => boolean): string {
		let value = "";
		while (!this.isEOF() && isType(this.current())) {
			value += this.current();
			this.next();
		}
		return value;
	}

	private tokenizeNumber(): tok.Number {
		if (!isNumberStart(this.current())) {
			throw new err.InternalLexerError(this.pos(), "tokenizeNumber called on a non-number token");
		}
		log("Tokenizing number");

		let value = this.current();
		this.next();

		const current = this.current();
		if (isDecDigit(current) || current === ".") {
			log(`-> decimal number (integral part)`);
			value += this.eatCharsOfType(isDecDigit);
			if (this.current() == ".") {
				// if a number is simply followed by a period, it could be the between operator (,,)
				if (isDecDigit(this.peek())) {
					log(`-> radix point`);
					value += ".";
					this.next();
					log(`-> decimal number (fractional part)`);
					value += this.eatCharsOfType(isDecDigit);
				}
			}
		} else if (current === "x") {
			if (value !== "0") throw new err.InvalidNumberTypeError(this.pos(), value + current);
			log(`-> hexadecimal`);
			value += current;
			this.next();
			value += this.eatCharsOfType(isHexDigit);
		} else if (current === "b") {
			if (value !== "0") throw new err.InvalidNumberTypeError(this.pos(), value + current);
			log(`-> binary`);
			value += current;
			this.next();
			value += this.eatCharsOfType(isBinDigit);
		}

		return new tok.Number(value, this.pos());
	}

	private tokenizeIdentifier(): tok.Identifier {
		if (!isIdentifierStart(this.current())) {
			throw new err.InternalLexerError(this.pos(), "tokenizeIdentifier called on a non-identifier token");
		}

		let value = this.eatCharsOfType(isIdentifier);

		if (isKeyword(value)) {
			log(`-> keyword`);
			return new tok.Keyword(value, this.pos());
		} else if (isBoolean(value)) {
			log(`-> boolean`);
			return new tok.Boolean(value, this.pos());
		} else if (isNull(value)) {
			log(`-> null`);
			return new tok.Null(value, this.pos());
		} else {
			log(`-> identifier`);
			return new tok.Identifier(value, this.pos());
		}
	}

	private tokenizeString(quote: string): tok.String {
		let value = "";

		while (!this.isEOF() && this.current() !== quote) {
			if (this.current() == "\\") {
				log(`-> escape`);
				value += this.current();
				this.next();
			}
			value += this.current();
			this.next();
		}

		return new tok.String(value, this.pos());
	}
}



export function tokenize(input: string) {
	log(`Tokenizing input of length ${input.length}...`);
	let lex = new Lexer(input);
	let tokens = lex.tokenize();
	log(`Done lexing. Returning ${tokens.length} tokens.`);
	log(`Output:\n-> ${tokens.join("\n-> ")}`);
	return tokens;
}