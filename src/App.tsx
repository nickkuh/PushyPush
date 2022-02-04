import React, {useEffect, useMemo, useState} from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import auth from '@react-native-firebase/auth';
import usePushPermissions from './usePushPermissions';
import usePushTopics from './usePushTopics';
import usePushHandler from './usePushHandler';

const App = () => {
  /* Task 1 - Push Permissions */
  const {authorizationStatus, requestUserPermission, userHasSetPermissions} =
    usePushPermissions();

  const displayPermissions = useMemo(() => {
    switch (authorizationStatus) {
      case messaging.AuthorizationStatus.NOT_DETERMINED:
        return 'Not Determined';
      case messaging.AuthorizationStatus.AUTHORIZED:
        return 'Authorized!';
      case messaging.AuthorizationStatus.DENIED:
        return 'Denied!';
      case messaging.AuthorizationStatus.PROVISIONAL:
        return 'Provisional!';
    }
  }, [authorizationStatus]);

  /* Task 2 - Push Topic Subscriptions */
  const {setTopics} = usePushTopics();

  useEffect(() => {
    const doIt = async () => {
      let user = auth().currentUser;
      if (!user) {
        const userCred = await auth().signInAnonymously();
        user = userCred.user;
      }
      if (user) {
        setTopics([user.uid, 'all']);
      }
    };
    doIt();
  }, [setTopics]);

  /* Task 3 - Push Notification Handling */
  const {notification, setNotification} = usePushHandler();

  const [eventHistoryText, setEventHistoryText] = useState('');

  useEffect(() => {
    if (notification) {
      console.log(
        'New notification: ',
        Platform.OS,
        notification.state,
        notification.message.notification?.title,
        notification.message.notification?.body,
      );
      setNotification(undefined);
      let text = '';
      switch (notification.state) {
        case 'quit':
          text +=
            'Notification tapped to open app\n' +
            notification.message.notification?.body;
          break;
        case 'background':
          text +=
            'Notification received while in background\n' +
            notification.message.notification?.body;
          break;
        case 'foreground':
          text +=
            'Notification received while in foreground\n' +
            notification.message.notification?.body;
          break;
      }
      setEventHistoryText(eventHistoryText + text + '\n\n');
    }
  }, [eventHistoryText, notification, setNotification]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle={'dark-content'} />
      <View style={styles.container}>
        {!userHasSetPermissions && (
          <Pressable onPress={requestUserPermission}>
            <View style={styles.button}>
              <Text>Allow Push Notifications</Text>
            </View>
          </Pressable>
        )}
        {userHasSetPermissions && !eventHistoryText.length && (
          <Text>{displayPermissions}</Text>
        )}
        {!!eventHistoryText.length && <Text>{eventHistoryText}</Text>}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 10,
    borderColor: 'grey',
    padding: 10,
    margin: 10,
    backgroundColor: '#d3d3d3',
  },
});
export default App;
