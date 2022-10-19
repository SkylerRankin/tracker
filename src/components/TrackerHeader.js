import { useContext } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppContext from "./AppContext";
import { aggregationModes } from "./Constants";

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
            <Text style={styles.text}>Your trackers</Text>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={onAggregationToggle} style={[styles.button, { marginRight: 0 }]}>
                    <Text style={styles.buttonText}>{aggregationMode}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onEdit} style={[styles.button]}>
                    <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={onAdd} style={[styles.button, { marginLeft: 0 }]}>
                    <Text style={styles.buttonText}>New</Text>
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
    buttonsContainer: {
        flexDirection: "row",
        borderRadius: 10,
        marginLeft: "auto",
    },
    text: {
        color: "#777",
        marginLeft: 10,
        textAlignVertical: "center"
    },
    button: {
        width: 70,
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
