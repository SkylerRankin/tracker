import { SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomePage from './src/pages/HomePage';
import AddPage from './src/pages/AddPage';
import ResponsePage from './src/pages/ResponsePage';
import TrackerPage from './src/pages/TrackerPage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SafeViewAndroid from './src/styles/SafeViewAndroid';
import { useState } from 'react';
import AppContext from './src/components/AppContext';
import { getLargeTestData, getPastThreeWeekGappedTestData, getPastThreeWeekTestData, getTestData } from './src/components/TestData';

/**

Global store schema:

- chart time scale: (0 = week, 1 = month, 2 = year)
- chart time offset: integer number of `chart time scale`s from today into the past
- trackers: array of tracker objects
- selected trackers: array of indexes into `trackers`
- past responses: array of past response objects
- using chart line: boolean, true when the vertical line is in use on the chat

Tracker object schema
- name: string
- segments: 10,
- colorIndex: integer
- invertAxis: boolean

Past response schema
- timestamp: timestamp
- value: integer [1, 10]
- notes: string

Using Chart Line

*/

const stack = createNativeStackNavigator();

export default function App() {

    const [chartTimeScale, setChartTimeScale] = useState(0);
    const [chartTimeOffset, setChartTimeOffset] = useState(0);
    const [pastResponses, setPastResponses] = useState([
        getPastThreeWeekTestData(),
        getLargeTestData(),
        getPastThreeWeekGappedTestData(),
        getTestData()
    ]);
    const [trackers, setTrackers] = useState([
        { name: "Knee Pain", segments: 10, colorIndex: 6, invertAxis: false },
        { name: "Mood", segments: 10, colorIndex: 0, invertAxis: false },
        { name: "Happiness", segments: 10, colorIndex: 3, invertAxis: false },
        { name: "the deal", segments: 10, colorIndex: 2, invertAxis: false }
    ]);
    const [selectedTrackers, setSelectedTrackers] = useState([2]);
    const [usingChartLine, setUsingChartLine] = useState(false);

    const appSettings = {
        chartTimeScale, setChartTimeScale,
        chartTimeOffset, setChartTimeOffset,
        pastResponses, setPastResponses,
        trackers, setTrackers,
        selectedTrackers, setSelectedTrackers,
        usingChartLine, setUsingChartLine
    };

    return (
        <AppContext.Provider value={appSettings}>
            <NavigationContainer style={styles.root}>
                <SafeAreaView style={SafeViewAndroid.AndroidSafeArea}>
                    <stack.Navigator>
                        <stack.Screen
                            name="Home"
                            component={HomePage}
                            options={{ headerShown: false }}/>
                        <stack.Screen name="Add" component={AddPage} options={{ headerShown: false }}/>
                        <stack.Screen name="Response" component={ResponsePage} options={{ headerShown: false }}/>
                        <stack.Screen name="Trackers" component={TrackerPage} options={{ headerShown: false }}/>
                    </stack.Navigator>
                </SafeAreaView>
            </NavigationContainer>
        </AppContext.Provider>
        
    );
}

const styles = StyleSheet.create({
    root: {
        backgroundColor: 'white'
    }
});
