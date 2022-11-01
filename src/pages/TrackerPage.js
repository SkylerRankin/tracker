import React, { useContext, useEffect, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppContext from '../util/AppContext';
import AppText from '../components/AppText';
import { invertValue } from '../components/DataUtil';
import PastResponse from '../components/PastResponse';
import ScrollableSelector from '../components/ScrollableSelector';

const maxResponsesInList = 50;
const pageWidth = Dimensions.get("window").width;

export default function TrackerPage({ navigation, route }) {
    const trackerIndex = route.params.trackerIndex;
    const context = useContext(AppContext);
    const [responseValue, setResponseValue] = useState(0);
    const [responseNotes, setResponseNotes] = useState("");

    const tracker = context.trackers[trackerIndex];

    const onSave = () => {
        const response = {
            timestamp: (new Date()).getTime(),
            value: responseValue + 1,
            notes: responseNotes
        };
        context.addResponse(trackerIndex, response);
        setResponseNotes("");
        navigation.pop();
    }

    const pastResponses = context.pastResponses[trackerIndex].length <= maxResponsesInList ?
        [...context.pastResponses[trackerIndex]] :
        context.pastResponses[trackerIndex].slice(
            context.pastResponses[trackerIndex].length - maxResponsesInList,
            context.pastResponses[trackerIndex].length);
    pastResponses.reverse();

    return (
        <View style={styles.container}>
            <View style={{flexDirection: "row"}}>
                <AppText style={styles.trackerName}>{tracker.name}</AppText>
                <TouchableOpacity
                    onPress={() => navigation.pop()}
                    style={styles.backButton}>
                    <AppText style={styles.backButtonText}>Back</AppText>
                </TouchableOpacity>
            </View>
            <AppText style={styles.responseText}>Today's response...</AppText>
            <ScrollableSelector
                responseValue={responseValue}
                setResponseValue={setResponseValue}
                segments={tracker.segments}/>
            <AppText style={styles.responseText}>Notes...</AppText>
            <TextInput onChangeText={setResponseNotes} value={responseNotes} style={styles.notesInput} multiline={true}/>
            <TouchableOpacity style={styles.saveButtonContainer} onPress={onSave}>
                <AppText style={{textAlign: "center"}}>Save</AppText>
            </TouchableOpacity>
            <AppText style={[styles.responseText, {marginTop: 60}]}>Past responses...</AppText>
            <ScrollView style={styles.pastResponseContainer}>
                { pastResponses.map((response, i) => <PastResponse key={i} response={response}/>) }
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
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 40,
        marginRight: 20,
        width: pageWidth - 40 - 70 - 20
    },
    responseText: {
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
    },
    backButton: {
        width: 70,
        height: 29,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 8,
        backgroundColor: "#eee",
        padding: 2,
        marginLeft: "auto"
    },
    backButtonText: {
        color: "black"
    }
});
