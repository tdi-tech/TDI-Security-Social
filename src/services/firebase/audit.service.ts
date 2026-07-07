import { collection, addDoc } from 'firebase/firestore';
import { db, appId, auth } from './config';

export const logAuditEvent = async (actionDescription: string): Promise<void> => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
        const net = await getNetworkContext();
        const now = new Date();
        const expireDate = new Date(now.getTime() + (13 * 24 * 60 * 60 * 1000) + (23 * 60 * 60 * 1000));

        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'auditLogs'), {
            ip: net.ip || "127.0.0.1",
            pais: net.country || "Local/Proxy",
            fecha: now,
            expireAt: expireDate,
            uid: currentUser.uid,
            email: currentUser.email || "anonymous-email",
            provider: currentUser.providerData[0]?.providerId || "google.com",
            userAgent: navigator.userAgent || "unknown-agent",
            accion: actionDescription
        });
    } catch (err) {
        console.error("Fallo crítico al asentar registro en auditLogs:", err);
    }
};

export const safeFirestoreOperation = async <T>(operationFn: () => Promise<T>, actionName: string): Promise<T> => {
    try {
        return await operationFn();
    } catch (error: any) {
        if (error.code === 'permission-denied') {
            await logAuditEvent(`Bloqueo 403: Operación denegada (${actionName})`);
        }
        throw error;
    }
};