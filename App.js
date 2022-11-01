import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import React, { Component } from 'react';
import { AppState,SafeAreaView, StyleSheet } from 'react-native';

import AddPage from './src/pages/AddPage';
import HomePage from './src/pages/HomePage';
import TrackerPage from './src/pages/TrackerPage';
import SafeViewAndroid from './src/styles/SafeViewAndroid';
import AppContext from './src/util/AppContext';
import { customFonts, loadScreenshotData, saveChangesWaitMS } from './src/util/Constants';
import { addConfigToChartDatasetCache, buildFullDatasetCache, getSampleData, getScreenShotData } from './src/util/DataUtil';
import { runStorageInitialization, writeAppData } from './src/util/StorageUtil';

const stack = createNativeStackNavigator();

// Keep the splash screen visible until initialization finishes.
SplashScreen.preventAutoHideAsync();

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
        // Use an arrow function for listener to ensure onAppStateChange has the scope access to this.state.
        this.appStateSubscription = AppState.addEventListener("change", (nextAppState) => this.onAppStateChange(nextAppState));
        const loadedData = await runStorageInitialization();
        if (loadedData.noSaveData) {
            const sampleData = getSampleData();
            loadedData.pastResponses = sampleData.pastResponses;
            loadedData.trackers = sampleData.trackers;
            loadedData.selectedTrackers = sampleData.selectedTrackers;
        }

        if (loadScreenshotData) {
            const sampleData = getScreenShotData();
            loadedData.pastResponses = sampleData.pastResponses;
            loadedData.trackers = sampleData.trackers;
            loadedData.selectedTrackers = sampleData.selectedTrackers;
        }

        // Initialize the dataset cache for each time scale - aggregation - tracker configuration.
        const fullDatasetCache = loadedData.trackers.length === 0 ? {} :
            buildFullDatasetCache(loadedData.pastResponses, loadedData.trackers.length);

        // Initialize the chart dataset cache for each loaded tracker.
        const chartDatasetCache = addConfigToChartDatasetCache({}, fullDatasetCache, loadedData.trackers,
            this.state.chartTimeOffset, this.state.chartTimeScale, this.state.aggregationMode);

        await Font.loadAsync(customFonts);

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

    async onLayoutRootView() {
        if (this.state.dataInitialized) {
            await SplashScreen.hideAsync();
        }
    }

    render() {
        const appContext = {
            dataInitialized: this.state.dataInitialized,

            chartTimeScale: this.state.chartTimeScale,
            setChartTimeScale: newChartTimeScale => {
                const newChartTimeOffset = 0;
                const newChartDatasetCache = addConfigToChartDatasetCache(this.state.chartDatasetCache, this.state.fullDatasetCache, this.state.trackers,
                    newChartTimeOffset, newChartTimeScale, this.state.aggregationMode);
                this.setState({ chartTimeScale: newChartTimeScale, chartTimeOffset: newChartTimeOffset, chartDatasetCache: newChartDatasetCache });
            },

            chartTimeOffset: this.state.chartTimeOffset,
            setChartTimeOffset: newChartTimeOffset => {
                const newChartDatasetCache = addConfigToChartDatasetCache(this.state.chartDatasetCache, this.state.fullDatasetCache, this.state.trackers,
                    newChartTimeOffset, this.state.chartTimeScale, this.state.aggregationMode);
                this.setState({ chartTimeOffset: newChartTimeOffset, chartDatasetCache: newChartDatasetCache })
            },

            pastResponses: this.state.pastResponses,
            addResponse: (trackerIndex, newResponse) => {
                const newPastResponses = this.state.pastResponses.map(trackerResponseSet => trackerResponseSet.map(response => Object.assign({}, response)));
                newPastResponses[trackerIndex].push(newResponse);

                const newFullDatasetCache = buildFullDatasetCache(newPastResponses, this.state.trackers.length);
                const newChartDatasetCache = addConfigToChartDatasetCache({}, newFullDatasetCache, this.state.trackers,
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
                const newChartDatasetCache = addConfigToChartDatasetCache({}, newFullDatasetCache, newTrackers,
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
                const newIndex = index => index === trackerIndex ? trackerIndex + offset : index === trackerIndex + offset ? index - offset : index;

                const newSelectedTrackers = this.state.selectedTrackers.map(i => newIndex(i));

                const newTrackers = this.state.trackers.map(tracker => Object.assign({}, tracker));
                [newTrackers[trackerIndex], newTrackers[trackerIndex + offset]] = [newTrackers[trackerIndex + offset], newTrackers[trackerIndex]];

                const newPastResponses = this.state.pastResponses.map(trackerResponseSet => trackerResponseSet.map(response => Object.assign({}, response)));
                [newPastResponses[trackerIndex], newPastResponses[trackerIndex + offset]] = [newPastResponses[trackerIndex + offset], newPastResponses[trackerIndex]];

                const newFullDatasetCache = buildFullDatasetCache(newPastResponses, newTrackers.length);
                const newChartDatasetCache = addConfigToChartDatasetCache({}, newFullDatasetCache, newTrackers,
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
                const newChartDatasetCache = addConfigToChartDatasetCache({}, newFullDatasetCache, newTrackers,
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
            updateTracker: (existingTrackerIndex, newTracker) => {
                const newTrackers = [...this.state.trackers.map(previousTracker => Object.assign({}, previousTracker))];
                newTrackers[existingTrackerIndex] = newTracker;
                const newFullDatasetCache = buildFullDatasetCache(this.state.pastResponses, newTrackers.length);
                const newChartDatasetCache = addConfigToChartDatasetCache({}, newFullDatasetCache, newTrackers,
                    this.state.chartTimeOffset, this.state.chartTimeScale, this.state.aggregationMode);

                this.onSavedDataUpdate();
                this.setState({
                    trackers: newTrackers,
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
                const newChartDatasetCache = addConfigToChartDatasetCache(this.state.chartDatasetCache, this.state.fullDatasetCache, this.state.trackers,
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

        if (!this.state.dataInitialized) {
            return null;
        }

        return (
            <AppContext.Provider value={appContext}>
                <SafeAreaView style={SafeViewAndroid.AndroidSafeArea} onLayout={this.onLayoutRootView.bind(this)}>
                    <NavigationContainer style={styles.root}>
                        <stack.Navigator>
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
