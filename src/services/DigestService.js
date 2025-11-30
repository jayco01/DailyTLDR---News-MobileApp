import functions from '@react-native-firebase/functions';
import firestore from '@react-native-firebase/firestore';

const NUM_OF_DISPLAYED_DAYS = 7;

export const triggerManualDigest = async () => {
  try {
    const generateDigest = functions().httpsCallable('generateManualDigest');
    const result = await generateDigest();
    return result.data;
  } catch (error) {
    console.error("Trigger Failed:", error);
    throw error;
  }
};

export const getWeeklyDigests = async (userId) => {
  try {
    const numberOfDaysAgo = new Date();
    numberOfDaysAgo.setDate(numberOfDaysAgo.getDate() - NUM_OF_DISPLAYED_DAYS);

    const snapshot = await firestore()
      .collection('digests')
      .where('userId', '==', userId)
      .where('createdAt', '>=', numberOfDaysAgo)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error("Failed to getWeeklyDigests:", error);
    throw error;
  }
};