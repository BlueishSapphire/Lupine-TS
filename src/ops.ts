// weird quirk, all operators that consist of multiple characters
// must start with a single-character operator

export namespace chars {
	export const MEMBER = ".";
	export const MEMBER_NULLISH = "?.";

	export const FOR = "->";
	export const BETWEEN = "..";
	export const SPREAD = "...";

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

export const ASSIGNMENT = [
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
export const BOOL = [
	chars.BOOL_AND,
	chars.BOOL_NOT,
	chars.BOOL_OR,
	chars.BOOL_XOR,
];
export const COMPARE = [
	chars.COMP_EQ,
	chars.COMP_NE,
	chars.COMP_GT,
	chars.COMP_GE,
	chars.COMP_LT,
	chars.COMP_LE,
];
export const ADD = [ chars.ADD, chars.SUB ];
export const MULTIPLY = [ chars.MULT, chars.DIV, chars.MOD, chars.INTDIV ];
export const EXPONENT = [ chars.POW ];
export const BINARY = [ chars.BIT_AND, chars.BIT_OR, chars.BIT_XOR ];
export const SHIFT = [ chars.BIT_LSHIFT, chars.BIT_RSHIFT ];
export const BETWEEN = [ chars.BETWEEN ];
export const UNARY = [ chars.BOOL_NOT, chars.BIT_INV, chars.SPREAD ];
export const MEMBER = [ chars.MEMBER, chars.MEMBER_NULLISH ];



export const ALL = [chars.FOR, ...MEMBER, ...BETWEEN, ...ASSIGNMENT, ...BOOL, ...COMPARE, ...ADD, ...MULTIPLY, ...EXPONENT, ...BINARY, ...SHIFT, ...UNARY];
export const isOperator = (s: string): boolean => ALL.includes(s);



export function getPrecedence(op: string): number {
	if (MEMBER.includes(op))     return 11;
	if (UNARY.includes(op))      return 10;
	if (BETWEEN.includes(op))    return 9;
	if (SHIFT.includes(op))      return 8;
	if (BINARY.includes(op))     return 7;
	if (EXPONENT.includes(op))   return 6;
	if (MULTIPLY.includes(op))   return 5;
	if (ADD.includes(op))        return 4;
	if (COMPARE.includes(op))    return 3;
	if (BOOL.includes(op))       return 2;
	if (ASSIGNMENT.includes(op)) return 1;
	throw new Error("[Internal] Operator not found in precendence table");
}
