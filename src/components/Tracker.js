import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import dotIcon from '../../assets/images/dot.png';
import checkIcon from '../../assets/images/check.png';
import { graphColors } from "./Constants";

export default function Tracker({navigation, tracker, completed, selected, onPress, index}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            onLongPress={() => {
                navigation.push("Trackers", { trackerIndex: index })
            }}>
            <View style={styles.container}>
                <Text style={styles.nameText}>{tracker.name}</Text>
                {
                    !completed && <Image style={[styles.reminderImage, styles.firstImageInRow]} source={dotIcon}/>
                }
                <Image style={[styles.isSelectedImage, selected && { tintColor: graphColors[tracker.colorIndex] }, completed && styles.firstImageInRow]} source={checkIcon}/>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        height: 50,
        marginBottom: 10,
        flexDirection: 'row',
        // backgroundColor: '#f2f2f2',
        // borderColor: '#349beb',
        // borderWidth: 4,
        padding: 10,
        borderRadius: 10
    },
    firstImageInRow: { marginLeft: 'auto' },
    reminderImage: {
        width: 19,
        height: 22,
        marginRight: 5,
        marginTop: 0,
        tintColor: '#edc82f'
    },
    isSelectedImage: {
        width: 24,
        height: 24,
        marginLeft: 5,
        marginRight: 5,
        marginTop: 0,
        tintColor: "#e1e1e1"
    },
    selectedImage: {
        tintColor: "#349beb"
    },
    nameText: {
        // marginLeft: 20,
        fontSize: 15,
        textAlignVertical: "center"
    }
});
