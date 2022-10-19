import { SafeAreaView, StyleSheet, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomePage from './src/pages/HomePage';
import AddPage from './src/pages/AddPage';
import ResponsePage from './src/pages/ResponsePage';
import TrackerPage from './src/pages/TrackerPage';
import StartPage from './src/pages/StartPage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SafeViewAndroid from './src/styles/SafeViewAndroid';
import { Component } from 'react';
import AppContext from './src/components/AppContext';
import { getLargeTestData, getPastThreeWeekGappedTestData, getPastThreeWeekTestData, getTestData } from './src/components/TestData';
import { runStorageInitialization, writeAppData } from './src/components/StorageUtil';
import { aggregationModes, buildFullDatasetCache, getDatasetCacheKey, getProcessedSequence } from './src/components/DataUtil';

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
            aggregationMode: 0,
            savedFiles: null,
            datasetCache: {}
        };
    }

    async componentDidMount(_, prevState) {
        console.log("Initializing app");
        // Use an arrow function for listener to ensure onAppStateChange has the scope access to this.state.
        this.appStateSubscription = AppState.addEventListener("change", (nextAppState) => this.onAppStateChange(nextAppState));
        const loadedData = await runStorageInitialization();

        // FOR DEBUGGING!!!!!!!!!!!
        if (loadedData.trackers.length === 0) {
            console.log("!!!!!!!!!!!! Loading test data");
            loadedData.pastResponses = [getPastThreeWeekTestData()];
            loadedData.trackers = [{ name: "test tracker", segments: 10, colorIndex: 0, invertAxis: false }];
            loadedData.selectedTrackers = [0];
        }

        // Initialize the dataset cache for each time scale - aggregation - tracker configuration.
        const datasetCache = loadedData.trackers.length === 0 ? {} :
            buildFullDatasetCache(loadedData.pastResponses, loadedData.trackers.length);

        console.log("Dataset cache keys:");
        console.log(Object.keys(datasetCache));

        this.setState({
            ...prevState,
            dataInitialized: true,
            pastResponses: loadedData.pastResponses,
            trackers: loadedData.trackers,
            selectedTrackers: loadedData.selectedTrackers,
            savedFiles: loadedData.savedFiles,
            datasetCache
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
            setChartTimeScale: newChartTimeScale => this.setState({ chartTimeScale: newChartTimeScale }),
            chartTimeOffset: this.state.chartTimeOffset,
            setChartTimeOffset: newChartTimeOffset => this.setState({ chartTimeOffset: newChartTimeOffset }),

            pastResponses: this.state.pastResponses,
            addResponse: newResponse => {
                const newPastResponses = this.state.pastResponses.map(trackerResponseSet => trackerResponseSet.map(response => Object.assign({}, response)));
                newPastResponses.push(newResponse);

                const newDatasetCache = buildFullDatasetCache(newPastResponses, newTrackers.length);

                this.setState({
                    pastResponses: newPastResponses,
                    datasetCache: newDatasetCache
                });
            },

            trackers: this.state.trackers,
            deleteTracker: trackerIndex => {
                // Remove the tracker index from the selected trackers.
                const newSelectedTrackers = this.state.selectedTrackers
                    .filter(i => i !== trackerIndex)
                    .map(i => i > trackerIndex ? i - 1 : i);

                // Remove the tracker index from the trackers array.
                const newTrackers = this.state.trackers.map((tracker, i) => {
                    if (i === trackerIndex) return;
                    return Object.assign({}, tracker);
                });

                // Remove the responses for this tracker.
                const newPastResponses = [];
                this.state.pastResponses.forEach((pastResponseSet, i) => {
                    if (i === trackerIndex) return;
                    const responses = [];
                    pastResponseSet.forEach(response => {
                        responses.push(Object.assign({}, response));
                    });
                    newPastResponses.push(responses);
                });

                // Rebuild the dataset cache.
                const newDatasetCache = newTrackers.length === 0 ? {} :
                    buildFullDatasetCache(newPastResponses, newTrackers.length);

                this.setState({
                    selectedTrackers: newSelectedTrackers,
                    trackers: newTrackers,
                    pastResponses: newPastResponses,
                    datasetCache: newDatasetCache
                });
            },
            moveTrackerPosition: (trackerIndex, offset) => {
                const newIndex = index => index === trackerIndex ? trackerIndex + offset : index === trackerIndex + offset ? trackerIndex - offset : index;

                const newSelectedTrackers = this.state.selectedTrackers.map(i => newIndex(i));

                const newTrackers = this.state.trackers.map(tracker => Object.assign({}, tracker));
                [newTrackers[trackerIndex], newTrackers[trackerIndex + offset]] = [newTrackers[trackerIndex + offset], newTrackers[trackerIndex]];

                const newPastResponses = this.state.pastResponses.map(trackerResponseSet => trackerResponseSet.map(response => Object.assign({}, response)));
                [newPastResponses[trackerIndex], newPastResponses[trackerIndex + offset]] = [newPastResponses[trackerIndex + offset], newPastResponses[trackerIndex]];

                const newDatasetCache = buildFullDatasetCache(newPastResponses, newTrackers.length);

                this.setState({
                    selectedTrackers: newSelectedTrackers,
                    trackers: newTrackers,
                    pastResponses: newPastResponses,
                    datasetCache: newDatasetCache
                });
            },
            addTracker: tracker => {
                const newTrackers = [tracker, ...this.state.trackers.map(previousTracker => Object.assign({}, previousTracker))];
                const newPastResponses = this.state.pastResponses.map(trackerResponseSet => trackerResponseSet.map(response => Object.assign({}, response)));
                const newDatasetCache = buildFullDatasetCache(newPastResponses, newTrackers.length);
                this.setState({
                    trackers: newTrackers,
                    pastResponses: newPastResponses,
                    datasetCache: newDatasetCache
                });
            },

            selectedTrackers: this.state.selectedTrackers,
            toggleSelectedTracker: trackerIndex => {
                let newSelectedTrackers;
                if (this.state.selectedTrackers.includes(trackerIndex)) {
                    newSelectedTrackers = this.state.selectedTrackers.filter(i => i !== trackerIndex);
                } else {
                    newSelectedTrackers = [trackerIndex, ...this.state.selectedTrackers];
                }
                this.setState({ selectedTrackers: newSelectedTrackers });
            },

            aggregationMode: this.state.aggregationMode,
            setAggregationMode: newAggregationMode => this.setState({ aggregationMode: newAggregationMode }),
            savedFiles: this.state.savedFiles,
            datasetCache: this.state.datasetCache
        };

        return (
            <AppContext.Provider value={appContext}>
                <SafeAreaView style={SafeViewAndroid.AndroidSafeArea}>
                    <NavigationContainer style={styles.root}>
                        <stack.Navigator>
                            <stack.Screen name="Start" component={StartPage} options={{ headerShown: false }} />
                            <stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
                            <stack.Screen name="Add" component={AddPage} options={{ headerShown: false }} />
                            <stack.Screen name="Response" component={ResponsePage} options={{ headerShown: false }} />
                            <stack.Screen name="Trackers" component={TrackerPage} options={{ headerShown: false }} />
                        </stack.Navigator>
                    </NavigationContainer>
                </SafeAreaView>
            </AppContext.Provider>
        );
    }

}

const styles = StyleSheet.create({
    root: {
        backgroundColor: 'white'
    }
});
