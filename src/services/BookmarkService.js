import firestore from '@react-native-firebase/firestore';

/**
 * Save a digest to the user's bookmarks.
 * @param {string} userId - Current User ID
 * @param {object} digest - The full digest object to save
 */
export const addBookmark = async (userId, digest) => {
  try {
    // original digestId will be used as the id in the bookmark collection to prevent duplication
    await firestore()
      .collection('profiles')
      .doc(userId)
      .collection('bookmarks')
      .doc(digest.id)
      .set({
        ...digest,
        savedAt: firestore.FieldValue.serverTimestamp()
      });

    console.log("Bookmark added!");
    return true;
  } catch (e) {
    console.error("Failed to add the article to bookmark:",e);
    throw e;
  }
};

/**
 * Remove a digest from bookmarks.
 * @param {string} userId - Current User ID
 * @param {string} digestId - The ID of the digest to remove
 */
export const removeBookmark = async (userId, digestId) => {
  try {
    await firestore()
      .collection('profiles')
      .doc(userId)
      .collection('bookmarks')
      .doc(digestId)
      .delete();

    console.log("Bookmark removed!");
    return true;
  } catch (e) {
    console.error("Failed to remove the article to bookmark:", e);
    throw e;
  }
};

/**
 * Fetch all bookmarks for a user.
 * Returns an array of digest objects, sorted by saved date (newest first).
 * @param {string} userId - Current User ID
 */
export const getBookmarks = async (userId) => {
  try {
    const snapshot = await firestore()
      .collection('profiles')
      .doc(userId)
      .collection('bookmarks')
      .orderBy('savedAt', 'desc')
      .get();

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (e) {
    console.error("Failed to fetch bookmarks:", e);
    throw e;
  }
};