import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TrackingChart from '../components/TrackingChart';
import Tracker from '../components/Tracker';
import { useContext, useState } from 'react';
import AppContext from '../components/AppContext';
import RangeSelector from '../components/RangeSelector';
import DateAxis from '../components/DateAxis';
import EditableTracker from '../components/EditableTracker';
import ChartLineDate from '../components/ChartLineDate';
import { deleteLocalStorage } from '../components/StorageUtil';
import TrackerHeader from '../components/TrackerHeader';
import EditTrackersHeader from '../components/EditTrackersHeader';
import { isSameDay } from 'date-fns';

export default function HomePage({navigation}) {
    
    const context = useContext(AppContext);
    const [ editTrackers, setEditTrackers ] = useState(false);

    const onSelectTracker = trackerIndex => {
        context.toggleSelectedTracker(trackerIndex);
    }

    const editableTrackersList = context.trackers.map((tracker, i) => (
        <EditableTracker key={i} tracker={tracker} index={i}/>
    ));

    let trackersList = <Text style={styles.noTrackersText}>Press New to add a tracker.</Text>;
    if (context.trackers.length > 0) {
        trackersList = context.trackers.map((tracker, i) => {
            const lastTimestamp = context.pastResponses[i][context.pastResponses[i].length - 1].timestamp;
            const completed = isSameDay(lastTimestamp, new Date().getTime());
            return (<Tracker
                    key={i}
                    navigation={navigation}
                    index={i}
                    tracker={tracker}
                    completed={completed}
                    selected={context.selectedTrackers.includes(i)}
                    onPress={() => onSelectTracker(i)}/>)
        }
    )}

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>daily tracker</Text>
                <TouchableOpacity onPress={async () => await deleteLocalStorage()}>
                    <Text>Delete local data</Text>
                </TouchableOpacity>
            </View>
            <View style={{marginBottom: 20}}><RangeSelector/></View>
            <View style={{ paddingHorizontal: 20 }}>
                <TrackingChart/>
            </View>
            { context.usingChartLine ? <ChartLineDate/> : <DateAxis/> }
            {
                editTrackers ?
                <EditTrackersHeader onBack={() => setEditTrackers(false)}/>
                :
                <TrackerHeader onEdit={() => setEditTrackers(true)} onAdd={() => navigation.navigate("Add")}/>
            }
            <ScrollView style={styles.trackersView}>
                { editTrackers ? editableTrackersList : trackersList }
            </ScrollView>
        </View>
  );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        paddingTop: 20,
        paddingHorizontal: 10,
        flex: 1
    },
    header: {
        marginTop: 20,
        flexDirection: 'row'
    },
    title: {
        fontSize: 30,
        marginLeft: 20,
        marginBottom: 40
    },
    addButton: {
        width: 40,
        height: 40,
        padding: 0,
        borderRadius: 14,
        backgroundColor: '#eee',
        marginRight: 10,
        marginLeft: 'auto'
    },
    addButtonImage: {
        width: "100%",
        height: "100%",
        tintColor: "#777"
    },
    trackersView: {
        padding: 20,
        flex: 1,
        marginBottom: 10,
        marginTop: 20
    },
    timeArea: {
        marginBottom: 50,
        height: 40,
        flexDirection: "row",
        justifyContent: "center"
    },
    timeButton: {
        marginHorizontal: 10,
        width: 70,
        height: 45,
        padding: 10,
        borderRadius: 10,
        alignContent: "center",
        justifyContent: "center",
        textAlign: "center",
        color: "#f2f2f2",
        backgroundColor: "#f2f2f2"
    },
    selectedTimeRange: {
        borderColor: "#349beb",
        borderWidth: 4
    },
    trackerHeader: {
        flexDirection: "row",
        marginTop: 30
    },
    trackedEditText: {
        marginLeft: 30,
        color: "#777"
    },
    newTrackerText: {
        color: "#777"
    },
    trackersText: {
        fontStyle: 'italic'
    },
    noTrackersText: {
        fontStyle: "italic",
        color: "#777",
        fontSize: 12
    }
});
