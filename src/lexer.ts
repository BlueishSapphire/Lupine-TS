import { Token, TokenKind } from "./token";



const log = console.log.bind(null, "[Lexer]");

class LexerError extends Error {
	constructor(public message: string) {
		super(message);
		this.name = "LexerError";
	}
}



const isNewline = (s: string): boolean => /[\n\r]/g.test(s);
const isWhiteSpace = (s: string) => /^\s$/.test(s);

const isGrouping = (s: string): boolean => ["(", ")", "[", "]", "{", "}"].includes(s);
const isQuote = (s: string): boolean => ["'", '"'].includes(s);
const isComment = (s: string): boolean => ["#"].includes(s);
const isPunctuation = (s: string): boolean => [".", ",", ":", ";"].includes(s);

const isNumberStart = (s: string): boolean => /^[0-9]$/.test(s);
const isDecDigit = (s: string): boolean => /^[0-9]$/.test(s);
const isHexDigit = (s: string): boolean => /^[0-9A-Fa-f]$/.test(s);
const isBinDigit = (s: string): boolean => /^[0-1]$/.test(s);

const isIdentifierStart = (s: string): boolean => /^[A-Za-z_]$/.test(s);
const isIdentifier = (s: string): boolean => /^[A-Za-z_0-9]$/.test(s);

// single, eg. %
const CHAR_SINGLE_OP = ["=", "!", ">", "<", "+", "-", "*", "/", "%", "&", "|", "^", "~"];
const isSingleOp = (s: string): boolean => CHAR_SINGLE_OP.includes(s);

// double, eg. ==
const CHAR_DOUBLE_OP = ["=", "&", "|", "*", "?", "+", "-", "/"];
const isDoubleOp = (s: string): boolean => CHAR_DOUBLE_OP.includes(s);

// single + an equal sign, eg. !=
const CHAR_SINGLE_EQ_OP = ["!", ">", "<", "+", "-", "*", "/", "%"];
const isSingleEqualsOp = (s: string): boolean => CHAR_SINGLE_EQ_OP.includes(s);

// double + an equal sign, eg. &&=
const CHAR_DOUBLE_EQ_OP = ["&", "|", "*", "?", "/", ">", "<"];
const isDoubleEqualsOp = (s: string): boolean => CHAR_DOUBLE_EQ_OP.includes(s);



const KEYWORDS = [
	"const",
	"let",
	"if",
	"else",
	"elif",
	"for",
	"while",
	"loop",
	"fn",
	"class",
	"in",
];
const isKeyword = (s: string): boolean => KEYWORDS.includes(s);
const isBoolean = (s: string): boolean => ["true", "false"].includes(s);
const isNull = (s: string): boolean => ["null"].includes(s);



class Lexer {
	public position: number;

	constructor(public input: string) {
		this.position = 0;
	}

	private isEOF(): boolean {
		return this.position >= this.input.length;
	}

	private canPeek(): boolean {
		return this.position + 1 < this.input.length;
	}

	private expectNotEOF(): void {
		if (this.isEOF()) {
			throw new LexerError(`Unexpected EOF at position ${this.position}`);
		}
	}

	private expectPeek(): void {
		if (!this.canPeek()) {
			throw new LexerError(`Unexpected EOF at position ${this.position + 1}`);
		}
	}

	private current(): string {
		this.expectNotEOF();
		return this.input[this.position];
	}

	private peek(): string {
		this.expectPeek();
		return this.input[this.position + 1];
	}

	private next(): void {
		this.position++;
	}

	private skipLine(): void {
		while (this.canPeek() && !isNewline(this.peek())) {
			this.next();
		}
	}

	tokenize(): Token[] {
		let tokens: Token[] = [];

		while (!this.isEOF()) {
			let current = this.current();

			if (isWhiteSpace(current)) {
				this.next();
			} else if (isComment(current)) {
				this.skipLine();
				this.next();
			} else if (isGrouping(current)) {
				tokens.push({
					kind: TokenKind.Grouping,
					value: current,
				});
				this.next();
			} else if (isPunctuation(current)) {
				tokens.push({
					kind: TokenKind.Punctuation,
					value: current,
				});
				this.next();
			} else if (isNumberStart(current)) {
				tokens.push(this.tokenizeNumber());
			} else if (isIdentifierStart(current)) {
				tokens.push(this.tokenizeIdentifier());
			} else if (isQuote(current)) {
				let quote = current;

				tokens.push({
					kind: TokenKind.Quote,
					value: quote,
				});
				this.next();

				tokens.push(this.tokenizeString(quote));

				tokens.push({
					kind: TokenKind.Quote,
					value: quote,
				});
				this.next();
			} else {
				if (!isSingleOp(current)) {
					throw new LexerError(`Unrecognized token '${current}'`);
				}

				let value = current;
				this.next();

				const peek = this.canPeek() ? this.peek() : null;
				if (isSingleEqualsOp(current) && peek == "=") {
					value += "=";
					this.next();
				} else if (isDoubleOp(current) && peek == current) {
					value += current;
					this.next();

					if (isDoubleEqualsOp(current) && peek == "=") {
						value += "=";
						this.next();
					}
				}

				tokens.push({
					kind: TokenKind.Operator,
					value,
				});
			}
		}

		tokens.push({
			kind: TokenKind.EOF,
			value: "\0",
		});

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

	private tokenizeNumber(): Token {
		if (!isNumberStart(this.current())) {
			throw new LexerError("[Internal] tokenizeNumber called on a non-number token");
		}

		let value = this.current();
		this.next();

		if (this.canPeek()) {
			let peek = this.peek();

			if (isDecDigit(peek)) {
				value += this.eatCharsOfType(isDecDigit);
			} else if (["x", "b"].includes(peek)) {
				if (value !== "0") {
					throw new LexerError(`Numbers in hexadecimal or binary must begin with a '0', but instead found '${value}' at position ${this.position}`);
				}

				value += peek;
				if (peek == "x") {
					value += this.eatCharsOfType(isHexDigit);
				} else if (peek == "b") {
					value += this.eatCharsOfType(isBinDigit);
				} else {
					throw new LexerError(`Unsupported number type: '0${peek}' at position ${this.position + 1}`)
				}
			}
		}

		return {
			kind: TokenKind.Number,
			value,
		};
	}

	private tokenizeIdentifier(): Token {
		if (!isIdentifierStart(this.current())) {
			throw new LexerError("[Internal] tokenizeIdentifier called on a non-identifier token");
		}

		let identifier = this.eatCharsOfType(isIdentifier);

		if (isKeyword(identifier)) {
			return {
				kind: TokenKind.Keyword,
				value: identifier,
			};
		} else if (isBoolean(identifier)) {
			return {
				kind: TokenKind.Boolean,
				value: identifier,
			};
		} else if (isNull(identifier)) {
			return {
				kind: TokenKind.Null,
				value: identifier,
			};
		} else {
			return {
				kind: TokenKind.Identifier,
				value: identifier,
			};
		}
	}

	private tokenizeString(quote: string): Token {
		if (isQuote(this.current())) {
			throw new LexerError("[Internal] tokenizeString called on a non-quote token");
		}

		let value = "";

		while (!this.isEOF() && this.current() !== quote) {
			if (this.current() == "\\") {
				value += this.current();
				this.next();
			}
			value += this.current();
			this.next();
		}

		return {
			kind: TokenKind.String,
			value,
		};
	}
}



export function tokenize(input: string) {
	let lex = new Lexer(input);
	return lex.tokenize();
}