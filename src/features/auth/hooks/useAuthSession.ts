import { useState, useEffect, useRef } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, appId } from '../../../services/firebase/config';
import { loginWithGoogleDomain, logoutUser, subscribeToAuthChanges } from '../../../services/firebase/auth.service';
import type { User } from 'firebase/auth';
import type { UserRole, UserSession } from '../../../shared/types/models';

export const useAuthSession = (showToast: any, setLoginModalOpen: any) => {
    const [user, setUser] = useState<UserSession | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userRole, setUserRole] = useState<UserRole>('');
    const [cloudStatus, setCloudStatus] = useState('Conectando...');
    
    const [userPrefs, setUserPrefs] = useState<any>(null);
    const prefsRef = useRef<any>(null);

    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges(async (firebaseUser: User | null) => {
            if (firebaseUser) {
                const session: UserSession = {
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    isAnonymous: firebaseUser.isAnonymous
                };
                setUser(session);

                if (firebaseUser.email) {
                    try {
                        const selfRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', firebaseUser.email);
                        const selfSnap = await getDoc(selfRef);

                        if (!selfSnap.exists()) {
                            await setDoc(selfRef, {
                                email: firebaseUser.email,
                                displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                                photoURL: firebaseUser.photoURL,
                                lastLogin: new Date().toISOString()
                            }, { merge: true });
                            setIsAdmin(false);
                            setUserRole('');
                            const defaultPrefs = { sound: true, security: true, rrss: true, comments: true };
                            setUserPrefs(defaultPrefs);
                            prefsRef.current = defaultPrefs;
                        } else {
                            const data = selfSnap.data();
                            if (data.disabled) {
                                await logoutUser();
                                showToast('Tu cuenta ha sido deshabilitada. Contacta a TI.', true);
                                return;
                            }
                            
                            await setDoc(selfRef, { lastLogin: new Date().toISOString() }, { merge: true });
                            
                            const role = data.role as UserRole;
                            setUserRole(role || '');
                            setIsAdmin(['ADMIN_IT', 'ADMIN_CM', 'EDITOR_CM'].includes(role));

                            const loadedPrefs = data.preferences || { sound: true, security: true, rrss: true, comments: true };
                            setUserPrefs(loadedPrefs);
                            prefsRef.current = loadedPrefs;
                        }
                    } catch (error) {
                        console.error("Error validando perfil", error);
                    }
                }
                // 🔥 FIX: Restaurado a tu texto original para que el Sidebar funcione bien
                setCloudStatus('Conectado a Firebase');
            } else {
                setUser(null);
                setIsAdmin(false);
                setUserRole('');
                setUserPrefs(null);
                prefsRef.current = null;
                setCloudStatus('Desconectado');
            }
        });

        return () => unsubscribe();
    }, [showToast]);

    const loginWithGoogle = async () => {
        try {
            await loginWithGoogleDomain();
            setLoginModalOpen(false);
            showToast('Sesión iniciada exitosamente');
        } catch (error: any) {
            showToast(error.message || 'Error al iniciar sesión', true);
        }
    };

    const logoutAdmin = async () => {
        try {
            await logoutUser();
        } catch (error) {
            showToast('Error al cerrar sesión', true);
        }
    };

    const updateUserPrefs = async (newPrefs: any) => {
        if (!user?.email) return;
        const prefs = { ...userPrefs, ...newPrefs };
        setUserPrefs(prefs);
        prefsRef.current = prefs;
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.email), { preferences: prefs }, { merge: true });
        } catch (error) {
            console.error("Error guardando preferencias", error);
        }
    };

    return { 
        user, isAdmin, userRole, cloudStatus, 
        loginWithGoogle, logoutAdmin, userPrefs, updateUserPrefs, prefsRef 
    };
};