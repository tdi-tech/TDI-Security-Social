import { useState, useEffect } from 'react';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, appId } from '../../../services/firebase/config';
import { safeFirestoreOperation } from '../../../services/firebase/audit.service';

export const useUsersManager = (user: any, userRole: string, showToast: any, setConfirmModal: any) => {
    const [appUsers, setAppUsers] = useState<any[]>([]);

    useEffect(() => {
        if (!user || user.isAnonymous) return;
        // Solo IT y ADMIN_CM abren este listener
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

    const updateUserRole = async (email: string, newRole: string) => {
        try {
            await safeFirestoreOperation(async () => {
                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', email), { role: newRole }, { merge: true });
            }, `Modificar rol de ${email} a ${newRole}`);
            showToast('Rol actualizado exitosamente');
        } catch (e: any) { 
            showToast(e.code === 'permission-denied' ? 'Acceso bloqueado: No tienes permisos.' : 'Acción denegada.', true);
        }
    };

    const toggleUserStatus = async (email: string, currentStatus: boolean) => {
        try {
            await safeFirestoreOperation(async () => {
                await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'users', email), { disabled: !currentStatus }, { merge: true });
            }, `${!currentStatus ? 'Deshabilitar' : 'Habilitar'} cuenta de ${email}`);
            showToast(!currentStatus ? 'Cuenta deshabilitada' : 'Cuenta habilitada');
        } catch (e: any) { 
            showToast(e.code === 'permission-denied' ? 'Acceso bloqueado: No tienes permisos.' : 'Acción denegada.', true);
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
                    showToast(e.code === 'permission-denied' ? 'Bloqueo: No puedes eliminar este usuario.' : 'Acción denegada.', true); 
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
            }, `Pre-registrar usuario: ${email}`);
            showToast(`Usuario pre-registrado correctamente.`);
        } catch (e: any) { 
            showToast(e.code === 'permission-denied' ? 'Bloqueo: No tienes privilegios.' : 'Acción denegada.', true); 
        }
    };

    return { appUsers, updateUserRole, toggleUserStatus, deleteUserRecord, addManualUser };
};