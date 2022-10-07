import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TrackingChart from '../components/TrackingChart';
import Tracker from '../components/Tracker';
import { useContext, useState } from 'react';
import AppContext from '../components/AppContext';
import TrackingChart3 from '../components/TrackingChart3';
import RangeSelector from '../components/RangeSelector';
import DateAxis from '../components/DateAxis';

export default function HomePage({navigation}) {
    
    const context = useContext(AppContext);

    const onSelectTracker = i => {
        if (context.selectedTrackers.includes(i)) {
            context.setSelectedTrackers(context.selectedTrackers.filter(index => index !== i));
        } else {
            context.setSelectedTrackers([i, ...context.selectedTrackers]);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>daily tracker</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Add')}
                    style={styles.addButton}>
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>
            <View style={{marginBottom: 20}}><RangeSelector/></View>
            <View style={{ paddingHorizontal: 20 }}>
                <TrackingChart3/>
            </View>
            <DateAxis/>
            <Text style={styles.trackersText}>Your trackers</Text>
            <ScrollView style={styles.trackersView}>
                { context.trackers.map((tracker, i) => (
                    <Tracker
                        key={i}
                        navigation={navigation}
                        data={tracker}
                        selected={context.selectedTrackers.includes(i)}
                        onPress={() => onSelectTracker(i)}/>)) }
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
        padding: 10,
        paddingTop: 2,
        paddingLeft: 12,
        borderRadius: 14,
        backgroundColor: '#eee',
        marginRight: 10,
        marginLeft: 'auto'
    },
    addButtonText: {
        fontSize: 25
    },
    trackersText: {
        fontWeight: 'bold',
        fontStyle: 'italic',
        marginTop: 30
    },
    trackersView: {
        padding: 20
    },
    timeArea: {
        marginBottom: 50,
        // flex: 1,
        height: 40,
        flexDirection: "row",
        justifyContent: "center",
        // justifyContent: "space-between",
        // alignItems: "center",
        // backgroundColor: "green",
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
    }
});
