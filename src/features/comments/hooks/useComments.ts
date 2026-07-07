import { updateDocument, deleteDocument, detectMaliciousPayload } from '../../../services/firebase/core.service';
import { logAuditEvent } from '../../../services/firebase/audit.service';

export const useComments = (showToast: any, setConfirmModal: any, logAction: any) => {
    const updateComment = async (id: string, updatedData: any) => {
        if (detectMaliciousPayload(updatedData)) {
            await logAuditEvent(`Bloqueo de Seguridad: Inyección XSS/SQL (Comentarios)`);
            return showToast('Bloqueo de seguridad: Caracteres prohibidos detectados.', true);
        }
        try {
            await updateDocument('comments', id, updatedData, `Editar comentario ID: ${id}`);
            await logAction(`Editó un reporte de comentarios`, 'Comentarios', 'edit', id);
            showToast('Comentario editado correctamente.');
        } catch (err: any) { showToast(err.code === 'permission-denied' ? 'Permiso denegado.' : 'Acción denegada', true); }
    };

    const deleteComment = (id: string) => {
        setConfirmModal({
            isOpen: true, title: 'Eliminar Reporte', msg: 'Eliminará el reporte de forma permanente. ¿Estás seguro?',
            onConfirm: async () => {
                try {
                    await deleteDocument('comments', id, `Eliminar comentario ID: ${id}`);
                    await logAction(`Eliminó de forma permanente un reporte`, 'Comentarios', 'delete');
                    showToast('Reporte eliminado exitosamente.');
                } catch (err: any) { showToast(err.code === 'permission-denied' ? 'Bloqueo: Privilegios insuficientes.' : 'Acción denegada', true); }
            }
        });
    };

    return { updateComment, deleteComment };
};