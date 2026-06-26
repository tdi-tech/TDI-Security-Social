import { useState, useEffect, useCallback, useRef } from 'react';
import { auth, db, appId } from '../firebase/config';
import {
    signInAnonymously, onAuthStateChanged, signOut,
    GoogleAuthProvider, signInWithPopup
} from "firebase/auth";
import {
    collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, arrayUnion, getDoc
} from "firebase/firestore";
import { safeFirestoreOperation, logAuditEvent } from '../views/AuditViews';

export const useFirebase = ({ showToast, setLoginModalOpen, setDetailModalOpen, setConfirmModal }: any) => {

    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [userRole, setUserRole] = useState<string>('');
    const [appUsers, setAppUsers] = useState<any[]>([]);
    const [cloudStatus, setCloudStatus] = useState(() => {
        return localStorage.getItem('auth_hint') === 'admin' ? 'Conectando...' : 'Desconectado de Firebase';
    });

    const isLoading = false;
    const incidents: any[] = [];
    const rrssIncidents: any[] = [];
    const comments: any[] = [];

    const [checklistState, setChecklistState] = useState<any>({});
    const [notifications, setNotifications] = useState<any[]>([]);
    const [userPrefs, setUserPrefs] = useState({ sound: true, security: true, rrss: true, comments: true });
    const prefsRef = useRef(userPrefs);
    
    useEffect(() => { prefsRef.current = userPrefs; }, [userPrefs]);

    const detectMaliciousPayload = (data: any): boolean => {
        if (!data) return false;
        const str = JSON.stringify(data).toLowerCase();
        const patterns = ['<script>', 'javascript:', 'onerror=', 'onload=', 'drop table', 'union select', '../../'];
        return patterns.some(pattern => str.includes(pattern));
    };

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

    // 🔄 LECTURA EXCLUSIVA DE USUARIOS (Gatillada únicamente para IT y CM_ADMIN)
    useEffect(() => {
        if (!user || user.isAnonymous) return;
        
        // El EDITOR_CM o READER no tienen permiso de lectura en las reglas, evitamos abrir el canal para no generar errores
        if (userRole !== 'ADMIN_IT' && userRole !== 'ADMIN_CM') {
            setAppUsers([]);
            return;
        }

        const usersRef = collection(db, 'artifacts', appId, 'public', 'data', 'users');
        const unsubAllUsers = onSnapshot(usersRef, (snap) => {
            const uList: any[] = [];
            snap.forEach(d => uList.push(d.data()));
            setAppUsers(uList);
        }, () => {});

        return () => unsubAllUsers();
    }, [user, userRole]);

    useEffect(() => {
        if (!user) return;
        if (!user.isAnonymous && user.email && !user.email.endsWith('@tierradeideas.mx')) return;

        const checklistRef = collection(db, 'artifacts', appId, 'public', 'data', 'appState');
        const unsubChecklist = onSnapshot(checklistRef, (snapshot) => {
            let found = false;
            snapshot.forEach((docSnap) => {
                if (docSnap.id === 'globalChecklist') {
                    setChecklistState(docSnap.data().items || {}); found = true;
                }
            });
            if (!found) setChecklistState({});
        }, () => {});

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
        }, () => {});

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
                await logAuditEvent(`Alerta de Perímetro: Intento de acceso denegado`);
                await signOut(auth);
                showToast('Acceso denegado. Usa un correo @tierradeideas.mx', true);
                return;
            }
            
            localStorage.setItem('auth_hint', 'admin');
            localStorage.setItem('failed_logins', '0'); 
            setLoginModalOpen(false);
            showToast(`Bienvenido, ${result.user.displayName}`);
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
        try {
            await safeFirestoreOperation(async () => {
                await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'notifications', id));
            }, `Eliminar notificación ${id}`);
        }
        catch (err) { showToast('Acción denegada por el servidor', true); }
    };

    const updateUserRole = async (email: string, newRole: string) => {
        try {
            await safeFirestoreOperation(async () => {
                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', email), { role: newRole }, { merge: true });
            }, `Modificar rol de ${email} a ${newRole}`);
            showToast('Rol actualizado exitosamente');
        } catch (e: any) { 
            showToast(e.code === 'permission-denied' ? 'Acceso bloqueado: No tienes permisos.' : 'Acción denegada por el servidor de seguridad.', true);
        }
    };

    const toggleUserStatus = async (email: string, currentStatus: boolean) => {
        try {
            await safeFirestoreOperation(async () => {
                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', email), { disabled: !currentStatus }, { merge: true });
            }, `${!currentStatus ? 'Deshabilitar' : 'Habilitar'} cuenta de ${email}`);
            showToast(!currentStatus ? 'Cuenta deshabilitada' : 'Cuenta habilitada');
        } catch (e: any) { 
            showToast(e.code === 'permission-denied' ? 'Acceso bloqueado: No tienes permisos.' : 'Acción denegada por el servidor de seguridad.', true);
        }
    };

    const deleteUserRecord = (email: string) => {
        setConfirmModal({
            isOpen: true, title: 'Eliminar Usuario', msg: `¿Seguro que deseas eliminar el acceso de ${email}?`,
            onConfirm: async () => {
                try {
                    await safeFirestoreOperation(async () => {
                        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', email));
                    }, `Eliminar usuario permanentemente: ${email}`);
                    showToast('Usuario eliminado del sistema');
                } catch (e: any) { 
                    showToast(e.code === 'permission-denied' ? 'Bloqueo de seguridad: No puedes eliminar este usuario.' : 'Acción denegada por el servidor.', true); 
                }
            }
        });
    };

    const addManualUser = async (email: string, role: string) => {
        if (!email.endsWith('@tierradeideas.mx')) return showToast('Solo correos @tierradeideas.mx', true);
        try {
            await safeFirestoreOperation(async () => {
                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', email), {
                    email: email.trim().toLowerCase(), displayName: email.split('@')[0], photoURL: '', role: role, disabled: false
                }, { merge: true });
            }, `Pre-registrar usuario manualmente: ${email}`);
            showToast(`Usuario pre-registrado correctamente.`);
        } catch (e: any) { 
            showToast(e.code === 'permission-denied' ? 'Bloqueo: No tienes privilegios.' : 'Acción denegada por el servidor.', true); 
        }
    };

    const toggleIncidentStatus = async (id: string) => {
        try {
            await safeFirestoreOperation(async () => {
                const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'incidents', id);
                const docSnap = await getDoc(docRef);
                if (!docSnap.exists()) return;
                const inc = docSnap.data();
                const newStatus = inc.estado === 'Resuelto' ? 'Abierto' : 'Resuelto';
                await setDoc(docRef, { ...inc, estado: newStatus });
                await logAction(`Cambió el estado a ${newStatus}`, 'Hackeos', 'edit', id);
            }, `Cambiar estado de incidente de hackeo ID: ${id}`);
            showToast(`Estado actualizado con éxito`);
        } catch (err: any) { 
            showToast(err.code === 'permission-denied' ? 'Permiso denegado por reglas de seguridad.' : 'Acción denegada', true); 
        }
    };

    const updateIncident = async (id: string, updatedData: any) => {
        if (detectMaliciousPayload(updatedData)) {
            await logAuditEvent(`Bloqueo de Seguridad: Inyección XSS/SQL (Hackeos)`);
            showToast('Bloqueo de seguridad: Caracteres prohibidos detectados.', true);
            return;
        }
        try {
            await safeFirestoreOperation(async () => {
                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'incidents', id), updatedData, { merge: true });
                await logAction(`Editó un registro de seguridad`, 'Hackeos', 'edit', id);
            }, `Editar incidente de hackeo ID: ${id}`);
            showToast('Incidente editado correctamente.');
        } catch (err: any) { 
            showToast(err.code === 'permission-denied' ? 'Permiso denegado por reglas de seguridad.' : 'Acción denegada', true); 
        }
    };

    const deleteIncident = (id: string) => {
        setConfirmModal({
            isOpen: true, title: 'Eliminar Incidente', msg: 'Esta acción no se puede deshacer. ¿Seguro?',
            onConfirm: async () => {
                try {
                    await safeFirestoreOperation(async () => {
                        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'incidents', id));
                        await logAction(`Eliminó de forma permanente un registro`, 'Hackeos', 'delete');
                    }, `Eliminar incidente de hackeo ID: ${id}`);
                    showToast('Incidente eliminado');
                    setDetailModalOpen(false);
                } catch (err: any) { 
                    showToast(err.code === 'permission-denied' ? 'Bloqueo: No tienes permisos para eliminar.' : 'Acción denegada', true); 
                }
            }
        });
    };

    const updateRrssIncident = async (id: string, updatedData: any) => {
        if (detectMaliciousPayload(updatedData)) {
            await logAuditEvent(`Bloqueo de Seguridad: Inyección XSS/SQL (RRSS)`);
            showToast('Bloqueo de seguridad: Caracteres prohibidos detectados.', true);
            return;
        }
        try {
            await safeFirestoreOperation(async () => {
                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rrss_incidents', id), updatedData, { merge: true });
                await logAction(`Editó un caso de reputación`, 'Incidencia RRSS', 'edit', id);
            }, `Editar incidente de RRSS ID: ${id}`);
            showToast('Incidente RRSS editado correctamente.');
        } catch (err: any) { 
            showToast(err.code === 'permission-denied' ? 'Permiso denegado.' : 'Acción denegada', true); 
        }
    };

    const deleteRrssIncident = (id: string) => {
        setConfirmModal({
            isOpen: true, title: 'Eliminar Incidente RRSS', msg: 'Eliminará el registro de forma permanente. ¿Seguro?',
            onConfirm: async () => {
                try {
                    await safeFirestoreOperation(async () => {
                        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rrss_incidents', id));
                        await logAction(`Eliminó permanentemente un caso de crisis`, 'Incidencia RRSS', 'delete');
                    }, `Eliminar incidente RRSS ID: ${id}`);
                    showToast('Registro eliminado exitosamente');
                } catch (err: any) { 
                    showToast(err.code === 'permission-denied' ? 'Bloqueo: No tienes permisos de eliminación.' : 'Acción denegada', true); 
                }
            }
        });
    };

    const updateComment = async (id: string, updatedData: any) => {
        if (detectMaliciousPayload(updatedData)) {
            await logAuditEvent(`Bloqueo de Seguridad: Inyección XSS/SQL (Comentarios)`);
            showToast('Bloqueo de seguridad: Caracteres prohibidos detectados.', true);
            return;
        }
        try {
            await safeFirestoreOperation(async () => {
                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'comments', id), updatedData, { merge: true });
                await logAction(`Editó un reporte de comentarios`, 'Comentarios', 'edit', id);
            }, `Editar comentario ID: ${id}`);
            showToast('Comentario editado correctamente.');
        } catch (err: any) { 
            showToast(err.code === 'permission-denied' ? 'Permiso denegado.' : 'Acción denegada', true); 
        }
    };

    const deleteComment = (id: string) => {
        setConfirmModal({
            isOpen: true, title: 'Eliminar Reporte', msg: 'Eliminará el reporte de forma permanente. ¿Estás seguro?',
            onConfirm: async () => {
                try {
                    await safeFirestoreOperation(async () => {
                        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'comments', id));
                        await logAction(`Eliminó de forma permanente un reporte`, 'Comentarios', 'delete');
                    }, `Eliminar comentario ID: ${id}`);
                    showToast('Reporte eliminado exitosamente.');
                } catch (err: any) { 
                    showToast(err.code === 'permission-denied' ? 'Bloqueo: Privilegios insuficientes.' : 'Acción denegada', true); 
                }
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