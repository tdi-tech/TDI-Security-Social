import { 
    signInAnonymously, 
    onAuthStateChanged, 
    signOut, 
    GoogleAuthProvider, 
    signInWithPopup 
} from "firebase/auth";
import type { User } from "firebase/auth"; // 👈 LA MAGIA ESTÁ AQUÍ (import type)
import { auth } from './config';

export const loginWithGoogleDomain = async (): Promise<User> => {
    const provider = new GoogleAuthProvider();
    // La restricción de dominio principal ocurre a nivel de Identity Provider
    provider.setCustomParameters({ hd: 'tierradeideas.mx' });
    
    const result = await signInWithPopup(auth, provider);
    return result.user;
};

export const loginAsReader = async (): Promise<User> => {
    const result = await signInAnonymously(auth);
    return result.user;
};

export const logoutUser = async (): Promise<void> => {
    await signOut(auth);
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
};