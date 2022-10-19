import { subWeeks, subMonths, subYears, isBefore, isAfter, maxTime, minTime, isSameDay, addDays, startOfDay, endOfDay, differenceInDays, subDays } from "date-fns";
import { aggregationModes, graphTimeRanges } from "./Constants";

const arrayAvg = a => a.reduce((prev, curr) => prev + curr, 0) / a.length;
const arrayMax = a => a.reduce((prev, curr) => Math.max(prev, curr), a[0]);
const arrayMin = a => a.reduce((prev, curr) => Math.min(prev, curr), a[0]);

const getDateRange = (chartTimeScale, chartTimeOffset) => {
    const scale = chartTimeScale;
    const offset = chartTimeOffset;
    const today = new Date();
    const endDate =
        scale === 0 ? subWeeks(today, offset) :
        scale === 1 ? subMonths(today, offset) :
        subYears(today, offset);
    const startDate =
        scale === 0 ? addDays(subWeeks(today, offset + 1), 1) :
        scale === 1 ? addDays(subMonths(today, offset + 1), 1) :
        addDays(subYears(today, offset + 1), 1);
    return { start: startOfDay(startDate).getTime(), end: endOfDay(endDate).getTime() };
}

/**
 * Aggregates an array of { timestamp, value } into groups of days that are less than
 * `days` days apart. For instance, days = 1 would aggregate every individual day. Setting
 * days = 3 would mean each group of three consecutive days (distance of 0, 1, and 2). The
 * counting starts from the largest date and works backwards.
 */
const aggregateSegmentOfResponses = (dataset, days, mode) => {
    const aggregated = [];
    let currentSegmentStart = dataset[dataset.length - 1].timestamp;
    let valuesInSegment = [];

    const addSegment = () => {
        const value = mode === "avg" ? arrayAvg(valuesInSegment) :
            mode === "max" ? arrayMax(valuesInSegment) :
            arrayMin(valuesInSegment);
        aggregated.push({ timestamp: currentSegmentStart, value: Math.floor(value) });
        valuesInSegment = [];
    }

    for (let i = dataset.length - 1; i >= 0; i--) {
        const response = dataset[i];
        const distance = differenceInDays(currentSegmentStart, response.timestamp);
        if (distance >= days) {
            addSegment();
            currentSegmentStart = response.timestamp;
        }
        valuesInSegment.push(response.value);
    }

    // Add the remaining segment.
    addSegment();

    aggregated.reverse();
    return aggregated;
}

// Adds array items for missing days.
const fillMissingDays = (dataset) => {
    const gaps = [];
    const results = [];
    let previousValue = dataset[0].value;
    let previousTimestamp = subDays(dataset[0].timestamp, 1).getTime();
    dataset.forEach((response, i) => {
        const distance = differenceInDays(response.timestamp, previousTimestamp);

        if (distance < 0) {
            console.error("Dataset contains out of order timestamps.");
        }

        // If the difference is 0 (same day) or 1 (next day), just add the response.
        // There was no gap to consider.
        if (distance <= 1) {
            results.push(response);
            previousTimestamp = response.timestamp;
            previousValue = response.value;
            return;
        }

        // Slope to interpolate the values in the gap.
        const valueSlope = (response.value - previousValue) / distance;

        // There is a gap of (distance - 1) days that needs to be filled.
        for (let i = 0; i < distance - 1; i++) {
            const addedResponse = {
                timestamp: addDays(previousTimestamp, i + 1).getTime(),
                value: Math.floor(previousValue + valueSlope * (i + 1))
            };
            results.push(addedResponse);
        }

        gaps.push({ startResponse: previousTimestamp, nextResponse: response.timestamp, distance});
        results.push(response);

        previousTimestamp = response.timestamp;
        previousValue = response.value;
    });

    return results;
}

const addEdgeBufferDays = (dataset, range) => {
    const firstResponse = dataset.reduce((prev, curr) => isBefore(curr.timestamp, prev) ? curr.timestamp : prev, maxTime);
    const lastResponse = dataset.reduce((prev, curr) => isAfter(curr.timestamp, prev) ? curr.timestamp : prev, minTime);
    const results = [];

    if (!isSameDay(firstResponse, range.start)) {
        const difference = differenceInDays(firstResponse, range.start);
        for (let i = 0; i < difference; i++) {
            results.push({
                timestamp: addDays(range.start, i).getTime(),
                value: -1
            });
        }
    }

    results.push(...dataset);

    if (!isSameDay(lastResponse, range.end)) {
        const difference = differenceInDays(range.end, lastResponse);
        for (let i = 1; i <= difference; i++) {
            results.push({
                timestamp: addDays(lastResponse, i).getTime(),
                value: -1
            });
        }
    }

    return results;
}

const getDataset = (context, trackerIndex) => {
    const range = getDateRange(context);
    let dataset = context.pastResponses[trackerIndex]
        .filter(response => !isBefore(response.timestamp, range.start) && !isAfter(response.timestamp, range.end))
        .map(response => ({ timestamp: response.timestamp, value: response.value }));

    if (dataset.length === 0) return [];

    // Fill in missing days before and after the responses
    dataset = addEdgeBufferDays(dataset, range);

    // Fill in any gaps between responses
    dataset = fillMissingDays(dataset);

    // Aggregate responses in the same day
    dataset = aggregateSegmentOfResponses(dataset, 1, context.aggregationMode);

    // Aggregate by week if using the year-long time scale
    if (context.chartTimeScale === 2) {
        dataset = aggregateSegmentOfResponses(dataset, 30, context.aggregationMode);
    }

    return { dataset, startBufferSize: 0, endBufferSize: 0 };
}

const trimAndBufferDataset = (dataset, chartTimeScale, chartTimeOffset) => {
    const range = getDateRange(chartTimeScale, chartTimeOffset);
    console.log(`trimAndBufferDataset: chartTimeScale=${chartTimeScale}`);
    console.log(range)

    let firstIndexInRange = -1;
    if (!isBefore(dataset[0].timestamp, range.start)) {
        firstIndexInRange = 0;
    } else {
        for (let i = 0; i < dataset.length - 1; i++) {
            if (isBefore(dataset[i].timestamp, range.start) && !isBefore(dataset[i + 1].timestamp, range.start)) {
                firstIndexInRange = i;
                break;
            }
        }
    }

    let lastIndexInRange = -1;
    if (!isAfter(dataset[dataset.length - 1].timestamp, range.end)) {
        lastIndexInRange = dataset.length - 1;
    } else {
        for (let i = dataset.length - 1; i > 1; i--) {
            if (isAfter(dataset[i].timestamp, range.end) && !isAfter(dataset[i - 1].timestamp, range.end)) {
                lastIndexInRange = i;
                break;
            }
        }
    }

    if (firstIndexInRange === -1) return [];

    const resultsInRange = dataset.slice(firstIndexInRange, lastIndexInRange + 1);    
    // Fill in missing days before and after the responses
    const bufferedResults = addEdgeBufferDays(resultsInRange, range);

    return bufferedResults;
}

/**
 * Returns a continuous sequence of aggregated responses. Start and end buffers are NOT added.
 */
const getProcessedSequence = (pastResponses, aggregationModeIndex, aggregateDays) => {
    const aggregationMode = aggregationModes[aggregationModeIndex];
    let dataset = pastResponses.map(response => ({ timestamp: response.timestamp, value: response.value }));

    if (dataset.length === 0) return [];

    // Fill in any gaps between responses
    dataset = fillMissingDays(dataset);

    // Aggregate responses in the same day
    dataset = aggregateSegmentOfResponses(dataset, 1, aggregationMode);

    // Aggregate by week if using the year-long time scale
    if (aggregateDays && aggregateDays > 1) {
        dataset = aggregateSegmentOfResponses(dataset, aggregateDays, aggregationMode);
    }

    return dataset;
}

const getDatasetCacheKey = (chartTimeScaleIndex, aggregationModeIndex, trackerIndex) => {
    if (chartTimeScaleIndex === 0) chartTimeScaleIndex = 1;
    return `${graphTimeRanges.labels[chartTimeScaleIndex]}-${aggregationModes[aggregationModeIndex]}-tracker${trackerIndex}`;
}

/**
 * Builds an object with each key containing an array of responses. The array includes the full set of available
 * responses for the given configuration, applying the appropriate aggregation and gap-filling.
 */
const buildFullDatasetCache = (pastResponsesPerIndex, trackerCount) => {
    const datasetCache = {};
    const aggregationSizePerTimeScale = [1, 1, 30];
    for (let chartTimeScaleIndex = 0; chartTimeScaleIndex <= 2; chartTimeScaleIndex++) {
        for (let aggregationModeIndex = 0; aggregationModeIndex <= 2; aggregationModeIndex++) {
            for (let trackerIndex = 0; trackerIndex < trackerCount; trackerIndex++) {
                const key = getDatasetCacheKey(chartTimeScaleIndex, aggregationModeIndex, trackerIndex);
                if (!Object.keys(datasetCache).includes(key)) {
                    datasetCache[key] = getProcessedSequence(pastResponsesPerIndex[trackerIndex], aggregationModeIndex, aggregationSizePerTimeScale[chartTimeScaleIndex]);
                }
            }
        }
    }
    return datasetCache;
}

export { getDateRange, getDataset, fillMissingDays, addEdgeBufferDays, aggregateSegmentOfResponses,
    getProcessedSequence, aggregationModes, getDatasetCacheKey, trimAndBufferDataset, buildFullDatasetCache }