import { useState, useEffect, useCallback } from 'react';
import { auth, db, appId } from '../firebase/config';
import { 
    signInAnonymously, onAuthStateChanged, signOut, 
    GoogleAuthProvider, signInWithPopup 
} from "firebase/auth";
import { collection, onSnapshot, doc, setDoc, deleteDoc } from "firebase/firestore";

export const useFirebase = ({ showToast, setLoginModalOpen, setDetailModalOpen, setConfirmModal }: any) => {

    const [user, setUser] = useState<any>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    
    // TRUCO DE UX: Inicializamos el estado usando un indicio en caché para evitar el parpadeo de "Conectando..."
    const [cloudStatus, setCloudStatus] = useState(() => {
        return localStorage.getItem('auth_hint') === 'admin' 
            ? 'Conectando...' 
            : 'Desconectado de Firebase (Lector)';
    });
    
    const [incidents, setIncidents] = useState<any[]>([]);
    const [checklistState, setChecklistState] = useState<any>({});

    // ==== 1. Inicialización y Autenticación Inteligente ====
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const isAdm = !currentUser.isAnonymous;
                setIsAdmin(isAdm);
                
                // Guardamos el indicio en caché según el rol obtenido
                localStorage.setItem('auth_hint', isAdm ? 'admin' : 'lector');
                setCloudStatus(isAdm ? 'Conectado a Firebase (Administrador)' : 'Desconectado de Firebase (Lector)');
            } else {
                setUser(null);
                setIsAdmin(false);
                
                if (localStorage.getItem('auth_hint') === 'admin') {
                    setCloudStatus('Conectando...');
                } else {
                    setCloudStatus('Desconectado de Firebase (Lector)');
                }

                try {
                    await signInAnonymously(auth);
                } catch (error) {
                    localStorage.setItem('auth_hint', 'lector');
                    setCloudStatus('Desconectado de Firebase (Lector)');
                }
            }
        });
        return () => unsubscribe();
    }, []);

    // ==== 2. Cerrar Sesión Manual con Limpieza de Caché y Recarga ====
    const logoutAdmin = async () => {
        localStorage.setItem('auth_hint', 'lector'); // Cambiamos el indicio antes de refrescar
        await signOut(auth);
        window.location.reload(); // Recarga automática limpia de toda la plataforma
    };

    const forceLogout = useCallback(async () => {
        if (!isAdmin) return;
        showToast('Sesión cerrada por inactividad (10 min).', true);
        localStorage.setItem('auth_hint', 'lector');
        await signOut(auth);
        window.location.reload();
    }, [isAdmin, showToast]);

    // ==== 3. Temporizador de Inactividad ====
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

    // ==== 4. Suscripciones Públicas en Tiempo Real (SIN CANDADOS) ====
    useEffect(() => {
        // Al quitar el "if (!user) return;" y dejar el array vacío [], Firestore
        // se conecta inmediatamente al cargar la app y funciona de forma pública (Lectores).
        const incidentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'incidents');
        const unsubIncidents = onSnapshot(incidentsRef, (snapshot) => {
            const data: any[] = [];
            snapshot.forEach((doc) => data.push(doc.data()));
            data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
            setIncidents(data);
        }, (error) => {
            console.error("Error en Firestore:", error);
            setCloudStatus('Desconectado de Firebase (Lector)');
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
        }, (error) => console.error("Error en Firestore:", error));

        return () => {
            unsubIncidents();
            unsubChecklist();
        };
    }, []); // Corre una sola vez al montar la app

    // ==== 5. Controladores del Panel de Control ====
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
            if (error.code !== 'auth/popup-closed-by-user') {
                showToast('Error al iniciar sesión con Google', true);
            }
        }
    };

    const toggleIncidentStatus = async (id: string) => {
        const inc = incidents.find(i => i.id === id);
        if (!inc) return;
        const newStatus = inc.estado === 'Resuelto' ? 'Abierto' : 'Resuelto';
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'incidents', inc.id), { ...inc, estado: newStatus });
            showToast(`Estado cambiado a ${newStatus}`);
        } catch (err) { showToast('Error al actualizar', true); }
    };

    const updateIncident = async (id: string, updatedData: any) => {
        try {
            const docRef = doc(db, 'artifacts', appId, 'public', 'data', 'incidents', id);
            await setDoc(docRef, updatedData, { merge: true });
            showToast('Incidente editado correctamente.');
        } catch (err) {
            showToast('Error al editar el incidente.', true);
        }
    };

    const deleteIncident = (id: string) => {
        setConfirmModal({
            isOpen: true, title: 'Eliminar Incidente', msg: 'Esta acción no se puede deshacer. ¿Seguro?',
            onConfirm: async () => {
                try {
                    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'incidents', id));
                    showToast('Incidente eliminado');
                    setDetailModalOpen(false);
                } catch(err) { showToast('Error', true); }
            }
        });
    };

    return { 
        user, isAdmin, cloudStatus, incidents, checklistState, setChecklistState, 
        loginWithGoogle, logoutAdmin, toggleIncidentStatus, updateIncident, deleteIncident 
    };
};