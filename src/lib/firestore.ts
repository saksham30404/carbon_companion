import { db } from "../firebase";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";

export const addData = async (collectionName: string, data: any) => await addDoc(collection(db, collectionName), data);
export const getData = async (collectionName: string) => {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};
export const updateData = async (collectionName: string, id: string, data: any) => await updateDoc(doc(db, collectionName, id), data);
export const deleteData = async (collectionName: string, id: string) => await deleteDoc(doc(db, collectionName, id));