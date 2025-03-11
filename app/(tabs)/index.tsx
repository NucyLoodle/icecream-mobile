import { Text, View,  StyleSheet } from 'react-native';
import AppLoading from "expo-app-loading";
import {
  useFonts,
  AlfaSlabOne_400Regular,
} from "@expo-google-fonts/alfa-slab-one";

import {
  Poppins_400Regular,
}  from "@expo-google-fonts/poppins";


export default function Index() {
  let [fontsLoaded] = useFonts({
    AlfaSlabOne_400Regular
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  } else {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Icecream Tracker</Text>
      </View>
    );
  }

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eab2bb',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  text: {
    color: '#3c6ca8',
    fontFamily: 'AlfaSlabOne_400Regular',
  },
});
