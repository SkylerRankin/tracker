import { useContext, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppContext from '../components/AppContext';
import { graphColors } from '../components/Constants';

export default function AddPage({navigation, route}) {
    const context = useContext(AppContext);
    const editExistingTracker = route.params.editExisting;
    const existingTrackerIndex = route.params.existingTrackerIndex;
    const existingTracker = editExistingTracker && context.trackers[existingTrackerIndex];

    const [color, setColor] = useState(editExistingTracker ? existingTracker.color : graphColors[0]);
    const [customColor, setCustomColor] = useState(editExistingTracker && !graphColors.includes(existingTracker.color) ? existingTracker.color : "");
    const [trackerName, setTrackerName] = useState(editExistingTracker ? existingTracker.name : "");   
    const [invertAxis, setInvertAxis] = useState(editExistingTracker ? existingTracker.invertAxis : false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    const existingTrackerNames = context.trackers.map(t => t.name);
    const nameIsNew = !existingTrackerNames.includes(trackerName) || (editExistingTracker && trackerName === existingTracker.name);
    const customColorIsValid = !customColor || customColor.length === 0 || customColor.match(/#[a-fA-F0-9]{6}/g);

    const onSave = () => {
        const newTracker = {
            name: trackerName,
            color: color,
            segments: 10,
            invertAxis: invertAxis
        };
        if (editExistingTracker) {
            context.updateTracker(existingTrackerIndex, newTracker);
        } else {
            context.addTracker(newTracker);
        }
        
        navigation.navigate("Home");
    }

    const onDelete = () => {
        context.deleteTracker(existingTrackerIndex);
        navigation.navigate("Home");
    }

    const onCustomColorChange = value => {
        setCustomColor(value);
        setColor(value);
        if (value.length === 0) {
            setColor(graphColors[0]);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={{fontSize: 20}}>{ editExistingTracker ? "Edit tracker" : "Add a tracker" }</Text>
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
            { graphColors.map(graphColor => (
                <TouchableOpacity
                    key={graphColor}
                    onPress={() => { setColor(graphColor) }}
                    style={[styles.colorSelector, {backgroundColor: graphColor}, graphColor === color && styles.selectedColorSelector]}>
                    <View></View>
                </TouchableOpacity>
            )) }
            </View>
            <View style={styles.customColorContainer}>
                <TextInput
                    placeholder="Custom color (e.g. #c96d5d)"
                    onChangeText={onCustomColorChange}
                    value={customColor}
                    style={[styles.customColorInput, customColor && styles.customColorInputActive]}/>
                <Text style={[styles.messageText, { height: 50 }]}>{ !customColorIsValid && "~ must be a hex value" }</Text>
            </View>

            <Text style={{marginTop: 30, marginBottom: 20}}>Invert y-axis in chart...</Text>
            <TouchableOpacity onPress={() => { setInvertAxis(!invertAxis); }}>
                <Text style={[styles.invertButton, invertAxis && styles.invertButtonSelected]}>
                    {invertAxis ? "Yes" : "No"}
                </Text>
            </TouchableOpacity>
            {
                editExistingTracker && !confirmDelete &&
                    <TouchableOpacity onPress={() => { setConfirmDelete(true); }} style={{marginTop: 20}}>
                        <Text style={[styles.deleteButton]}>
                            Delete
                        </Text>
                    </TouchableOpacity>
            }
            {
                editExistingTracker && confirmDelete &&
                    <View style={styles.confirmDeleteContainer}>
                        <Text>Are you sure?</Text>
                        <TouchableOpacity onPress={() => { setConfirmDelete(false); }}>
                            <Text style={[styles.confirmDeleteButton]}>
                                Cancel
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { onDelete(); }}>
                            <Text style={[styles.deleteButton]}>
                                Delete
                            </Text>
                        </TouchableOpacity>
                    </View>
            }
            {
            nameIsNew && trackerName.length > 0 && customColorIsValid && (
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
    customColorContainer: {
        marginTop: 10,
        marginHorizontal: 20
    },
    customColorInput: {
        borderWidth: 4,
        borderRadius: 10,
        padding: 5,
        paddingLeft: 10,
        width: 200,
        borderColor: "white"
    },
    customColorInputActive: {
        borderColor: "black"
    },
    colorSelector: {
        width: 45,
        height: 45,
        borderWidth: 4,
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
    },
    deleteButton: {
        width: 70,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#c96d5d",
        color: "white",
        textAlign: "center"
    },
    confirmDeleteContainer: {
        marginTop: 20,
        flexDirection: "row",
        alignItems: "center"
    },
    confirmDeleteButton: {
        width: 70,
        padding: 10,
        borderRadius: 10,
        marginHorizontal: 20,
        backgroundColor: "#eee",
        textAlign: "center"
    }
});
