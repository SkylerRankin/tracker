import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
                    <Text style={{fontWeight: "bold"}}>{response.value}</Text>
                    <Text style={{color: "#ccc"}}>  •  </Text>
                    <Text style={{color: "#444"}}>{makeDateString(response.timestamp)}</Text>
                    { !expanded && <Text style={{marginLeft: "auto"}}>{notesText}</Text> }
                </View>
                {
                    expanded && hasNote && <Text style={{marginTop: 10}}>{response.notes}</Text>
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
