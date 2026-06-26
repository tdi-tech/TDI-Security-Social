import React, { useState, useEffect } from 'react';
import { Lock, Menu, CheckCircle2, XCircle, Sun, Moon, LogOut, Hammer, Bell, Trash2, Eye, Users, ChevronRight, X, Megaphone, MessageSquare } from 'lucide-react';
import { getDoc, doc } from 'firebase/firestore';
import { db, appId } from './firebase/config';

// Hooks
import { useTheme } from './hooks/useTheme';
import { useFirebase } from './hooks/useFirebase';

// Componentes
import { Sidebar } from './components/Sidebar';
import { LoginModal, ConfirmModal } from './components/Modals';
import { Inactivity } from './components/Inactivity';

// Vistas
import { StaticProtocoloView, RolesView, GlosarioView, ProtocoloRRSSView } from './views/StaticViews';
import { DashboardView } from './views/DashboardView';
import { ChangelogView } from './views/ChangelogView';
import { HistorialView, ChecklistView, NewIncidentView } from './views/HackViews';
import { AyudaView } from './views/AyudaView';
import { ConfigView } from './views/ConfigView';
import { NewRRSSIncidentView, HistorialRRSSView } from './views/RRSSViews';
import { NewCommentView, HistorialCommentView } from './views/CommentViews';
import { UserManagementView } from './views/UserViews';
import { BackupView } from './views/BackupView';
import { AuditViews } from './views/AuditViews';

export default function App() {
    const { isDarkMode, toggleTheme } = useTheme();

    const [currentView, setCurrentView] = useState(() => {
        return localStorage.getItem('innova_current_view') || 'dashboard';
    });
    
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false); 
    const [notifMenuOpen, setNotifMenuOpen] = useState(false);
    const [notifTab, setNotifTab] = useState('unread');

    const [toast, setToast] = useState<any>(null);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [confirmModal, setConfirmModal] = useState<any>({ isOpen: false, title: '', msg: '', onConfirm: null });

    const [previewModal, setPreviewModal] = useState<{isOpen: boolean, type: string, data: any}>({isOpen: false, type: '', data: null});

    const showToast = (msg: string, isError = false) => {
        setToast({ msg, isError });
        setTimeout(() => setToast(null), 4000);
    };

    const {
        user, isAdmin, cloudStatus, checklistState, setChecklistState,
        loginWithGoogle, logoutAdmin, updateIncident, deleteIncident, toggleIncidentStatus,
        updateRrssIncident, deleteRrssIncident, updateComment, deleteComment,
        notifications, markAsRead, hideNotification, deleteNotification, logAction,
        userRole, appUsers, updateUserRole, toggleUserStatus, deleteUserRecord, addManualUser,
        userPrefs, updateUserPrefs 
    } = useFirebase({
        showToast, setLoginModalOpen, setConfirmModal
    });

    const navigate = (view: string) => {
        const adminViews = ['nuevo', 'checklist', 'nuevo-rss', 'nuevo-comentario', 'gestion-usuarios', 'backups', 'auditoria'];
        const loggedInViews = [...adminViews, 'changelog'];
        
        if (loggedInViews.includes(view) && !isAdmin) {
            showToast('Debes iniciar sesión para acceder a esta sección.', true);
            setLoginModalOpen(true);
            return;
        }

        if ((view === 'backups' || view === 'auditoria') && userRole !== 'ADMIN_IT') {
            showToast('Acceso denegado. Este módulo es exclusivo para el Administrador de IT.', true);
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

    useEffect(() => {
        const handleClickOutside = (e: any) => {
            if (!e.target.closest('.notif-container')) setNotifMenuOpen(false);
            if (!e.target.closest('.profile-container')) setProfileMenuOpen(false);
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const validNotifications = notifications.filter((n: any) => 
        n.userId !== user?.uid && 
        !(n.deletedBy && n.deletedBy.includes(user?.uid))
    );
    const unreadNotifications = validNotifications.filter((n: any) => !(n.readBy && n.readBy.includes(user?.uid)));
    const readNotifications = validNotifications.filter((n: any) => (n.readBy && n.readBy.includes(user?.uid)));

    const handleViewIncident = async (n: any) => {
        setNotifMenuOpen(false);
        try {
            let colName = '';
            if (n.module === 'Hackeos') colName = 'incidents';
            else if (n.module === 'Incidencia RRSS') colName = 'rrss_incidents';
            else if (n.module === 'Comentarios') colName = 'comments';

            if (!colName) return;
            const docSnap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', colName, n.incidentId));
            
            if (docSnap.exists()) {
                const data = { id: docSnap.id, ...docSnap.data() };
                if (colName === 'incidents') {
                     navigate('historial');
                     showToast('Apertura rápida. Busca el incidente en la lista superior.');
                } else if (colName === 'rrss_incidents') {
                     setPreviewModal({isOpen: true, type: 'rrss', data});
                } else {
                     setPreviewModal({isOpen: true, type: 'comment', data});
                }
            } else {
                showToast('El registro ya no existe o fue eliminado', true);
            }
        } catch(e) {
            showToast('Error al obtener el registro del servidor', true);
        }
    };

    const displayRoleName = userRole === 'ADMIN_IT' ? 'Administrador IT' : userRole === 'ADMIN_CM' ? 'Administrador CM' : userRole === 'EDITOR_CM' ? 'Editor CM' : 'Administrador';

    const renderHeaderTitle = () => {
        const baseClass = "text-sm sm:text-xl font-bold flex items-center gap-1.5 sm:gap-2.5 tracking-tight select-none truncate max-w-[160px] sm:max-w-none";
        const parentClass = "hidden sm:inline theme-text-muted opacity-80 font-semibold";
        const separatorClass = "hidden sm:inline text-gray-600 font-light text-lg";
        const childClass = "theme-text-main font-bold truncate";

        switch (currentView) {
            case 'dashboard': return <h1 className="text-base sm:text-xl font-bold theme-text-main tracking-tight">Dashboard</h1>;
            case 'gestion-usuarios': return <h1 className="text-base sm:text-xl font-bold theme-text-main tracking-tight">Gestión de Usuarios</h1>;
            case 'protocolo': return <div className={baseClass}><span className={parentClass}>Hackeos</span><span className={separatorClass}>/</span><span className={childClass}>Protocolo</span></div>;
            case 'nuevo': return <div className={baseClass}><span className={parentClass}>Hackeos</span><span className={separatorClass}>/</span><span className={childClass}>Crear incidente</span></div>;
            case 'checklist': return <div className={baseClass}><span className={parentClass}>Hackeos</span><span className={separatorClass}>/</span><span className={childClass}>Checklist Rápido</span></div>;
            case 'historial': return <div className={baseClass}><span className={parentClass}>Hackeos</span><span className={separatorClass}>/</span><span className={childClass}>Historial</span></div>;
            case 'glosario': return <div className={baseClass}><span className={parentClass}>Hackeos</span><span className={separatorClass}>/</span><span className={childClass}>Glosario</span></div>;
            case 'protocolo-rss': return <div className={baseClass}><span className={parentClass}>Incidencias RRSS</span><span className={separatorClass}>/</span><span className={childClass}>Protocolo</span></div>;
            case 'nuevo-rss': return <div className={baseClass}><span className={parentClass}>Incidencias RRSS</span><span className={separatorClass}>/</span><span className={childClass}>Crear incidente</span></div>;
            case 'historial-rss': return <div className={baseClass}><span className={parentClass}>Incidencias RRSS</span><span className={separatorClass}>/</span><span className={childClass}>Historial</span></div>;
            case 'nuevo-comentario': return <div className={baseClass}><span className={parentClass}>Comentarios</span><span className={separatorClass}>/</span><span className={childClass}>Capturar comentarios</span></div>;
            case 'historial-comentario': return <div className={baseClass}><span className={parentClass}>Comentarios</span><span className={separatorClass}>/</span><span className={childClass}>Historial</span></div>;
            case 'roles': return <h1 className="text-base sm:text-xl font-bold theme-text-main tracking-tight">Roles</h1>;
            case 'changelog': return <h1 className="text-base sm:text-xl font-bold theme-text-main tracking-tight">Changelog</h1>;
            case 'backups': return <h1 className="text-base sm:text-xl font-bold theme-text-main tracking-tight">Copias de Seguridad Core</h1>;
            case 'auditoria': return <h1 className="text-base sm:text-xl font-bold theme-text-main tracking-tight">Auditoría Avanzada</h1>;
            case 'config': return <h1 className="text-base sm:text-xl font-bold theme-text-main tracking-tight">Configuración</h1>;
            case 'ayuda': return <h1 className="text-base sm:text-xl font-bold theme-text-main tracking-tight">Ayuda</h1>;
            default: return <h1 className="text-base sm:text-xl font-bold theme-text-main tracking-tight capitalize truncate">{currentView.replace(/-/g, ' ')}</h1>;
        }
    };

    return (
        <div className={`h-screen print:h-auto print:block flex relative font-sans transition-colors duration-300 ${isAdmin ? 'is-admin' : ''}`}>

            {((user && user.email) || isAdmin) && <Inactivity onLogout={logoutAdmin} />}

            <div className="fixed top-5 right-5 z-[70] flex flex-col gap-2 no-print">
                {toast && (
                    <div className={`p-4 rounded-xl shadow-lg flex items-center gap-3 transition-all ${toast.isError ? 'bg-[var(--error)] text-white' : 'theme-bg-container theme-border border theme-text-main'}`}>
                        {toast.isError ? <XCircle className="w-5 h-5"/> : <CheckCircle2 className={`w-5 h-5 text-[var(--success)]`}/>}
                        <p className="text-sm font-medium">{toast.msg}</p>
                    </div>
                )}
            </div>

            <Sidebar
                sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
                currentView={currentView} navigate={navigate}
                isAdmin={isAdmin} cloudStatus={cloudStatus}
                userRole={userRole}
            />

            <main className="flex-1 print:block flex flex-col h-full print:h-auto relative overflow-x-hidden print:overflow-visible w-full bg-[var(--surface)]">

                <header className="h-16 border-b theme-border theme-bg-container flex items-center justify-between px-4 sm:px-6 no-print shadow-sm z-10">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 theme-text-muted hover:theme-text-main rounded-lg"><Menu className="w-6 h-6"/></button>
                        <div className="flex items-center">{renderHeaderTitle()}</div>
                    </div>
                    
                    <div className="flex items-center gap-1 sm:gap-4">
                        {isAdmin && (
                            <div className="relative notif-container">
                                <button onClick={() => setNotifMenuOpen(!notifMenuOpen)} className="p-2 theme-text-muted hover:theme-text-main rounded-lg transition-colors relative" title="Notificaciones">
                                    <Bell className="w-5 h-5"/>
                                    {unreadNotifications.length > 0 && <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--surface)] animate-pulse"></span>}
                                </button>
                                {notifMenuOpen && (
                                    <div className="fixed sm:absolute left-4 sm:left-auto right-4 sm:right-0 inset-x-4 sm:inset-x-auto mt-3 w-auto sm:w-80 theme-bg-container border theme-border rounded-xl shadow-2xl z-50 fade-in flex flex-col max-h-[500px] sm:max-h-[450px]">
                                        <div className="p-4 border-b theme-border flex items-center justify-between bg-[var(--primary)]/5">
                                            <h3 className="font-bold theme-text-main">Actividad Reciente</h3>
                                            <span className="text-xs font-bold theme-text-muted bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg">{validNotifications.length}</span>
                                        </div>
                                        <div className="flex items-center border-b theme-border bg-[var(--surface)]">
                                            <button onClick={(e) => { e.stopPropagation(); setNotifTab('unread'); }} className={`flex-1 py-2 text-xs font-bold text-center transition-colors ${notifTab === 'unread' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'theme-text-muted hover:theme-text-main'}`}>
                                                Nuevas ({unreadNotifications.length})
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); setNotifTab('read'); }} className={`flex-1 py-2 text-xs font-bold text-center transition-colors ${notifTab === 'read' ? 'text-[var(--primary)] border-b-2 border-[var(--primary)]' : 'theme-text-muted hover:theme-text-main'}`}>
                                                Leídas ({readNotifications.length})
                                            </button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                                            {notifTab === 'unread' && unreadNotifications.length === 0 && <p className="text-center text-xs theme-text-muted py-8">No hay notificaciones nuevas.</p>}
                                            {notifTab === 'read' && readNotifications.length === 0 && <p className="text-center text-xs theme-text-muted py-8">No tienes notificaciones leídas.</p>}

                                            {(notifTab === 'unread' ? unreadNotifications : readNotifications).map((n: any) => (
                                                <div key={n.id} className="p-3 theme-bg-low rounded-xl border theme-border mb-2 flex flex-col relative group shadow-sm">
                                                    <div className="flex items-start gap-3">
                                                        {n.userPhoto ? (
                                                            <img src={n.userPhoto} alt="User" className="w-8 h-8 rounded-full flex-shrink-0 border theme-border" />
                                                        ) : (
                                                            <div className="w-8 h-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-xs flex-shrink-0">{n.userName?.charAt(0) || 'A'}</div>
                                                        )}
                                                        <div className="flex-1 min-w-0 pr-6">
                                                            <p className="text-xs font-bold theme-text-main truncate">{n.userName}</p>
                                                            <p className="text-xs theme-text-muted mt-0.5 leading-relaxed">{n.action}</p>
                                                            <div className="flex items-center gap-2 mt-1.5">
                                                                <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--primary)] bg-[var(--primary)]/10 px-1.5 py-0.5 rounded">{n.module}</span>
                                                                <span className="text-[9px] font-medium theme-text-muted">{new Date(n.timestamp).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-3 flex items-center gap-2 pl-11">
                                                        {notifTab === 'unread' && (
                                                            <button onClick={(e) => { e.stopPropagation(); markAsRead(n.id); }} className="text-[10px] font-bold bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-1.5 rounded-lg hover:bg-[var(--primary)]/20 transition-colors flex items-center gap-1">
                                                                <CheckCircle2 className="w-3 h-3"/> Marcar leído
                                                            </button>
                                                        )}
                                                        {(n.type === 'create' || n.type === 'edit') && n.incidentId && (
                                                            <button onClick={(e) => { e.stopPropagation(); handleViewIncident(n); }} className="text-[10px] font-bold bg-slate-500/10 theme-text-main px-2 py-1.5 rounded-lg hover:bg-slate-500/20 transition-colors flex items-center gap-1">
                                                                <Eye className="w-3 h-3"/> Ver Incidente
                                                            </button>
                                                        )}
                                                    </div>
                                                    {notifTab === 'read' && (
                                                        <button onClick={(e) => { e.stopPropagation(); hideNotification(n.id); }} className="absolute top-3 right-3 p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100" title="Eliminar">
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        
                        <button onClick={toggleTheme} className="p-1 sm:p-2 theme-text-muted hover:theme-text-main rounded-lg transition-colors" title="Cambiar Tema">
                            {isDarkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
                        </button>
                        
                        {isAdmin ? (
                            <div className="flex items-center gap-1.5 sm:gap-3 pl-1 relative profile-container">
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold theme-text-main leading-none">{user?.displayName}</p>
                                    <p className="text-[10px] theme-text-muted uppercase font-bold mt-1 tracking-wider">{displayRoleName}</p>
                                </div>
                                <div className="relative">
                                    {user?.photoURL ? (
                                        <img src={user.photoURL} alt="Perfil" referrerPolicy="no-referrer" className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-[2px] sm:border-[3px] border-[var(--primary)] shadow-sm cursor-pointer hover:scale-105 transition-transform" onClick={() => setProfileMenuOpen(!profileMenuOpen)} />
                                    ) : (
                                        <button onClick={() => setProfileMenuOpen(!profileMenuOpen)} className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--primary)] hover:brightness-110 flex items-center justify-center text-white font-bold text-xs sm:text-sm cursor-pointer hover:scale-105 transition-transform">{user?.displayName?.charAt(0) || 'A'}</button>
                                    )}
                                    {profileMenuOpen && (
                                        <div className="absolute right-0 mt-3 w-52 sm:w-56 theme-bg-container border theme-border rounded-xl shadow-2xl py-2 z-50 fade-in">
                                            <div className="px-4 py-3 border-b theme-border sm:hidden"><p className="text-sm font-bold theme-text-main truncate">{user?.displayName}</p><p className="text-xs theme-text-muted mt-0.5">{displayRoleName}</p></div>
                                            
                                            {(userRole === 'ADMIN_IT' || userRole === 'ADMIN_CM') && (
                                                <>
                                                    <button onClick={() => { navigate('gestion-usuarios'); setProfileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm font-medium theme-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-3">
                                                        <Users className="w-4 h-4 text-blue-500" /> Gestionar Usuarios
                                                    </button>
                                                    <div className="border-t theme-border my-1"></div>
                                                </>
                                            )}

                                            <button onClick={logoutAdmin} className="w-full text-left px-4 py-3 text-sm font-medium text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors flex items-center gap-3"><LogOut className="w-4 h-4" /> Cerrar Sesión</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setLoginModalOpen(true)} className={`px-2.5 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-bold rounded-lg transition-all shadow-sm flex items-center gap-1.5 bg-[var(--primary)] text-white hover:brightness-110`}><Lock className="w-3.5 h-3.5"/><span className="hidden xs:inline sm:inline">Entrar</span></button>
                        )}
                    </div>
                </header>

                <div id="main-content" className="flex-1 print:block overflow-y-auto print:overflow-visible p-4 sm:p-8 print:p-0 w-full">
                    {currentView === 'dashboard' && <DashboardView isAdmin={isAdmin} navigate={navigate} showToast={showToast} toggleIncidentStatus={toggleIncidentStatus} updateIncident={updateIncident} deleteIncident={deleteIncident} />}
                    {currentView === 'protocolo' && <StaticProtocoloView />}
                    {currentView === 'nuevo' && <NewIncidentView isAdmin={isAdmin} user={user} showToast={showToast} navigate={navigate} logAction={logAction} />}
                    {currentView === 'historial' && <HistorialView showToast={showToast} isAdmin={isAdmin} />}
                    {currentView === 'checklist' && <ChecklistView checklistState={checklistState} setChecklistState={setChecklistState} isAdmin={isAdmin} showToast={showToast} setConfirmModal={setConfirmModal} />}
                    {currentView === 'roles' && <RolesView />}
                    {currentView === 'changelog' && <ChangelogView />}
                    {currentView === 'glosario' && <GlosarioView />}
                    {currentView === 'ayuda' && <AyudaView isAdmin={isAdmin} />}
                    
                    {currentView === 'config' && (
                        <ConfigView 
                            isDarkMode={isDarkMode} toggleTheme={toggleTheme} userRole={userRole} 
                            userPrefs={userPrefs} updateUserPrefs={updateUserPrefs} showToast={showToast}
                        />
                    )}
                    
                    {currentView === 'gestion-usuarios' && <UserManagementView appUsers={appUsers} userRole={userRole} updateUserRole={updateUserRole} toggleUserStatus={toggleUserStatus} deleteUserRecord={deleteUserRecord} addManualUser={addManualUser} />}

                    {currentView === 'backups' && userRole === 'ADMIN_IT' && (
                        <BackupView showToast={showToast} />
                    )}

                    {currentView === 'auditoria' && userRole === 'ADMIN_IT' && (
                        <AuditViews />
                    )}

                    {currentView === 'protocolo-rss' && <ProtocoloRRSSView />}
                    {currentView === 'nuevo-rss' && <NewRRSSIncidentView isAdmin={isAdmin} user={user} showToast={showToast} navigate={navigate} logAction={logAction} />}
                    {currentView === 'historial-rss' && <HistorialRRSSView showToast={showToast} isAdmin={isAdmin} updateRrssIncident={updateRrssIncident} deleteRrssIncident={deleteRrssIncident} />}
                    {currentView === 'nuevo-comentario' && <NewCommentView isAdmin={isAdmin} user={user} showToast={showToast} navigate={navigate} logAction={logAction} />}
                    {currentView === 'historial-comentario' && <HistorialCommentView showToast={showToast} isAdmin={isAdmin} updateComment={updateComment} deleteComment={deleteComment} />}
                </div>
            </main>

            {previewModal.isOpen && previewModal.data && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 fade-in">
                    <div className="theme-bg-container rounded-2xl w-full max-w-md shadow-2xl border theme-border flex flex-col">
                        <div className={`p-4 border-b theme-border flex justify-between items-center ${previewModal.type === 'rrss' ? 'bg-orange-500/5' : 'bg-blue-500/5'}`}>
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${previewModal.type === 'rrss' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                    {previewModal.type === 'rrss' ? <Megaphone className="w-5 h-5"/> : <MessageSquare className="w-5 h-5"/>}
                                </div>
                                <div><h3 className="font-bold theme-text-main">Vista Rápida</h3><p className="text-[10px] theme-text-muted font-medium uppercase tracking-wider">{previewModal.type === 'rrss' ? 'Incidencia RRSS' : 'Comentarios'}</p></div>
                            </div>
                            <button onClick={() => setPreviewModal({isOpen: false, type: '', data: null})} className="p-1.5 theme-text-muted hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="p-5 space-y-4">
                            {previewModal.type === 'rrss' ? (
                                <>
                                    <div className="flex justify-between items-start">
                                        <div><p className="text-xs theme-text-muted font-bold mb-1">Medio Afectado</p><p className="text-lg font-bold theme-text-main text-orange-500">{previewModal.data.medio}</p></div>
                                        <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase ${previewModal.data.estado === 'Resuelto' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>{previewModal.data.estado}</span>
                                    </div>
                                    <div className="p-3 theme-bg-low rounded-xl border theme-border"><p className="text-sm theme-text-main font-medium"><span className="font-bold">{previewModal.data.usuario}:</span> {previewModal.data.descripcion}</p></div>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div><span className="text-xs theme-text-muted block mb-0.5">Riesgo</span><span className="font-bold theme-text-main">{previewModal.data.riesgo}</span></div>
                                        <div><span className="text-xs theme-text-muted block mb-0.5">Campus</span><span className="font-bold theme-text-main">{previewModal.data.campus}</span></div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start">
                                        <div><p className="text-xs theme-text-muted font-bold mb-1">Periodo del Reporte</p><p className="text-base font-bold theme-text-main text-blue-500">{previewModal.data.fechaInicio} <span className="text-sm font-medium theme-text-muted">al</span> {previewModal.data.fechaFin}</p></div>
                                        <span className="px-2 py-1 text-[10px] font-bold rounded-md uppercase bg-blue-500/10 text-blue-500">{previewModal.data.contenido}</span>
                                    </div>
                                    <div className="p-3 theme-bg-low rounded-xl border theme-border"><p className="text-sm theme-text-main font-medium">Contiene <span className="font-bold text-blue-500">{previewModal.data.comentariosList?.length || 1}</span> comentario(s) registrado(s).</p></div>
                                </>
                            )}
                        </div>
                        <div className="p-4 border-t theme-border flex gap-3">
                            <button onClick={() => { setPreviewModal({isOpen: false, type: '', data: null}); navigate(previewModal.type === 'rrss' ? 'historial-rss' : 'historial-comentario'); }} className={`w-full py-2.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 ${previewModal.type === 'rrss' ? 'bg-orange-600' : 'bg-blue-600'}`}>
                                Ver historial completo <ChevronRight className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div id="print-header" className="hidden text-black font-bold text-2xl">Reporte: Innova Management</div>

            <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} onGoogleLogin={loginWithGoogle} />
            <ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} msg={confirmModal.msg} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} onConfirm={() => { confirmModal.onConfirm(); setConfirmModal({ ...confirmModal, isOpen: false }); }} />
        </div>
    );
}