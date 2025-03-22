import React from 'react';
import 'expo-dev-client';
import { createStackNavigator } from '@react-navigation/stack';
import Index from './index';
import createInvite from './createInvite';
import TrackVan from './TrackVan';
import Verify from './Verify';

const Stack = createStackNavigator();

export default function RootLayout() {
  return (
    <Stack.Navigator
    screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" component={Index} />
      <Stack.Screen name="createInvite" component={createInvite} />
      <Stack.Screen name="TrackVan" component={TrackVan} />
      <Stack.Screen name="Verify" component={Verify} />
    </Stack.Navigator>
  );
}