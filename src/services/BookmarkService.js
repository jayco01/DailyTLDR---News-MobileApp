import {getFirestore, doc, setDoc, deleteDoc, serverTimestamp} from '@react-native-firebase/firestore';

const db = getFirestore();

/**
 * Save a digest to the user's bookmarks.
 * @param {string} userId - Current User ID
 * @param {object} digest - The full digest object to save
 */
export const addBookmark = async (userId, digest) => {
  try {
    // origina digestId will be used as the id in the bookmark collection to prevent duplication
    const bookmarkRef = doc(db, 'profiles', userId, 'bookmarks', digest.id);

    await setDoc(bookmarkRef, {
      ...digest,
      savedAt: serverTimestamp()
    });

    console.log("Bookmark added");
  } catch (e) {
    console.error("Failed to add the article to bookmark:",e);
    throw e;
  }
}