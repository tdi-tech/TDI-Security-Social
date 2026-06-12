import { useState, useEffect, useCallback } from 'react';
import { auth, db, appId } from '../firebase/config';
import { 
    signInAnonymously, onAuthStateChanged, signOut, 
    GoogleAuthProvider, signInWithPopup 
} from "firebase/auth";
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc } from "firebase/firestore";

export const useFirebase = ({ showToast, setLoginModalOpen, setDetailModalOpen, setConfirmModal }: any) => {

    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    
    const [userRole, setUserRole] = useState<string>('');
    const [appUsers, setAppUsers] = useState<any[]>([]);
    
    const [cloudStatus, setCloudStatus] = useState(() => {
        return localStorage.getItem('auth_hint') === 'admin' 
            ? 'Conectando...' : 'Desconectado de Firebase (Lector)';
    });
    
    const [incidents, setIncidents] = useState<any[]>([]);
    const [rrssIncidents, setRrssIncidents] = useState<any[]>([]);
    const [checklistState, setChecklistState] = useState<any>({});
    const [comments, setComments] = useState<any[]>([]);
    const [notifications, setNotifications] = useState<any[]>([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const isAdm = !currentUser.isAnonymous;
                setIsAdmin(isAdm);
                localStorage.setItem('auth_hint', isAdm ? 'admin' : 'lector');
                setCloudStatus(isAdm ? 'Conectado a Firebase (Administrador)' : 'Desconectado de Firebase (Lector)');
            } else {
                setUser(null);
                setIsAdmin(false);
                setUserRole('');
                if (localStorage.getItem('auth_hint') === 'admin') setCloudStatus('Conectando...');
                else setCloudStatus('Desconectado de Firebase (Lector)');

                try { await signInAnonymously(auth); } 
                catch (error) {
                    localStorage.setItem('auth_hint', 'lector');
                    setCloudStatus('Desconectado de Firebase (Lector)');
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
                        if (user.email === 'marcosg@tierradeideas.mx' && data.role !== 'ADMIN_IT') {
                            await setDoc(selfRef, { role: 'ADMIN_IT' }, { merge: true });
                            setUserRole('ADMIN_IT');
                        } else {
                            setUserRole(data.role);
                        }
                        // Actualizar foto y nombre si cambiaron en Google
                        if (data.photoURL !== user.photoURL || data.displayName !== user.displayName) {
                            await setDoc(selfRef, { photoURL: user.photoURL, displayName: user.displayName }, { merge: true });
                        }
                    }
                } else {
                    const initialRole = user.email === 'marcosg@tierradeideas.mx' ? 'ADMIN_IT' : 'EDITOR_CM';
                    await setDoc(selfRef, {
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        role: initialRole,
                        disabled: false
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

    // FUNCIONES DE GESTIÓN DE USUARIOS
    const updateUserRole = async (email: string, newRole: string) => {
        if (email === 'marcosg@tierradeideas.mx') return showToast('Acción denegada: Superuser intocable.', true);
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', email), { role: newRole }, { merge: true });
            showToast('Rol actualizado exitosamente');
        } catch (e) { showToast('Error al actualizar rol', true); }
    };

    const toggleUserStatus = async (email: string, currentStatus: boolean) => {
        if (email === 'marcosg@tierradeideas.mx') return showToast('Acción denegada: Superuser intocable.', true);
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', email), { disabled: !currentStatus }, { merge: true });
            showToast(!currentStatus ? 'Cuenta deshabilitada' : 'Cuenta habilitada');
        } catch (e) { showToast('Error al actualizar cuenta', true); }
    };

    const deleteUserRecord = (email: string) => {
        if (userRole !== 'ADMIN_IT') return showToast('Permisos insuficientes.', true);
        if (email === 'marcosg@tierradeideas.mx') return showToast('Acción denegada: Superuser intocable.', true);
        
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

    // NUEVA FUNCIÓN: AGREGAR USUARIO MANUALMENTE (PRE-REGISTRO)
    const addManualUser = async (email: string, role: string) => {
        if (userRole !== 'ADMIN_IT' && userRole !== 'ADMIN_CM') return showToast('Permisos insuficientes.', true);
        if (!email.endsWith('@tierradeideas.mx')) return showToast('Solo se permiten correos @tierradeideas.mx', true);

        try {
            const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'users', email);
            await setDoc(docRef, {
                email: email.trim().toLowerCase(),
                displayName: email.split('@')[0], // Nombre temporal extraído del correo
                photoURL: '',
                role: role,
                disabled: false
            }, { merge: true });
            showToast(`Usuario ${email} pre-registrado correctamente.`);
        } catch (e) {
            showToast('Error al pre-registrar usuario', true);
        }
    };

    // LECTURA DE RESTO DE COLECCIONES
    useEffect(() => {
        const incidentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'incidents');
        const unsubIncidents = onSnapshot(incidentsRef, (snapshot) => {
            const data: any[] = [];
            snapshot.forEach((doc) => data.push(doc.data()));
            data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
            setIncidents(data);
        }, (error) => setCloudStatus('Desconectado de Firebase (Lector)'));

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
        });

        return () => {
            unsubIncidents(); unsubRrss(); unsubComments(); unsubChecklist(); unsubNotif();
        };
    }, []);

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

    const logAction = async (actionText: string, moduleName: string, actionType: 'create'|'edit'|'delete', incidentId: string = '') => {
        if (!user) return;
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
                isRead: false
            });
        } catch (error) { console.error('Error al guardar notificación', error); }
    };

    const markAsRead = async (id: string) => {
        try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'notifications', id), { isRead: true }, { merge: true }); } 
        catch (err) {}
    };

    const deleteNotification = async (id: string) => {
        try { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'notifications', id)); } 
        catch (err) { showToast('Error al eliminar la notificación', true); }
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
                } catch(err) { showToast('Error', true); }
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
                } catch(err) { showToast('Error al eliminar', true); }
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
        notifications, markAsRead, deleteNotification, logAction,
        userRole, appUsers, updateUserRole, toggleUserStatus, deleteUserRecord,
        // EXPORTAMOS LA FUNCIÓN MANUAL
        addManualUser
    };
};