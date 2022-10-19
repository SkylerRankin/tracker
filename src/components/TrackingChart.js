import React, { useContext, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { LineChart } from 'react-native-wagmi-charts';
import AppContext from './AppContext';
import { graphColors } from './Constants';
import { getDatasetCacheKey, trimAndBufferDataset } from './DataUtil';

const pageWidth = Dimensions.get("window").width;
const chartWidth = pageWidth - 30 * 2;
const chartHeight = 250;
const chartLineWidthByScale = [8, 4, 1];

export default function TrackingChart() {
    console.log("------------------ TrackingChart render() ---------------------------");
    const context = useContext(AppContext);

    const [currentIndex, setCurrentIndex] = useState(-1);

    const onCurrentIndexChange = index => {
        setCurrentIndex(index);
    }

    const datasets = [];
    const chartTimeScale = context.chartTimeScale;

    const sortedTrackedIndices = context.selectedTrackers;
    sortedTrackedIndices.sort().reverse();
    sortedTrackedIndices.forEach(trackerIndex => {
        const tracker = context.trackers[trackerIndex];
        const cacheKey = getDatasetCacheKey(context.chartTimeScale, context.aggregationMode, trackerIndex);
        const fullData = context.datasetCache[cacheKey];
        const finalData = trimAndBufferDataset(fullData, context.chartTimeScale, context.chartTimeOffset);
        datasets.push({
            dataset: finalData,
            color: graphColors[tracker.colorIndex],
            trackerIndex
        });
        console.log(`Using cached dataset for time scale ${chartTimeScale}, tracker ${trackerIndex}. ${fullData.length} items, ${finalData.length} items after trim and buffer.`);
    });

    // Ensure datasets all have the same length
    const datasetLengths = datasets.map(d => d.dataset.length);
    const consistentLengths = datasetLengths.filter(l => l !== datasetLengths[0]).length === 0;
    if (!consistentLengths) {
        const maxLength = datasetLengths.reduce((prev, curr) => Math.max(prev, curr), -1);
        console.log(`Inconsistent dataset lengths: ${datasetLengths}`);
    }

    const charts = [];
    datasets.forEach((data, i) => {
        const currentValue = currentIndex >= 0 && data.dataset.length > currentIndex ? data.dataset[currentIndex].value : -1;
        const toolTip = currentValue >= 0 ?
            <LineChart.Tooltip>
                <Text style={[tooltipStyles.tooltip, { backgroundColor: data.color }]}>
                    { currentValue }
                </Text>
            </LineChart.Tooltip> : null;

        charts.push(
            <LineChart key={i} id={`${i}`} width={ chartWidth } height={ chartHeight }>
                <LineChart.Path color={data.color} width={chartLineWidthByScale[context.chartTimeScale]} pathProps={{isTransitionEnabled: false}}>
                    {/* {
                        i === 0 && [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(y => (
                            <LineChart.HorizontalLine key={y} color={"#f3f3f3"} lineProps={{ strokeDasharray: [0], strokeWidth: 1 }} at={{value: y}}/>
                        ))
                    } */}
                </LineChart.Path>
                { i === 0 && <LineChart.CursorLine/> }
                <LineChart.CursorCrosshair>
                    { toolTip }
                </LineChart.CursorCrosshair>
            </LineChart>
        );
    });

    const dataProviderSet = {};
    datasets.forEach((d, i) => dataProviderSet[`${i}`] = d.dataset);
    // Chart will crash when provided an empty LineChart.Provider. This provides a blank one.
    if (datasets.length === 0) dataProviderSet["empty"] = []

    return (
        <View style={{ width: chartWidth, height: chartHeight, overflow: "hidden" }}>
            <GestureHandlerRootView>
                <LineChart.Provider data={dataProviderSet} onCurrentIndexChange={onCurrentIndexChange} yRange={{ min: 1, max: 10 }}>
                    <LineChart.Group>
                        { charts && charts.length > 0 && charts }
                    </LineChart.Group>
                </LineChart.Provider>
            </GestureHandlerRootView>            
        </View>
    );
}

const tooltipStyles = StyleSheet.create({
    tooltip: {
        backgroundColor: 'black',
        borderRadius: 4,
        color: 'white',
        fontSize: 14,
        padding: 4,
        width: 30,
        textAlign: "center"
    }
});