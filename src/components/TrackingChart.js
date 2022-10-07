import { useContext, useState } from 'react';
import { Text, View, Dimensions, TouchableWithoutFeedback, TouchableOpacity } from 'react-native';
import { VictoryLine, VictoryChart, VictoryAxis, VictoryContainer } from "victory-native";
import AppContext from './AppContext';
import { graphColors } from './Constants';
import { subDays, getDaysInMonth, differenceInDays } from 'date-fns'

const pageWidth = Dimensions.get("window").width;

const showMostRecentResponses = context => {
    const currentDate = new Date();
    const currentMonth = currentDate.getUTCMonth();
    const currentYear = currentDate.getUTCFullYear();
    const selectedMonth = context.chartMonth;
    const selectedYear = context.chartYear;

    // Show the most recent 30 days of responses, rather than a specific month.
    return currentMonth + 1 === selectedMonth && currentYear === selectedYear;
}

// The chart expects ~30 days of continuous data points. If some days are missing,
// incrementing the x values will leave them improperly shifted. This creates an 
// array of the x values for the appropriate month's worth of responses (if there are that many).
const getXValues = (context, showCurrentResponses, trackerIndex) => {
    const currentDate = new Date();
    const xValues = [];
    if (showCurrentResponses) {
        // The most recent data within 30 days.
        for (let i = context.pastResponses[trackerIndex].length - 1; i >= 0; i--) {
            const response = context.pastResponses[trackerIndex][i];
            const ageInDays = differenceInDays(currentDate, response.timestamp);
            if (ageInDays > 30) {
                break;
            }
            xValues.push(ageInDays);
        }
        const oldestResponse = xValues[xValues.length - 1];
        const offset = 30 - oldestResponse;
        for (let i = 0; i < xValues.length; i++) xValues[i] += offset;
    } else {
        const responses = context.pastResponses[trackerIndex].filter(response => {
            const date = new Date(response.timestamp);
            return date.getMonth() + 1 === context.chartMonth && date.getFullYear() === context.chartYear;
        });
        responses.forEach(response => {
            const date = new Date(response.timestamp);
            xValues.push(date.getDate());
        });
    }

    return xValues;
}

const getData = context => {
    if (context.selectedTrackers.length === 0) return [];

    const currentDate = new Date();
    const selectedMonth = context.chartMonth;
    const selectedYear = context.chartYear;

    // Show the most recent 30 days of responses, rather than a specific month.
    const showCurrentResponses = showMostRecentResponses(context);

    const dataPerTracker = {};
    context.selectedTrackers.forEach(trackerIndex => {
        const responses = context.pastResponses[trackerIndex];
        const invertAxis = context.trackers[trackerIndex].invertAxis;
        const invert = value => Math.abs(context.trackers[trackerIndex].segments - value) + 1;
        const xValues = getXValues(context, showCurrentResponses, trackerIndex);

        const data = [];
        responses.forEach((response, i) => {
            const date = new Date(response.timestamp);
            if (showCurrentResponses) {
                if (differenceInDays(date, currentDate) > 30) return;
            } else {
                if (date.getMonth() + 1 !== selectedMonth || date.getFullYear() !== selectedYear) return;
            }
            data.push({
                x: xValues[i],
                y: invertAxis ? invert(response.value) : response.value
            });
        });
        dataPerTracker[`${trackerIndex}`] = data;
    });

    return dataPerTracker;
}

const getTickValues = context => {
    const showCurrentResponses = showMostRecentResponses(context);
    const values = [];

    if (showCurrentResponses) {
        const currentDate = new Date();
        for (let i = 30; i >= 0; i--) {
            const date = subDays(currentDate, i);
            values.push(`${date.getUTCMonth() + 1}/${date.getUTCDate()}`);
        }
    } else {
        const selectedMonth = context.chartMonth;
        const selectedYear = context.chartYear;
        const days = getDaysInMonth(new Date(selectedYear, selectedMonth - 1));
        for (let i = 1; i <= days; i++) {
            values.push(`${selectedMonth}/${i}`);
        }
    }

    return values;
}

export default function TrackingChart() {
    const context = useContext(AppContext);
    const dataPerTracker = getData(context);
    const tickValues = getTickValues(context);

    const onChartPress = e => {
        const x = e.nativeEvent.pageX;
        if (x < pageWidth / 2) {
            // TODO check if there is any available data that far back
            if (context.chartMonth > 1) {
                context.setChartMonth(context.chartMonth - 1);
            } else {
                context.setChartMonth(12);
                context.setChartYear(context.chartYear - 1);
            }
        } else {
            const currentMonth = (new Date()).getMonth() + 1;
            const currentYear = (new Date()).getFullYear();
            if (context.chartYear < currentYear || context.chartMonth < currentMonth) {
                if (context.chartMonth < 12) {
                    context.setChartMonth(context.chartMonth + 1);
                } else {
                    context.setChartMonth(1);
                    context.setChartYear(context.chartYear + 1);
                }
            }
        }
    }

    return (
        <View>
            <TouchableOpacity
                onPress={onChartPress}>
                <View>
                    <VictoryChart width={Dimensions.get("window").width - 20} containerComponent={<VictoryContainer disableContainerEvents />} >
                        <VictoryAxis
                            tickCount={4}
                            tickValues={tickValues}
                            style={{
                                // grid: { stroke: "#020", strokeWidth: 1 },
                                tickLabels: { fontSize: 15, fontFamily: "Roboto" },
                            }}/>
                        <VictoryAxis
                            dependentAxis
                            tickCount={10}
                            style={{
                                // grid: { stroke: "#020", strokeWidth: 1 },
                                tickLabels: { fontSize: 15, fontFamily: "Roboto" }
                            }}/>
                        {
                            Object.keys(dataPerTracker).map(key => {
                                const trackerIndex = Number.parseInt(key);
                                const color = graphColors[context.trackers[trackerIndex].colorIndex];
                                return (
                                    <VictoryLine
                                        key={key}
                                        data={dataPerTracker[trackerIndex]}
                                        domainPadding={{x: [20, 20]}}
                                        domain={{y: [1, 10]}}
                                        interpolation="basis"
                                        style={{
                                            data: { stroke: color, strokeWidth: 4 }
                                        }}
                                        // animate={{
                                        //     duration: 250,
                                        //     onLoad: { duration: 250 }
                                        // }}
                                        />)
                            })
                        }
                    </VictoryChart>
                </View>
            </TouchableOpacity>
        </View>

    )
}
