import { StyleSheet, Text, TouchableOpacity, View } from "react-native";


export default function EditTrackersHeader({ onBack }) {

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Edit trackers</Text>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={onBack} style={[styles.button, { marginLeft: 0 }]}>
                    <Text style={styles.buttonText}>Back</Text>
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
