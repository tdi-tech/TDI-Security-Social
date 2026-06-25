import { useState, useEffect, useCallback, useRef } from 'react';
import { auth, db, appId } from '../firebase/config';
import {
    signInAnonymously, onAuthStateChanged, signOut,
    GoogleAuthProvider, signInWithPopup
} from "firebase/auth";
import {
    collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, arrayUnion, getDoc
} from "firebase/firestore";

export const useFirebase = ({ showToast, setLoginModalOpen, setDetailModalOpen, setConfirmModal }: any) => {

    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userRole, setUserRole] = useState<string>('');
    const [appUsers, setAppUsers] = useState<any[]>([]);
    const [cloudStatus, setCloudStatus] = useState(() => {
        return localStorage.getItem('auth_hint') === 'admin' ? 'Conectando...' : 'Desconectado de Firebase';
    });

    // 🛑 SEGURIDAD APLICADA: Colecciones masivas purgadas del hook global.
    // Exportamos variables vacías para que la interfaz (App.tsx) no se rompa,
    // garantizando que el Lazy Loading de las vistas funcione al 100%.
    const isLoading = false;
    const incidents: any[] = [];
    const rrssIncidents: any[] = [];
    const comments: any[] = [];

    const [checklistState, setChecklistState] = useState<any>({});
    const [notifications, setNotifications] = useState<any[]>([]);
    const [userPrefs, setUserPrefs] = useState({ sound: true, security: true, rrss: true, comments: true });
    const prefsRef = useRef(userPrefs);
    
    useEffect(() => { prefsRef.current = userPrefs; }, [userPrefs]);

    const playNotificationSound = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
            gain.gain.setValueAtTime(0, ctx.currentTime);
            gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch (e) {}
    };

    const updateUserPrefs = async (newPrefs: any) => {
        if (!user || user.isAnonymous) return;
        try {
            setUserPrefs(newPrefs);
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', user.email), { preferences: newPrefs }, { merge: true });
        } catch (error) { showToast("Error guardando preferencias", true); }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
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
  
                try { await signInAnonymously(auth); }
                catch (error) { localStorage.setItem('auth_hint', 'lector'); setCloudStatus('Desconectado de Firebase'); }
            }
        });
        return () => unsubscribe();
    }, []);

    const logoutAdmin = async () => {
        localStorage.setItem('auth_hint', 'lector');
        await signOut(auth);
        window.location.reload();
    };

    const forceLogout = useCallback(async () => {
        if (!isAdmin) return;
        showToast('Sesión cerrada por inactividad (10 min).', true);
        localStorage.setItem('auth_hint', 'lector');
        await signOut(auth);
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
        let unsubAllUsers: any = null;

        if (user && !user.isAnonymous) {
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
            });

            const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'users');
            unsubAllUsers = onSnapshot(usersRef, (snap) => {
                const uList: any[] = [];
                snap.forEach(d => uList.push(d.data()));
                setAppUsers(uList);
            }, (error) => {});
        }
        return () => { if (unsubSelf) unsubSelf(); if (unsubAllUsers) unsubAllUsers(); };
    }, [user]);

    // 🔄 LECTURA DE DATOS MENORES (Checklist y Notificaciones)
    useEffect(() => {
        const checklistRef = collection(db, 'artifacts', appId, 'public', 'data', 'appState');
        const unsubChecklist = onSnapshot(checklistRef, (snapshot) => {
            let found = false;
            snapshot.forEach((docSnap) => {
                if (docSnap.id === 'globalChecklist') {
                    setChecklistState(docSnap.data().items || {}); found = true;
                }
            });
            if (!found) setChecklistState({});
        });

        if (!user) return () => unsubChecklist();

        const notifRef = collection(db, 'artifacts', appId, 'public', 'data', 'notifications');
        const unsubNotif = onSnapshot(notifRef, (snapshot) => {
            const data: any[] = [];
            snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
            data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setNotifications(data);

            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added') {
                    const notif = change.doc.data();
                    const isRecent = (new Date().getTime() - new Date(notif.timestamp).getTime()) < 10000;
                    if (isRecent && notif.userId !== user.uid) {
                        let moduleKey: 'security' | 'rrss' | 'comments' = 'security';
                        if (notif.module === 'Incidencia RRSS') moduleKey = 'rrss';
                        if (notif.module === 'Comentarios') moduleKey = 'comments';
                        const currentPrefs = prefsRef.current;
                        if (moduleKey === 'security' && !currentPrefs.security) return;
                        if (moduleKey === 'rrss' && !currentPrefs.rrss) return;
                        if (moduleKey === 'comments' && !currentPrefs.comments) return;
                        if (currentPrefs.sound) playNotificationSound();
                    }
                }
            });
        }, (error) => {});

        return () => { unsubChecklist(); unsubNotif(); };
    }, [user]);

    const loginWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ hd: 'tierradeideas.mx' });
        try {
            const result = await signInWithPopup(auth, provider);
            const loggedInEmail = result.user.email || '';
            if (!loggedInEmail.endsWith('@tierradeideas.mx')) {
                localStorage.setItem('auth_hint', 'lector');
                await signOut(auth);
                showToast('Acceso denegado. Usa un correo @tierradeideas.mx', true);
                return;
            }
            localStorage.setItem('auth_hint', 'admin');
            setLoginModalOpen(false);
            showToast(`Bienvenido, ${result.user.displayName}`);
        } catch (error: any) {
            if (error.code !== 'auth/popup-closed-by-user') showToast('Error al iniciar sesión', true);
        }
    };

    const logAction = async (actionText: string, moduleName: string, actionType: 'create' | 'edit' | 'delete', incidentId: string = '') => {
        if (!user || user.isAnonymous) return;
        try {
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'notifications'), {
                userId: user.uid, userName: user.displayName || 'Administrador', userPhoto: user.photoURL || '',
                action: actionText, module: moduleName, type: actionType, incidentId: incidentId,
                timestamp: new Date().toISOString(), readBy: [], deletedBy: []   
            });
        } catch (error) {}
    };

    const markAsRead = async (id: string) => {
        if (!user) return;
        try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'notifications', id), { readBy: arrayUnion(user.uid) }, { merge: true }); } 
        catch (err) { }
    };

    const hideNotification = async (id: string) => {
        if (!user) return;
        try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'notifications', id), { deletedBy: arrayUnion(user.uid) }, { merge: true }); } 
        catch (err) { showToast('Error al ocultar', true); }
    };

    const deleteNotification = async (id: string) => {
        try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'notifications', id)); }
        catch (err) { showToast('Acción denegada por el servidor', true); }
    };

    const updateUserRole = async (email: string, newRole: string) => {
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', email), { role: newRole }, { merge: true });
            showToast('Rol actualizado exitosamente');
        } catch (e) { showToast('Acción denegada por el servidor de seguridad.', true); }
    };

    const toggleUserStatus = async (email: string, currentStatus: boolean) => {
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', email), { disabled: !currentStatus }, { merge: true });
            showToast(!currentStatus ? 'Cuenta deshabilitada' : 'Cuenta habilitada');
        } catch (e) { showToast('Acción denegada por el servidor de seguridad.', true); }
    };

    const deleteUserRecord = (email: string) => {
        setConfirmModal({
            isOpen: true, title: 'Eliminar Usuario', msg: `¿Seguro que deseas eliminar el acceso de ${email}?`,
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', email));
                    showToast('Usuario eliminado del sistema');
                } catch (e) { showToast('Acción denegada por el servidor.', true); }
            }
        });
    };

    const addManualUser = async (email: string, role: string) => {
        if (!email.endsWith('@tierradeideas.mx')) return showToast('Solo correos @tierradeideas.mx', true);
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', email), {
                email: email.trim().toLowerCase(), displayName: email.split('@')[0], photoURL: '', role: role, disabled: false
            }, { merge: true });
            showToast(`Usuario pre-registrado correctamente.`);
        } catch (e) { showToast('Acción denegada por el servidor.', true); }
    };

    // 🛑 SOLUCIÓN AL ERROR QUE MARCASTE: Lee desde Firebase en lugar de la variable local vacía
    const toggleIncidentStatus = async (id: string) => {
        try {
            const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'incidents', id);
            const docSnap = await getDoc(docRef);
            if (!docSnap.exists()) return;
            const inc = docSnap.data();
            const newStatus = inc.estado === 'Resuelto' ? 'Abierto' : 'Resuelto';
            await setDoc(docRef, { ...inc, estado: newStatus });
            await logAction(`Cambió el estado a ${newStatus}`, 'Hackeos', 'edit', id);
            showToast(`Estado cambiado a ${newStatus}`);
        } catch (err) { showToast('Acción denegada', true); }
    };

    const updateIncident = async (id: string, updatedData: any) => {
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'incidents', id), updatedData, { merge: true });
            await logAction(`Editó un registro de seguridad`, 'Hackeos', 'edit', id);
            showToast('Incidente editado correctamente.');
        } catch (err) { showToast('Acción denegada', true); }
    };

    const deleteIncident = (id: string) => {
        setConfirmModal({
            isOpen: true, title: 'Eliminar Incidente', msg: 'Esta acción no se puede deshacer. ¿Seguro?',
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'incidents', id));
                    await logAction(`Eliminó de forma permanente un registro`, 'Hackeos', 'delete');
                    showToast('Incidente eliminado');
                    setDetailModalOpen(false);
                } catch (err) { showToast('Acción denegada', true); }
            }
        });
    };

    const updateRrssIncident = async (id: string, updatedData: any) => {
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rrss_incidents', id), updatedData, { merge: true });
            await logAction(`Editó un caso de reputación`, 'Incidencia RRSS', 'edit', id);
            showToast('Incidente RRSS editado correctamente.');
        } catch (err) { showToast('Acción denegada', true); }
    };

    const deleteRrssIncident = (id: string) => {
        setConfirmModal({
            isOpen: true, title: 'Eliminar Incidente RRSS', msg: 'Eliminará el registro de forma permanente. ¿Seguro?',
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rrss_incidents', id));
                    await logAction(`Eliminó permanentemente un caso de crisis`, 'Incidencia RRSS', 'delete');
                    showToast('Registro eliminado exitosamente');
                } catch (err) { showToast('Acción denegada', true); }
            }
        });
    };

    const updateComment = async (id: string, updatedData: any) => {
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'comments', id), updatedData, { merge: true });
            await logAction(`Editó un reporte de comentarios`, 'Comentarios', 'edit', id);
            showToast('Comentario editado correctamente.');
        } catch (err) { showToast('Acción denegada', true); }
    };

    const deleteComment = (id: string) => {
        setConfirmModal({
            isOpen: true, title: 'Eliminar Reporte', msg: 'Eliminará el reporte de forma permanente. ¿Estás seguro?',
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'comments', id));
                    await logAction(`Eliminó de forma permanente un reporte`, 'Comentarios', 'delete');
                    showToast('Reporte eliminado exitosamente.');
                } catch (err) { showToast('Acción denegada', true); }
            }
        });
    };

    return {
        user, isAdmin, cloudStatus, isLoading, incidents, rrssIncidents, checklistState, setChecklistState,
        loginWithGoogle, logoutAdmin, toggleIncidentStatus, updateIncident, deleteIncident,
        updateRrssIncident, deleteRrssIncident, comments, updateComment, deleteComment,
        notifications, markAsRead, hideNotification, deleteNotification, logAction,
        userRole, appUsers, updateUserRole, toggleUserStatus, deleteUserRecord,
        addManualUser, userPrefs, updateUserPrefs
    };
};