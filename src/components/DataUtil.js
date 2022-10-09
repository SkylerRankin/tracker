import { subWeeks, subMonths, subYears, isBefore, isAfter, maxTime, minTime, isSameDay, addDays, startOfDay, endOfDay, differenceInDays, subDays } from "date-fns";

const getDateRange = context => {
    const scale = context.chartTimeScale;
    const offset = context.chartTimeOffset;
    const today = new Date();
    const endDate =
        scale === 0 ? subWeeks(today, offset) :
        scale === 1 ? subMonths(today, offset) :
        subYears(today, offset);
    const startDate =
        scale === 0 ? addDays(subWeeks(today, offset + 1), 1) :
        scale === 1 ? addDays(subMonths(today, offset + 1), 1) :
        addDays(subYears(today, offset + 1), 1);
    return { start: startOfDay(startDate), end: endOfDay(endDate) };
}

const getDataset = (context, trackerIndex) => {
    const range = getDateRange(context);
    const responsesInRange = context.pastResponses[trackerIndex].filter(response =>
        !isBefore(response.timestamp, range.start) && !isAfter(response.timestamp, range.end));

    if (responsesInRange.length === 0) return [];
    
    const dataset = responsesInRange.map(response => ({ timestamp: response.timestamp, value: response.value }));

    const firstResponse = dataset.reduce((prev, curr) => isBefore(curr.timestamp, prev) ? curr.timestamp : prev, maxTime);
    const lastResponse = dataset.reduce((prev, curr) => isAfter(curr.timestamp, prev) ? curr.timestamp : prev, minTime);

    let startBufferSize = -1, endBufferSize = -1;

    // If the first date in the range is not the first date of the range, need some padding.
    if (!isSameDay(range.start, firstResponse)) {
        startBufferSize = differenceInDays(firstResponse, range.start);
        const bufferValues = [];
        for (let i = 0; i < startBufferSize; i++) {
            bufferValues.push({
                timestamp: subDays(new Date(firstResponse), i + 1).getTime(),
                value: 0 // TODO set this to the next actual data point, not 0
            });
        }
        dataset.unshift(...bufferValues)
    }

    // If the last date in the range is not the last date of the range, need some padding.
    if (!isSameDay(range.end, lastResponse)) {
        endBufferSize = differenceInDays(range.end, lastResponse);
        const bufferValues = [];
        for (let i = 0; i < endBufferSize; i++) {
            bufferValues.push({
                timestamp: subDays(new Date(lastResponse), i).getTime(),
                value: 0
            });
        }
        dataset.push(...bufferValues)
    }

    return { dataset, startBufferSize, endBufferSize  };
}

export { getDateRange, getDataset }