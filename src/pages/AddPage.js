import { useContext, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AppContext from '../components/AppContext';
import AppText from '../components/AppText';
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
                <AppText style={{fontSize: 20}}>{ editExistingTracker ? "Edit tracker" : "Add a tracker" }</AppText>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Home')}
                    style={styles.backButton}>
                    <AppText style={styles.backButtonText}>Back</AppText>
                </TouchableOpacity>
            </View>
            <AppText style={{marginBottom: 10, marginTop: 30}}>Name...</AppText>
            <TextInput style={styles.nameInput} onChangeText={setTrackerName} value={trackerName}/>
            
            <AppText style={styles.messageText}>{ !nameIsNew && "~ this name has already been used" }</AppText>
            <AppText style={{marginTop: 30, marginBottom: 20}}>Color...</AppText>
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
                <AppText style={[styles.messageText, { height: 50 }]}>{ !customColorIsValid && "~ must be a hex value" }</AppText>
            </View>

            <AppText style={{marginTop: 30, marginBottom: 20}}>Invert y-axis in chart...</AppText>
            <TouchableOpacity onPress={() => { setInvertAxis(!invertAxis); }} style={[styles.invertButton, invertAxis && styles.invertButtonSelected]}>
                <AppText style={{textAlign: "center"}}>
                    {invertAxis ? "Yes" : "No"}
                </AppText>
            </TouchableOpacity>
            {
                editExistingTracker && !confirmDelete &&
                    <TouchableOpacity onPress={() => { setConfirmDelete(true); }} style={[styles.deleteButton, {marginTop: 20}]}>
                        <AppText style={[styles.deleteButtonText]}>
                            Delete
                        </AppText>
                    </TouchableOpacity>
            }
            {
                editExistingTracker && confirmDelete &&
                    <View style={styles.confirmDeleteContainer}>
                        <AppText>Are you sure?</AppText>
                        <TouchableOpacity onPress={() => { setConfirmDelete(false); }} style={[styles.confirmDeleteButton]}>
                            <AppText style={[styles.confirmDeleteButtonText]}>
                                Cancel
                            </AppText>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { onDelete(); }} style={[styles.deleteButton]}>
                            <AppText style={[styles.deleteButtonText]}>
                                Delete
                            </AppText>
                        </TouchableOpacity>
                    </View>
            }
            {
            nameIsNew && trackerName.length > 0 && customColorIsValid && (
                <TouchableOpacity
                    style={styles.saveButtonContainer}
                    onPress={onSave}>
                    <AppText style={{textAlign: "center"}}>Save</AppText>
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
        width: 50
    },
    invertButtonSelected: {
        backgroundColor: "#edc82f"
    },
    deleteButton: {
        width: 70,
        padding: 10,
        borderRadius: 10,
        backgroundColor: "#c96d5d"
    },
    deleteButtonText: {
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
        backgroundColor: "#eee"
    },
    confirmDeleteButtonText: {
        textAlign: "center"
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
