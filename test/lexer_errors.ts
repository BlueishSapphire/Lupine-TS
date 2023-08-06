import test, { ExecutionContext } from "ava";
import { tokenize } from "../src/lexer";
import * as err from "../src/errors";



function shouldThrowError(t: ExecutionContext<unknown>, expectedError: any, func: () => {}) {
	try {
		func();
		t.fail();
	} catch (error) {
		if (error instanceof expectedError) {
			t.pass();
		} else {
			t.fail();
		}
	}
}



test("Throws InvalidCharacterError", t => {
	shouldThrowError(t, err.InvalidCharacterError, tokenize.bind(null, "`"));
});

test("Throws InvalidNumberTypeError", t => {
	shouldThrowError(t, err.InvalidNumberTypeError, tokenize.bind(null, "1xFF"));
});

test("Throws UnterminatedStringError", t => {
	shouldThrowError(t, err.UnterminatedStringError, tokenize.bind(null, `"string`));
	shouldThrowError(t, err.UnterminatedStringError, tokenize.bind(null, `"`));
});