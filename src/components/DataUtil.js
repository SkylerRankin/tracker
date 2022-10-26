import { subWeeks, subMonths, subYears, isBefore, isAfter, maxTime, minTime, addDays, startOfDay, endOfDay, differenceInDays, subDays, startOfWeek, startOfMonth, startOfYear, isSameMonth, addMonths, getMonth } from "date-fns";
import { aggregationModeIndices, aggregationModes, approximateDaysPerMonth, approximateDaysPerYear, chartTimeScales, graphTimeRanges, maxChartDatasetCacheSizePerTracker } from "./Constants";

const arrayAvg = a => a.reduce((prev, curr) => prev + curr, 0) / a.length;
const arrayMax = a => a.reduce((prev, curr) => Math.max(prev, curr), a[0]);
const arrayMin = a => a.reduce((prev, curr) => Math.min(prev, curr), a[0]);

const getDateRange = (chartTimeScale, chartTimeOffset, today=new Date()) => {
    const scale = chartTimeScale;
    const offset = chartTimeOffset;

    if (offset === 0) {
        const endDate = today;
        const startDate =
            scale === chartTimeScales.week ? addDays(subWeeks(today, 1), 1) :
            scale === chartTimeScales.month ? addDays(subMonths(today, 1), 1) :
            addDays(subYears(today, 1), 1);
        return { start: startOfDay(startDate).getTime(), end: endOfDay(endDate).getTime() };
    } else {
        if (scale === chartTimeScales.week) {
            // Align with the start of week.
            const weekStart = startOfWeek(today, { weekStartsOn: 0 });
            return {
                start: startOfDay(subWeeks(weekStart, offset)).getTime(),
                end: endOfDay(subDays(subWeeks(weekStart, offset - 1), 1)).getTime()
            };
        } else if (scale === chartTimeScales.month) {
            // Align with the start of month.
            const monthStart = startOfMonth(today);
            return {
                start: startOfDay(subMonths(monthStart, offset)).getTime(),
                end: endOfDay(subDays(subMonths(monthStart, offset - 1), 1)).getTime()
            };
        } else {
            // Align with the start of year.
            const yearStart = startOfYear(today);
            return {
                start: startOfDay(subYears(yearStart, offset)).getTime(),
                end: endOfDay(subDays(subYears(yearStart, offset - 1), 1)).getTime()
            };
        }
    }
}

/**
 * Aggregates an array of { timestamp, value } into groups of days that are less than
 * `days` days apart. For instance, days = 1 would aggregate every individual day. Setting
 * days = 3 would mean each group of three consecutive days (distance of 0, 1, and 2). The
 * counting starts from the largest date and works backwards.
 * 
 * options argument: { aggregationModeIndex: number, days?: number, byMonth?: boolean }
 */
const aggregateSegmentOfResponses = (dataset, options) => {
    const aggregationModeIndex = options.aggregationModeIndex;
    const aggregated = [];
    let currentSegmentStart = dataset[dataset.length - 1].timestamp;
    let valuesInSegment = [];

    const addSegment = () => {
        const value = valuesInSegment.length === 0 ? -1 :
            aggregationModeIndex === aggregationModeIndices.avg ? arrayAvg(valuesInSegment) :
            aggregationModeIndex === aggregationModeIndices.min ? arrayMin(valuesInSegment) :
            arrayMax(valuesInSegment);
        const timestamp = options.byMonth ? startOfMonth(currentSegmentStart).getTime() : currentSegmentStart;
        aggregated.push({ timestamp, value: Math.floor(value) });
        valuesInSegment = [];
    }

    for (let i = dataset.length - 1; i >= 0; i--) {
        const response = dataset[i];

        if (options.byMonth) {
            if (!isSameMonth(response.timestamp, currentSegmentStart)) {
                addSegment();
                currentSegmentStart = response.timestamp;
            }
        } else {
            const distance = differenceInDays(currentSegmentStart, response.timestamp);
            if (distance >= options.days) {
                addSegment();
                currentSegmentStart = response.timestamp;
            }
        }
        
        // Buffer values are -1, and should not contribute to the chart.
        if (response.value > 0) {
            valuesInSegment.push(response.value);
        }
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

/**
 * Adds buffer days to the front of the dataset such that the first day is startTimestamp.
 * If the timestamp of the first day is already startTimestamp or before, no change is made.
 */
const addStartBufferDays = (dataset, startTimestamp) => {
    const firstResponse = dataset.reduce((prev, curr) => isBefore(curr.timestamp, prev) ? curr.timestamp : prev, maxTime);
    const results = [];
    if (isAfter(firstResponse, startTimestamp)) {
        const difference = differenceInDays(firstResponse, startTimestamp);
        for (let i = 0; i < difference; i++) {
            results.push({
                timestamp: addDays(startTimestamp, i).getTime(),
                value: -1
            });
        }
    }
    results.push(...dataset);
    return results;
}

const addStartBufferMonths = (dataset, startTimestamp, endTimestamp) => {
    const firstResponse = dataset.reduce((prev, curr) => isBefore(curr.timestamp, prev) ? curr.timestamp : prev, maxTime);

    // In the case of a 0 offset, the start and end can have the same month. For example, 10/20/2021 - 10/19/2022.
    // The buffer should not include the 10/1/2021 buffer, since that would result in 13 months being represented.
    if (getMonth(startTimestamp) === getMonth(endTimestamp)) {
        startTimestamp = addMonths(startTimestamp, 1).getTime();
    }

    // First response is already in the desired month or in some even earlier month. No buffer months needed.
    if (isSameMonth(firstResponse, startTimestamp) || isBefore(firstResponse, startTimestamp)) {
        return dataset;
    }

    const results = [];
    let currentBufferTimestamp = startOfMonth(startTimestamp);
    while (!isSameMonth(currentBufferTimestamp, firstResponse)) {
        results.push({
            timestamp: currentBufferTimestamp.getTime(),
            value: -1
        });
        currentBufferTimestamp = startOfMonth(addMonths(currentBufferTimestamp, 1));
    }

    results.push(...dataset);
    return results;
}

const addEndBufferDays = (dataset, endTimestamp) => {
    const lastResponse = dataset.reduce((prev, curr) => isAfter(curr.timestamp, prev) ? curr.timestamp : prev, minTime);
    const results = [...dataset];
    if (isBefore(lastResponse, endTimestamp)) {
        const difference = differenceInDays(endTimestamp, lastResponse);
        for (let i = 1; i <= difference; i++) {
            results.push({
                timestamp: addDays(lastResponse, i).getTime(),
                value: -1
            });
        }
    }
    return results;
}

const trimAndBufferDataset = (dataset, chartTimeScale, chartTimeOffset) => {
    if (dataset.length === 0) return [];

    const range = getDateRange(chartTimeScale, chartTimeOffset);

    let firstIndexInRange = -1;
    if (!isBefore(dataset[0].timestamp, range.start)) {
        firstIndexInRange = 0;
    } else {
        for (let i = 0; i < dataset.length - 1; i++) {
            if (isBefore(dataset[i].timestamp, range.start) && !isBefore(dataset[i + 1].timestamp, range.start)) {
                firstIndexInRange = i + 1;
                break;
            }
        }
    }

    let lastIndexInRange = -1;
    if (!isAfter(dataset[dataset.length - 1].timestamp, range.end)) {
        lastIndexInRange = dataset.length - 1;
    } else {
        for (let i = dataset.length - 1; i > 0; i--) {
            if (isAfter(dataset[i].timestamp, range.end) && !isAfter(dataset[i - 1].timestamp, range.end)) {
                lastIndexInRange = i - 1;
                break;
            }
        }
    }

    // If first index in range is -1, then all indices are after the range start.
    // If the last index in range is -1, then all indices are after the range end.
    if (firstIndexInRange === -1 || lastIndexInRange === -1) return [];

    let resultsInRange = dataset.slice(firstIndexInRange, lastIndexInRange + 1);

    // Fill in the missing data points before the actual responses. The end buffers are already present.
    const bufferedResults =
        chartTimeScale === chartTimeScales.year ? addStartBufferMonths(resultsInRange, range.start, range.end) :
        addStartBufferDays(resultsInRange, range.start);

    return bufferedResults;
}

/**
 * Returns a continuous sequence of aggregated responses. Only the end buffer is added, which adds
 * any missing days between the final day of the sequence and the current day.
 */
const getProcessedSequence = (pastResponses, aggregationModeIndex, chartTimeScaleIndex) => {
    let dataset = pastResponses.map(response => ({ timestamp: response.timestamp, value: response.value }));

    if (dataset.length === 0) return [];

    // Fill in any gaps between responses
    dataset = fillMissingDays(dataset);

    // Add ending buffer days to reach current date.
    dataset = addEndBufferDays(dataset, new Date().getTime());

    // Aggregate responses in the same day
    dataset = aggregateSegmentOfResponses(dataset, { aggregationModeIndex, days: 1 });

    // For the year long time scale, aggregate by month as well.
    if (chartTimeScaleIndex === chartTimeScales.year) {
        dataset = aggregateSegmentOfResponses(dataset, { aggregationModeIndex, byMonth: true });
    }

    return dataset;
}

const getFullDatasetCacheKey = (chartTimeScaleIndex, aggregationModeIndex, trackerIndex) => {
    if (chartTimeScaleIndex === 0) chartTimeScaleIndex = 1;
    return `${graphTimeRanges.labels[chartTimeScaleIndex]}-${aggregationModes[aggregationModeIndex]}-tracker${trackerIndex}`;
}

const getChartDatasetCacheKey = (trackerIndex, chartTimeOffset, chartTimeScaleIndex, aggregationModeIndex) => {
    return `tracker${trackerIndex}-offset${chartTimeOffset}-${graphTimeRanges.labels[chartTimeScaleIndex]}-${aggregationModes[aggregationModeIndex]}`;
}

/**
 * Builds an object with each key containing an array of responses. The array includes the full set of available
 * responses for the given configuration, applying the appropriate aggregation and gap-filling.
 */
const buildFullDatasetCache = (pastResponsesPerIndex, trackerCount) => {
    const fullDatasetCache = {};
    for (let chartTimeScaleIndex = 0; chartTimeScaleIndex <= 2; chartTimeScaleIndex++) {
        for (let aggregationModeIndex = 0; aggregationModeIndex <= 2; aggregationModeIndex++) {
            for (let trackerIndex = 0; trackerIndex < trackerCount; trackerIndex++) {
                const key = getFullDatasetCacheKey(chartTimeScaleIndex, aggregationModeIndex, trackerIndex);
                if (!Object.keys(fullDatasetCache).includes(key)) {
                    fullDatasetCache[key] = getProcessedSequence(pastResponsesPerIndex[trackerIndex], aggregationModeIndex, chartTimeScaleIndex);
                }
            }
        }
    }
    return fullDatasetCache;
}

/**
 * Builds an object mapping chart dataset cache keys (from getChartDatasetCacheKey()) to the final data array that can be
 * used in the TrackingChart component. Recently used arrays are saved so that they can quickly be reused instead of
 * recalculated.
 */
const addConfigToChartDatasetCache = (previousCache, fullDatasetCache, trackers, chartTimeOffset, chartTimeScaleIndex, aggregationModeIndex) => {
    const newCache = {};

    // All trackers are updated for each config, so if the first tracker is already present, there are no updates to make.
    if (Object.keys(previousCache).includes(getChartDatasetCacheKey(0, chartTimeOffset, chartTimeScaleIndex, aggregationModeIndex))) {
        return previousCache;
    }

    for (let trackerIndex = 0; trackerIndex < trackers.length; trackerIndex++) {
        const newChartKey = getChartDatasetCacheKey(trackerIndex, chartTimeOffset, chartTimeScaleIndex, aggregationModeIndex);
        const currentCacheSizeForTracker = Object.keys(previousCache).filter(k => k.startsWith(`tracker${trackerIndex}-`)).length;
        if (currentCacheSizeForTracker >= maxChartDatasetCacheSizePerTracker) {
            // Find the oldest key.
            const oldestKey = Object.keys(previousCache).reduce((prev, curr) => previousCache[prev].timestamp < previousCache[curr].timestamp ? prev : curr, Object.keys(previousCache)[0]);
            console.log(`Removed old key ${oldestKey} from chart cache.`);

            // Add all but the oldest key to the new cache.
            Object.keys(previousCache).forEach(key => {
                if (key === oldestKey) return;
                newCache[key] = {
                    timestamp: previousCache[key].timestamp,
                    data: [...previousCache[key].data]
                };
            });
        } else {
            // Add all keys to new cache.
            Object.keys(previousCache).forEach(key => {
                newCache[key] = {
                    timestamp: previousCache[key].timestamp,
                    data: [...previousCache[key].data]
                };
            });
        }

        // Add the new value to the new cache.
        const fullDatasetKey = getFullDatasetCacheKey(chartTimeScaleIndex, aggregationModeIndex, trackerIndex);
        const data = trimAndBufferDataset(fullDatasetCache[fullDatasetKey], chartTimeScaleIndex, chartTimeOffset);
        if (trackers[trackerIndex].invertAxis) {
            for (let i = 0; i < data.length; i++) {
                data[i].value = invertValue(data[i].value);
            }
        }

        newCache[newChartKey] = {
            timestamp: new Date().getTime(),
            data
        };
        console.log(`Added key ${newChartKey} to chart cache. data length = ${data.length}.`);
    }

    console.log(`Finished cache update. New size = ${Object.keys(newCache).length} for ${trackers.length} trackers.`);
    return newCache;
}

const invertValue = v => v === -1 ? v : 10 - v + 1;

const getSampleData = () => {
    const values = [3, 2, 4, [1, 3], 4, [6, 3], 5, 7, [6, 5, 4], [5, 4], 5, 4, [6, 7], [3, 2, 5], [7, 6], 8];
    const today = new Date();
    const sampleResponses = [];
    values.forEach((value, i) => {
        if (typeof(value) === "number") {
            sampleResponses.push({
                timestamp: subDays(today, values.length - 1 - i).getTime(),
                value: value,
                notes: ""
            });
        } else {
            value.forEach(v => {
                sampleResponses.push({
                    timestamp: subDays(today, values.length - 1 - i).getTime(),
                    value: v,
                    notes: ""
                });
            });
        }
    });
    sampleResponses[sampleResponses.length - 1].notes = "Tap here! Notes can be useful to store more context.";
    const data = {
        pastResponses: [
            sampleResponses
        ],
        trackers: [
            {
                name: "Sample tracker ~ Long press to add data",
                segments: 10,
                color: "#99a98d",
                invertAxis: false
            }
        ],
        selectedTrackers: [0]
    };
    return data;
}

export { getDateRange, fillMissingDays, aggregateSegmentOfResponses, addStartBufferDays, addEndBufferDays,
    getProcessedSequence, getFullDatasetCacheKey, buildFullDatasetCache, getChartDatasetCacheKey,
    addConfigToChartDatasetCache, addStartBufferMonths, invertValue, getSampleData }