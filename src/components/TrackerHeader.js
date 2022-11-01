import React, { useContext } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import AppContext from "../util/AppContext";
import { aggregationModes } from "../util/Constants";
import AppText from "./AppText";

const capitalizeWord = s => {
    return s.substring(0, 1).toUpperCase() + s.substring(1);
}

export default function TrackerHeader({ onEdit, onAdd }) {

    const context = useContext(AppContext);
    const onAggregationToggle = () => {
        const newAggregationMode = (context.aggregationMode + 1) % 3;
        context.setAggregationMode(newAggregationMode);
    }

    const aggregationMode = capitalizeWord(aggregationModes[context.aggregationMode]);

    return (
        <View style={styles.container}>
            <AppText style={styles.text}>Your trackers</AppText>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={onAggregationToggle} style={[styles.button, { marginRight: 0 }]}>
                    <AppText style={styles.buttonText}>{aggregationMode}</AppText>
                </TouchableOpacity>
                <TouchableOpacity onPress={onEdit} style={[styles.button]}>
                    <AppText style={styles.buttonText}>Edit</AppText>
                </TouchableOpacity>
                <TouchableOpacity onPress={onAdd} style={[styles.button, { marginLeft: 0 }]}>
                    <AppText style={styles.buttonText}>New</AppText>
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
        borderRadius: 10,
        alignItems: "center"
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
    buttonsContainer: {
        flexDirection: "row",
        borderRadius: 10,
        marginLeft: "auto",
    },
    text: {
        color: "#777",
        marginLeft: 10
    },
    button: {
        width: 70,
        height: 29,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        backgroundColor: "white",
        margin: 3,
        padding: 2
    },
    buttonText: {
        color: "#777",
    }
});
