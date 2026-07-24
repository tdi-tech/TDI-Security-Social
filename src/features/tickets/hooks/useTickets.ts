import { useCallback } from 'react';
import { collection, addDoc, doc, updateDoc, deleteDoc, arrayUnion } from 'firebase/firestore';
import { db, appId, auth } from '../../../services/firebase/config';

export const useTickets = (showToast: any, openConfirmModal: any, logAction?: any) => {

    const updateTicketStatus = useCallback(async (id: string, nuevoEstado: string, currentUser?: any) => {
        try {
            const updatePayload: any = { estado: nuevoEstado };
            const userToUse = currentUser || auth.currentUser;
            
            if (userToUse) {
                const idsToAdd = [userToUse.uid, userToUse.email].filter(Boolean);
                updatePayload.readBy = arrayUnion(...idsToAdd);
            }
            
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tickets', id), updatePayload);
            showToast(`Estatus actualizado a: ${nuevoEstado}`);
        } catch (e) {
            showToast('Error al actualizar estatus', true);
        }
    }, [showToast]);

    const updateTicketInternals = useCallback(async (
        ticketId: string, 
        ticketData: any, 
        currentUser: any, 
        appUsers: any[]
    ) => {
        try {
            const updatePayload: any = {
                fechaEntregaReal: ticketData.fechaEntregaReal || '',
                linkArte: ticketData.linkArte || '',
                notasInternas: ticketData.notasInternas || '',
                responsable: ticketData.responsable || ''
            };

            const userToUse = currentUser || auth.currentUser;
            if (userToUse) {
                const idsToAdd = [userToUse.uid, userToUse.email].filter(Boolean);
                updatePayload.readBy = arrayUnion(...idsToAdd);
            }

            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tickets', ticketId), updatePayload);

            if (ticketData.responsable && userToUse) {
                const assignedUserObj = appUsers.find(u => (u.displayName || u.email) === ticketData.responsable);
                
                if (assignedUserObj && assignedUserObj.email !== userToUse.email) {
                    const otherUsersIdentifiers: string[] = [];
                    appUsers.forEach((u: any) => {
                        if (u.email !== assignedUserObj.email) {
                            if (u.uid) otherUsersIdentifiers.push(u.uid);
                            if (u.email) otherUsersIdentifiers.push(u.email);
                            if (u.displayName) otherUsersIdentifiers.push(u.displayName);
                        }
                    });

                    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'notifications'), {
                        userId: userToUse.uid || userToUse.email,
                        userName: userToUse.displayName || userToUse.email || 'Miembro del equipo',
                        userPhoto: userToUse.photoURL || '',
                        action: `Te asignó como responsable del ticket: "${ticketData.tema}"`,
                        module: 'Tickets',
                        type: 'ticket_assign',
                        incidentId: ticketId,
                        timestamp: new Date().toISOString(),
                        readBy: [],
                        deletedBy: otherUsersIdentifiers
                    });
                }
            }

            if (logAction) await logAction('Actualizó metadatos y responsable de ticket', 'Tickets', 'update', ticketId);
            showToast('¡Metadatos internos y responsable guardados!');
            return true;
        } catch (e) {
            showToast('Error al guardar datos', true);
            return false;
        }
    }, [showToast, logAction]);

    const deleteTicket = useCallback((id: string, onSuccess?: () => void) => {
        if (openConfirmModal) {
            openConfirmModal(
                "¿Eliminar Ticket de Producción?",
                "Esta acción purgará el ticket emergente y sus adjuntos permanentemente. ¿Deseas continuar?",
                async () => {
                    try {
                        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tickets', id));
                        showToast('Ticket purgado del sistema');
                        if (onSuccess) onSuccess();
                    } catch(e) { showToast('Sin permisos para eliminar', true); }
                }
            );
        }
    }, [openConfirmModal, showToast]);

    return { updateTicketStatus, updateTicketInternals, deleteTicket };
};