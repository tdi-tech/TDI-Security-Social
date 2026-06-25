import { useState, useEffect, useCallback, useRef } from 'react';
import { auth, db, appId } from '../firebase/config';
import {
    signInAnonymously, onAuthStateChanged, signOut,
    GoogleAuthProvider, signInWithPopup
} from "firebase/auth";
import {
    collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, arrayUnion
} from "firebase/firestore";

// Lista de correos cuyo rol ADMIN_IT está protegido y se auto-restaura.
export const PROTECTED_ADMIN_IT_EMAILS = [
    'marcosg@tierradeideas.mx',
    'rperez@tierradeideas.mx'
];

export const useFirebase = ({ showToast, setLoginModalOpen, setDetailModalOpen, setConfirmModal }: any) => {

    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    const [userRole, setUserRole] = useState<string>('');
    const [appUsers, setAppUsers] = useState<any[]>([]);

    // 🔄 TEXTOS LIMPIOS
    const [cloudStatus, setCloudStatus] = useState(() => {
        return localStorage.getItem('auth_hint') === 'admin'
            ? 'Conectando...' : 'Desconectado de Firebase';
    });

    const [incidents, setIncidents] = useState<any[]>([]);
    const [rrssIncidents, setRrssIncidents] = useState<any[]>([]);
    const [checklistState, setChecklistState] = useState<any>({});
    const [comments, setComments] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);

    const [userPrefs, setUserPrefs] = useState({
        sound: true,
        security: true,
        rrss: true,
        comments: true
    });
    
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
        } catch (e) {
            console.warn("El navegador bloqueó el audio automático.");
        }
    };

    const updateUserPrefs = async (newPrefs: any) => {
        if (!user || user.isAnonymous) return;
        try {
            setUserPrefs(newPrefs);
            const selfRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', user.email);
            await setDoc(selfRef, { preferences: newPrefs }, { merge: true });
        } catch (error) {
            showToast("Error guardando preferencias", true);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const isAdm = !currentUser.isAnonymous;
                setIsAdmin(isAdm);
                localStorage.setItem('auth_hint', isAdm ? 'admin' : 'lector');
                // 🔄 TEXTOS LIMPIOS
                setCloudStatus(isAdm ? 'Conectado a Firebase' : 'Desconectado de Firebase');
            } else {
                setUser(null);
                setIsAdmin(false);
                setUserRole('');
                if (localStorage.getItem('auth_hint') === 'admin') setCloudStatus('Conectando...');
                else setCloudStatus('Desconectado de Firebase');

                try { await signInAnonymously(auth); }
                catch (error) {
                    localStorage.setItem('auth_hint', 'lector');
                    setCloudStatus('Desconectado de Firebase');
                }
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
        const IDLE_TIME = 10 * 60 * 1000;
        const resetTimer = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => forceLogout(), IDLE_TIME);
        };
        const events = ['mousemove', 'keydown', 'scroll', 'click', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetTimer));
        resetTimer();
        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            events.forEach(event => window.removeEventListener(event, resetTimer));
        };
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
                        showToast('Tu cuenta ha sido deshabilitada por un administrador.', true);
                        await logoutAdmin();
                    } else {
                        const isProtectedAdmin = PROTECTED_ADMIN_IT_EMAILS.includes(user.email);
                        if (isProtectedAdmin && data.role !== 'ADMIN_IT') {
                            await setDoc(selfRef, { role: 'ADMIN_IT' }, { merge: true });
                            setUserRole('ADMIN_IT');
                        } else {
                            setUserRole(data.role);
                        }

                        if (data.preferences) setUserPrefs(data.preferences);

                        if (data.photoURL !== user.photoURL || data.displayName !== user.displayName) {
                            await setDoc(selfRef, { photoURL: user.photoURL, displayName: user.displayName }, { merge: true });
                        }
                    }
                } else {
                    const initialRole = PROTECTED_ADMIN_IT_EMAILS.includes(user.email) ? 'ADMIN_IT' : 'EDITOR_CM';
                    await setDoc(selfRef, {
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        role: initialRole,
                        disabled: false,
                        preferences: userPrefs
                    });
                    setUserRole(initialRole);
                }
            });

            if (userRole === 'ADMIN_IT' || userRole === 'ADMIN_CM') {
                const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'users');
                unsubAllUsers = onSnapshot(usersRef, (snap) => {
                    const uList: any[] = [];
                    snap.forEach(d => uList.push(d.data()));
                    setAppUsers(uList);
                });
            }
        }

        return () => {
            if (unsubSelf) unsubSelf();
            if (unsubAllUsers) unsubAllUsers();
        };
    }, [user, userRole]);

    const updateUserRole = async (email: string, newRole: string) => {
        if (PROTECTED_ADMIN_IT_EMAILS.includes(email)) return showToast('Acción denegada: Administrador IT protegido.', true);
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', email), { role: newRole }, { merge: true });
            showToast('Rol actualizado exitosamente');
        } catch (e) { showToast('Error al actualizar rol', true); }
    };

    const toggleUserStatus = async (email: string, currentStatus: boolean) => {
        if (PROTECTED_ADMIN_IT_EMAILS.includes(email)) return showToast('Acción denegada: Administrador IT protegido.', true);
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', email), { disabled: !currentStatus }, { merge: true });
            showToast(!currentStatus ? 'Cuenta deshabilitada' : 'Cuenta habilitada');
        } catch (e) { showToast('Error al actualizar cuenta', true); }
    };

    const deleteUserRecord = (email: string) => {
        if (userRole !== 'ADMIN_IT') return showToast('Permisos insuficientes.', true);
        if (PROTECTED_ADMIN_IT_EMAILS.includes(email)) return showToast('Acción denegada: Administrador IT protegido.', true);

        setConfirmModal({
            isOpen: true, title: 'Eliminar Usuario', msg: `¿Seguro que deseas eliminar el acceso de ${email}?`,
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', email));
                    showToast('Usuario eliminado del sistema');
                } catch (e) { showToast('Error al eliminar', true); }
            }
        });
    };

    const addManualUser = async (email: string, role: string) => {
        if (userRole !== 'ADMIN_IT' && userRole !== 'ADMIN_CM') return showToast('Permisos insuficientes.', true);
        if (!email.endsWith('@tierradeideas.mx')) return showToast('Solo se permiten correos @tierradeideas.mx', true);

        try {
            const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', email);
            await setDoc(docRef, {
                email: email.trim().toLowerCase(),
                displayName: email.split('@')[0],
                photoURL: '',
                role: role,
                disabled: false
            }, { merge: true });
            showToast(`Usuario ${email} pre-registrado correctamente.`);
        } catch (e) {
            showToast('Error al pre-registrar usuario', true);
        }
    };

    useEffect(() => {
        const incidentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'incidents');
        const unsubIncidents = onSnapshot(incidentsRef, (snapshot) => {
            const data: any[] = [];
            snapshot.forEach((doc) => data.push(doc.data()));
            data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
            setIncidents(data);
        }, (error) => setCloudStatus('Desconectado de Firebase')); // 🔄 TEXTO LIMPIO

        const rrssRef = collection(db, 'artifacts', appId, 'public', 'data', 'rrss_incidents');
        const unsubRrss = onSnapshot(rrssRef, (snapshot) => {
            const data: any[] = [];
            snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
            data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
            setRrssIncidents(data);
        });

        const commentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'comments');
        const unsubComments = onSnapshot(commentsRef, (snapshot) => {
            const data: any[] = [];
            snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
            data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            setComments(data);
        });

        const checklistRef = collection(db, 'artifacts', appId, 'public', 'data', 'appState');
        const unsubChecklist = onSnapshot(checklistRef, (snapshot) => {
            let found = false;
            snapshot.forEach((docSnap) => {
                if (docSnap.id === 'globalChecklist') {
                    setChecklistState(docSnap.data().items || {});
                    found = true;
                }
            });
            if (!found) setChecklistState({});
        });

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

                    if (isRecent && user && notif.userId !== user.uid) {
                        let moduleKey: 'security' | 'rrss' | 'comments' = 'security';
                        if (notif.module === 'Incidencia RRSS') moduleKey = 'rrss';
                        if (notif.module === 'Comentarios') moduleKey = 'comments';

                        const currentPrefs = prefsRef.current;
                        if (moduleKey === 'security' && !currentPrefs.security) return;
                        if (moduleKey === 'rrss' && !currentPrefs.rrss) return;
                        if (moduleKey === 'comments' && !currentPrefs.comments) return;

                        if (currentPrefs.sound) {
                            playNotificationSound();
                        }
                    }
                }
            });
        });

        return () => {
            unsubIncidents(); unsubRrss(); unsubComments(); unsubChecklist(); unsubNotif();
        };
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
            if (error.code !== 'auth/popup-closed-by-user') showToast('Error al iniciar sesión con Google', true);
        }
    };

    const logAction = async (actionText: string, moduleName: string, actionType: 'create' | 'edit' | 'delete', incidentId: string = '') => {
        if (!user || user.isAnonymous) return;
        try {
            const notifRef = collection(db, 'artifacts', appId, 'public', 'data', 'notifications');
            await addDoc(notifRef, {
                userId: user.uid,
                userName: user.displayName || 'Administrador',
                userPhoto: user.photoURL || '',
                action: actionText,
                module: moduleName,
                type: actionType,
                incidentId: incidentId,
                timestamp: new Date().toISOString(),
                readBy: [],     
                deletedBy: []   
            });
        } catch (error) { console.error('Error registrando acción', error); }
    };

    const markAsRead = async (id: string) => {
        if (!user) return;
        try { 
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'notifications', id), { 
                readBy: arrayUnion(user.uid) 
            }, { merge: true }); 
        } catch (err) { }
    };

    const hideNotification = async (id: string) => {
        if (!user) return;
        try { 
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'notifications', id), { 
                deletedBy: arrayUnion(user.uid) 
            }, { merge: true }); 
        } catch (err) { showToast('Error al ocultar la notificación', true); }
    };

    const deleteNotification = async (id: string) => {
        try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'notifications', id)); }
        catch (err) { showToast('Error al eliminar la notificación del servidor', true); }
    };

    const toggleIncidentStatus = async (id: string) => {
        const inc = incidents.find(i => i.id === id);
        if (!inc) return;
        const newStatus = inc.estado === 'Resuelto' ? 'Abierto' : 'Resuelto';
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'incidents', inc.id), { ...inc, estado: newStatus });
            await logAction(`Cambió el estado a ${newStatus}`, 'Hackeos', 'edit', inc.id);
            showToast(`Estado cambiado a ${newStatus}`);
        } catch (err) { showToast('Error al actualizar', true); }
    };

    const updateIncident = async (id: string, updatedData: any) => {
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'incidents', id), updatedData, { merge: true });
            await logAction(`Editó un registro de seguridad`, 'Hackeos', 'edit', id);
            showToast('Incidente editado correctamente.');
        } catch (err) { showToast('Error al editar el incidente.', true); }
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
                } catch (err) { showToast('Error', true); }
            }
        });
    };

    const updateRrssIncident = async (id: string, updatedData: any) => {
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rrss_incidents', id), updatedData, { merge: true });
            await logAction(`Editó un caso de reputación`, 'Incidencia RRSS', 'edit', id);
            showToast('Incidente RRSS editado correctamente.');
        } catch (err) { showToast('Error al editar.', true); }
    };

    const deleteRrssIncident = (id: string) => {
        setConfirmModal({
            isOpen: true, title: 'Eliminar Incidente RRSS', msg: 'Esta acción eliminará el registro de forma permanente. ¿Seguro?',
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rrss_incidents', id));
                    await logAction(`Eliminó permanentemente un caso de crisis`, 'Incidencia RRSS', 'delete');
                    showToast('Registro eliminado exitosamente');
                } catch (err) { showToast('Error al eliminar', true); }
            }
        });
    };

    const updateComment = async (id: string, updatedData: any) => {
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'comments', id), updatedData, { merge: true });
            await logAction(`Editó un reporte de comentarios`, 'Comentarios', 'edit', id);
            showToast('Comentario editado correctamente.');
        } catch (err) { showToast('Error al editar el comentario.', true); }
    };

    const deleteComment = (id: string) => {
        setConfirmModal({
            isOpen: true, title: 'Eliminar Reporte', msg: 'Esta acción eliminará el reporte de forma permanente. ¿Estás seguro?',
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'comments', id));
                    await logAction(`Eliminó de forma permanente un reporte`, 'Comentarios', 'delete');
                    showToast('Reporte eliminado exitosamente.');
                } catch (err) { showToast('Error al eliminar el reporte.', true); }
            }
        });
    };

    return {
        user, isAdmin, cloudStatus, incidents, rrssIncidents, checklistState, setChecklistState,
        loginWithGoogle, logoutAdmin, toggleIncidentStatus, updateIncident, deleteIncident,
        updateRrssIncident, deleteRrssIncident, comments, updateComment, deleteComment,
        notifications, markAsRead, hideNotification, deleteNotification, logAction,
        userRole, appUsers, updateUserRole, toggleUserStatus, deleteUserRecord,
        addManualUser,
        userPrefs,
        updateUserPrefs
    };
};