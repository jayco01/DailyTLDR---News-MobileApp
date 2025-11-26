import { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, signInAnonymously} from '@react-native-firebase/auth';
import {doc, getDoc, setDoc, updateDoc} from '@react-native-firebase/firestore';
import {auth, db, serverTimestamp} from '@react-native-firebase/firestore';

const AuthContext = createContext();

export function AuthProvider({children}){
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const isNewUser = !loading && user && !profile;

  useEffect(() => {
    setLoading(true); // start in the loading screen

    //listen to the changes of authentication
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try{ // check if user exist in the database
          const userRef = doc(db, 'profile', currentUser.uid);
          const snapShot = await getDoc(userRef);
        } catch (e) {
          console.error(`Anonymous Authentication Failed - ${e}`);
        }

      } else { // if user does not exist then sign in anonymously
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.error(`Anonymous Authentication Failed - ${e}`);
        }
      }
      setLoading(false);
    });

  return unsubscribe;
  }, []);
  const createProfile = async (username) => {
    if (!user) throw new Error('User does not exist');

    const newProfile = {
      userid : user.uid,
      publicUsername: username,
      topic: "Technology", // default topic
      gemini_settings: { // default gemini prompt
        tone: "Informative",
        format: 'Concise'
      },
      createdAt: serverTimestamp(),
    };

    const userRef = doc(db, 'profiles', user.uid);
    await setDoc(userRef, newProfile);
    setProfile(newProfile);
  };

  const updateProfile = async (data) => {
    if (!user) return;

    const userRef = doc(db, 'profiles', user.uid);
    await updateDoc(userRef, data);
    setProfile(prev => ({ ...prev, ...data }));
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isNewUser,
      createProfile,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )

}

export const useAuth = () => useContext(AuthContext);


