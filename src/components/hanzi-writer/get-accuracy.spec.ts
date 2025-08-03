import { expect, suite, test } from "vitest";
import { getAccuracy } from "./get-accuracy";

suite("getAccuracy", () => {
    test.each([1,2,3,10,25,50,100,200])("if mistakes = 0 and hints = 0, accuracy is 1 (strokes: %s)", (strokes) => {
        const accuracy = getAccuracy({ hints: 0, mistakes: 0, strokes});
        expect(accuracy).toBe(1);
    });

    test.each([1,2,3,10,25,50,100,200])("a hint costs more than an error (strokes %s)", (strokes) => {
        const hintAccuracy = getAccuracy({ hints: 1, mistakes: 0, strokes});
        const mistakeAccuracy = getAccuracy({ hints: 0, mistakes: 1, strokes});

        expect(hintAccuracy < mistakeAccuracy).toBe(true);
    });

    test.each([3,10,25,50,100,200])("hints and mistakes contribute to a lower accuracy (stroke %s)", (strokes) => {
        const a = getAccuracy({ hints: 1, mistakes: 1, strokes});
        const b = getAccuracy({ hints: 1, mistakes:0, strokes});

        expect(a).toBeLessThan(b);
    })
})