import React, { useContext } from "react";
import { Image,StyleSheet, TouchableOpacity, View } from "react-native";

import leftArrow from '../assets/images/leftArrow.png';
import AppContext from "../util/AppContext";
import { graphTimeRanges } from "../util/Constants";
import AppText from "./AppText";

export default function RangeSelector() {

    const context = useContext(AppContext);

    const onScaleSelected = i => {
        if (i !== context.chartTimeScale) {
            context.setChartTimeOffset(0);
            context.setChartTimeScale(i);
        }
    }

    const onOffsetChanged = d => {
        if (d === -1 && context.chartTimeOffset === 0) return;
        // TODO prevent going past existing data
        context.setChartTimeOffset(context.chartTimeOffset + d);
    }

    const ranges = graphTimeRanges.labels.map((r, i) => (
        <TouchableOpacity
            onPress={() => onScaleSelected(i)}
            key={r}
            style={{margin: 3}}>
            <View style={[styles.rangeSelector, i === context.chartTimeScale && styles.rangeSelectorSelected]}>
                <AppText style={{color: "#777"}}>{r}</AppText>
            </View>
        </TouchableOpacity>
    ));

    return (
        <View style={styles.container}>
            <View style={styles.rangesContainer}>
                { ranges }
            </View>
            <View style={styles.arrowContainer}>
                <TouchableOpacity onPress={() => onOffsetChanged(1)} style={[styles.arrowButton, { marginRight: 3 }]}>
                    <Image style={styles.arrowImage} source={leftArrow}/>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onOffsetChanged(-1)} style={[styles.arrowButton, { marginLeft: 0 }]}>
                    <Image style={[styles.arrowImage, {transform: [{rotate: "180deg"}]}]} source={leftArrow}/>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        height: 35,
        width: '100%',
        backgroundColor: '#eee',
        borderRadius: 10
    },
    rangesContainer: {
        flexDirection: "row",
        borderRadius: 10
    },
    rangeSelector: {
        width: 60,
        height: "100%",
        alignItems: "center",
        justifyContent: "center"
    },
    rangeSelectorSelected: {
        backgroundColor: "white",
        borderRadius: 8
    },
    arrowContainer: {
        flexDirection: "row",
        borderRadius: 10,
        marginLeft: "auto",
    },
    arrowButton: {
        width: 70,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        backgroundColor: "white",
        margin: 3,
        padding: 2
    },
    arrowImage: {
        width: 30,
        height: 13,
        tintColor: "#777"
    }
});
