import {describe, expect, test} from '@jest/globals'
import { addDays } from "date-fns";
import { addEdgeBufferDays, aggregateSegmentOfResponses, fillMissingDays } from "../src/components/DataUtil";

describe("fillMissingDays", () => {
    test("no days to fill", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: startDate, value: 0 },
            { timestamp: addDays(startDate, 1), value: 2 },
            { timestamp: addDays(startDate, 2), value: 3 },
            { timestamp: addDays(startDate, 3), value: 4 },
            { timestamp: addDays(startDate, 4), value: 5 },
            { timestamp: addDays(startDate, 5), value: 6 },
        ];
        const results = fillMissingDays(input);
        expect(results).toEqual(input);
    });

    test("single missing day", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: startDate, value: 0 },
            { timestamp: addDays(startDate, 1), value: 0 },
            { timestamp: addDays(startDate, 2), value: 0 },
            { timestamp: addDays(startDate, 3), value: 0 },
            { timestamp: addDays(startDate, 4), value: 3 },
            { timestamp: addDays(startDate, 6), value: 5 },
        ];
        const expected = [...input];
        expected.splice(5, 0, { timestamp: addDays(startDate, 5), value: 4 });
        const results = fillMissingDays(input);
        expect(results).toEqual(expected);
    });

    test("large gap of missing days", () => {
        const startDate = new Date(2020, 0, 1);
        const expected = [
            { timestamp: startDate, value: 0 },
            { timestamp: addDays(startDate, 1), value: 0 },
            { timestamp: addDays(startDate, 2), value: 0 },
            { timestamp: addDays(startDate, 3), value: 9 },

            { timestamp: addDays(startDate, 4), value: 8 },
            { timestamp: addDays(startDate, 5), value: 7 },
            { timestamp: addDays(startDate, 6), value: 7 },
            { timestamp: addDays(startDate, 7), value: 6 },
            { timestamp: addDays(startDate, 8), value: 5 },
            { timestamp: addDays(startDate, 9), value: 5 },
            { timestamp: addDays(startDate, 10), value: 4 },
            { timestamp: addDays(startDate, 11), value: 3 },
            { timestamp: addDays(startDate, 12), value: 3 },
            { timestamp: addDays(startDate, 13), value: 2 },

            { timestamp: addDays(startDate, 14), value: 2 },
            { timestamp: addDays(startDate, 15), value: 0 },
            { timestamp: addDays(startDate, 16), value: 0 },
            { timestamp: addDays(startDate, 17), value: 0 },
            { timestamp: addDays(startDate, 18), value: 0 },
            { timestamp: addDays(startDate, 19), value: 0 },
        ];
        const input = [...expected];
        input.splice(4, 10);
        const results = fillMissingDays(input);
        expect(results).toEqual(expected);
    });

    test("multiple gaps of missing days", () => {
        const startDate = new Date(2020, 0, 1);
        const expected = [
            { timestamp: startDate, value: 0 },
            { timestamp: addDays(startDate, 1), value: 0 },
            { timestamp: addDays(startDate, 2), value: 2 },

            { timestamp: addDays(startDate, 3), value: 4 },
            { timestamp: addDays(startDate, 4), value: 6 },

            { timestamp: addDays(startDate, 5), value: 9 },
            { timestamp: addDays(startDate, 6), value: 0 },
            { timestamp: addDays(startDate, 7), value: 0 },
            { timestamp: addDays(startDate, 8), value: 0 },
            { timestamp: addDays(startDate, 9), value: 10 },

            { timestamp: addDays(startDate, 10), value: 8 },
            { timestamp: addDays(startDate, 11), value: 6 },
            { timestamp: addDays(startDate, 12), value: 4 },
            { timestamp: addDays(startDate, 13), value: 2 },

            { timestamp: addDays(startDate, 14), value: 1 },
            { timestamp: addDays(startDate, 15), value: 0 },
            { timestamp: addDays(startDate, 16), value: 2 },

            { timestamp: addDays(startDate, 17), value: 3 },

            { timestamp: addDays(startDate, 18), value: 5 },
            { timestamp: addDays(startDate, 19), value: 0 },
        ];
        const input = [...expected];
        input.splice(17, 1);
        input.splice(10, 4);
        input.splice(3, 2);
        const results = fillMissingDays(input);
        expect(results).toEqual(expected);
    });

});

describe("addEdgeBufferDays", () => {
    const bufferValue = -1;

    test("no buffers needed", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: addDays(startDate, 0), value: bufferValue },
            { timestamp: addDays(startDate, 1), value: bufferValue },
            { timestamp: addDays(startDate, 2), value: bufferValue },
            { timestamp: addDays(startDate, 3), value: bufferValue },
            { timestamp: addDays(startDate, 4), value: bufferValue }
        ];
        const range = { start: startDate, end: addDays(startDate, 4) };
        const results = addEdgeBufferDays(input, range);
        expect(results).toEqual(input);
    });

    test("add front buffer", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: addDays(startDate, 2), value: bufferValue },
            { timestamp: addDays(startDate, 6), value: bufferValue }
        ];
        const expected = [
            { timestamp: addDays(startDate, 0), value: bufferValue },
            { timestamp: addDays(startDate, 1), value: bufferValue },
            ...input
        ];
        const range = { start: startDate, end: addDays(startDate, 6) };
        const results = addEdgeBufferDays(input, range);
        expect(results).toEqual(expected);
    });

    test("add back buffer", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: startDate, value: bufferValue },
            { timestamp: addDays(startDate, 6), value: bufferValue }
        ];
        const expected = [
            ...input,
            { timestamp: addDays(startDate, 7), value: bufferValue },
            { timestamp: addDays(startDate, 8), value: bufferValue },
            { timestamp: addDays(startDate, 9), value: bufferValue },
            { timestamp: addDays(startDate, 10), value: bufferValue },
        ];
        const range = { start: startDate, end: addDays(startDate, 10) };
        const results = addEdgeBufferDays(input, range);
        expect(results).toEqual(expected);
    });

    test("both buffers needed", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: addDays(startDate, 2), value: bufferValue },
            { timestamp: addDays(startDate, 5), value: bufferValue }
        ];
        const expected = [
            { timestamp: addDays(startDate, 0), value: bufferValue },
            { timestamp: addDays(startDate, 1), value: bufferValue },
            ...input,
            { timestamp: addDays(startDate, 6), value: bufferValue },
            { timestamp: addDays(startDate, 7), value: bufferValue },
            { timestamp: addDays(startDate, 8), value: bufferValue }
        ];
        const range = { start: startDate, end: addDays(startDate, 8) };
        const results = addEdgeBufferDays(input, range);
        expect(results).toEqual(expected);
    });
});

describe("aggregateSegmentOfResponses", () => {
    test("1 day average", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: addDays(startDate, 0), value: 2 },
            { timestamp: addDays(startDate, 0), value: 1 },
            { timestamp: addDays(startDate, 0), value: 3 },
            { timestamp: addDays(startDate, 1), value: 8 },
            { timestamp: addDays(startDate, 2), value: 3 },
            { timestamp: addDays(startDate, 2), value: 7 },
            { timestamp: addDays(startDate, 4), value: 3 },
            { timestamp: addDays(startDate, 5), value: 0 },
        ];
        const expected = [
            { timestamp: addDays(startDate, 0), value: 2 },
            { timestamp: addDays(startDate, 1), value: 8 },
            { timestamp: addDays(startDate, 2), value: 5 },
            { timestamp: addDays(startDate, 4), value: 3 },
            { timestamp: addDays(startDate, 5), value: 0 },
        ];

        const results = aggregateSegmentOfResponses(input, 1, "avg");
        expect(results).toEqual(expected);
    });

    test("3 day min", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: addDays(startDate, 0), value: 2 },
            { timestamp: addDays(startDate, 0), value: 1 },
            { timestamp: addDays(startDate, 0), value: 3 },
            { timestamp: addDays(startDate, 1), value: 8 },
            { timestamp: addDays(startDate, 2), value: 3 },
            { timestamp: addDays(startDate, 2), value: 7 },
            { timestamp: addDays(startDate, 3), value: 7 },
            { timestamp: addDays(startDate, 4), value: 9 },
            { timestamp: addDays(startDate, 5), value: 6 },
        ];
        const expected = [
            { timestamp: addDays(startDate, 2), value: 1 },
            { timestamp: addDays(startDate, 5), value: 6 },
        ];

        const results = aggregateSegmentOfResponses(input, 3, "min");
        expect(results).toEqual(expected);
    });

    test("7 day max", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: addDays(startDate, 0), value: 2 },
            { timestamp: addDays(startDate, 0), value: 1 },
            { timestamp: addDays(startDate, 0), value: 3 },
            { timestamp: addDays(startDate, 1), value: 8 },
            { timestamp: addDays(startDate, 2), value: 3 },
            { timestamp: addDays(startDate, 2), value: 7 },

            { timestamp: addDays(startDate, 3), value: 7 },
            { timestamp: addDays(startDate, 4), value: 4 },
            { timestamp: addDays(startDate, 5), value: 3 },
            { timestamp: addDays(startDate, 6), value: 2 },
            { timestamp: addDays(startDate, 7), value: 6 },
            { timestamp: addDays(startDate, 8), value: 4 },
            { timestamp: addDays(startDate, 9), value: 6 },

            { timestamp: addDays(startDate, 10), value: 6 },
            { timestamp: addDays(startDate, 11), value: 9 },
            { timestamp: addDays(startDate, 12), value: 6 },
            { timestamp: addDays(startDate, 13), value: 6 },
            { timestamp: addDays(startDate, 14), value: 3 },
            { timestamp: addDays(startDate, 15), value: 4 },
            { timestamp: addDays(startDate, 15), value: 6 },
            { timestamp: addDays(startDate, 16), value: 7 },
        ];
        const expected = [
            { timestamp: addDays(startDate, 2), value: 8 },
            { timestamp: addDays(startDate, 9), value: 7 },
            { timestamp: addDays(startDate, 16), value: 9 },
        ];

        const results = aggregateSegmentOfResponses(input, 7, "max");
        expect(results).toEqual(expected);
    });
});