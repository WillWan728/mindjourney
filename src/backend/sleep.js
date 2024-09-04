import { db } from '../config/firebase';
import { collection, addDoc, query, where, getDocs, doc, updateDoc, deleteDoc, Timestamp, orderBy } from 'firebase/firestore';

const SLEEP_COLLECTION = 'sleep';

export const createSleepLog = async (userId, sleepData) => {
  try {
    console.log('Attempting to create sleep log:', { userId, sleepData });
    const sleepLogsRef = collection(db, SLEEP_COLLECTION);
    const newSleepLog = {
      userId,
      date: Timestamp.fromDate(new Date(sleepData.date)),
      bedtime: Timestamp.fromDate(new Date(`${sleepData.date} ${sleepData.bedtime}`)),
      waketime: Timestamp.fromDate(new Date(`${sleepData.date} ${sleepData.waketime}`)),
      quality: parseInt(sleepData.quality),
      feelRested: sleepData.feelRested === 'yes',
      dreamed: sleepData.dreamed === 'yes',
      wakeUps: parseInt(sleepData.wakeUps),
      notes: sleepData.notes,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    console.log('Prepared sleep log data:', newSleepLog);
    const docRef = await addDoc(sleepLogsRef, newSleepLog);
    console.log('Sleep log created successfully with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error adding sleep log: ", error);
    throw error;
  }
};

export const getSleepLogs = async (userId) => {
  try {
    console.log('Fetching sleep logs for user:', userId);
    const sleepLogsRef = collection(db, SLEEP_COLLECTION);
    const q = query(
      sleepLogsRef, 
      where("userId", "==", userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const logs = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      date: doc.data().date.toDate(),
      bedtime: doc.data().bedtime.toDate(),
      waketime: doc.data().waketime.toDate()
    }));
    console.log('Fetched sleep logs:', logs);
    return logs;
  } catch (error) {
    console.error("Error getting sleep logs: ", error);
    throw error;
  }
};

export const updateSleepLog = async (sleepLogId, updatedData) => {
  try {
    console.log('Updating sleep log:', { sleepLogId, updatedData });
    const sleepLogRef = doc(db, SLEEP_COLLECTION, sleepLogId);
    const updateFields = {
      ...updatedData,
      updatedAt: Timestamp.now()
    };
    if (updatedData.date) updateFields.date = Timestamp.fromDate(new Date(updatedData.date));
    if (updatedData.bedtime) updateFields.bedtime = Timestamp.fromDate(new Date(`${updatedData.date} ${updatedData.bedtime}`));
    if (updatedData.waketime) updateFields.waketime = Timestamp.fromDate(new Date(`${updatedData.date} ${updatedData.waketime}`));
    if (updatedData.quality) updateFields.quality = parseInt(updatedData.quality);
    if (updatedData.wakeUps) updateFields.wakeUps = parseInt(updatedData.wakeUps);
    if (updatedData.feelRested !== undefined) updateFields.feelRested = updatedData.feelRested === 'yes';
    if (updatedData.dreamed !== undefined) updateFields.dreamed = updatedData.dreamed === 'yes';
    await updateDoc(sleepLogRef, updateFields);
    console.log('Sleep log updated successfully');
  } catch (error) {
    console.error("Error updating sleep log: ", error);
    throw error;
  }
};

export const deleteSleepLog = async (sleepLogId) => {
  try {
    console.log('Deleting sleep log:', sleepLogId);
    const sleepLogRef = doc(db, SLEEP_COLLECTION, sleepLogId);
    await deleteDoc(sleepLogRef);
    console.log('Sleep log deleted successfully');
  } catch (error) {
    console.error("Error deleting sleep log: ", error);
    throw error;
  }
};

