import {getFunctions, httpsCallable} from "@react-native-firebase/functions"
import {
  getFirestore,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from '@react-native-firebase/firestore';

const db = getFirestore();
const functions = getFunctions();
const NUM_OF_DISPLAYED_DAYS = 7

export const triggerManualDigest = async () => {
  try {
    const generateDigest = httpsCallable(functions, 'generateManualDigest');
    const result = await generateDigest();
    return result.data;
  } catch (e) {
    console.error("Failed to trigger digest: ", e);
    throw e;
  }
}

export const getLatestDigest = async (userId) => {
  try{
    const digestsRef = collection(db, 'digests');

    const numberOfDaysAgo = new Date();
    numberOfDaysAgo.setDate(numberOfDaysAgo.getDate() - NUM_OF_DISPLAYED_DAYS);
    const firestoreDate = Timestamp.fromDate(numberOfDaysAgo);

    const queryToGetDigest = query(
      digestsRef,
      where('userId', '==', userId),
      where('createdAt', '>=', firestoreDate),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(queryToGetDigest);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (e) {
    console.error("Failed to getLatestDigest: ", e);
    throw e;
  }
}