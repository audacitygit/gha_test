// app.test.js
import { expect, test } from "vitest";

// should pass
test("2 + 2 should equal 4", () => {
    expect(2 + 2).toBe(4);
});

// should fail
test("2 + 2 should equal 5", () => {
    expect(2 + 2).toBe(5);
});
