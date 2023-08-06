import test, { ExecutionContext } from "ava";
import { tokenize } from "../src/lexer";
import * as tok from "../src/token";
import { Position } from "../src/position";



function givesOutputTokens(t: ExecutionContext<unknown>, input: string, expected: tok.Token[]) {
	const tokens = tokenize(input);
	t.deepEqual(tokens, expected);
}



test("Can tokenize an empty file", t => {
	givesOutputTokens(t, ``, [
		new tok.EOF(new Position(1, 0)),
	]);
});



test("Can tokenize a string", t => {
	givesOutputTokens(t, `"test string"`, [
		new tok.Quote(`"`, new Position(1, 0)),
		new tok.String("test string", new Position(1, 1)),
		new tok.Quote(`"`, new Position(1, 12)),
		new tok.EOF(new Position(1, 13)),
	]);
	givesOutputTokens(t, `"123 + 456"`, [
		new tok.Quote(`"`, new Position(1, 0)),
		new tok.String("123 + 456", new Position(1, 1)),
		new tok.Quote(`"`, new Position(1, 10)),
		new tok.EOF(new Position(1, 11)),
	]);
});



test("Can tokenize an empty string", t => {
	givesOutputTokens(t, `""`, [
		new tok.Quote(`"`, new Position(1, 0)),
		new tok.String("", new Position(1, 1)),
		new tok.Quote(`"`, new Position(1, 1)),
		new tok.EOF(new Position(1, 2)),
	]);
});



test("Can tokenize an integral decimal number", t => {
	givesOutputTokens(t, `1`, [
		new tok.Number(`1`, new Position(1, 0)),
		new tok.EOF(new Position(1, 1)),
	]);
	givesOutputTokens(t, `10`, [
		new tok.Number(`10`, new Position(1, 0)),
		new tok.EOF(new Position(1, 2)),
	]);
	givesOutputTokens(t, `357`, [
		new tok.Number(`357`, new Position(1, 0)),
		new tok.EOF(new Position(1, 3)),
	]);
	givesOutputTokens(t, `999_999`, [
		new tok.Number(`999_999`, new Position(1, 0)),
		new tok.EOF(new Position(1, 7)),
	]);
});



test("Can tokenize a fractional decimal number", t => {
	givesOutputTokens(t, `0.1`, [
		new tok.Number(`0.1`, new Position(1, 0)),
		new tok.EOF(new Position(1, 3)),
	]);
	givesOutputTokens(t, `3.14`, [
		new tok.Number(`3.14`, new Position(1, 0)),
		new tok.EOF(new Position(1, 4)),
	]);
	givesOutputTokens(t, `22.2222`, [
		new tok.Number(`22.2222`, new Position(1, 0)),
		new tok.EOF(new Position(1, 7)),
	]);
	givesOutputTokens(t, `1_000.000_001`, [
		new tok.Number(`1_000.000_001`, new Position(1, 0)),
		new tok.EOF(new Position(1, 13)),
	]);
});



test("Can tokenize a hexadecimal number", t => {
	givesOutputTokens(t, `0x0`, [
		new tok.Number(`0x0`, new Position(1, 0)),
		new tok.EOF(new Position(1, 3)),
	]);
	givesOutputTokens(t, `0xFF`, [
		new tok.Number(`0xFF`, new Position(1, 0)),
		new tok.EOF(new Position(1, 4)),
	]);
	givesOutputTokens(t, `0xAa`, [
		new tok.Number(`0xAa`, new Position(1, 0)),
		new tok.EOF(new Position(1, 4)),
	]);
	givesOutputTokens(t, `0x1A`, [
		new tok.Number(`0x1A`, new Position(1, 0)),
		new tok.EOF(new Position(1, 4)),
	]);
});



test("Can tokenize a binary number", t => {
	givesOutputTokens(t, `0b1`, [
		new tok.Number(`0b1`, new Position(1, 0)),
		new tok.EOF(new Position(1, 3)),
	]);
	givesOutputTokens(t, `0b1100`, [
		new tok.Number(`0b1100`, new Position(1, 0)),
		new tok.EOF(new Position(1, 6)),
	]);
	givesOutputTokens(t, `0b11111111_00000000`, [
		new tok.Number(`0b11111111_00000000`, new Position(1, 0)),
		new tok.EOF(new Position(1, 19)),
	]);
	givesOutputTokens(t, `0b0000`, [
		new tok.Number(`0b0000`, new Position(1, 0)),
		new tok.EOF(new Position(1, 6)),
	]);
});



test("Can tokenize a boolean", t => {
	givesOutputTokens(t, `true`, [
		new tok.Boolean(`true`, new Position(1, 0)),
		new tok.EOF(new Position(1, 4)),
	]);
	givesOutputTokens(t, `false`, [
		new tok.Boolean(`false`, new Position(1, 0)),
		new tok.EOF(new Position(1, 5)),
	]);
});



test("Can tokenize a null", t => {
	givesOutputTokens(t, `null`, [
		new tok.Null(`null`, new Position(1, 0)),
		new tok.EOF(new Position(1, 4)),
	]);
});



test("Can tokenize a group of parenthesis", t => {
	givesOutputTokens(t, `()`, [
		new tok.Grouping(`(`, new Position(1, 0)),
		new tok.Grouping(`)`, new Position(1, 1)),
		new tok.EOF(new Position(1, 2)),
	]);
});



test("Can tokenize a group of braces", t => {
	givesOutputTokens(t, `{}`, [
		new tok.Grouping(`{`, new Position(1, 0)),
		new tok.Grouping(`}`, new Position(1, 1)),
		new tok.EOF(new Position(1, 2)),
	]);
});



test("Can tokenize a group of brackets", t => {
	givesOutputTokens(t, `[]`, [
		new tok.Grouping(`[`, new Position(1, 0)),
		new tok.Grouping(`]`, new Position(1, 1)),
		new tok.EOF(new Position(1, 2)),
	]);
});



test("Can tokenize a spread operator", t => {
	givesOutputTokens(t, `...`, [
		new tok.Operator(`...`, new Position(1, 0)),
		new tok.EOF(new Position(1, 3)),
	]);
});



test("Can tokenize punctuation", t => {
	givesOutputTokens(t, `;`, [
		new tok.Punctuation(`;`, new Position(1, 0)),
		new tok.EOF(new Position(1, 1)),
	]);
	givesOutputTokens(t, `:`, [
		new tok.Punctuation(`:`, new Position(1, 0)),
		new tok.EOF(new Position(1, 1)),
	]);
	givesOutputTokens(t, `,`, [
		new tok.Punctuation(`,`, new Position(1, 0)),
		new tok.EOF(new Position(1, 1)),
	]);
});



test("Can tokenize keywords", t => {
	givesOutputTokens(t, `if`, [
		new tok.Keyword(`if`, new Position(1, 0)),
		new tok.EOF(new Position(1, 2)),
	]);
	givesOutputTokens(t, `fn`, [
		new tok.Keyword(`fn`, new Position(1, 0)),
		new tok.EOF(new Position(1, 2)),
	]);
	givesOutputTokens(t, `while`, [
		new tok.Keyword(`while`, new Position(1, 0)),
		new tok.EOF(new Position(1, 5)),
	]);
});



test("Can tokenize identifiers", t => {
	givesOutputTokens(t, `x`, [
		new tok.Identifier(`x`, new Position(1, 0)),
		new tok.EOF(new Position(1, 1)),
	]);
	givesOutputTokens(t, `_x`, [
		new tok.Identifier(`_x`, new Position(1, 0)),
		new tok.EOF(new Position(1, 2)),
	]);
	givesOutputTokens(t, `x2`, [
		new tok.Identifier(`x2`, new Position(1, 0)),
		new tok.EOF(new Position(1, 2)),
	]);
});



