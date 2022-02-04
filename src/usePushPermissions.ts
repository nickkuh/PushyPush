import {useCallback, useEffect, useMemo, useState} from 'react';
import {Platform} from 'react-native';
import PushNotificationIOS from '@react-native-community/push-notification-ios';
import messaging from '@react-native-firebase/messaging';
import {useAppState} from '@react-native-community/hooks';

const usePushPermissions = () => {
  const currentAppState = useAppState();

  const [authorizationStatus, setAuthorizationStatus] = useState(
    messaging.AuthorizationStatus.NOT_DETERMINED,
  );

  const userHasSetPermissions = useMemo(() => {
    if (Platform.OS === 'android') {
      return true;
    }
    switch (authorizationStatus) {
      case messaging.AuthorizationStatus.NOT_DETERMINED:
        return false;
      default:
        return true;
    }
  }, [authorizationStatus]);

  const requestUserPermission = useCallback(async () => {
    const updatedAuthorizationStatus = await messaging().requestPermission();
    console.log('Permission status:', updatedAuthorizationStatus);
    setAuthorizationStatus(updatedAuthorizationStatus);
  }, [setAuthorizationStatus]);

  useEffect(() => {
    if (Platform.OS === 'android') {
      requestUserPermission();
    } else {
      if (currentAppState === 'active') {
        console.log('Rechecking push permissions');
        PushNotificationIOS.checkPermissions(permissions => {
          if (permissions.authorizationStatus) {
            switch (permissions.authorizationStatus) {
              case PushNotificationIOS.AuthorizationStatus
                .UNAuthorizationStatusAuthorized:
                console.log('Push permission is authorized');
                setAuthorizationStatus(
                  messaging.AuthorizationStatus.AUTHORIZED,
                );
                break;
              case PushNotificationIOS.AuthorizationStatus
                .UNAuthorizationStatusDenied:
                console.log('Push permission is denied');
                setAuthorizationStatus(messaging.AuthorizationStatus.DENIED);
                break;
              case PushNotificationIOS.AuthorizationStatus
                .UNAuthorizationStatusProvisional:
                console.log('Push permission is provisional');
                setAuthorizationStatus(
                  messaging.AuthorizationStatus.PROVISIONAL,
                );
                break;
            }
          } else {
            console.log('Push permission is unknown');
          }
        });
      }
    }
  }, [currentAppState, requestUserPermission, setAuthorizationStatus]);

  const ret = useMemo(
    () => ({authorizationStatus, userHasSetPermissions, requestUserPermission}),
    [authorizationStatus, requestUserPermission, userHasSetPermissions],
  );
  return ret;
};

export default usePushPermissions;
