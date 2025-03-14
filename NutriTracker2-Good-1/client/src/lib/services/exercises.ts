import { collection, addDoc, query, where, orderBy, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import type { User } from "@shared/schema";

export interface Exercise {
  userId: string;
  type: "exercise";
  exerciseType: string;
  description: string;
  caloriesPerMinute: number;
  intensityLevel: 'low' | 'medium' | 'high';
  icon: string;
  totalCalories: number;
  timestamp: string;
}

export const saveExercise = async (userId: string, exercise: Omit<Exercise, 'userId' | 'type' | 'timestamp'>) => {
  const exerciseDoc = {
    userId,
    type: "exercise",
    ...exercise,
    timestamp: new Date().toISOString(),
  };

  return addDoc(collection(db, 'logs'), exerciseDoc);
};

export const getRecentLogs = async (userId: string, limit = 5) => {
  const logsRef = collection(db, 'logs');
  const q = query(
    logsRef,
    where("userId", "==", userId),
    orderBy("timestamp", "desc"),
    // limit(limit)
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const subscribeToLogs = (userId: string, onUpdate: (logs: any[]) => void) => {
  const logsRef = collection(db, 'logs');
  const q = query(
    logsRef,
    where("userId", "==", userId),
    orderBy("timestamp", "desc"),
    // limit(5)
  );

  return onSnapshot(q, (snapshot) => {
    const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    onUpdate(logs);
  });
};
