import React, { useContext, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppContext from '../components/AppContext';
import PastResponse from '../components/PastResponse';
import ScrollableSelector from '../components/ScrollableSelector';

export default function TrackerPage({ navigation, route }) {
    const trackerIndex = route.params.trackerIndex;
    const context = useContext(AppContext);
    const [responseValue, setResponseValue] = useState(0);
    const [responseNotes, setResponseNotes] = useState("");

    const tracker = context.trackers[trackerIndex];

    const onSave = () => {
        const response = {
            timestamp: (new Date()).getTime(),
            value: responseValue,
            notes: responseNotes
        };
        const pastResponses = context.pastResponses;
        pastResponses[trackerIndex].push(response);
        context.setPastResponses(pastResponses);
        setResponseNotes("");
    }

    return (
        <View style={styles.container}>
            <View style={{flexDirection: "row"}}>
                <Text style={styles.trackerName}>{tracker.name}</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Home')}
                    style={{marginLeft: "auto"}}>
                    <Text style={styles.buttonText}>back</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.responseText}>Today's response...</Text>
            <ScrollableSelector
                responseValue={responseValue}
                setResponseValue={setResponseValue}
                segments={tracker.segments}/>
            <Text style={styles.responseText}>Notes...</Text>
            <TextInput onChangeText={setResponseNotes} value={responseNotes} style={styles.notesInput} multiline={true}/>
            <TouchableOpacity style={styles.saveButtonContainer} onPress={onSave}>
                <Text style={{textAlign: "center"}}>Save</Text>
            </TouchableOpacity>
            <Text style={[styles.responseText, {marginTop: 60}]}>Past responses...</Text>
            <ScrollView style={styles.pastResponseContainer}>
                { context.pastResponses[trackerIndex].map((response, i) => <PastResponse key={i} response={response}/>) }
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flex: 1,
        backgroundColor: '#fff',
    },
    trackerName: {
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 40
    },
    responseText: {
        fontStyle: "italic",
        marginBottom: 20
    },
    notesInput: {
        height: 80,
        borderWidth: 1,
        borderColor: "#eee",
        borderRadius: 10,
        textAlignVertical: "top",
        padding: 5
    },
    saveButtonContainer: {
        borderWidth: 1,
        borderColor: "#eee",
        borderRadius: 10,
        justifyContent: "center",
        width: 80,
        height: 40,
        marginTop: 30
    },
    pastResponseContainer: {
        flex: 1,
        paddingLeft: 30,
        paddingRight: 10
    }
});
