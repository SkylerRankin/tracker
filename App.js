import { SafeAreaView, StyleSheet, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomePage from './src/pages/HomePage';
import AddPage from './src/pages/AddPage';
import ResponsePage from './src/pages/ResponsePage';
import TrackerPage from './src/pages/TrackerPage';
import StartPage from './src/pages/StartPage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SafeViewAndroid from './src/styles/SafeViewAndroid';
import { Component, useContext, useEffect, useRef, useState } from 'react';
import AppContext from './src/components/AppContext';
import { getLargeTestData, getPastThreeWeekGappedTestData, getPastThreeWeekTestData, getTestData } from './src/components/TestData';
import { loadResponses, loadTrackers, runStorageInitialization, writeAppData } from './src/components/StorageUtil';

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
const saveChangesWaitMS = 5 * 1000

export default class App extends Component {

    saveChangesTimer = null;
    appStateSubscription = null;

    constructor(props) {
        super(props);
        this.state = {
            appState: AppState.currentState,
            dataInitialized: false,
            chartTimeScale: 0,
            chartTimeOffset: 0,
            pastResponses: [],
            trackers: [],
            selectedTrackers: [],
            savedFiles: null
        };
    }

    async componentDidMount(_, prevState) {
        console.log("Initializing app");
        // Use an arrow function for listener to ensure onAppStateChange has the scope access to this.state.
        this.appStateSubscription = AppState.addEventListener("change", (nextAppState) => this.onAppStateChange(nextAppState));
        const loadedData = await runStorageInitialization();
        this.setState({
            ...prevState,
            dataInitialized: true,
            pastResponses: loadedData.pastResponses,
            trackers: loadedData.trackers,
            selectedTrackers: loadedData.selectedTrackers,
            savedFiles: loadedData.savedFiles
        });
        console.log("Finished setting initial state from disk.");
    }

    componentWillUnmount() {
        if (this.saveChangesTimer !== null) {
            clearTimeout(this.saveChangesTimer);
            this.saveChangesTimer = null;
        }

        if (this.appStateSubscription !== null) {
            this.appStateSubscription.remove();
        }
    }

    async onAppStateChange(nextAppState) {
        if (nextAppState !== "active") {
            if (this.saveChangesTimer !== null) {
                clearTimeout(this.saveChangesTimer);
                this.saveChangesTimer = null;
            }
            await writeAppData(this.state);
        }
        this.setState({ ...this.state, appState: nextAppState });
    }

    onSavedDataUpdate() {
        if (this.saveChangesTimer !== null) {
            clearTimeout(this.saveChangesTimer);
        }
        this.saveChangesTimer = setTimeout(async () => { await writeAppData(this.state) }, saveChangesWaitMS);
    }

    render() {
        const appContext = {
            dataInitialized: this.state.dataInitialized,
            chartTimeScale: this.state.chartTimeScale,
            setChartTimeScale: newChartTimeScale => this.setState(previousState => ({ ...previousState, chartTimeScale: newChartTimeScale })),
            chartTimeOffset: this.state.chartTimeOffset,
            setChartTimeOffset: newChartTimeOffset => this.setState(previousState => ({ ...previousState, chartTimeOffset: newChartTimeOffset })),
            pastResponses: this.state.pastResponses,
            setPastResponses: newPastResponses => {
                this.setState(previousState => ({ ...previousState, pastResponses: newPastResponses }));
                this.onSavedDataUpdate();
            },
            trackers: this.state.trackers,
            setTrackers: newTrackers => {
                this.setState(previousState => ({ ...previousState, trackers: newTrackers }));
                this.onSavedDataUpdate();
            },
            selectedTrackers: this.state.selectedTrackers,
            setSelectedTrackers: newSelectedTrackers => {
                this.setState(previousState => ({ ...previousState, selectedTrackers: newSelectedTrackers }));
                this.onSavedDataUpdate();
            },
            savedFiles: this.state.savedFiles,
            setSavedFiles: newSavedFiles => this.setState(previousState => ({ ...previousState, savedFiles: newSavedFiles }))
        };

        return (
            <AppContext.Provider value={appContext}>
                <NavigationContainer style={styles.root} onStateChange={ s => console.log(s) }>
                    <SafeAreaView style={SafeViewAndroid.AndroidSafeArea}>
                        <stack.Navigator>
                            <stack.Screen name="Start" component={StartPage} options={{ headerShown: false }} />
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

}

const styles = StyleSheet.create({
    root: {
        backgroundColor: 'white'
    }
});
