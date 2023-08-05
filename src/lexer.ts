import * as ops from "./ops";
import * as tok from "./token";



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
const isLineComment = (s: string): boolean => ["#"].includes(s);
const isPunctuation = (s: string): boolean => [".", ",", ":", ";"].includes(s);

const isNumberStart = (s: string): boolean => /^[0-9]$/.test(s);
const isDecDigit = (s: string): boolean => /^[0-9]$/.test(s);
const isHexDigit = (s: string): boolean => /^[0-9A-Fa-f]$/.test(s);
const isBinDigit = (s: string): boolean => /^[0-1]$/.test(s);

const isIdentifierStart = (s: string): boolean => /^[A-Za-z_]$/.test(s);
const isIdentifier = (s: string): boolean => /^[A-Za-z_0-9]$/.test(s);

// // single, eg. %
// const CHAR_SINGLE_OP = ["=", "!", ">", "<", "+", "-", "*", "/", "%", "&", "|", "^", "~"];
// const isSingleOp = (s: string): boolean => CHAR_SINGLE_OP.includes(s);

// // double, eg. ==
// const CHAR_DOUBLE_OP = ["=", "&", "|", "*", "?", "+", "-", "/"];
// const isDoubleOp = (s: string): boolean => CHAR_DOUBLE_OP.includes(s);

// // single + an equal sign, eg. !=
// const CHAR_SINGLE_EQ_OP = ["!", ">", "<", "+", "-", "*", "/", "%"];
// const isSingleEqualsOp = (s: string): boolean => CHAR_SINGLE_EQ_OP.includes(s);

// // double + an equal sign, eg. &&=
// const CHAR_DOUBLE_EQ_OP = ["&", "|", "*", "?", "/", ">", "<"];
// const isDoubleEqualsOp = (s: string): boolean => CHAR_DOUBLE_EQ_OP.includes(s);



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

	tokenize(): tok.Token[] {
		let tokens: tok.Token[] = [];

		while (!this.isEOF()) {
			let current = this.current();

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
				tokens.push(new tok.Grouping(current));
				this.next();
			} else if (isPunctuation(current)) {
				log(`Found punctuation`);
				tokens.push(new tok.Punctuation(current));
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

				tokens.push(new tok.Quote(current));
				this.next();

				log(`Found string`);
				tokens.push(this.tokenizeString(quote));

				log(`Found quote`);
				tokens.push(new tok.Quote(current));
				this.next();
			} else {
				if (!ops.isOperator(current)) {
					throw new LexerError(`Unrecognized token '${current}'`);
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

				tokens.push(new tok.Operator(value));
			}
		}

		log(`Found EOF`);
		tokens.push(new tok.EOF());

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
			throw new LexerError("[Internal] tokenizeNumber called on a non-number token");
		}

		let value = this.current();
		this.next();

		if (this.canPeek()) {
			let peek = this.peek();

			if (isDecDigit(peek)) {
				log(`-> decimal number (integral part)`);
				value += this.eatCharsOfType(isDecDigit);
				if (this.current() == ".") {
					log(`-> radix point`);
					value += ".";
					this.next();
					log(`-> decimal number (fractional part)`);
					value += this.eatCharsOfType(isDecDigit);
				}
			} else if (["x", "b"].includes(peek)) {
				if (value !== "0") {
					throw new LexerError(`Numbers in hexadecimal or binary must begin with a '0', but instead found '${value}' at position ${this.position}`);
				}

				value += peek;
				if (peek == "x") {
					log(`-> hexadecimal`);
					value += this.eatCharsOfType(isHexDigit);
				} else if (peek == "b") {
					log(`-> binary`);
					value += this.eatCharsOfType(isBinDigit);
				} else {
					throw new LexerError(`Unsupported number type: '0${peek}' at position ${this.position + 1}`)
				}
			}
		}

		return new tok.Number(value);
	}

	private tokenizeIdentifier(): tok.Identifier {
		if (!isIdentifierStart(this.current())) {
			throw new LexerError("[Internal] tokenizeIdentifier called on a non-identifier token");
		}

		let value = this.eatCharsOfType(isIdentifier);

		if (isKeyword(value)) {
			log(`-> keyword`);
			return new tok.Keyword(value);
		} else if (isBoolean(value)) {
			log(`-> boolean`);
			return new tok.Boolean(value);
		} else if (isNull(value)) {
			log(`-> null`);
			return new tok.Null(value);
		} else {
			log(`-> identifier`);
			return new tok.Identifier(value);
		}
	}

	private tokenizeString(quote: string): tok.String {
		if (isQuote(this.current())) {
			throw new LexerError("[Internal] tokenizeString called on a non-quote token");
		}

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

		return new tok.String(value);
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