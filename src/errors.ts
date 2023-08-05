import { Position } from "./position";



// ===== GENERIC COMPILER ERRORS =====

export class CompilerError extends Error {
	name = "CompilerError";

	constructor(pos: Position, message: string) {
		super(`Line ${pos.line}, Column ${pos.col}: ${message}`);
	}
}

export class InternalCompilerError extends CompilerError {
	name = "InternalCompilerError";

	constructor(pos: Position, message: string) {
		super(pos, "[Internal] " + message);
	}
}

export class UnexpectedEOFError extends CompilerError {
	name = "UnexpectedEOFError";

	constructor(pos: Position) {
		super(pos, `Unexpected EOF`);
	}
}



// ===== LEXER SPECIFIC ERRORS =====

export class LexerError extends CompilerError {
	name = "LexerError";
}

export class InternalLexerError extends LexerError {
	name = "InternalLexerError";

	constructor(pos: Position, message: string) {
		super(pos, "[Internal] " + message);
	}
}

export class InvalidCharacterError extends LexerError {
	name = "InvalidCharacterError";

	constructor(pos: Position, char: string) {
		super(pos, `Unrecognized character ${char}`);
	}
}

export class UnterminatedStringError extends LexerError {
	name = "UnterminatedStringError";

	constructor(pos: Position) {
		super(pos, `Missing an ending quote`);
	}
}

export class InvalidNumberTypeError extends LexerError {
	name = "InvalidNumberTypeError";

	constructor(pos: Position, start: string) {
		super(pos, `Number should start with 0x for hexadecimal or 0b for binary. Found a number that starts with ${start}`);
	}
}



// ===== PARSER SPECIFIC ERRORS =====

export class ParserError extends CompilerError {
	name = "ParserError";
}

export class InternalParserError extends ParserError {
	name = "InternalParserError";

	constructor(pos: Position, message: string) {
		super(pos, "[Internal] " + message);
	}
}

export class UnexpectedTokenError extends ParserError {
	name = "UnexpectedTokenError";

	constructor(pos: Position, expected: string, found: string) {
		super(pos, `Expected token of type ${expected}, but found ${found} instead`);
	}
}

export class MissingSemicolonError extends ParserError {
	name = "MissingSemicolonError";

	constructor(pos: Position) {
		super(pos, `Missing semicolon`);
	}
}

export class MissingOpenBraceError extends ParserError {
	name = "MissingOpenBraceError";

	constructor(pos: Position) {
		super(pos, `Missing opening brace before code block`);
	}
}

export class MissingCloseBraceError extends ParserError {
	name = "MissingCloseBraceError";

	constructor(pos: Position) {
		super(pos, `Missing closing brace after code block`);
	}
}

export class MissingCloseParenthesisError extends ParserError {
	name = "MissingCloseParenthesisError";

	constructor(pos: Position) {
		super(pos, `Missing closing parenthesis`);
	}
}

export class UnterminatedArrayLiteralError extends ParserError {
	name = "UnterminatedArrayLiteralError";

	constructor(pos: Position) {
		super(pos, `Missing closing brackets after array literal`);
	}
}

export class ExpectedVariableAfterForError extends ParserError {
	name = "ExpectedVariableAfterForError";

	constructor(pos: Position) {
		super(pos, `Expected a variable name after the "for" keyword`);
	}
}

export class ExpectedOperatorAfterForError extends ParserError {
	name = "ExpectedOperatorAfterForError";

	constructor(pos: Position) {
		super(pos, `Expected an operator after the variable in a for loop`);
	}
}

export class ExpectedVariableAfterConstError extends ParserError {
	name = "ExpectedVariableAfterConstError";

	constructor(pos: Position) {
		super(pos, `Expected a variable name after the "const" keyword`);
	}
}

export class ExpectedEqualsAfterConstError extends ParserError {
	name = "ExpectedEqualsAfterConstError";

	constructor(pos: Position) {
		super(pos, `Expected an equal sign after the variable name in a const declaration (hint: constants must always be initialized with a value)`);
	}
}

export class ExpectedValueAfterConstError extends ParserError {
	name = "ExpectedValueAfterConstError";

	constructor(pos: Position) {
		super(pos, `Expected a value after the equal sign in a const declaration`);
	}
}

export class ExpectedVariableAfterLetError extends ParserError {
	name = "ExpectedVariableAfterLetError";

	constructor(pos: Position) {
		super(pos, `Expected a variable name after the "let" keyword`);
	}
}

export class MissingCommaInArgumentListError extends ParserError {
	name = "MissingCommaInArgumentListError";

	constructor(pos: Position) {
		super(pos, `Missing comma after an argument`);
	}
}

export class MissingCloseParenthesisAfterArgumentError extends ParserError {
	name = "MissingCloseParenthesisAfterArgumentError";

	constructor(pos: Position) {
		super(pos, `Missing closing parenthesis after arguments`);
	}
}

export class ExpectedArgumentError extends ParserError {
	name = "ExpectedArgumentError";

	constructor(pos: Position) {
		super(pos, `Expected an argument`);
	}
}


