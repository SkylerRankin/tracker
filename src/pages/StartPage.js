import { Image, StyleSheet, View } from 'react-native';
import { useContext } from 'react';
import AppContext from '../components/AppContext';
import { StackActions } from '@react-navigation/native';
import logoImage from '../assets/images/icon.png';
import { deleteLocalStorage } from '../components/StorageUtil';

export default function StartPage({navigation}) {
    const context = useContext(AppContext);

    if (context.dataInitialized) {
        setTimeout(async () => {
            navigation.dispatch(StackActions.replace("Home"));
        }, 500);
    }

    return (
        <View style={styles.container}>
            <Image style={styles.image} source={logoImage}/>
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
    image: {
        width: 100,
        height: 100
    }
});