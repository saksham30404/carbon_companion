import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, signOut } from "firebase/auth";
import { auth } from "../firebase"

const googleProvider = new GoogleAuthProvider();

export const loginWithEmail = async (email: string, password: string) => await signInWithEmailAndPassword(auth, email, password);
export const signupWithEmail = async (email: string, password: string) => await createUserWithEmailAndPassword(auth, email, password);
export const loginWithGoogle = async () => await signInWithPopup(auth, googleProvider);
export const logout = async () => await signOut(auth);
