import React from 'react';
import { Dimensions, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';

import AppText from './AppText';

const totalWidth = Dimensions.get("window").width - 40;
const halfTotalWidth = totalWidth / 2;
const segmentBaseSize = 50;
const segmentPadding = 10;
const segmentWidth = segmentBaseSize + segmentPadding * 2;

const getCenterIndex = (scrollFraction, segments) => {
    // The percentage that half a block takes up of the available scrolling space
    const halfSegmentPercentage = 1 / (2 * (segments - 1));
    // Which half-block is currently in the center. Working in halves because the first
    // and last blocks only have half that are selectable, since they're centered.
    const halfIndex = Math.floor(scrollFraction / halfSegmentPercentage);
    const centerIndex = halfIndex == 0 ? 0 : halfIndex == (segments - 1) * 2 ? segments - 1 : Math.ceil(halfIndex / 2);
    return centerIndex;
}

const createScrollSegments = (selectedIndex, segments) => {
    let scrollSegments = [];
    for (let i = 0; i < segments; i++) {
        const text = (i + 1);
        const containerStylesList = [
            styles.selectableSegment,
            selectedIndex === i && { padding: 0 }
        ];
        const segmentStylesList = [
            styles.segmentContainer
        ];
        scrollSegments.push(
            <TouchableWithoutFeedback key={i}>
                <View style={containerStylesList}>
                    <View style={segmentStylesList}>
                        <AppText style={{textAlign: "center", fontSize: 20}}>{text}</AppText>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }

    const firstBufferWidth = halfTotalWidth - (segmentWidth / 2);
    scrollSegments = [
        <View key={"buffer0"} style={[{width: firstBufferWidth}]}></View>,
        ...scrollSegments,
        <View key={"buffer1"} style={[{width: firstBufferWidth}]}></View>,
    ];

    return scrollSegments;
}

export default function ScrollableSelector({segments, responseValue, setResponseValue}) {
    const maxScroll = (segments - 1) * segmentWidth;

    const onScrolled = event => {
        const value = event.nativeEvent.contentOffset.x;
        const scrollFraction = Math.min(Math.max(value / maxScroll, 0), 1);
        const newSelectedIndex = getCenterIndex(scrollFraction, segments);
        if (newSelectedIndex !== responseValue) {
            setResponseValue(newSelectedIndex);
        }
    }

    const scrollSegments = createScrollSegments(responseValue, segments);

    return (
        <View style={styles.container}>
            <View style={{height: segmentWidth}}>
                <ScrollView
                    horizontal={true}
                    showsHorizontalScrollIndicator={false}
                    onScroll={onScrolled}
                    // https://reactnative.dev/docs/scrollview.html#scrolleventthrottle-ios
                    scrollEventThrottle={16}>
                    { scrollSegments }
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        backgroundColor: '#green',
    },
    trackerName: {
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 40
    },
    responseText: {
        fontStyle: "italic",
        marginBottom: 20
    },
    segmentsContainer: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        textAlignVertical: "center",
        overflow: "hidden"
    },
    segmentContainer: {
        width: "100%",
        height: "100%",
        backgroundColor: '#eee',
        justifyContent: "center",
        borderRadius: 10
    },
    selectableSegment: {
        width: segmentWidth,
        height: "100%",
        justifyContent: "center",
        padding: segmentPadding,
    }
});
