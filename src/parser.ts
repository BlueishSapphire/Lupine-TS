import * as ast from "./ast";
import * as ops from "./ops";
import * as tok from "./token";



const log = console.log.bind(null, "[Parser]");

class ParserError extends Error {
	constructor(public message: string) {
		super(message);
		this.name = "ParserError";
	}
}



export class Parser {
	public position: number;

	constructor (public input: tok.Token[]) {
		this.position = 0;
	}

	private isEOF(): boolean {
		return (this.position >= this.input.length) || (this.input[this.position] instanceof tok.EOF);
	}

	private canPeek(): boolean {
		return (this.position + 1 < this.input.length) || (this.input[this.position + 1] instanceof tok.EOF);
	}

	private expectNotEOF(): void {
		if (this.isEOF()) {
			throw new ParserError(`Unexpected EOF at position ${this.position}`);
		}
	}

	private expectPeek(): void {
		if (!this.canPeek()) {
			throw new ParserError(`Unexpected EOF at position ${this.position + 1}`);
		}
	}

	private current(): tok.Token {
		this.expectNotEOF();
		return this.input[this.position];
	}

	private peek(): tok.Token {
		this.expectPeek();
		return this.input[this.position + 1];
	}

	private next(): void {
		this.position++;
	}

	private match(tok: tok.Token, cls: any, value?: string): boolean {
		return (tok instanceof cls && (value === undefined || tok.value === value));
	}

	private matchCurrent(cls: any, value?: string): boolean {
		return this.match(this.current(), cls, value);
	}

	private matchPeek(cls: any, value?: string): boolean {
		return this.match(this.peek(), cls, value);
	}

	public parse(): ast.Node {
		log(`Parsing ${this.input.length} tokens`);
		// return this.parseProgram();
		const ast = this.parseExpression();
		log(`Output:\n-> ${ast}`);
		return ast;
	}

	public parseProgram(): ast.Program {
		log("Parsing program");
		const statements: ast.Statement[] = [];

		while (!this.isEOF()) {
			statements.push(this.parseStatement());
		}

		return new ast.Program(statements);
	}

	// ===== STATEMENTS =====

	public parseStatement(): ast.Statement {
		const current = this.current();
		if (this.match(current, tok.Keyword, 'if')) {
			return this.parseIfStatement();

		} else if (this.match(current, tok.Keyword, 'while')) {
			return this.parseWhileStatement();

		} else if (this.match(current, tok.Keyword, 'loop')) {
			return this.parseLoopStatement();

		} else if (this.match(current, tok.Keyword, 'fn')) {
			return this.parseFunctionDeclaration();

		} else if (this.match(current, tok.Keyword, 'let')) {
			return this.parseLetDeclaration();

		} else if (this.match(current, tok.Keyword, 'const')) {
			return this.parseConstDeclaration();

		} else if (this.match(current, tok.Identifier)) {
			return this.parseAssignmentOrFunctionCall();

		} else {
			// Handle error or throw an exception for unexpected tokens
			// For simplicity, let's assume this is a single expression statement
			return this.parseExpressionStatement();
		}
	}

	parseAssignmentOrFunctionCall(): ast.Assignment | ast.NamedFuncCall {
		const token = this.current();
		if (!this.isEOF() && this.match(this.peek(), tok.Grouping, "(")) {
			log("function call");
			log("-> parsing name");
			let name = token.value;
			let func = new ast.Variable(name);
			this.next();

			log("-> parsing args");
			let args = this.parseArgumentList();

			return new ast.NamedFuncCall(func, args);
		} else {
			log("assignment");
			const name = token.value;
			const variable = new ast.Variable(name);
			this.next();

			const op = this.current().value;
			log(`-> operator (${op})`);
			this.next();

			const value = this.parseExpression();

			return new ast.Assignment(op, variable, value);
		}
	}

	// ===== EXPRESSIONS =====

	parseExpression(minPrecedence = 0): ast.Expression {
		log("Parsing expression");
		if (this.match(this.current(), tok.Grouping, "(")) {
			log("-> Open parenthesis");
			this.next();
			const groupedExpression = this.parseExpression();

			if (!this.match(this.current(), tok.Grouping, ")")) {
				throw new ParserError("Expected closing parenthesis");
			}
			this.next();

			log("-> Close parenthesis");

			return groupedExpression;
		}

		let leftExpression = this.parseValue();
	
		while (!this.isEOF()) {
			const token = this.current();
			
			if (token instanceof tok.Operator) {
				const operatorPrecedence = ops.getPrecedence(token.value);

				if (operatorPrecedence < minPrecedence) break;

				this.next();
				leftExpression = this.parseInfixExpression(leftExpression, token.value);
			} else {
				break;
			}
		}

		return leftExpression;
	}

	parseValue(): ast.Value {
		log("Parsing value");

		const token = this.current();

		if (token instanceof tok.Number) {
			log("-> number");
			const isFloat = token.value.includes(".");
			log(`-> ${isFloat ? "float" : "int"}`);
			const value = isFloat ? parseFloat(token.value) : parseInt(token.value);
			this.next();

			return new ast.Number(value);
		} else if (token instanceof tok.String) {
			log("-> string");
			const value = token.value;
			this.next();

			return new ast.String(value);
		} else if (token instanceof tok.Boolean) {
			log("-> bool");
			const value = token.value === "true";
			this.next();

			return new ast.Boolean(value);
		} else if (token instanceof tok.Null) {
			log("-> null");

			this.next();
			return new ast.Null();
		} else if (token instanceof tok.Identifier) {
			if (!this.isEOF() && this.match(this.peek(), tok.Grouping, "(")) {
				log("-> function call");
				log("-> parsing name");
				let name = token.value;
				let func = new ast.Variable(name);
				this.next();

				log("-> parsing args");
				let args = this.parseArgumentList();

				return new ast.NamedFuncCall(func, args);
			} else {
				log("-> variable");
				const value = token.value;

				this.next();
				return new ast.Variable(value);
			}
		} else {
			throw new ParserError("Unexpected token");
		}

		return new ast.Number(0);
	}

	parseInfixExpression(left: ast.Expression, operator: string): ast.Expression {
		const operatorPrecedence = ops.getPrecedence(operator);
		const right = this.parseExpression(operatorPrecedence + 1);

		return new ast.BinaryOp(operator, left, right);
	}

	parseArgumentList(): ast.Node[] {
		log("Parsing argument list");
		const arr = [];
		let first = true;
		
		if (!this.match(this.current(), tok.Grouping, "(")) {
			throw new ParserError("[Internal] parseArgumentList() called without opening parenthesis");
		}
		this.next();

		while (!this.isEOF()) {
			if (this.match(this.current(), tok.Grouping, ")")) break;
			if (first) {
				log("-> first arg");
				first = false;
			} else {
				if (!this.match(this.current(), tok.Punctuation, ",")) {
					throw new ParserError("Missing comma in argument list");
				}
				log("-> comma");
				this.next();
			}
			// last comma can be missing
			if (this.match(this.current(), tok.Grouping, ")")) break;
			arr.push(this.parseExpression());
		}

		if (!this.match(this.current(), tok.Grouping, ")")) {
			throw new ParserError("Missing end parenthesis for argument list");
		}

		this.next();
		return arr;
	}
}

