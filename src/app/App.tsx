import React, { useState, useEffect } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db, appId } from '../services/firebase/config';

// 🔌 Hooks de Dominio y UI (Rutas actualizadas a FSD)
import { useTheme } from './providers/ThemeProvider';
import { useAuthSession } from '../features/auth/hooks/useAuthSession';
import { useGlobalEvents } from '../features/notifications/hooks/useGlobalEvents';
import { useUsersManager } from '../features/users/hooks/useUsersManager';
import { useIncidents } from '../features/incidents/hooks/useIncidents';
import { useRRSS } from '../features/rrss/hooks/useRRSS';
import { useComments } from '../features/comments/hooks/useComments';

// 🏗️ Arquitectura Core
import { AppRouter } from './routes';
import { MainLayout } from '../shared/components/Layout/MainLayout';

export default function App() {
    const { isDarkMode, toggleTheme } = useTheme();

    // 1️⃣ ESTADOS UI GLOBALES
    const [currentView, setCurrentView] = useState(() => localStorage.getItem('innova_current_view') || 'dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false); 
    const [notifMenuOpen, setNotifMenuOpen] = useState(false);
    const [notifTab, setNotifTab] = useState('unread');
    const [toast, setToast] = useState<any>(null);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState<any>({ isOpen: false, title: '', msg: '', onConfirm: null });
    const [previewModal, setPreviewModal] = useState<{isOpen: boolean, type: string, data: any}>({isOpen: false, type: '', data: null});

    // 2️⃣ FUNCIONES DE SOPORTE UI
    const showToast = (msg: string, isError = false) => {
        setToast({ msg, isError });
        setTimeout(() => setToast(null), 4000);
    };

    const dummySetDetailModalOpen = () => {}; // Los componentes manejan su propio modal de detalle

    // 3️⃣ INYECCIÓN DE DEPENDENCIAS (Feature Hooks)
    const { 
        user, isAdmin, userRole, cloudStatus, loginWithGoogle, logoutAdmin, userPrefs, updateUserPrefs, prefsRef 
    } = useAuthSession(showToast, setLoginModalOpen);
    
    const { 
        checklistState, setChecklistState, notifications, logAction, markAsRead, hideNotification, deleteNotification 
    } = useGlobalEvents(user, prefsRef, showToast);
    
    const { 
        appUsers, updateUserRole, toggleUserStatus, deleteUserRecord, addManualUser 
    } = useUsersManager(user, userRole, showToast, setConfirmModal);
    
    // 4️⃣ DOMINIOS CRUD SEPARADOS
    const { 
        toggleIncidentStatus, updateIncident, deleteIncident 
    } = useIncidents(showToast, setConfirmModal, dummySetDetailModalOpen, logAction);
    
    const { 
        updateRrssIncident, deleteRrssIncident 
    } = useRRSS(showToast, setConfirmModal, logAction);
    
    const { 
        updateComment, deleteComment 
    } = useComments(showToast, setConfirmModal, logAction);

    // 🛡️ MOTOR DE ENRUTAMIENTO Y RBAC (Control de Acceso Basado en Roles)
    const navigate = async (view: string) => {
        const adminViews = ['nuevo', 'checklist', 'nuevo-rss', 'nuevo-comentario', 'gestion-usuarios', 'backups', 'auditoria'];
        const loggedInViews = [...adminViews, 'changelog'];
        
        if (loggedInViews.includes(view) && !isAdmin) {
            showToast('Debes iniciar sesión para acceder a esta sección.', true);
            setLoginModalOpen(true);
            return;
        }

        if ((view === 'backups' || view === 'auditoria') && userRole !== 'ADMIN_IT') {
            const { logAuditEvent } = await import('../services/firebase/audit.service');
            await logAuditEvent(`Violación RBAC: Acceso restringido (/${view})`);
            showToast('Acceso denegado. Este módulo es exclusivo para el Administrador de IT.', true);
            return;
        }

        if (view === 'gestion-usuarios' && userRole !== 'ADMIN_IT' && userRole !== 'ADMIN_CM') {
            showToast('Acceso denegado. Tu rol no cuenta con permisos para gestionar usuarios.', true);
            return;
        }

        setCurrentView(view); 
        localStorage.setItem('innova_current_view', view); 
        setSidebarOpen(false);
    };

    useEffect(() => {
        if (cloudStatus === 'Conectando...') return;
        if (!user && !isAdmin) {
            const publicViews = ['dashboard', 'protocolo', 'historial', 'glosario', 'protocolo-rss', 'historial-rss', 'historial-comentario', 'roles', 'config', 'ayuda'];
            if (!publicViews.includes(currentView)) {
                setCurrentView('dashboard');
                localStorage.setItem('innova_current_view', 'dashboard');
            }
        }
    }, [user, isAdmin, currentView, cloudStatus]);

    // 🔔 Lógica de Notificaciones
    useEffect(() => {
        const handleClickOutside = (e: any) => {
            if (!e.target.closest('.notif-container')) setNotifMenuOpen(false);
            if (!e.target.closest('.profile-container')) setProfileMenuOpen(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const validNotifications = notifications.filter((n: any) => n.userId !== user?.uid && !(n.deletedBy && n.deletedBy.includes(user?.uid)));
    const unreadNotifications = validNotifications.filter((n: any) => !(n.readBy && n.readBy.includes(user?.uid)));
    const readNotifications = validNotifications.filter((n: any) => (n.readBy && n.readBy.includes(user?.uid)));

    const handleViewIncident = async (n: any) => {
        setNotifMenuOpen(false);
        try {
            let colName = n.module === 'Hackeos' ? 'incidents' : n.module === 'Incidencia RRSS' ? 'rrss_incidents' : n.module === 'Comentarios' ? 'comments' : '';
            if (!colName) return;
            const docSnap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', colName, n.incidentId));
            
            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() };
                if (colName === 'incidents') { navigate('historial'); showToast('Apertura rápida. Busca el incidente en la lista superior.'); } 
                else if (colName === 'rrss_incidents') setPreviewModal({isOpen: true, type: 'rrss', data});
                else setPreviewModal({isOpen: true, type: 'comment', data});
            } else { showToast('El registro ya no existe o fue eliminado', true); }
        } catch(e) { showToast('Error al obtener el registro del servidor', true); }
    };

    const displayRoleName = userRole === 'ADMIN_IT' ? 'Administrador IT' : userRole === 'ADMIN_CM' ? 'Administrador CM' : userRole === 'EDITOR_CM' ? 'Editor CM' : 'Administrador';

    // 📦 Propiedades empaquetadas para las vistas (Routing)
    const viewProps = {
        isAdmin, user, userRole, showToast, navigate, logAction, appUsers, checklistState, setChecklistState,
        updateUserRole, toggleUserStatus, deleteUserRecord, addManualUser, isDarkMode, toggleTheme, userPrefs, updateUserPrefs,
        toggleIncidentStatus, updateIncident, deleteIncident, updateRrssIncident, deleteRrssIncident, updateComment, deleteComment
    };

    return (
        <MainLayout 
            isDarkMode={isDarkMode} toggleTheme={toggleTheme} currentView={currentView} navigate={navigate}
            sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} profileMenuOpen={profileMenuOpen} setProfileMenuOpen={setProfileMenuOpen}
            notifMenuOpen={notifMenuOpen} setNotifMenuOpen={setNotifMenuOpen} notifTab={notifTab} setNotifTab={setNotifTab}
            toast={toast} loginModalOpen={loginModalOpen} setLoginModalOpen={setLoginModalOpen} confirmModal={confirmModal} setConfirmModal={setConfirmModal}
            previewModal={previewModal} setPreviewModal={setPreviewModal} user={user} isAdmin={isAdmin} userRole={userRole} cloudStatus={cloudStatus} displayRoleName={displayRoleName}
            unreadNotifications={unreadNotifications} readNotifications={readNotifications} validNotifications={validNotifications}
            markAsRead={markAsRead} hideNotification={hideNotification} handleViewIncident={handleViewIncident}
            loginWithGoogle={loginWithGoogle} logoutAdmin={logoutAdmin}
        >
            <AppRouter currentView={currentView} props={viewProps} />
        </MainLayout>
    );
}