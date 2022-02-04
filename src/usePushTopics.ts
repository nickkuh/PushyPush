import {useEffect, useMemo, useState} from 'react';
import auth from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';

const usePushTopics = () => {
  const [topics, setTopics] = useState<string[] | null>(null);
  const [user, setUser] = useState(auth().currentUser);

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(updatedUser => {
      if (updatedUser) {
        if (user && user.uid === updatedUser.uid) {
          return;
        }
      }
      setUser(updatedUser);
    });
    return subscriber;
  }, [user]);

  useEffect(() => {
    const userId = user?.uid;
    if (userId && topics) {
      console.log('Subscribe to topics: ', topics);
      const subscribeToTopics = async () => {
        try {
          for (let index = 0; index < topics.length; index++) {
            await messaging().subscribeToTopic(topics[index]);
            console.log('Subscribed to topic', topics[index]);
          }
        } catch (error) {
          console.log('Subscribe error', error);
          throw error;
        }
      };

      subscribeToTopics();
    }
  }, [topics, user?.uid]);

  const ret = useMemo(() => ({setTopics}), [setTopics]);
  return ret;
};

export default usePushTopics;
