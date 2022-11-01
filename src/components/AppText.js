import React from 'react';
import { Text } from "react-native";

// A default text component so all text uses the same styling.

export default function AppText({ style, children }) {
    return (
        <Text style={[{ fontFamily: "SourceSansPro" }, style]}>{ children }</Text>
    );
}
