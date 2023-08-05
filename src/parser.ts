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

	private eatSemicolon() {
		if (!this.matchCurrent(tok.Punctuation, ";")) {
			throw new ParserError(`Expected semicolon but found ${this.current()}`);
		}
		this.next();
	}

	public parse(): ast.Program {
		log(`Parsing ${this.input.length} tokens`);
		// return this.parseProgram();
		const ast = this.parseProgram();
		log(`Output:\n-> ${ast}`);
		return ast;
	}

	public parseProgram(): ast.Program {
		log("program");
		const statements: ast.Statement[] = [];

		while (!this.isEOF() && !this.matchCurrent(tok.Grouping, "}")) {
			statements.push(this.parseStatement());
		}

		return new ast.Program(statements);
	}

	private parseBlock(): ast.Program {
		log("block");
		
		if (!this.matchCurrent(tok.Grouping, "{"))
			throw new ParserError("Expected opening brace before code block");
		this.next();
		log("-> new block");

		const body = this.parseProgram();

		if (!this.matchCurrent(tok.Grouping, "}"))
			throw new ParserError("Expected closing brace after code block");
		this.next();

		return body;
	}

	// ===== STATEMENTS =====

	public parseStatement(): ast.Statement {
		const current = this.current();
		// if (this.match(current, tok.Keyword, 'if')) {
		// 	return this.parseIfStatement();

		// } else
		if (this.match(current, tok.Keyword, 'while')) {
			return this.parseWhileStatement();

		} else if (this.match(current, tok.Keyword, 'loop')) {
			return this.parseLoopStatement();

		} else if (this.match(current, tok.Keyword, 'for')) {
			return this.parseForStatement();

		} else if (this.match(current, tok.Keyword, 'fn')) {
			return this.parseNamedFunctionDeclarationOrAnonFunctionCall();

		} else if (this.match(current, tok.Keyword, 'return')) {
			return this.parseReturnStatement();

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

	parseReturnStatement(): ast.Return {
		if (!this.matchCurrent(tok.Keyword, "return"))
			throw new ParserError("[Intenal] parseReturnStatement called on a non-return token");
		this.next();

		const value = this.parseExpression();

		this.eatSemicolon();

		return new ast.Return(value);
	}

	parseNamedFunctionDeclarationOrAnonFunctionCall(): ast.NamedFuncDecl | ast.AnonFuncCall {
		if (!this.matchCurrent(tok.Keyword, "fn"))
			throw new ParserError("[Intenal] parseForStatement called on a non-for token");
		this.next();

		if (this.matchCurrent(tok.Identifier)) {
			const name = new ast.Variable(this.current().value);
			this.next();

			const params = this.parseParameterList();

			const body = this.parseBlock();

			return new ast.NamedFuncDecl(name, params, body);
		} else {
			const params = this.parseParameterList();

			const body = this.parseBlock();

			const func = new ast.AnonFuncDecl(params, body);;

			const args = this.parseArgumentList();

			return new ast.AnonFuncCall(func, args);
		}
	}

	parseForStatement(): ast.For {
		if (!this.matchCurrent(tok.Keyword, "for"))
			throw new ParserError("[Intenal] parseForStatement called on a non-for token");
		this.next();

		log("for");

		if (!this.matchCurrent(tok.Identifier))
			throw new ParserError("Expected a variable after the keyword for");
		log("-> variable");
		const variable = new ast.Variable(this.current().value);
		this.next();

		if (!this.matchCurrent(tok.Operator, "->"))
			throw new ParserError("Expected -> operator after variable in for loop");
		log("-> arrow");
		this.next();

		log("-> expression");
		const expression = this.parseExpression();

		const body = this.parseBlock();

		return new ast.For(variable, expression, body);
	}

	parseWhileStatement(): ast.While {
		if (!this.matchCurrent(tok.Keyword, "while"))
			throw new ParserError("[Intenal] parseWhileStatement called on a non-while token");
		this.next();

		log("while");

		const condition = this.parseExpression();

		const body = this.parseBlock();
		
		return new ast.While(condition, body);
	}

	parseLoopStatement(): ast.Loop {
		if (!this.matchCurrent(tok.Keyword, "loop"))
			throw new ParserError("[Intenal] parseLoopStatement called on a non-loop token");
		this.next();

		log("loop");

		const body = this.parseBlock();
		
		return new ast.Loop(body);
	}

	parseConstDeclaration(): ast.Const {
		log("const");

		if (!this.matchCurrent(tok.Keyword, "const"))
			throw new ParserError("[Intenal] parseConstDeclaration called on a non-const token");
		this.next();

		if (!this.matchCurrent(tok.Identifier))
			throw new ParserError("Expected a variable after const");
		const variable = new ast.Variable(this.current().value);
		this.next();

		if (!this.matchCurrent(tok.Operator, "="))
			throw new ParserError("Expected an equals sign after variable");
		this.next();

		const expression = this.parseExpression();

		this.eatSemicolon();

		return new ast.Const(variable, expression);
	}

	parseLetDeclaration(): ast.LetValue | ast.LetVariable {
		log("let");
		
		if (!this.matchCurrent(tok.Keyword, "let"))
			throw new ParserError("[Intenal] parseLetDeclaration called on a non-let token");
		this.next();

		if (!this.matchCurrent(tok.Identifier))
			throw new ParserError("Expected a variable after let");
		log("-> variable");
		const variable = new ast.Variable(this.current().value);
		this.next();

		if (this.matchCurrent(tok.Operator, "=")) {
			log("-> value");
			
			this.next();

			const expression = this.parseExpression();
	
			this.eatSemicolon();
	
			return new ast.LetValue(variable, expression);
		} else if (this.matchCurrent(tok.Punctuation, ";")) {
			this.eatSemicolon();
	
			return new ast.LetVariable(variable);
		} else {
			throw new ParserError("Expected either an equals sign or a semicolon after variable");
		}
	}

	parseExpressionStatement(): ast.Expression {
		log("expression statement");
		const expression = this.parseExpression();
		
		this.eatSemicolon();

		return expression;
	}

	parseAssignmentOrFunctionCall(): ast.Assignment | ast.NamedFuncCall {
		const token = this.current();
		if (!this.isEOF() && this.match(this.peek(), tok.Grouping, "(")) {
			log("function call");
			log("-> name");
			let name = token.value;
			let func = new ast.Variable(name);
			this.next();

			log("-> args");
			let args = this.parseArgumentList();

			this.eatSemicolon();

			return new ast.NamedFuncCall(func, args);
		} else {
			log("assignment");
			const name = token.value;
			const variable = new ast.Variable(name);
			this.next();

			const op = this.current().value;
			log("-> operator");
			this.next();

			const value = this.parseExpression();
			
			this.eatSemicolon();

			return new ast.Assignment(op, variable, value);
		}
	}

	// ===== EXPRESSIONS =====

	parseExpression(minPrecedence = 0): ast.Expression {
		log("expression");
		if (this.match(this.current(), tok.Grouping, "(")) {
			log("-> open parenthesis");
			this.next();
			const groupedExpression = this.parseExpression();

			if (!this.match(this.current(), tok.Grouping, ")")) {
				throw new ParserError("Expected closing parenthesis");
			}
			this.next();

			log("-> close parenthesis");

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

		if (this.matchCurrent(tok.Number)) {
			log("-> number");
			
			let value: number;
			if (token.value.includes(".")) {
				log("-> float");
				value = parseFloat(token.value.replace("_", ""));
			} else if (token.value.startsWith("0x")) {
				log("-> hex");
				value = parseInt(token.value.substring(2).replace("_", ""), 16);
			} else if (token.value.startsWith("0b")) {
				log("-> bin");
				value = parseInt(token.value.substring(2).replace("_", ""), 2);
			} else {
				log("-> dec");
				value = parseInt(token.value.replace("_", ""));
			}
			this.next();

			return new ast.Number(value);
		} else if (this.matchCurrent(tok.Quote)) {
			log("-> string");
			this.next();
			
			if (!this.matchCurrent(tok.String))
				throw new ParserError("[Internal] Expected string after quote");
			const value = this.current().value;
			this.next();

			if (!this.matchCurrent(tok.Quote))
				throw new ParserError("[Internal] Expected quote after string");
			this.next();

			return new ast.String(value);
		} else if (this.matchCurrent(tok.Boolean)) {
			log("-> bool");
			const value = token.value === "true";
			this.next();

			return new ast.Boolean(value);
		} else if (this.matchCurrent(tok.Null)) {
			log("-> null");

			this.next();
			return new ast.Null();
		} else if (this.matchCurrent(tok.Identifier)) {
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
		} else if (this.matchCurrent(tok.Grouping, "[")) {
			log("-> array literal");
			this.next();
			
			const values: ast.Node[] = [];
			while (!this.isEOF() && !this.matchCurrent(tok.Grouping, "]")) {
				values.push(this.parseExpression());

				if (this.matchCurrent(tok.Punctuation, ",")) {
					this.next();
				} else {
					break;
				}
			}

			if (!this.matchCurrent(tok.Grouping, "]")) 
				throw new ParserError(`Expected closing brackets on array literal, found ${this.current()}`);
			this.next();

			return new ast.Array(values);
		} else if (this.matchCurrent(tok.Keyword, "fn")) {
			log("-> anonymous function");
			this.next();
			
			const params = this.parseParameterList();

			const body = this.parseBlock();

			const func = new ast.AnonFuncDecl(params, body);

			if (this.matchCurrent(tok.Grouping, "(")) { 
				const args = this.parseArgumentList();

				return new ast.AnonFuncCall(func, args);
			}
			
			return func;
		} else {
			throw new ParserError(`Unexpected token ${this.current()}`);
		}
	}

	parseInfixExpression(left: ast.Expression, operator: string): ast.Expression {
		const operatorPrecedence = ops.getPrecedence(operator);
		const right = this.parseExpression(operatorPrecedence + 1);

		return new ast.BinaryOp(operator, left, right);
	}

	parseParameterList(): ast.Parameter[] {
		log("Parsing parameter list");
		const arr: ast.Parameter[] = [];
		let first = true;
		
		if (!this.match(this.current(), tok.Grouping, "(")) {
			throw new ParserError("[Internal] parseParameterList() called without opening parenthesis");
		}
		this.next();

		while (!this.isEOF()) {
			if (this.match(this.current(), tok.Grouping, ")")) break;
			if (first) {
				log("-> first param");
				first = false;
			} else {
				if (!this.match(this.current(), tok.Punctuation, ",")) {
					throw new ParserError("Missing comma in parameter list");
				}
				log("-> comma");
				this.next();
			}
			// last comma can be missing
			if (this.match(this.current(), tok.Grouping, ")")) break;
			arr.push(this.parseParameter());
		}

		if (!this.match(this.current(), tok.Grouping, ")")) {
			throw new ParserError("Missing end parenthesis for parameter list");
		}

		this.next();
		return arr;
	}

	parseParameter(): ast.Parameter {
		if (!this.matchCurrent(tok.Identifier))
			throw new ParserError("Expected a parameter");
		log("parameter");
		const variable = new ast.Variable(this.current().value);
		this.next();

		if (this.matchCurrent(tok.Operator, "=")) {
			log("-> defaulted")
			this.next();

			const _default = this.parseExpression();

			return new ast.DefaultedParameter(variable, _default);
		}

		return new ast.Parameter(variable);
	}

	parseArgumentList(): ast.Expression[] {
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

