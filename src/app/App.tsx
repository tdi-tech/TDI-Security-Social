import React, { useState, useEffect, useCallback } from 'react';
import { getDoc, doc } from 'firebase/firestore';
import { db, appId } from '../services/firebase/config';

import { useTheme } from './providers/ThemeProvider';
import { useToast } from './providers/ToastProvider';
import { useModals } from './providers/ModalProvider';
import { useAuthSession } from '../features/auth/hooks/useAuthSession';
import { useGlobalEvents } from '../features/notifications/hooks/useGlobalEvents';
import { useUsersManager } from '../features/users/hooks/useUsersManager';
import { useIncidents } from '../features/incidents/hooks/useIncidents';
import { useRRSS } from '../features/rrss/hooks/useRRSS';
import { useComments } from '../features/comments/hooks/useComments';

import { AppRouter, ROUTES } from './routes';
import { MainLayout } from '../shared/components/Layout/MainLayout';
import { LoginModal } from '../shared/components/Modals';

const AppContent = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { showToast } = useToast();
    const { openConfirmModal, openPreviewModal, onNavigateRef } = useModals();

    const [currentView, setCurrentView] = useState(() => localStorage.getItem('innova_current_view') || 'dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false); 
    const [notifMenuOpen, setNotifMenuOpen] = useState(false);
    const [notifTab, setNotifTab] = useState('unread');
    const [loginModalOpen, setLoginModalOpen] = useState(false);

    const { user, isAdmin, userRole, cloudStatus, loginWithGoogle, logoutAdmin, userPrefs, updateUserPrefs, prefsRef } = useAuthSession(showToast, setLoginModalOpen);
    const { checklistState, setChecklistState, notifications, logAction, markAsRead, hideNotification } = useGlobalEvents(user, prefsRef, showToast);
    const { appUsers, updateUserRole, toggleUserStatus, deleteUserRecord, addManualUser } = useUsersManager(user, userRole, showToast, openConfirmModal);
    
    const dummySetDetailModalOpen = () => {}; 
    const { toggleIncidentStatus, updateIncident, deleteIncident } = useIncidents(showToast, openConfirmModal, dummySetDetailModalOpen, logAction);
    const { updateRrssIncident, deleteRrssIncident } = useRRSS(showToast, openConfirmModal, logAction);
    const { updateComment, deleteComment } = useComments(showToast, openConfirmModal, logAction);

    const navigate = useCallback(async (view: string) => {
        const route = ROUTES[view] || ROUTES['dashboard'];
        const access = route.access;

        if (access === 'LOGGED_IN' && !isAdmin) {
            showToast('Debes iniciar sesión para acceder a esta sección.', true);
            return setLoginModalOpen(true);
        }
        if (access === 'ADMIN_IT' && userRole !== 'ADMIN_IT') {
            const { logAuditEvent } = await import('../services/firebase/audit.service');
            await logAuditEvent(`Violación RBAC: Acceso restringido (/${view})`);
            return showToast('Acceso denegado. Exclusivo para Administrador de IT.', true);
        }
        if (access === 'ADMIN_CM_IT' && userRole !== 'ADMIN_IT' && userRole !== 'ADMIN_CM') {
            return showToast('Acceso denegado. Tu rol no tiene permisos.', true);
        }

        setCurrentView(view); 
        localStorage.setItem('innova_current_view', view); 
        setSidebarOpen(false);
    }, [isAdmin, userRole, showToast]); 

    // 🔥 FIX: Cierre de sesión suave, primero navega y luego destruye la sesión
    const handleLogout = useCallback(() => {
        navigate('dashboard');
        setTimeout(() => {
            logoutAdmin();
            showToast('Sesión cerrada correctamente');
        }, 150);
    }, [navigate, logoutAdmin, showToast]);

    useEffect(() => { 
        onNavigateRef.current = navigate; 
    }, [navigate, onNavigateRef]);

    useEffect(() => {
        if (cloudStatus === 'Conectando...') return;
        if (!user && !isAdmin && ROUTES[currentView]?.access !== 'PUBLIC') {
            setCurrentView('dashboard');
            localStorage.setItem('innova_current_view', 'dashboard');
        }
    }, [user, isAdmin, currentView, cloudStatus]);

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
            let colName: any = n.module === 'Hackeos' ? 'incidents' : n.module === 'Incidencia RRSS' ? 'rrss_incidents' : n.module === 'Comentarios' ? 'comments' : '';
            if (!colName) return;
            const docSnap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', colName, n.incidentId));
            
            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() };
                if (colName === 'incidents') { navigate('historial'); showToast('Apertura rápida. Busca en la lista.'); } 
                else if (colName === 'rrss_incidents') openPreviewModal('rrss', data);
                else openPreviewModal('comment', data);
            } else showToast('El registro fue eliminado', true);
        } catch(e) { showToast('Error al conectar con servidor', true); }
    };

    const displayRoleName = userRole === 'ADMIN_IT' ? 'Administrador IT' : userRole === 'ADMIN_CM' ? 'Administrador CM' : userRole === 'EDITOR_CM' ? 'Editor CM' : 'Administrador';

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
            user={user} isAdmin={isAdmin} userRole={userRole} cloudStatus={cloudStatus} displayRoleName={displayRoleName}
            unreadNotifications={unreadNotifications} readNotifications={readNotifications} validNotifications={validNotifications}
            markAsRead={markAsRead} hideNotification={hideNotification} handleViewIncident={handleViewIncident}
            openLoginModal={() => setLoginModalOpen(true)} logoutAdmin={handleLogout}
        >
            <AppRouter currentView={currentView} props={viewProps} />
            <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} onGoogleLogin={loginWithGoogle} />
        </MainLayout>
    );
};

export default AppContent;