import { useState, useCallback, useRef, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, deleteDoc, arrayUnion, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, appId, auth, getNetworkContext } from '../../../services/firebase/config';
import { logAuditEvent, logSecurityBlock } from '../../../services/firebase/audit.service';

export const useTickets = (showToast: any, openConfirmModal: any, logAction?: any) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const lastSubmissionTime = useRef<number>(0);

    const [ticketRemainingAttempts, setTicketRemainingAttempts] = useState(5);
    const [ticketLockoutUntil, setTicketLockoutUntil] = useState<number | null>(null);

    // 🔥 ESCUDO EN TIEMPO REAL: Sincronización en vivo con firewall_locks usando onSnapshot
    useEffect(() => {
        let unsub: (() => void) | undefined;
        getNetworkContext().then((net) => {
            const userToUse = auth.currentUser;
            const lockId = userToUse?.email 
                ? userToUse.email.replace(/[@.]/g, '_') 
                : (net.ip ? net.ip.replace(/\./g, '_') : "anonymous_client");
                
            const lockRef = doc(db, 'artifacts', appId, 'public', 'data', 'firewall_locks', lockId);
            
            unsub = onSnapshot(lockRef, (lockSnap) => {
                if (lockSnap.exists()) {
                    const data = lockSnap.data();
                    if (data.lockoutUntil && Date.now() < new Date(data.lockoutUntil).getTime()) {
                        setTicketLockoutUntil(new Date(data.lockoutUntil).getTime());
                        setTicketRemainingAttempts(0);
                    } else {
                        const rem = Math.max(0, 5 - (data.failedAttempts || 0));
                        setTicketRemainingAttempts(rem);
                        if (data.lockoutUntil && Date.now() >= new Date(data.lockoutUntil).getTime()) {
                            setTicketLockoutUntil(null);
                        }
                    }
                } else {
                    setTicketRemainingAttempts(5);
                    setTicketLockoutUntil(null);
                }
            });
        }).catch(() => {});

        return () => { if (unsub) unsub(); };
    }, []);

    const createTicket = useCallback(async (ticketData: any, currentUser?: any) => {
        setIsSubmitting(true);
        try {
            const userToUse = currentUser || auth.currentUser;
            const net = await getNetworkContext().catch(() => ({ ip: "unknown_client" }));
            const lockId = userToUse?.email 
                ? userToUse.email.replace(/[@.]/g, '_') 
                : (net.ip ? net.ip.replace(/\./g, '_') : "anonymous_client");
            
            const lockRef = doc(db, 'artifacts', appId, 'public', 'data', 'firewall_locks', lockId);
            const lockSnap = await getDoc(lockRef);
            const lockData = lockSnap.exists() ? lockSnap.data() : {};
            const now = Date.now();

            // 1. VERIFICACIÓN BACKEND: ¿Bloqueo de 30 minutos activo?
            if (lockData.lockoutUntil) {
                const lockoutTime = new Date(lockData.lockoutUntil).getTime();
                if (now < lockoutTime) {
                    const minRestantes = Math.ceil((lockoutTime - now) / (1000 * 60));
                    showToast(`🚨 Firewall de Servidor: IP bloqueada por seguridad. Intenta en ${minRestantes} minuto(s).`, true);
                    await logAuditEvent(`Intento ilegal de envío durante bloqueo activo de firewall en Tickets (${lockId})`);
                    setIsSubmitting(false);
                    return false;
                }
            }

            // 2. VERIFICACIÓN BACKEND: Rate Limit de 60 segundos
            if (lockData.lastSubmissionTime && (now - lockData.lastSubmissionTime < 60 * 1000)) {
                const segRestantes = Math.ceil((60 * 1000 - (now - lockData.lastSubmissionTime)) / 1000);
                showToast(`⚡ Rate Limit de Servidor: Espera ${segRestantes}s para enviar otro ticket.`, true);
                await logSecurityBlock(`Spam de tickets / Exceso de velocidad (Rate Limit 60s en ${lockId})`, 0);
                setIsSubmitting(false);
                return false;
            }

            // 🔥 ESQUEMA EN ESPAÑOL EXACTO para cumplir con firestore.rules
            const payload = {
                ...ticketData,
                estado: 'Pendiente',
                timestamp: new Date().toISOString(),
                autor: userToUse?.email || 'Innova Cliente (Web)',
                fechaEntregaReal: '',
                linkArte: '',
                notasInternas: '',
                responsable: '',
                readBy: []
            };

            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'tickets'), payload);
            
            await setDoc(lockRef, {
                failedAttempts: 0,
                lockoutUntil: null,
                lastSubmissionTime: now,
                lastIp: net.ip || "unknown"
            }, { merge: true });

            setTicketRemainingAttempts(5);
            setTicketLockoutUntil(null);
            showToast('¡Ticket creado y enviado a la central con éxito!');
            if (logAction) await logAction(`Creó un nuevo ticket de soporte`, 'Tickets', 'create');
            setIsSubmitting(false);
            return true;
        } catch (error: any) {
            setIsSubmitting(false);
            
            if (error.code === 'permission-denied') {
                try {
                    const net = await getNetworkContext().catch(() => ({ ip: "unknown_client" }));
                    const userToUse = currentUser || auth.currentUser;
                    const lockId = userToUse?.email ? userToUse.email.replace(/[@.]/g, '_') : (net.ip ? net.ip.replace(/\./g, '_') : "anonymous_client");
                    const lockRef = doc(db, 'artifacts', appId, 'public', 'data', 'firewall_locks', lockId);
                    const lockSnap = await getDoc(lockRef);
                    const lockData = lockSnap.exists() ? lockSnap.data() : {};
                    
                    const currentFails = (lockData.failedAttempts || 0) + 1;
                    const rem = Math.max(0, 5 - currentFails);
                    setTicketRemainingAttempts(rem);

                    const updatePayload: any = { failedAttempts: currentFails, lastIp: net.ip || "unknown" };

                    if (currentFails >= 5) {
                        const lockoutTimestamp = new Date(Date.now() + 30 * 60 * 1000).toISOString();
                        updatePayload.lockoutUntil = lockoutTimestamp;
                        setTicketLockoutUntil(new Date(lockoutTimestamp).getTime());
                        showToast('🚨 5 intentos fallidos: Tu IP ha sido bloqueada en el servidor por 30 minutos.', true);
                        
                        await logAuditEvent(`Alerta Brute-Force: IP/Usuario ${lockId} bloqueado 30 min en backend por fallar PIN 5 veces`);
                    } else {
                        showToast(`Acceso denegado: PIN incorrecto. Te quedan ${rem} intento(s) en el servidor.`, true);
                        await logAuditEvent(`Alerta de Seguridad: PIN de Ticket incorrecto (Intento ${currentFails}/5 por ${lockId})`);
                    }
                    
                    await setDoc(lockRef, updatePayload, { merge: true });
                } catch (lockErr) {
                    console.error("Error al registrar fallo en firewall:", lockErr);
                }
            } else {
                showToast('Error al enviar el ticket. Verifica tu conexión.', true);
            }
            return false;
        }
    }, [showToast, logAction]);

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
        } catch (error: any) {
            if (error.code === 'permission-denied') {
                showToast('Acceso bloqueado: No tienes permisos.', true);
                await logAuditEvent(`Alerta RBAC/DOM: Intento ilegal de modificar estatus en ticket #${id}`);
            } else {
                showToast('Error al actualizar estatus', true);
            }
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
        } catch (error: any) {
            if (error.code === 'permission-denied') {
                showToast('Acceso bloqueado: No tienes permisos.', true);
                await logAuditEvent(`Alerta RBAC/DOM: Intento ilegal de alterar metadatos en ticket #${ticketId}`);
            } else {
                showToast('Error al guardar datos', true);
            }
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
                    } catch (error: any) {
                        if (error.code === 'permission-denied') {
                            showToast('Sin permisos para eliminar', true);
                            await logAuditEvent(`Alerta RBAC/DOM: Intento ilegal de eliminar el ticket #${id}`);
                        } else {
                            showToast('Sin permisos para eliminar', true);
                        }
                    }
                }
            );
        }
    }, [openConfirmModal, showToast]);

    return { 
        createTicket, 
        isSubmitting, 
        updateTicketStatus, 
        updateTicketInternals, 
        deleteTicket,
        ticketRemainingAttempts,
        ticketLockoutUntil
    };
};