export enum TokenKind {
	Operator = "Operator",
	Punctuation = "Punctuation",
	Grouping = "Grouping",

	Quote = "Quote",

	String = "String",
	Number = "Number",
	Identifier = "Identifier",
	Keyword = "Keyword",
	Boolean = "Boolean",
	Null = "Null",

	EOF = "EOF"
};



export interface Token {
	kind: TokenKind,
	value: string
};