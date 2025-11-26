import { initializeApp, getApp, getApps } from '@react-native-firebase/app';
import {getAuth} from '@react-native-firebase/auth';
import {getFirestore, serverTimestamp} from '@react-native-firebase/firestore';
import {getFunctions} from '@react-native-firebase/functions';

let app;

if (getApps().length === 0) {
  app = initializeApp({});
} else {
  app = getApp();
}

const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions();

export {app, auth, db, functions, serverTimestamp};
