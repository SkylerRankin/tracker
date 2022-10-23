import React, { useContext, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LineChart } from 'react-native-wagmi-charts';
import AppContext from './AppContext';
import { graphColors } from './Constants';
import { getChartDatasetCacheKey, invertValue } from './DataUtil';

const pageWidth = Dimensions.get("window").width;
const chartWidth = pageWidth - 30 * 2;
const chartHeight = 250;
const chartLineWidthByScale = [6, 6, 6];

export default function TrackingChart() {
    console.log("------------------ TrackingChart render() ---------------------------");
    const context = useContext(AppContext);

    const [currentIndex, setCurrentIndex] = useState(-1);

    const onCurrentIndexChange = index => {
        setCurrentIndex(index);
    }

    const datasets = [];

    const sortedTrackedIndices = context.selectedTrackers;
    sortedTrackedIndices.sort().reverse();
    sortedTrackedIndices.forEach(trackerIndex => {
        const cacheKey = getChartDatasetCacheKey(trackerIndex, context.chartTimeOffset, context.chartTimeScale, context.aggregationMode);
        if (!Object.keys(context.chartDatasetCache).includes(cacheKey)) {
            console.log(`Skipping chart cache key ${cacheKey}: not present in dataset cache.`);
            return;
        }
        const data = context.chartDatasetCache[cacheKey].data;
        if (data.length > 0) {
            datasets.push({
                dataset: data,
                color: context.trackers[trackerIndex].color,
                trackerIndex
            });
        } else {
            console.log(`Skipping chart cache key ${cacheKey}: zero length dataset.`);
        }
    });

    const charts = [];
    datasets.forEach((data, i) => {
        const invertAxis = context.trackers[data.trackerIndex].invertAxis;
        let currentValue = currentIndex >= 0 && data.dataset.length > currentIndex ? data.dataset[currentIndex].value : -1;
        if (invertAxis && currentValue > -1) currentValue = invertValue(currentValue);
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