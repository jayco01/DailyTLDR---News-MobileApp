import {app} from "./src/config/firebase";
import { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ActivityIndicator, Text, View } from 'react-native';

function App(){
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    if(app?.name){
      setStatus(`Successfully initialized to project : ${app.options.projectId}`);
      console.log("Firebase App Name:", app.name);
    } else {
      setStatus("Failed to initialize app.");
    }
  },[])

  return (
    <SafeAreaView>
      <Text> Daily TLDR Setup </Text>

      { status.includes('Successfully') ? (
        <Text>{status}</Text>
      ) : (
        <View>
          <ActivityIndicator size="large" color={'green'} />
          <Text>{status}</Text>
        </View>
      )}
    </SafeAreaView>
  )
}

export default App;