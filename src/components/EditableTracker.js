import { useContext, useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import xIcon from '../../assets/images/x.png';
import upIcon from '../../assets/images/upArrow.png';
import downIcon from '../../assets/images/downArrow.png';
import AppContext from "./AppContext";

export default function EditableTracker({tracker, index}) {

    const context = useContext(AppContext);
    const [ confirmDelete, setConfirmDelete ] = useState(false);

    const swapTrackerData = offset => {
        context.moveTrackerPosition(index, offset);
    }

    const onOrderUp = () => {
        if (index === 0) return;
        swapTrackerData(-1);
    };

    const onOrderDown = () => {
        if (index === context.trackers.length - 1) return;
        swapTrackerData(1);
    };

    const onDelete = () => {
        context.deleteTracker(index);
        setConfirmDelete(false);
    };

    const defaultView = (
        <View style={styles.container}>
            <Text style={styles.nameText}>{tracker.name}</Text>
            <TouchableOpacity onPress={onOrderDown} style={{marginLeft: "auto"}}>
                <Image style={[styles.orderImage]} source={downIcon}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={onOrderUp}>
                <Image style={[styles.orderImage]} source={upIcon}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setConfirmDelete(true)}>
                <Image style={[styles.orderImage, { tintColor: "red" }]} source={xIcon}/>
            </TouchableOpacity>
        </View>
    );

    const confirmDeleteView = (
        <View style={styles.container}>
            <Text style={styles.nameText}>{tracker.name}</Text>
            <Text style={{marginLeft: 20}}>Are you sure?</Text>
            <TouchableOpacity onPress={onDelete} style={{marginLeft: "auto", marginRight: 20}}>
                <Text>delete</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setConfirmDelete(false)}>
                <Text>cancel</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <View>
            { confirmDelete ? confirmDeleteView : defaultView }
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 50,
        marginBottom: 10,
        flexDirection: 'row',
        borderColor: '#349beb',
        padding: 10,
        borderRadius: 10,
        alignItems: "center"
    },
    firstImageInRow: { marginLeft: 'auto' },
    nameText: {
        fontSize: 15,
        textAlignVertical: "center"
    },
    orderImage: {
        width: 24,
        height: 24,
        marginLeft: 10,
        marginRight: 10,
        marginTop: 0,
        tintColor: "#888"
    }
});
