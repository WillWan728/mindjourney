import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updatePassword } from 'firebase/auth';
import { db, auth } from '../config/firebase';

export const fetchUserProfile = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');

  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() };
  } else {
    throw new Error('User profile not found');
  }
};

export const updateUserProfile = async (userData) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');

  const userDocRef = doc(db, 'users', user.uid);
  await updateDoc(userDocRef, userData);
};

export const updateUserPassword = async (newPassword) => {
  const user = auth.currentUser;
  if (!user) throw new Error('No user logged in');

  await updatePassword(user, newPassword);
};

