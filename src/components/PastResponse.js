import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const makeDateString = timestamp => {
    const months = ["Jan", "Fed", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const date = new Date(timestamp);
    return `${months[date.getMonth() - 1]} ${date.getDay()}, ${date.getFullYear()}`;
}

export default function PastResponse({response}) {
    const [expanded, setExpanded] = useState(false);
    const hasNote = response.notes && response.notes.length > 0;
    const maxNotePreview = 20;
    const notesText = hasNote ?
        (response.notes.length > maxNotePreview ? response.notes.substring(0, Math.min(response.notes.length - 3, maxNotePreview)) + "..." : response.notes)
        : "";
    return (
        <TouchableOpacity
            style={{marginBottom: 15}}
            onPress={() => {setExpanded(!expanded)}}>
            <View style={[styles.container, expanded && hasNote && styles.expandedContainer]}>
                <View style={styles.rowContainer}>
                    <Text style={{fontWeight: "bold"}}>{response.value}</Text>
                    <Text style={{color: "#ccc"}}>  •  </Text>
                    <Text style={{color: "#444"}}>{makeDateString(response.timestamp)}</Text>
                    { !expanded && <Text style={{marginLeft: "auto"}}>{notesText}</Text> }
                </View>
                {
                    expanded && hasNote && <Text>{response.notes}</Text>
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
    }
});
