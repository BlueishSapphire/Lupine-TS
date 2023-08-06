import test from "ava";
import * as fs from "fs";
import { tokenize } from "../src/lexer";
import { parse } from "../src/parser";



const examples = fs.readdirSync("./examples").filter(name => name.endsWith(".lup"));
for (const example of examples) {
	const contents = fs.readFileSync("./examples/" + example).toString();

	test(`Can lex examples/${example} without errors`, t => {
		try {
			tokenize(contents);
			t.pass();
		} catch (err) {
			t.fail();
			throw err;
		}
	});

	test(`Can lex and parse examples/${example} without errors`, t => {
		try {
			parse(tokenize(contents));
			t.pass();
		} catch (err) {
			t.fail();
			throw err;
		}
	});
}