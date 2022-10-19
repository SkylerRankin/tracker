import { Text, View } from 'react-native';
import { useContext } from 'react';
import AppContext from '../components/AppContext';
import { StackActions } from '@react-navigation/native';
import { deleteLocalStorage } from '../components/StorageUtil';

export default function StartPage({navigation}) {
    const context = useContext(AppContext);


    if (context.dataInitialized) {
        setTimeout(async () => {
            // await deleteLocalStorage();
            navigation.dispatch(StackActions.replace("Home"));
        }, 1000);
    }

    return (
        <View>
            <Text>Start page...</Text>
        </View>
    );

}