import { doc, setDoc, addDoc, collection, arrayUnion, deleteDoc } from "firebase/firestore";
import { db, appId, auth } from './config';

export const detectMaliciousPayload = (data: any): boolean => {
    if (!data) return false;
    const str = JSON.stringify(data).toLowerCase();
    const patterns = ['<script>', 'javascript:', 'onerror=', 'onload=', 'drop table', 'union select', '../../'];
    return patterns.some(pattern => str.includes(pattern));
};

export const updateDocument = async (collectionName: string, docId: string, data: any, actionName: string) => {
    return safeFirestoreOperation(async () => {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, docId), data, { merge: true });
    }, actionName);
};

export const deleteDocument = async (collectionName: string, docId: string, actionName: string) => {
    return safeFirestoreOperation(async () => {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', collectionName, docId));
    }, actionName);
};

export const pushNotification = async (userId: string, userName: string, userPhoto: string, actionText: string, moduleName: string, actionType: string, incidentId: string = '') => {
    try {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'notifications'), {
            userId, 
            userName: userName || 'Administrador', 
            userPhoto: userPhoto || '',
            action: actionText, 
            module: moduleName, 
            type: actionType, 
            incidentId,
            timestamp: new Date().toISOString(), 
            readBy: [], 
            deletedBy: []   
        });
    } catch (error) {
        console.error("Error pushing notification", error);
    }
};

export const markNotificationRead = async (notifId: string, userId: string) => {
    try {
        await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'notifications', notifId), { 
            readBy: arrayUnion(userId) 
        }, { merge: true });
    } catch (error) {
        // Fallo silencioso intencional para no interrumpir UX
    }
};