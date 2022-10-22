import {describe, expect, test} from '@jest/globals'
import { addDays, endOfDay, startOfMonth, subMonths } from "date-fns";
import { aggregationModeIndices, chartTimeScales } from '../src/components/Constants';
import { addEndBufferDays, addStartBufferDays, addStartBufferMonths, aggregateSegmentOfResponses, fillMissingDays, getDateRange } from "../src/components/DataUtil";

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

describe("addStartBufferDays", () => {
    const bufferValue = -1;

    test("no buffer needed (1)", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: addDays(startDate, 0).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 1).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 2).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 3).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 4).getTime(), value: bufferValue }
        ];
        const rangeStart = startDate.getTime();
        const results = addStartBufferDays(input, rangeStart);
        expect(results).toEqual(input);
    });

    test("no buffer needed (2)", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: addDays(startDate, 0).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 1).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 2).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 3).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 4).getTime(), value: bufferValue }
        ];
        const rangeStart = addDays(startDate, 2).getTime();
        const results = addStartBufferDays(input, rangeStart);
        expect(results).toEqual(input);
    });

    test("small start buffer", () => {
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
        const rangeStart = startDate.getTime();
        const results = addStartBufferDays(input, rangeStart);
        expect(results).toEqual(expected);
    });

    test("large start buffer", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: addDays(startDate, 6).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 7).getTime(), value: bufferValue }
        ];
        const expected = [
            { timestamp: addDays(startDate, 0).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 1).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 2).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 3).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 4).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 5).getTime(), value: bufferValue },
            ...input,
        ];
        const rangeStart = startDate.getTime();
        const results = addStartBufferDays(input, rangeStart);
        expect(results).toEqual(expected);
    });
});

describe("addStartBufferMonths", () => {
    test("no buffer needed, first is in start month", () => {
        const today = new Date(2020, 10, 1);
        const start = subMonths(today, 3);
        const end = today;
        const input = [
            { timestamp: subMonths(today, 3).getTime(), value: 0 },
            { timestamp: subMonths(today, 2).getTime(), value: 0 },
            { timestamp: subMonths(today, 1).getTime(), value: 0 },
            { timestamp: subMonths(today, 0).getTime(), value: 0 }
        ];
        const results = addStartBufferMonths(input, start, end);
        expect(results).toEqual(input);
    });

    test("no buffer needed, first is before start month ", () => {
        const today = new Date(2020, 10, 1);
        const start = subMonths(today, 2);
        const end = today;
        const input = [
            { timestamp: subMonths(today, 4).getTime(), value: 0 },
            { timestamp: subMonths(today, 3).getTime(), value: 0 },
            { timestamp: subMonths(today, 2).getTime(), value: 0 },
            { timestamp: subMonths(today, 1).getTime(), value: 0 },
            { timestamp: subMonths(today, 0).getTime(), value: 0 }
        ];
        const results = addStartBufferMonths(input, start, end);
        expect(results).toEqual(input);
    });

    test("small buffer", () => {
        const today = new Date(2020, 10, 1);
        const start = subMonths(today, 2);
        const end = today;
        const input = [
            { timestamp: subMonths(today, 1).getTime(), value: 0 },
            { timestamp: subMonths(today, 0).getTime(), value: 0 }
        ];
        const expected = [
            { timestamp: subMonths(today, 2).getTime(), value: -1 },
            ...input
        ];
        const results = addStartBufferMonths(input, start, end);
        expect(results).toEqual(expected);
    });

    test("large buffer", () => {
        const today = new Date(2020, 10, 1);
        const start = subMonths(today, 11);
        const end = today;
        const input = [
            { timestamp: today.getTime(), value: 0 }
        ];
        const expected = [
            { timestamp: subMonths(today, 11).getTime(), value: -1 },
            { timestamp: subMonths(today, 10).getTime(), value: -1 },
            { timestamp: subMonths(today, 9).getTime(), value: -1 },
            { timestamp: subMonths(today, 8).getTime(), value: -1 },
            { timestamp: subMonths(today, 7).getTime(), value: -1 },
            { timestamp: subMonths(today, 6).getTime(), value: -1 },
            { timestamp: subMonths(today, 5).getTime(), value: -1 },
            { timestamp: subMonths(today, 4).getTime(), value: -1 },
            { timestamp: subMonths(today, 3).getTime(), value: -1 },
            { timestamp: subMonths(today, 2).getTime(), value: -1 },
            { timestamp: subMonths(today, 1).getTime(), value: -1 },
            ...input
        ];
        const results = addStartBufferMonths(input, start, end);
        expect(results).toEqual(expected);
    });

    test("0 offset, full year", () => {
        const today = new Date(2020, 10, 1);
        const start = subMonths(today, 12);
        const end = today;
        const input = [
            { timestamp: subMonths(today, 4).getTime(), value: 1 },
            { timestamp: subMonths(today, 3).getTime(), value: 1 },
            { timestamp: subMonths(today, 2).getTime(), value: 1 },
            { timestamp: subMonths(today, 1).getTime(), value: 1 },
            { timestamp: subMonths(today, 0).getTime(), value: 1 }
        ];
        const expected = [
            { timestamp: subMonths(today, 11).getTime(), value: -1 },
            { timestamp: subMonths(today, 10).getTime(), value: -1 },
            { timestamp: subMonths(today, 9).getTime(), value: -1 },
            { timestamp: subMonths(today, 8).getTime(), value: -1 },
            { timestamp: subMonths(today, 7).getTime(), value: -1 },
            { timestamp: subMonths(today, 6).getTime(), value: -1 },
            { timestamp: subMonths(today, 5).getTime(), value: -1 },
            ...input
        ];
        const results = addStartBufferMonths(input, start, end);
        expect(results).toEqual(expected);
    });
});

describe("addEndBufferDays", () => {
    const bufferValue = -1;

    test("no end buffer needed (1)", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: addDays(startDate, 0).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 1).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 2).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 3).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 4).getTime(), value: bufferValue }
        ];
        const rangeEnd = addDays(startDate, 4).getTime();
        const results = addEndBufferDays(input, rangeEnd);
        expect(results).toEqual(input);
    });

    test("no end buffer needed (2)", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: addDays(startDate, 0).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 1).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 2).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 3).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 4).getTime(), value: bufferValue }
        ];
        const rangeEnd = addDays(startDate, 2).getTime();
        const results = addEndBufferDays(input, rangeEnd);
        expect(results).toEqual(input);
    });

    test("small end buffer", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: addDays(startDate, 0).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 5).getTime(), value: bufferValue }
        ];
        const expected = [
            ...input,
            { timestamp: addDays(startDate, 6).getTime(), value: bufferValue }
        ];
        const rangeEnd = addDays(startDate, 6).getTime();
        const results = addEndBufferDays(input, rangeEnd);
        expect(results).toEqual(expected);
    });

    test("large end buffer", () => {
        const startDate = new Date(2020, 0, 1);
        const input = [
            { timestamp: addDays(startDate, 0).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 1).getTime(), value: bufferValue }
        ];
        const expected = [
            ...input,
            { timestamp: addDays(startDate, 2).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 3).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 4).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 5).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 6).getTime(), value: bufferValue },
            { timestamp: addDays(startDate, 7).getTime(), value: bufferValue }
        ];
        const rangeEnd = addDays(startDate, 7).getTime();
        const results = addEndBufferDays(input, rangeEnd);
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

        const results = aggregateSegmentOfResponses(input, {aggregationModeIndex: aggregationModeIndices.avg, days: 1 });
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

        const results = aggregateSegmentOfResponses(input, {aggregationModeIndex: aggregationModeIndices.min, days: 3 });
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

        const results = aggregateSegmentOfResponses(input, {aggregationModeIndex: aggregationModeIndices.max, days: 7 });
        expect(results).toEqual(expected);
    });

    test("by month (1)", () => {
        const input = [
            { timestamp: new Date(2022, 5, 3).getTime(), value: 1 },
            { timestamp: new Date(2022, 5, 8).getTime(), value: 8 },
            { timestamp: new Date(2022, 6, 2).getTime(), value: 7 },
            { timestamp: new Date(2022, 7, 4).getTime(), value: 2 },
            { timestamp: new Date(2022, 7, 8).getTime(), value: 8 },
            { timestamp: new Date(2022, 8, 1).getTime(), value: 2 },
            { timestamp: new Date(2022, 8, 3).getTime(), value: 1 },
            { timestamp: new Date(2022, 8, 4).getTime(), value: 1 },
            { timestamp: new Date(2022, 8, 3).getTime(), value: 2 },
            { timestamp: new Date(2022, 8, 3).getTime(), value: 5 },
            { timestamp: new Date(2022, 9, 1).getTime(), value: 1 },
            { timestamp: new Date(2022, 9, 6).getTime(), value: 7 },
            { timestamp: new Date(2022, 9, 8).getTime(), value: 6 },
            { timestamp: new Date(2022, 9, 10).getTime(), value: 2 },
        ];
        const expected = [
            { timestamp: startOfMonth(new Date(2022, 5, 1)).getTime(), value: 4 },
            { timestamp: startOfMonth(new Date(2022, 6, 1)).getTime(), value: 7 },
            { timestamp: startOfMonth(new Date(2022, 7, 1)).getTime(), value: 5 },
            { timestamp: startOfMonth(new Date(2022, 8, 1)).getTime(), value: 2 },
            { timestamp: startOfMonth(new Date(2022, 9, 1)).getTime(), value: 4 },
        ];

        const results = aggregateSegmentOfResponses(input, {aggregationModeIndex: aggregationModeIndices.avg, byMonth: true });
        expect(results).toEqual(expected);
    });
});

describe("getDateRange", () => {
    test("0 offset, week scale (1)", () => {
        const today = new Date(2022, 0, 10);
        const range = getDateRange(chartTimeScales.week, 0, today);
        expect(range.start).toBe(new Date(2022, 0, 4).getTime());
        expect(range.end).toBe(endOfDay(new Date(2022, 0, 10)).getTime());
    });

    test("0 offset, week scale (2)", () => {
        const today = new Date(2022, 3, 30);
        const range = getDateRange(chartTimeScales.week, 0, today);
        expect(range.start).toBe(new Date(2022, 3, 24).getTime());
        expect(range.end).toBe(endOfDay(new Date(2022, 3, 30)).getTime());
    });

    test("0 offset, week scale (3)", () => {
        const today = new Date(2022, 5, 3);
        const range = getDateRange(chartTimeScales.week, 0, today);
        expect(range.start).toBe(new Date(2022, 4, 28).getTime());
        expect(range.end).toBe(endOfDay(new Date(2022, 5, 3)).getTime());
    });

    test("0 offset, month scale", () => {
        const today = new Date(2022, 9, 20);
        const range = getDateRange(chartTimeScales.month, 0, today);
        expect(range.start).toBe(new Date(2022, 8, 21).getTime());
        expect(range.end).toBe(endOfDay(new Date(2022, 9, 20)).getTime());
    });

    test("0 offset, year scale", () => {
        const today = new Date(2022, 6, 29);
        const range = getDateRange(chartTimeScales.year, 0, today);
        expect(range.start).toBe(new Date(2021, 6, 30).getTime());
        expect(range.end).toBe(endOfDay(new Date(2022, 6, 29)).getTime());
    });

    test("1 offset, week scale (1)", () => {
        // Start of week is 10/9, so end of range is 10/8.
        const today = new Date(2022, 9, 10);
        const range = getDateRange(chartTimeScales.week, 1, today);
        expect(range.start).toBe(new Date(2022, 9, 2).getTime());
        expect(range.end).toBe(endOfDay(new Date(2022, 9, 8)).getTime());
    });

    test("1 offset, week scale (2)", () => {
        // Start of week is 10/4, so end of range is 10/3.
        const today = new Date(2022, 8, 4);
        const range = getDateRange(chartTimeScales.week, 1, today);
        expect(range.start).toBe(new Date(2022, 7, 28).getTime());
        expect(range.end).toBe(endOfDay(new Date(2022, 8, 3)).getTime());
    });

    test("1 offset, week scale (3)", () => {
        // Start of week is 10/2, so end of range is 10/1.
        const today = new Date(2022, 9, 8);
        const range = getDateRange(chartTimeScales.week, 1, today);
        expect(range.start).toBe(new Date(2022, 8, 25).getTime());
        expect(range.end).toBe(endOfDay(new Date(2022, 9, 1)).getTime());
    });

    test("4 offset, week scale", () => {
        // Start of week is 10/16.
        const today = new Date(2022, 9, 19);
        const range = getDateRange(chartTimeScales.week, 4, today);
        expect(range.start).toBe(new Date(2022, 8, 18).getTime());
        expect(range.end).toBe(endOfDay(new Date(2022, 8, 24)).getTime());
    });

    test("4 offset, month scale", () => {
        const today = new Date(2022, 9, 31);
        const range = getDateRange(chartTimeScales.month, 4, today);
        expect(range.start).toBe(new Date(2022, 5, 1).getTime());
        expect(range.end).toBe(endOfDay(new Date(2022, 5, 30)).getTime());
    });

    test("4 offset, year scale", () => {
        const today = new Date(2022, 9, 31);
        const range = getDateRange(chartTimeScales.year, 4, today);
        expect(range.start).toBe(new Date(2018, 0, 1).getTime());
        expect(range.end).toBe(endOfDay(new Date(2018, 11, 31)).getTime());
    });

});