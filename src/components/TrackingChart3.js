import React, { useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { LineChart } from 'react-native-wagmi-charts';

/**
 * App will crash if all datasets do not have the same length.
 */

const pageWidth = Dimensions.get("window").width;
const chartWidth = pageWidth - 30 * 2;
const chartHeight = 250;

const data = [
  {
    timestamp: 1665119843000,
    value: 10,
  },
  {
    timestamp: 1665033443000,
    value: 8,
  },
  {
    timestamp: 1664947043000,
    value: 3,
  },
  {
    timestamp: 1664860643000,
    value: 6,
  },
  {
    timestamp: 1664342412000,
    value: 0,
  },
  {
    timestamp: 1664256012000,
    value: 0,
  },
];

const data2 = [
    {
        timestamp: 1665120012000,
        value: 9,
      },
      {
        timestamp: 1664860812000,
        value: 8,
      },
      {
        timestamp: 1664601612000,
        value: 3,
      },
      {
        timestamp: 1664428812000,
        value: 10,
      },
      {
        timestamp: 1664342412000,
        value: 0,
      },
      {
        timestamp: 1664256012000,
        value: 0,
      },
]
data2.reverse();

export default function TrackingChart3() {

    const [currentIndex, setCurrentIndex] = useState(-1);

    const onCurrentIndexChange = index => {
        setCurrentIndex(index);
    }

    const onTouchStart = () => {
        console.log('touch start');
    }

    const onTouchEnd = () => {
        console.log('touch end');
    }

    const datasets = [
        { dataset: data, color: "green" },
        { dataset: data2, color: "#ddd" }
    ];
    const dataProviderSet = {};
    datasets.forEach((d, i) => dataProviderSet[`${i}`] = d.dataset);

    const charts = [];
    datasets.forEach((data, i) => {
        charts.push(
            <LineChart key={i} id={`${i}`} width={ chartWidth } height={chartHeight}>
                <LineChart.Path color={data.color} width={8}>
                    {
                        // data.dataset.map((_, i) => <LineChart.Dot color="red" at={i} />)
                    }
                </LineChart.Path>
                <LineChart.CursorCrosshair onActivated={onTouchStart} onEnded={onTouchEnd}>
                    <LineChart.Tooltip textStyle={[tooltipStyles.tooltip, { backgroundColor: data.color }]} />
                </LineChart.CursorCrosshair>
                { i === 0 && <LineChart.CursorLine/> }
            </LineChart>
        );
    });

    return (
        <View style={{ width: chartWidth, height: chartHeight, overflow: "hidden" }}>
            <GestureHandlerRootView>
                <LineChart.Provider data={dataProviderSet} onCurrentIndexChange={onCurrentIndexChange}>
                    <LineChart.Group>
                        { charts }
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
    }
});