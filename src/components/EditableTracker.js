import { useContext } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import infoIcon from '../assets/images/info.png';
import upIcon from '../assets/images/upArrow.png';
import downIcon from '../assets/images/downArrow.png';
import AppContext from "./AppContext";
import AppText from "./AppText";

export default function EditableTracker({tracker, index, onEditTracker}) {

    const context = useContext(AppContext);

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

    return (
        <View style={styles.container}>
            <AppText style={styles.nameText}>{tracker.name}</AppText>
            <TouchableOpacity onPress={onOrderDown} style={{marginLeft: "auto"}}>
                <Image style={[styles.orderImage]} source={downIcon}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={onOrderUp}>
                <Image style={[styles.orderImage]} source={upIcon}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onEditTracker(index)}>
                <Image style={[styles.orderImage, { tintColor: "#5e9acc" }]} source={infoIcon}/>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
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
        textAlignVertical: "center",
        flex: 1
    },
    orderImage: {
        width: 24,
        height: 24,
        marginLeft: 20,
        marginTop: 0,
        tintColor: "#888"
    }
});
