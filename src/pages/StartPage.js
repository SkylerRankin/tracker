import { StyleSheet, Text, View } from 'react-native';
import { useContext } from 'react';
import AppContext from '../components/AppContext';
import { StackActions } from '@react-navigation/native';

export default function StartPage({navigation}) {
    const context = useContext(AppContext);

    if (context.dataInitialized) {
        setTimeout(async () => {
            navigation.dispatch(StackActions.replace("Home"));
        }, 500);
    }

    return (
        <View style={styles.container}>
            <Text style={styles.titleText}>~ daily tracker</Text>
        </View>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "white",
        alignItems: "center",
        justifyContent: "center"
    },
    titleText: {
        backgroundColor: "#eee",
        textAlign: "center",
        fontSize: 18,
        fontStyle: "italic",
        width: 200,
        padding: 10,
        borderRadius: 10
    }
});