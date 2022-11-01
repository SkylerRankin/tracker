import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import TrackingChart from '../components/TrackingChart';
import Tracker from '../components/Tracker';
import { useContext, useState } from 'react';
import AppContext from '../util/AppContext';
import RangeSelector from '../components/RangeSelector';
import DateAxis from '../components/DateAxis';
import EditableTracker from '../components/EditableTracker';
import { deleteLocalStorage } from '../util/StorageUtil';
import TrackerHeader from '../components/TrackerHeader';
import EditTrackersHeader from '../components/EditTrackersHeader';
import { isSameDay, subYears } from 'date-fns';
import AppText from '../components/AppText';

const showDebugDeleteButton = true;

export default function HomePage({navigation}) {
    
    const context = useContext(AppContext);
    const [ editTrackers, setEditTrackers ] = useState(false);

    const onSelectTracker = trackerIndex => {
        context.toggleSelectedTracker(trackerIndex);
    }

    const onEditTracker = trackerIndex => {
        setEditTrackers(false);
        navigation.navigate("Add", { editExisting: true, existingTrackerIndex: trackerIndex });
    }

    const editableTrackersList = context.trackers.map((tracker, i) => (
        <EditableTracker key={i} tracker={tracker} index={i} onEditTracker={onEditTracker}/>
    ));

    let trackersList = <AppText style={styles.noTrackersText}>Press New to add a tracker.</AppText>;
    if (context.trackers.length > 0) {
        trackersList = context.trackers.map((tracker, i) => {
            const lastTimestamp = context.pastResponses[i].length === 0 ?
                subYears(new Date(), 1) : // If no responses, set the last timestamp to some date that is not today.
                context.pastResponses[i][context.pastResponses[i].length - 1].timestamp;
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

    const debugDeleteButton = (
        <TouchableOpacity onPress={async () => await deleteLocalStorage()}>
            <AppText>Delete local data</AppText>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <AppText style={styles.title}>minatrack</AppText>
                { showDebugDeleteButton && debugDeleteButton }
            </View>
            <View style={{marginBottom: 20}}><RangeSelector/></View>
            <View style={{ paddingHorizontal: 20 }}>
                <TrackingChart/>
            </View>
            <DateAxis/>
            {
                editTrackers ?
                <EditTrackersHeader onBack={() => setEditTrackers(false)}/>
                :
                <TrackerHeader onEdit={() => setEditTrackers(true)} onAdd={() => navigation.navigate("Add", { editExisting: false })}/>
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
        marginLeft: 10,
        marginBottom: 30,
        fontFamily: "SourceSansPro"
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
        marginTop: 10
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
