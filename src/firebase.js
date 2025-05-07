import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs,
  addDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBoK3bPJOT2HpDwbK0bW9omsX1R_WT7WZ0",
  authDomain: "rakesh-488b9.firebaseapp.com",
  projectId: "rakesh-488b9",
  storageBucket: "rakesh-488b9.firebasestorage.app",
  messagingSenderId: "432139911446",
  appId: "1:432139911446:web:9c67f7bee09154a0be1037",
  measurementId: "G-YK5FL9118S"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const ADMIN_EMAIL = 'dhimanrakesh719@gmail.com';

// User Management
export const getUserRole = async (uid) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return { success: true, role: userDoc.data().role };
    } else {
      return { success: true, role: 'student' };
    }
  } catch (error) {
    console.error('Error getting user role:', error);
    return { success: false, role: 'student' };
  }
};

export const setUserRole = async (uid, role) => {
  try {
    await setDoc(doc(db, 'users', uid), { role }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error('Error setting user role:', error);
    return { success: false, error };
  }
};

// Time Slots Management
export const addTimeSlot = async (slotData) => {
  try {
    const docRef = await addDoc(collection(db, 'timeSlots'), {
      ...slotData,
      createdAt: serverTimestamp(),
      status: 'available'
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding time slot:', error);
    return { success: false, error };
  }
};

export const getTimeSlots = async (filter = {}) => {
  try {
    let q = collection(db, 'timeSlots');
    if (filter.status) {
      q = query(q, where('status', '==', filter.status));
    }
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting time slots:', error);
    return [];
  }
};

export const deleteTimeSlot = async (id) => {
  try {
    await deleteDoc(doc(db, 'timeSlots', id));
    return { success: true };
  } catch (error) {
    console.error('Error deleting time slot:', error);
    return { success: false, error: error.message };
  }
};

export const bookTimeSlot = async (slotId, userId, subject) => {
  try {
    await updateDoc(doc(db, 'timeSlots', slotId), {
      status: 'booked',
      bookedBy: userId,
      subject,
      bookedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error booking time slot:', error);
    return { success: false, error };
  }
};

// Sessions Management
export const getUserSessions = async (userId) => {
  try {
    const q = query(collection(db, 'timeSlots'), where('bookedBy', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting user sessions:', error);
    return [];
  }
};

// Testimonials
export const addTestimonial = async (testimonialData) => {
  try {
    const docRef = await addDoc(collection(db, 'testimonials'), {
      ...testimonialData,
      createdAt: serverTimestamp()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error adding testimonial:', error);
    return { success: false, error };
  }
};

export const getTestimonials = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'testimonials'));
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting testimonials:', error);
    return [];
  }
};

// Notifications
export const addNotification = async (userId, notification) => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      ...notification,
      read: false,
      createdAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error adding notification:', error);
    return { success: false, error };
  }
};

export const getUserNotifications = async (userId) => {
  try {
    const q = query(collection(db, 'notifications'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};