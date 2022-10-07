import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { graphTimeRanges } from "./Constants";

const pageWidth = Dimensions.get("window").width;
const axisWidth = pageWidth - 10 * 2;

export default function DateAxis() {

    const xTicks = 6;
    const labelWidth = axisWidth / xTicks;

    const labels = [];
    for (let i = 0; i < xTicks; i++) {
        const style = [
            styles.label,
            { width: labelWidth }
        ];
        labels.push(
            <Text style={ style }>{`9/2${i}`}</Text>
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
        height: 35,
        width: '100%'
    },
    label: {
        textAlign: "center"
    }
});
