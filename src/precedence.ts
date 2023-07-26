const assignment = [ "=", "+=", "-=", "*=", "/=", "//=", "%=", "**=", "&=", "|=", "^=", ">>=", "<<=", "&&=", "||=", "??=", "~=", ];
const bool = [ "&&", "||", "??" ];
const compare = [ "==", "~=", "<=", ">=", "<", ">" ];
const add = [ "+", "-" ];
const multiply = [ "*", "/", "//", "%" ];
const exponent = [ "**" ];
const binary = [ "&", "|", "^" ];
const shift = [ ">>", "<<" ];

export function getPrecedence(op: string): number {
	if (assignment.includes(op)) return 1;
	if (bool.includes(op)) return 2;
	if (compare.includes(op)) return 3;
	if (add.includes(op)) return 4;
	if (multiply.includes(op)) return 5;
	if (exponent.includes(op)) return 6;
	if (binary.includes(op)) return 7;
	if (shift.includes(op)) return 8;
	throw new Error("[Internal] Operator not found in precendence table");
}
