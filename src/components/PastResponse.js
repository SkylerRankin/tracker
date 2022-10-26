import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppText from "./AppText";

const makeDateString = timestamp => {
    const months = ["Jan", "Fed", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const date = new Date(timestamp);
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export default function PastResponse({response}) {
    const [expanded, setExpanded] = useState(false);
    const hasNote = response.notes && response.notes.length > 0;
    const maxNotePreview = 15;
    let notesText = "";
    if (hasNote) {
        notesText = response.notes.replace(new RegExp("(\r\n|\r|\n)", "g"), " ");
        if (notesText.length > maxNotePreview) {
            notesText = notesText.substring(0, Math.min(notesText.length - 3, maxNotePreview)) + "...";
        }
    }
    return (
        <TouchableOpacity
            style={{marginBottom: 15}}
            onPress={() => {setExpanded(!expanded)}}>
            <View style={[styles.container, expanded && hasNote && styles.expandedContainer]}>
                <View style={styles.rowContainer}>
                    <AppText style={{fontWeight: "bold", width: 20}}>{response.value}</AppText>
                    <AppText style={styles.dot}>•</AppText>
                    <AppText style={{color: "#444"}}>{makeDateString(response.timestamp)}</AppText>
                    { !expanded && <AppText style={{marginLeft: "auto"}}>{notesText}</AppText> }
                </View>
                {
                    expanded && hasNote && <AppText style={{marginTop: 10}}>{response.notes}</AppText>
                }
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: "transparent",
        borderRadius: 10
    },
    expandedContainer: {
        borderColor: "#eee",        
    },
    rowContainer: {
        flexDirection: "row",
        borderRadius: 10
    },
    dot: {
        color: "#ccc",
        width: 20,
        textAlign: "center",
        marginHorizontal: 4
    },
});
