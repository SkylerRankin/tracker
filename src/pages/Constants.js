export const graphColors = [
    "#99a98d",
    "#555633",
    "#a77950",
    "#bac0a9",
    "#b1a59a",
    "#c3b070",
    "#999e7a",
    "#D9E1CA",
    "#889e96",
    "#3b533f",
];

export const customFonts = {
    "SourceSansPro": require("../assets/fonts/source-sans-pro/SourceSansPro-Regular.ttf")
};

export const graphTimeRanges = {
    labels: [ "W", "M", "Y" ],
    days: [ 7, 30, 365 ]
}

export const aggregationModes = ["Avg", "Min", "Max"];
export const aggregationModeIndices = { avg: 0, min: 1, max: 2 };

export const maxChartDatasetCacheSizePerTracker = 10;

export const approximateDaysPerMonth = 30;
export const approximateDaysPerYear = approximateDaysPerMonth * 12;
export const chartTimeScales = { week: 0, month: 1, year: 2 };

export const saveFileVersion = 1;
