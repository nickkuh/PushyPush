import * as admin from 'firebase-admin';

export const sendNotification = async (props: {
  topic: string;
  payload: admin.messaging.MessagingPayload;
}) => {
  const {topic, payload} = props;
  try {
    admin.initializeApp();
    await admin.messaging().sendToTopic(topic, payload, {priority: 'high'});
    return 'Sent';
  } catch (err) {
    // tslint:disable-next-line: no-console
    console.log('err', err);
    throw err;
  }
};

sendNotification({
  topic: 'all',
  payload: {
    notification: {
      title: 'Pushy Push',
      body: 'Hello There Nick!',
      sound: 'default',
    },
    data: {
      deeplink: 'home',
    },
  },
})
  .then(res => {
    console.log(res);
    process.exit();
  })
  .catch(err => {
    console.log('Failed to send push', err);
    process.exit();
  });
