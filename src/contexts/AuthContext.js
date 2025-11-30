import React, { createContext, useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const isNewUser = !loading && user && !profile;

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        try {
          const userDoc = await firestore()
            .collection('profiles')
            .doc(currentUser.uid)
            .get();

          if (userDoc.exists) {
            setProfile(userDoc.data());
          } else {
            setProfile(null);
          }
        } catch (e) {
          console.error("Failed to fetch profile:", e);
        }
      } else {
        setUser(null);
        setProfile(null);
        // If logged out, force Anonymous Sign-in immediately
        try {
          await auth().signInAnonymously();
        } catch (e) {
          console.error("Anonymous Sign-in failed:", e);
        }
      }

      setLoading(false);
    });

    return subscriber;
  }, []);

  const createProfile = async (username) => {
    if (!user) throw new Error('User does not exist');

    const newProfile = {
      userId: user.uid,
      publicUsername: username,
      topic: "Technology",
      gemini_settings: {
        tone: "Informative",
        format: 'Concise'
      },
      // Native Syntax for Timestamp
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    await firestore().collection('profiles').doc(user.uid).set(newProfile);
    setProfile(newProfile);
  };

  const updateProfile = async (data) => {
    if (!user) return;

    await firestore().collection('profiles').doc(user.uid).update(data);

    setProfile(prev => ({ ...prev, ...data }));
  };

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
  );
}