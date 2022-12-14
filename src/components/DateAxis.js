import { addDays, differenceInDays, getDate, getMonth } from "date-fns";
import React, { useContext } from "react";
import { Dimensions, StyleSheet, View } from "react-native";

import AppContext from "../util/AppContext";
import { getDateRange } from "../util/DataUtil";
import AppText from "./AppText";

const pageWidth = Dimensions.get("window").width;
const axisWidth = pageWidth - 10 * 2;
const xTicks = 5;
const labelWidth = axisWidth / xTicks;

export default function DateAxis() {
    const context = useContext(AppContext);
    const dateRange = getDateRange(context.chartTimeScale, context.chartTimeOffset);

    const daysInRange = differenceInDays(dateRange.end, dateRange.start);
    const segmentSize = daysInRange / (xTicks - 1);

    const labels = [];
    for (let i = 0; i < xTicks; i++) {
        const style = [
            styles.label,
            { width: labelWidth }
        ];
        const date = addDays(dateRange.start, i * segmentSize);
        // Months are 0-indexed in date-fns, but days are not!
        const dateText = `${getMonth(date) + 1}/${getDate(date)}`;
        labels.push(
            <AppText key={i} style={ style }>{dateText}</AppText>
        );
    }

    return (
        <View style={styles.container}>
            { labels }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        height: 45,
        width: '100%',
        paddingTop: 10
    },
    label: {
        textAlign: "center",
        color: "#777",
        fontSize: 13
    }
});
