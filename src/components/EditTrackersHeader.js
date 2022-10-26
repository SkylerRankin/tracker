import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppText from "./AppText";


export default function EditTrackersHeader({ onBack }) {

    return (
        <View style={styles.container}>
            <AppText style={styles.text}>Edit trackers</AppText>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={onBack} style={[styles.button, { marginLeft: 0 }]}>
                    <AppText style={styles.buttonText}>Back</AppText>
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
