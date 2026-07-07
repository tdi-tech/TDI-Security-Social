import { updateDocument, deleteDocument, detectMaliciousPayload } from '../../../services/firebase/core.service';
import { logAuditEvent } from '../../../services/firebase/audit.service';

export const useRRSS = (showToast: any, setConfirmModal: any, logAction: any) => {
    const updateRrssIncident = async (id: string, updatedData: any) => {
        if (detectMaliciousPayload(updatedData)) {
            await logAuditEvent(`Bloqueo de Seguridad: Inyección XSS/SQL (RRSS)`);
            return showToast('Bloqueo de seguridad: Caracteres prohibidos detectados.', true);
        }
        try {
            await updateDocument('rrss_incidents', id, updatedData, `Editar incidente de RRSS ID: ${id}`);
            await logAction(`Editó un caso de reputación`, 'Incidencia RRSS', 'edit', id);
            showToast('Incidente RRSS editado correctamente.');
        } catch (err: any) { showToast(err.code === 'permission-denied' ? 'Permiso denegado.' : 'Acción denegada', true); }
    };

    const deleteRrssIncident = (id: string) => {
        setConfirmModal({
            isOpen: true, title: 'Eliminar Incidente RRSS', msg: 'Eliminará el registro de forma permanente. ¿Seguro?',
            onConfirm: async () => {
                try {
                    await deleteDocument('rrss_incidents', id, `Eliminar incidente RRSS ID: ${id}`);
                    await logAction(`Eliminó permanentemente un caso de crisis`, 'Incidencia RRSS', 'delete');
                    showToast('Registro eliminado exitosamente');
                } catch (err: any) { showToast(err.code === 'permission-denied' ? 'Bloqueo: No tienes permisos de eliminación.' : 'Acción denegada', true); }
            }
        });
    };

    return { updateRrssIncident, deleteRrssIncident };
};