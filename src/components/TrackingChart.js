import React, { useContext, useState } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { LineChart } from 'react-native-wagmi-charts';
import AppContext from './AppContext';
import { graphColors } from './Constants';
import { getDataset } from './DataUtil';

const pageWidth = Dimensions.get("window").width;
const chartWidth = pageWidth - 30 * 2;
const chartHeight = 250;
const chartLineWidthByScale = [8, 4, 1];

export default function TrackingChart() {

    const context = useContext(AppContext);

    const [currentIndex, setCurrentIndex] = useState(-1);
    const onCurrentIndexChange = index => {
        setCurrentIndex(index);
    }

    const datasets = [];
    const sortedTrackedIndices = context.selectedTrackers;
    sortedTrackedIndices.sort().reverse();
    sortedTrackedIndices.forEach(trackerIndex => {
        const tracker = context.trackers[trackerIndex];
        const data = getDataset(context, trackerIndex);

        if (data.dataset && data.dataset.length > 0) {
            datasets.push({
                dataset: data.dataset,
                startBufferSize: data.startBufferSize,
                endBufferSize: data.endBufferSize,
                color: graphColors[tracker.colorIndex],
                trackerIndex
            });
        }
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
        charts.push(
            <LineChart key={i} id={`${i}`} width={ chartWidth } height={ chartHeight }>
                <LineChart.Path color={data.color} width={chartLineWidthByScale[context.chartTimeScale]} pathProps={{isTransitionEnabled: false}}>
                    {
                        // data.dataset.map((_, i) => <LineChart.Dot key={i} color="black" at={i} />)
                    }
                    {/* {
                        data.startBufferSize > 0 &&
                            <LineChart.Highlight
                                color="white"
                                from={0}
                                to={data.startBufferSize}
                                width={chartLineWidthByScale[context.chartTimeScale]} />
                    } */}
                    {
                        i === 0 && [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(y => (
                            <LineChart.HorizontalLine key={y} color={"#f3f3f3"} lineProps={{ strokeDasharray: [0], strokeWidth: 1 }} at={{value: y}}/>
                        ))
                    }
                </LineChart.Path>
                <LineChart.CursorCrosshair>
                    <LineChart.Tooltip textStyle={[tooltipStyles.tooltip, { backgroundColor: data.color }]} />
                </LineChart.CursorCrosshair>
                { i === 0 && <LineChart.CursorLine/> }
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
                    {/* <LineChart.PriceText format={({value}) => { return 'price' }}/> */}
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
    }
});