import { SafeAreaView, StyleSheet, AppState } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import HomePage from './src/pages/HomePage';
import AddPage from './src/pages/AddPage';
import TrackerPage from './src/pages/TrackerPage';
import StartPage from './src/pages/StartPage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SafeViewAndroid from './src/styles/SafeViewAndroid';
import { Component } from 'react';
import AppContext from './src/components/AppContext';
import { getLargeTestData, getPastThreeWeekGappedTestData, getPastThreeWeekTestData, getTestData } from './src/components/TestData';
import { runStorageInitialization, writeAppData } from './src/components/StorageUtil';
import { addConfigToChartDatasetCache, buildFullDatasetCache } from './src/components/DataUtil';

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
            fullDatasetCache: {},
            chartDatasetCache: {}
        };
    }

    async componentDidMount(_, prevState) {
        console.log("Initializing app");
        // Use an arrow function for listener to ensure onAppStateChange has the scope access to this.state.
        this.appStateSubscription = AppState.addEventListener("change", (nextAppState) => this.onAppStateChange(nextAppState));
        // await deleteLocalStorage();
        const loadedData = await runStorageInitialization();

        // FOR DEBUGGING!!!!!!!!!!!
        if (loadedData.trackers.length === 0) {
            console.log("!!!!!!!!!!!! Loading test data");
            loadedData.pastResponses = [
                getPastThreeWeekTestData(),
                getLargeTestData()
            ];
            loadedData.trackers = [
                { name: "three weeks", segments: 10, colorIndex: 0, invertAxis: true },
                { name: "500 days", segments: 10, colorIndex: 1, invertAxis: false }
            ];
            loadedData.selectedTrackers = [0, 1];
        }

        // Initialize the dataset cache for each time scale - aggregation - tracker configuration.
        const fullDatasetCache = loadedData.trackers.length === 0 ? {} :
            buildFullDatasetCache(loadedData.pastResponses, loadedData.trackers.length);

        // Initialize the chart dataset cache for each loaded tracker.
        const chartDatasetCache = addConfigToChartDatasetCache({}, fullDatasetCache, loadedData.trackers.length,
            this.state.chartTimeOffset, this.state.chartTimeScale, this.state.aggregationMode);

        this.setState({
            ...prevState,
            dataInitialized: true,
            pastResponses: loadedData.pastResponses,
            trackers: loadedData.trackers,
            selectedTrackers: loadedData.selectedTrackers,
            savedFiles: loadedData.savedFiles,
            fullDatasetCache,
            chartDatasetCache
        });
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
            console.log(`Triggering writeAppData due to state change to ${nextAppState}.`);
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
            setChartTimeScale: newChartTimeScale => {
                const newChartTimeOffset = 0;
                const newChartDatasetCache = addConfigToChartDatasetCache(this.state.chartDatasetCache, this.state.fullDatasetCache, this.state.trackers.length,
                    newChartTimeOffset, newChartTimeScale, this.state.aggregationMode);
                this.setState({ chartTimeScale: newChartTimeScale, chartTimeOffset: newChartTimeOffset, chartDatasetCache: newChartDatasetCache });
            },

            chartTimeOffset: this.state.chartTimeOffset,
            setChartTimeOffset: newChartTimeOffset => {
                const newChartDatasetCache = addConfigToChartDatasetCache(this.state.chartDatasetCache, this.state.fullDatasetCache, this.state.trackers.length,
                    newChartTimeOffset, this.state.chartTimeScale, this.state.aggregationMode);
                this.setState({ chartTimeOffset: newChartTimeOffset, chartDatasetCache: newChartDatasetCache })
            },

            pastResponses: this.state.pastResponses,
            addResponse: (trackerIndex, newResponse) => {
                const newPastResponses = this.state.pastResponses.map(trackerResponseSet => trackerResponseSet.map(response => Object.assign({}, response)));
                newPastResponses[trackerIndex].push(newResponse);

                const newFullDatasetCache = buildFullDatasetCache(newPastResponses, this.state.trackers.length);
                const newChartDatasetCache = addConfigToChartDatasetCache({}, newFullDatasetCache, this.state.trackers.length,
                    this.state.chartTimeOffset, this.state.chartTimeScale, this.state.aggregationMode);

                this.onSavedDataUpdate();
                this.setState({
                    pastResponses: newPastResponses,
                    fullDatasetCache: newFullDatasetCache,
                    chartDatasetCache: newChartDatasetCache
                });
            },

            trackers: this.state.trackers,
            deleteTracker: trackerIndex => {
                // Remove the tracker index from the selected trackers.
                const newSelectedTrackers = this.state.selectedTrackers
                    .filter(i => i !== trackerIndex)
                    .map(i => i > trackerIndex ? i - 1 : i);

                // Remove the tracker index from the trackers array.
                const newTrackers = this.state.trackers
                    .filter((_, i) => i !== trackerIndex)
                    .map(tracker => Object.assign({}, tracker));

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
                const newFullDatasetCache = newTrackers.length === 0 ? {} :
                    buildFullDatasetCache(newPastResponses, newTrackers.length);
                const newChartDatasetCache = addConfigToChartDatasetCache({}, newFullDatasetCache, newTrackers.length,
                    this.state.chartTimeOffset, this.state.chartTimeScale, this.state.aggregationMode);

                this.onSavedDataUpdate();
                this.setState({
                    selectedTrackers: newSelectedTrackers,
                    trackers: newTrackers,
                    pastResponses: newPastResponses,
                    fullDatasetCache: newFullDatasetCache,
                    chartDatasetCache: newChartDatasetCache
                });
            },
            moveTrackerPosition: (trackerIndex, offset) => {
                const newIndex = index => index === trackerIndex ? trackerIndex + offset : index === trackerIndex + offset ? trackerIndex - offset : index;

                const newSelectedTrackers = this.state.selectedTrackers.map(i => newIndex(i));

                const newTrackers = this.state.trackers.map(tracker => Object.assign({}, tracker));
                [newTrackers[trackerIndex], newTrackers[trackerIndex + offset]] = [newTrackers[trackerIndex + offset], newTrackers[trackerIndex]];

                const newPastResponses = this.state.pastResponses.map(trackerResponseSet => trackerResponseSet.map(response => Object.assign({}, response)));
                [newPastResponses[trackerIndex], newPastResponses[trackerIndex + offset]] = [newPastResponses[trackerIndex + offset], newPastResponses[trackerIndex]];

                const newFullDatasetCache = buildFullDatasetCache(newPastResponses, newTrackers.length);
                const newChartDatasetCache = addConfigToChartDatasetCache({}, newFullDatasetCache, newTrackers.length,
                    this.state.chartTimeOffset, this.state.chartTimeScale, this.state.aggregationMode);

                this.onSavedDataUpdate();
                this.setState({
                    selectedTrackers: newSelectedTrackers,
                    trackers: newTrackers,
                    pastResponses: newPastResponses,
                    fullDatasetCache: newFullDatasetCache,
                    chartDatasetCache: newChartDatasetCache
                });
            },
            addTracker: tracker => {
                const newTrackers = [tracker, ...this.state.trackers.map(previousTracker => Object.assign({}, previousTracker))];
                const newSelectedTrackers = [0, ...this.state.selectedTrackers.map(i => i + 1)];
                const newPastResponses = [[], ...this.state.pastResponses.map(trackerResponseSet => trackerResponseSet.map(response => Object.assign({}, response)))];
                const newFullDatasetCache = buildFullDatasetCache(newPastResponses, newTrackers.length);
                const newChartDatasetCache = addConfigToChartDatasetCache({}, newFullDatasetCache, newTrackers.length,
                    this.state.chartTimeOffset, this.state.chartTimeScale, this.state.aggregationMode);

                this.onSavedDataUpdate();
                this.setState({
                    trackers: newTrackers,
                    selectedTrackers: newSelectedTrackers,
                    pastResponses: newPastResponses,
                    fullDatasetCache: newFullDatasetCache,
                    chartDatasetCache: newChartDatasetCache
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

                this.onSavedDataUpdate();
                this.setState({ selectedTrackers: newSelectedTrackers });
            },

            aggregationMode: this.state.aggregationMode,
            setAggregationMode: newAggregationMode => {
                const newChartDatasetCache = addConfigToChartDatasetCache(this.state.chartDatasetCache, this.state.fullDatasetCache, this.state.trackers.length,
                    this.state.chartTimeOffset, this.state.chartTimeScale, newAggregationMode);
                this.setState({
                    aggregationMode: newAggregationMode,
                    chartDatasetCache: newChartDatasetCache
                });
            },
            savedFiles: this.state.savedFiles,
            fullDatasetCache: this.state.fullDatasetCache,
            chartDatasetCache: this.state.chartDatasetCache
        };

        return (
            <AppContext.Provider value={appContext}>
                <SafeAreaView style={SafeViewAndroid.AndroidSafeArea}>
                    <NavigationContainer style={styles.root}>
                        <stack.Navigator>
                            <stack.Screen name="Start" component={StartPage} options={{ headerShown: false }} />
                            <stack.Screen name="Home" component={HomePage} options={{ headerShown: false }} />
                            <stack.Screen name="Add" component={AddPage} options={{ headerShown: false }} />
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
