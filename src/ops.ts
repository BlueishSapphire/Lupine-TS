export namespace chars {
	export const ADD = "+";
	export const SUB = "-";
	export const MULT = "*";
	export const DIV = "/";
	export const MOD = "%";
	export const INTDIV = "//";
	export const POW = "**";
	export const BIT_OR = "|";
	export const BIT_AND = "&";
	export const BIT_XOR = "^";
	export const BIT_INV = "~";
	export const BIT_LSHIFT = "<<";
	export const BIT_RSHIFT = ">>";
	export const BOOL_AND = "&&";
	export const BOOL_OR = "||";
	export const BOOL_XOR = "^^";
	export const BOOL_NOT = "!";
	export const NULLISH = "??";

	export const ASSIGN = "=";
	export const ASSIGN_ADD = ADD + ASSIGN;
	export const ASSIGN_SUB = SUB + ASSIGN;
	export const ASSIGN_MULT = MULT + ASSIGN;
	export const ASSIGN_DIV = DIV + ASSIGN;
	export const ASSIGN_MOD = MOD + ASSIGN;
	export const ASSIGN_INTDIV = INTDIV + ASSIGN;
	export const ASSIGN_POW = POW + ASSIGN;
	export const ASSIGN_BIT_OR = BIT_OR + ASSIGN;
	export const ASSIGN_BIT_AND = BIT_AND + ASSIGN;
	export const ASSIGN_BIT_XOR = BIT_XOR + ASSIGN;
	export const ASSIGN_BIT_INV = BIT_INV + ASSIGN;
	export const ASSIGN_BIT_LSHIFT = BIT_LSHIFT + ASSIGN;
	export const ASSIGN_BIT_RSHIFT = BIT_RSHIFT + ASSIGN;
	export const ASSIGN_BOOL_OR = BOOL_OR + ASSIGN;
	export const ASSIGN_BOOL_AND = BOOL_AND + ASSIGN;
	export const ASSIGN_BOOL_XOR = BOOL_XOR + ASSIGN;
	export const ASSIGN_NULLISH = NULLISH + ASSIGN;

	export const COMP_EQ = "==";
	export const COMP_NE = "!=";
	export const COMP_GT = ">";
	export const COMP_GE = ">=";
	export const COMP_LT = "<";
	export const COMP_LE = "<=";
}

const assignment = [
	chars.ASSIGN,
	chars.ASSIGN_ADD,
	chars.ASSIGN_SUB,
	chars.ASSIGN_MULT,
	chars.ASSIGN_DIV,
	chars.ASSIGN_MOD,
	chars.ASSIGN_INTDIV,
	chars.ASSIGN_POW,
	chars.ASSIGN_BIT_OR,
	chars.ASSIGN_BIT_AND,
	chars.ASSIGN_BIT_XOR,
	chars.ASSIGN_BIT_INV,
	chars.ASSIGN_BIT_LSHIFT,
	chars.ASSIGN_BIT_RSHIFT,
	chars.ASSIGN_BOOL_OR,
	chars.ASSIGN_BOOL_AND,
	chars.ASSIGN_BOOL_XOR,
	chars.ASSIGN_NULLISH,
];
const bool = [
	chars.BOOL_AND,
	chars.BOOL_NOT,
	chars.BOOL_OR,
	chars.BOOL_XOR,
];
const compare = [
	chars.COMP_EQ,
	chars.COMP_NE,
	chars.COMP_GT,
	chars.COMP_GE,
	chars.COMP_LT,
	chars.COMP_LE,
];
const add = [ chars.ADD, chars.SUB ];
const multiply = [ chars.MULT, chars.DIV, chars.MOD, chars.INTDIV ];
const exponent = [ chars.POW ];
const binary = [ chars.BIT_AND, chars.BIT_OR, chars.BIT_XOR ];
const shift = [ chars.BIT_LSHIFT, chars.BIT_RSHIFT ];
const unary = [ chars.BOOL_NOT, chars.BIT_INV ];



export const ALL = [...assignment, ...bool, ...compare, ...add, ...multiply, ...exponent, ...binary, ...shift, ...unary];
export const isOperator = (s: string): boolean => ALL.includes(s);



export function getPrecedence(op: string): number {
	if (assignment.includes(op)) return 1;
	if (bool.includes(op)) return 2;
	if (compare.includes(op)) return 3;
	if (add.includes(op)) return 4;
	if (multiply.includes(op)) return 5;
	if (exponent.includes(op)) return 6;
	if (binary.includes(op)) return 7;
	if (shift.includes(op)) return 8;
	if (unary.includes(op)) return 9;
	throw new Error("[Internal] Operator not found in precendence table");
}
