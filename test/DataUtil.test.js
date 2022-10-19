import {describe, expect, test} from '@jest/globals'
import { addDays } from "date-fns";
import { addEdgeBufferDays, aggregateSegmentOfResponses, fillMissingDays } from "../src/components/DataUtil";

describe("fillMissingDays", () => {
    test("no days to fill", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: startDate, value: 0 },
            { timestamp: addDays(startDate, 1).getTime(), value: 2 },
            { timestamp: addDays(startDate, 2).getTime(), value: 3 },
            { timestamp: addDays(startDate, 3).getTime(), value: 4 },
            { timestamp: addDays(startDate, 4).getTime(), value: 5 },
            { timestamp: addDays(startDate, 5).getTime(), value: 6 },
        ];
        const results = fillMissingDays(input);
        expect(results).toEqual(input);
    });

    test("single missing day", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: startDate, value: 0 },
            { timestamp: addDays(startDate, 1).getTime(), value: 0 },
            { timestamp: addDays(startDate, 2).getTime(), value: 0 },
            { timestamp: addDays(startDate, 3).getTime(), value: 0 },
            { timestamp: addDays(startDate, 4).getTime(), value: 3 },
            { timestamp: addDays(startDate, 6).getTime(), value: 5 },
        ];
        const expected = [...input];
        expected.splice(5, 0, { timestamp: addDays(startDate, 5).getTime(), value: 4 });
        const results = fillMissingDays(input);
        expect(results).toEqual(expected);
    });

    test("large gap of missing days", () => {
        const startDate = new Date(2020, 0, 1);
        const expected = [
            { timestamp: startDate.getTime(), value: 0 },
            { timestamp: addDays(startDate, 1).getTime(), value: 0 },
            { timestamp: addDays(startDate, 2).getTime(), value: 0 },
            { timestamp: addDays(startDate, 3).getTime(), value: 9 },

            { timestamp: addDays(startDate, 4).getTime(), value: 8 },
            { timestamp: addDays(startDate, 5).getTime(), value: 7 },
            { timestamp: addDays(startDate, 6).getTime(), value: 7 },
            { timestamp: addDays(startDate, 7).getTime(), value: 6 },
            { timestamp: addDays(startDate, 8).getTime(), value: 5 },
            { timestamp: addDays(startDate, 9).getTime(), value: 5 },
            { timestamp: addDays(startDate, 10).getTime(), value: 4 },
            { timestamp: addDays(startDate, 11).getTime(), value: 3 },
            { timestamp: addDays(startDate, 12).getTime(), value: 3 },
            { timestamp: addDays(startDate, 13).getTime(), value: 2 },

            { timestamp: addDays(startDate, 14).getTime(), value: 2 },
            { timestamp: addDays(startDate, 15).getTime(), value: 0 },
            { timestamp: addDays(startDate, 16).getTime(), value: 0 },
            { timestamp: addDays(startDate, 17).getTime(), value: 0 },
            { timestamp: addDays(startDate, 18).getTime(), value: 0 },
            { timestamp: addDays(startDate, 19).getTime(), value: 0 },
        ];
        const input = [...expected];
        input.splice(4, 10);
        const results = fillMissingDays(input);
        expect(results).toEqual(expected);
    });

    test("multiple gaps of missing days", () => {
        const startDate = new Date(2020, 0, 1);
        const expected = [
            { timestamp: startDate.getTime(), value: 0 },
            { timestamp: addDays(startDate, 1).getTime(), value: 0 },
            { timestamp: addDays(startDate, 2).getTime(), value: 2 },

            { timestamp: addDays(startDate, 3).getTime(), value: 4 },
            { timestamp: addDays(startDate, 4).getTime(), value: 6 },

            { timestamp: addDays(startDate, 5).getTime(), value: 9 },
            { timestamp: addDays(startDate, 6).getTime(), value: 0 },
            { timestamp: addDays(startDate, 7).getTime(), value: 0 },
            { timestamp: addDays(startDate, 8).getTime(), value: 0 },
            { timestamp: addDays(startDate, 9).getTime(), value: 10 },

            { timestamp: addDays(startDate, 10).getTime(), value: 8 },
            { timestamp: addDays(startDate, 11).getTime(), value: 6 },
            { timestamp: addDays(startDate, 12).getTime(), value: 4 },
            { timestamp: addDays(startDate, 13).getTime(), value: 2 },

            { timestamp: addDays(startDate, 14).getTime(), value: 1 },
            { timestamp: addDays(startDate, 15).getTime(), value: 0 },
            { timestamp: addDays(startDate, 16).getTime(), value: 2 },

            { timestamp: addDays(startDate, 17).getTime(), value: 3 },

            { timestamp: addDays(startDate, 18).getTime(), value: 5 },
            { timestamp: addDays(startDate, 19).getTime(), value: 0 },
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
            { timestamp: addDays(startDate, 0).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 1).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 2).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 3).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 4).getTime(), value: bufferValue }
        ];
        const range = { start: startDate.getTime(), end: addDays(startDate, 4).getTime() };
        const results = addEdgeBufferDays(input, range);
        expect(results).toEqual(input);
    });

    test("add front buffer", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: addDays(startDate, 2).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 6).getTime(), value: bufferValue }
        ];
        const expected = [
            { timestamp: addDays(startDate, 0).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 1).getTime(), value: bufferValue },
            ...input
        ];
        const range = { start: startDate.getTime(), end: addDays(startDate, 6).getTime() };
        const results = addEdgeBufferDays(input, range);
        expect(results).toEqual(expected);
    });

    test("add back buffer", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: startDate.getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 6).getTime(), value: bufferValue }
        ];
        const expected = [
            ...input,
            { timestamp: addDays(startDate, 7).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 8).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 9).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 10).getTime(), value: bufferValue },
        ];
        const range = { start: startDate.getTime(), end: addDays(startDate, 10).getTime() };
        const results = addEdgeBufferDays(input, range);
        expect(results).toEqual(expected);
    });

    test("both buffers needed", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: addDays(startDate, 2).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 5).getTime(), value: bufferValue }
        ];
        const expected = [
            { timestamp: addDays(startDate, 0).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 1).getTime(), value: bufferValue },
            ...input,
            { timestamp: addDays(startDate, 6).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 7).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 8).getTime(), value: bufferValue }
        ];
        const range = { start: startDate.getTime(), end: addDays(startDate, 8).getTime() };
        const results = addEdgeBufferDays(input, range);
        expect(results).toEqual(expected);
    });
});

describe("aggregateSegmentOfResponses", () => {
    test("1 day average", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: addDays(startDate, 0).getTime(), value: 2 },
            { timestamp: addDays(startDate, 0).getTime(), value: 1 },
            { timestamp: addDays(startDate, 0).getTime(), value: 3 },
            { timestamp: addDays(startDate, 1).getTime(), value: 8 },
            { timestamp: addDays(startDate, 2).getTime(), value: 3 },
            { timestamp: addDays(startDate, 2).getTime(), value: 7 },
            { timestamp: addDays(startDate, 4).getTime(), value: 3 },
            { timestamp: addDays(startDate, 5).getTime(), value: 0 },
        ];
        const expected = [
            { timestamp: addDays(startDate, 0).getTime(), value: 2 },
            { timestamp: addDays(startDate, 1).getTime(), value: 8 },
            { timestamp: addDays(startDate, 2).getTime(), value: 5 },
            { timestamp: addDays(startDate, 4).getTime(), value: 3 },
            { timestamp: addDays(startDate, 5).getTime(), value: 0 },
        ];

        const results = aggregateSegmentOfResponses(input, 1, "avg");
        expect(results).toEqual(expected);
    });

    test("3 day min", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: addDays(startDate, 0).getTime(), value: 2 },
            { timestamp: addDays(startDate, 0).getTime(), value: 1 },
            { timestamp: addDays(startDate, 0).getTime(), value: 3 },
            { timestamp: addDays(startDate, 1).getTime(), value: 8 },
            { timestamp: addDays(startDate, 2).getTime(), value: 3 },
            { timestamp: addDays(startDate, 2).getTime(), value: 7 },
            { timestamp: addDays(startDate, 3).getTime(), value: 7 },
            { timestamp: addDays(startDate, 4).getTime(), value: 9 },
            { timestamp: addDays(startDate, 5).getTime(), value: 6 },
        ];
        const expected = [
            { timestamp: addDays(startDate, 2).getTime(), value: 1 },
            { timestamp: addDays(startDate, 5).getTime(), value: 6 },
        ];

        const results = aggregateSegmentOfResponses(input, 3, "min");
        expect(results).toEqual(expected);
    });

    test("7 day max", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: addDays(startDate, 0).getTime(), value: 2 },
            { timestamp: addDays(startDate, 0).getTime(), value: 1 },
            { timestamp: addDays(startDate, 0).getTime(), value: 3 },
            { timestamp: addDays(startDate, 1).getTime(), value: 8 },
            { timestamp: addDays(startDate, 2).getTime(), value: 3 },
            { timestamp: addDays(startDate, 2).getTime(), value: 7 },

            { timestamp: addDays(startDate, 3).getTime(), value: 7 },
            { timestamp: addDays(startDate, 4).getTime(), value: 4 },
            { timestamp: addDays(startDate, 5).getTime(), value: 3 },
            { timestamp: addDays(startDate, 6).getTime(), value: 2 },
            { timestamp: addDays(startDate, 7).getTime(), value: 6 },
            { timestamp: addDays(startDate, 8).getTime(), value: 4 },
            { timestamp: addDays(startDate, 9).getTime(), value: 6 },

            { timestamp: addDays(startDate, 10).getTime(), value: 6 },
            { timestamp: addDays(startDate, 11).getTime(), value: 9 },
            { timestamp: addDays(startDate, 12).getTime(), value: 6 },
            { timestamp: addDays(startDate, 13).getTime(), value: 6 },
            { timestamp: addDays(startDate, 14).getTime(), value: 3 },
            { timestamp: addDays(startDate, 15).getTime(), value: 4 },
            { timestamp: addDays(startDate, 15).getTime(), value: 6 },
            { timestamp: addDays(startDate, 16).getTime(), value: 7 },
        ];
        const expected = [
            { timestamp: addDays(startDate, 2).getTime(), value: 8 },
            { timestamp: addDays(startDate, 9).getTime(), value: 7 },
            { timestamp: addDays(startDate, 16).getTime(), value: 9 },
        ];

        const results = aggregateSegmentOfResponses(input, 7, "max");
        expect(results).toEqual(expected);
    });
});