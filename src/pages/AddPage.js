import { useContext, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppContext from '../components/AppContext';
import { graphColors } from '../components/Constants';

export default function AddPage({navigation}) {
    const context = useContext(AppContext);

    const [colorIndex, setColorIndex] = useState(0);
    const [trackerName, setTrackerName] = useState("");   
    const [invertAxis, setInvertAxis] = useState(false);
    const nameIsNew = context.trackers.filter(tracker => tracker.name === trackerName).length === 0;

    const onSave = () => {
        const newTracker = {
            name: trackerName,
            colorIndex: colorIndex,
            segments: 10,
            invertAxis: invertAxis
        };
        const pastResponses = context.pastResponses;
        pastResponses.push([]);
        context.setPastResponses(pastResponses);
        context.setTrackers([...context.trackers, newTracker]);
        navigation.navigate("Home");
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={{fontSize: 20}}>Add a tracker</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Home')}
                    style={{marginLeft: "auto"}}>
                    <Text style={styles.buttonText}>back</Text>
                </TouchableOpacity>
            </View>
            <Text style={{marginBottom: 10, marginTop: 30}}>Name...</Text>
            <TextInput style={styles.nameInput} onChangeText={setTrackerName} value={trackerName}/>
            
            <Text style={styles.messageText}>{ !nameIsNew && "~ this name has already been used" }</Text>
            <Text style={{marginTop: 30, marginBottom: 20}}>Color...</Text>
            <View style={styles.colorSelectorContainer}>
            { graphColors.map((color, i) => (
                <TouchableOpacity
                    key={i}
                    onPress={() => { setColorIndex(i) }}
                    style={[styles.colorSelector, {backgroundColor: color}, i === colorIndex && styles.selectedColorSelector]}>
                    <View></View>
                </TouchableOpacity>
            )) }
            </View>

            <Text style={{marginTop: 30, marginBottom: 20}}>Invert y-axis in chart...</Text>
            <TouchableOpacity onPress={() => { setInvertAxis(!invertAxis); }}>
                <Text style={[styles.invertButton, invertAxis && styles.invertButtonSelected]}>
                    {invertAxis ? "Yes" : "No"}
                </Text>
            </TouchableOpacity>

            {
            nameIsNew && trackerName.length > 0 && (
                <TouchableOpacity
                    style={styles.saveButtonContainer}
                    onPress={onSave}>
                    <Text style={{textAlign: "center"}}>Save</Text>
                </TouchableOpacity>)
            }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 30
    },
    headerContainer: {
        flexDirection: "row"
    },
    nameInput: {
        borderWidth: 1,
        borderColor: "#eee",
        borderRadius: 10,
        fontSize: 20,
        // textAlignVertical: "middle",
        padding: 5
    },
    colorSelectorContainer: {
        width: "100%",
        // backgroundColor: "yellow",
        justifyContent: "center",
        flexDirection: "row",
        flexWrap: "wrap"
    },
    colorSelector: {
        width: 40,
        height: 40,
        borderWidth: 2,
        borderColor: "transparent",
        borderRadius: 10,
        margin: 10
    },
    selectedColorSelector: {
        borderColor: "black",
    },
    saveButtonContainer: {
        marginTop: 40,
        padding: 10,
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#eee",
        width: 60
    },
    messageText: {
        color: "#9c6260",
        marginLeft: 20
    },
    invertButton: {
        backgroundColor: "#eee",
        padding: 10,
        borderRadius: 10,
        width: 50,
        textAlign: "center",
        // marginLeft: 20
    },
    invertButtonSelected: {
        backgroundColor: "#edc82f"
    }
});
