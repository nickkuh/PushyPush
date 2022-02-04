import {useEffect, useMemo, useState} from 'react';
import messaging, {
  FirebaseMessagingTypes,
} from '@react-native-firebase/messaging';

const usePushHandler = () => {
  const [notification, setNotification] = useState<
    | {
        message: FirebaseMessagingTypes.RemoteMessage;
        state: 'foreground' | 'background' | 'quit';
      }
    | undefined
  >();
  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      setNotification({message: remoteMessage, state: 'foreground'});
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().setBackgroundMessageHandler(
      async remoteMessage => {
        setNotification({message: remoteMessage, state: 'background'});
      },
    );

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          setNotification({message: remoteMessage, state: 'quit'});
        }
      });

    return unsubscribe;
  }, []);

  const ret = useMemo(
    () => ({notification, setNotification}),
    [notification, setNotification],
  );
  return ret;
};

export default usePushHandler;
