import { useState, useEffect, useCallback, useRef } from 'react';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../../../services/firebase/config';
import { 
    loginWithGoogleDomain, loginAsReader, logoutUser, subscribeToAuthChanges 
} from '../../../services/firebase/auth.service';
import { logAuditEvent } from '../../../services/firebase/audit.service';

// 🛡️ CANDADO ANTI-CONGELAMIENTO v3.4.1 INTACTO
let isLoggingOut = false;

export const useAuthSession = (showToast: any, setLoginModalOpen: any) => {
    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userRole, setUserRole] = useState<string>('');
    const [userPrefs, setUserPrefs] = useState({ sound: true, security: true, rrss: true, comments: true });
    
    // 🛡️ TEXTOS EXACTOS DE INTERFAZ MANTENIDOS
    const [cloudStatus, setCloudStatus] = useState(() => {
        return localStorage.getItem('auth_hint') === 'admin' ? 'Conectando...' : 'Desconectado de Firebase';
    });

    const prefsRef = useRef(userPrefs);
    useEffect(() => { prefsRef.current = userPrefs; }, [userPrefs]);

    useEffect(() => {
        const unsubscribe = subscribeToAuthChanges(async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const isAdm = !currentUser.isAnonymous;
                setIsAdmin(isAdm);
                localStorage.setItem('auth_hint', isAdm ? 'admin' : 'lector');
                setCloudStatus(isAdm ? 'Conectado a Firebase' : 'Desconectado de Firebase');
            } else {
                setUser(null); setIsAdmin(false); setUserRole('');
                if (localStorage.getItem('auth_hint') === 'admin') setCloudStatus('Conectando...');
                else setCloudStatus('Desconectado de Firebase');
  
                if (!isLoggingOut) {
                    try { await loginAsReader(); }
                    catch (error) { localStorage.setItem('auth_hint', 'lector'); setCloudStatus('Desconectado de Firebase'); }
                }
            }
        });
        return () => unsubscribe();
    }, []);

    const logoutAdmin = async () => {
        isLoggingOut = true; 
        localStorage.setItem('auth_hint', 'lector');
        localStorage.setItem('innova_current_view', 'dashboard'); 
        await logoutUser();
        window.location.reload();
    };

    const forceLogout = useCallback(async () => {
        if (!isAdmin) return;
        isLoggingOut = true; 
        showToast('Sesión cerrada por inactividad (10 min).', true);
        localStorage.setItem('auth_hint', 'lector');
        localStorage.setItem('innova_current_view', 'dashboard'); 
        await logoutUser();
        window.location.reload();
    }, [isAdmin, showToast]);

    useEffect(() => {
        if (!isAdmin) return;
        let timeoutId: ReturnType<typeof setTimeout>;
        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => forceLogout(), 10 * 60 * 1000);
        };
        const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimer));
        resetTimer();
        return () => { if (timeoutId) clearTimeout(timeoutId); events.forEach(event => window.removeEventListener(event, resetTimer)); };
    }, [isAdmin, forceLogout]);

    useEffect(() => {
        let unsubSelf: any = null;
        if (user && !user.isAnonymous) {
            if (user.email && !user.email.endsWith('@tierradeideas.mx')) return;

            const selfRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.email);
            unsubSelf = onSnapshot(selfRef, async (snap) => {
                if (snap.exists()) {
                    const data = snap.data();
                    if (data.disabled) {
                        showToast('Tu cuenta ha sido deshabilitada.', true);
                        await logoutAdmin();
                    } else {
                        setUserRole(data.role);
                        if (data.preferences) setUserPrefs(data.preferences);
                        if (data.photoURL !== user.photoURL || data.displayName !== user.displayName) {
                            await setDoc(selfRef, { photoURL: user.photoURL, displayName: user.displayName }, { merge: true });
                        }
                    }
                } else {
                    await setDoc(selfRef, {
                        email: user.email, displayName: user.displayName, photoURL: user.photoURL,
                        role: 'EDITOR_CM', disabled: false, preferences: userPrefs
                    });
                    setUserRole('EDITOR_CM');
                }
            }, () => {});
        }
        return () => { if (unsubSelf) unsubSelf(); };
    }, [user]);

    const loginWithGoogle = async () => {
        try {
            const loggedInUser = await loginWithGoogleDomain();
            const loggedInEmail = loggedInUser.email || '';
            
            if (!loggedInEmail.endsWith('@tierradeideas.mx')) {
                localStorage.setItem('auth_hint', 'lector');
                await logAuditEvent(`Alerta de Perímetro: Intento de acceso denegado`);
                await logoutUser();
                showToast('Acceso denegado. Usa un correo @tierradeideas.mx', true);
                return;
            }
            
            localStorage.setItem('auth_hint', 'admin');
            localStorage.setItem('failed_logins', '0'); 
            setLoginModalOpen(false);
            showToast(`Bienvenido, ${loggedInUser.displayName}`);
        } catch (error: any) {
            if (error.code !== 'auth/popup-closed-by-user') {
                const attempts = parseInt(localStorage.getItem('failed_logins') || '0') + 1;
                localStorage.setItem('failed_logins', attempts.toString());
                
                if (attempts >= 3) {
                    await logAuditEvent(`Fuerza Bruta: Múltiples intentos fallidos`);
                }
                showToast('Error al iniciar sesión', true);
            }
        }
    };

    const updateUserPrefs = async (newPrefs: any) => {
        if (!user || user.isAnonymous) return;
        try {
            setUserPrefs(newPrefs);
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.email), { preferences: newPrefs }, { merge: true });
        } catch (error) { showToast("Error guardando preferencias", true); }
    };

    return { user, isAdmin, userRole, cloudStatus, loginWithGoogle, logoutAdmin, userPrefs, updateUserPrefs, prefsRef };
};