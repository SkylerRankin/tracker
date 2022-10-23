import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import dotIcon from '../../assets/images/dot.png';
import checkIcon from '../../assets/images/check.png';

export default function Tracker({navigation, tracker, completed, selected, onPress, index}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={() => {
                navigation.push("Trackers", { trackerIndex: index })
            }}>
            <View style={styles.container}>
                <Text style={styles.nameText}>{tracker.name}</Text>
                <Image style={[styles.reminderImage, styles.firstImageInRow, completed && styles.reminderImageInactive]} source={dotIcon}/>
                <Image style={[styles.isSelectedImage, selected && { tintColor: tracker.color }]} source={checkIcon}/>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 10,
        flexDirection: 'row',
        padding: 10,
        borderRadius: 10,
        alignItems: "center"
    },
    reminderImage: {
        width: 19,
        height: 22,
        marginRight: 5,
        marginTop: 0,
        tintColor: '#edc82f'
    },
    reminderImageInactive: {
        tintColor: "white"
    },
    isSelectedImage: {
        width: 24,
        height: 24,
        marginLeft: 10,
        marginTop: 0,
        tintColor: "#e1e1e1"
    },
    selectedImage: {
        tintColor: "#349beb"
    },
    nameText: {
        fontSize: 15,
        textAlignVertical: "center",
        flex: 1
    }
});
