import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import logo from './assets/logo.png';

export default function App() {
  const x = "testing";
  return (
    <View style={styles.container}>
      <Image source={logo} style={{ width: 305, height: 159 }}/>
      <Text>Open up App.js to start working on your app!</Text>
      <Text>{x + 12}</Text>
      {
        [1, 2, 3].map(x => <Text style={styles.listItem}>{`number ${x}`}</Text>)
      }
      <TouchableOpacity
        onPress={() => alert("pressed")}
        style={styles.button}>
        <Text style={styles.buttonText}>Pick a photo</Text>
      </TouchableOpacity>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listItem: {
    color: '#42f584'
  },
  button: {
    padding: 20,
    borderRadius: 5,
    backgroundColor: 'blue'
  },
  buttonText: {
    fontSize: 20,
    color: 'white'
  }
});
