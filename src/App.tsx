import React, { useState, useEffect } from 'react';
import { Lock, Menu, CheckCircle2, XCircle, Sun, Moon, Plus, LogOut, Hammer } from 'lucide-react';

// Hooks
import { useTheme } from './hooks/useTheme';
import { useFirebase } from './hooks/useFirebase';

// Componentes
import { Sidebar } from './components/Sidebar';
import { LoginModal, ConfirmModal } from './components/Modals';

// Vistas Estáticas
import { StaticProtocoloView, RolesView, GlosarioView, ProtocoloRRSSView } from './views/StaticViews';
import { DashboardView } from './views/DashboardView';

// Nueva Vista de Changelog
import { ChangelogView } from './views/ChangelogView';

// Vistas de Hackeos
import { HistorialView, ChecklistView, NewIncidentView, DetailModal, EditIncidentModal } from './views/HackViews';

// Vistas Modularizadas
import { AyudaView } from './views/AyudaView';
import { ConfigView } from './views/ConfigView';

// Vistas RRSS
import { NewRRSSIncidentView, HistorialRRSSView } from './views/RRSSViews';

// Vistas de Comentarios
import { NewCommentView, HistorialCommentView } from './views/CommentViews';

// Componente Placeholder (En construcción)
const PlaceholderView = ({ title }: { title: string }) => (
    <div className="fade-in h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-full flex items-center justify-center mb-6">
            <Hammer className="w-10 h-10 text-[var(--primary)]" />
        </div>
        <h2 className="text-3xl font-bold theme-text-main mb-3">{title}</h2>
        <p className="theme-text-muted max-w-md">
            Esta sección está siendo desarrollada. Pronto podrás gestionar y administrar este apartado directamente desde aquí.
        </p>
    </div>
);

export default function App() {
    const { isDarkMode, toggleTheme } = useTheme();

    const [currentView, setCurrentView] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileMenuOpen, setProfileMenuOpen] = useState(false); 

    const [toast, setToast] = useState<any>(null);
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
    const [confirmModal, setConfirmModal] = useState<any>({ isOpen: false, title: '', msg: '', onConfirm: null });

    const showToast = (msg: string, isError = false) => {
        setToast({ msg, isError });
        setTimeout(() => setToast(null), 4000);
    };

    const {
        user, isAdmin, cloudStatus, incidents, rrssIncidents, checklistState, setChecklistState,
        loginWithGoogle, logoutAdmin, toggleIncidentStatus, updateIncident, deleteIncident,
        updateRrssIncident, deleteRrssIncident,
        comments, updateComment, deleteComment
    } = useFirebase({
        showToast, setLoginModalOpen, setDetailModalOpen, setConfirmModal
    });

    const navigate = (view: string) => {
        if ((view === 'nuevo' || view === 'checklist' || view === 'nuevo-rss' || view === 'nuevo-comentario') && !isAdmin) {
            showToast('Debes ser Admin para acceder a esta sección.', true);
            setLoginModalOpen(true);
            return;
        }
        setCurrentView(view); 
        setSidebarOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = () => setProfileMenuOpen(false);
        if (profileMenuOpen) {
            document.addEventListener('click', handleClickOutside);
        }
        return () => document.removeEventListener('click', handleClickOutside);
    }, [profileMenuOpen]);

    // ========================================================
    // REESTRUCTURACIÓN DE MIGA DE PAN (BREADCRUMBS) PREMIUM
    // ========================================================
    const renderHeaderTitle = () => {
        const baseClass = "text-xl font-bold flex items-center gap-2.5 tracking-tight select-none";
        const parentClass = "theme-text-muted opacity-80 font-semibold";
        const separatorClass = "text-gray-600 font-light text-lg";
        const childClass = "theme-text-main font-bold";

        switch (currentView) {
            case 'dashboard':
                return <h1 className="text-xl font-bold theme-text-main tracking-tight">Dashboard</h1>;
            
            // Grupo Hackeos
            case 'protocolo':
                return (
                    <div className={baseClass}>
                        <span className={parentClass}>Hackeos</span>
                        <span className={separatorClass}>/</span>
                        <span className={childClass}>Protocolo</span>
                    </div>
                );
            case 'nuevo':
                return (
                    <div className={baseClass}>
                        <span className={parentClass}>Hackeos</span>
                        <span className={separatorClass}>/</span>
                        <span className={childClass}>Crear incidente</span>
                    </div>
                );
            case 'checklist':
                return (
                    <div className={baseClass}>
                        <span className={parentClass}>Hackeos</span>
                        <span className={separatorClass}>/</span>
                        <span className={childClass}>Checklist Rápido</span>
                    </div>
                );
            case 'historial':
                return (
                    <div className={baseClass}>
                        <span className={parentClass}>Hackeos</span>
                        <span className={separatorClass}>/</span>
                        <span className={childClass}>Historial</span>
                    </div>
                );
            case 'glosario':
                return (
                    <div className={baseClass}>
                        <span className={parentClass}>Hackeos</span>
                        <span className={separatorClass}>/</span>
                        <span className={childClass}>Glosario</span>
                    </div>
                );

            // Grupo Incidencias RRSS
            case 'protocolo-rss':
                return (
                    <div className={baseClass}>
                        <span className={parentClass}>Incidencias RRSS</span>
                        <span className={separatorClass}>/</span>
                        <span className={childClass}>Protocolo</span>
                    </div>
                );
            case 'nuevo-rss':
                return (
                    <div className={baseClass}>
                        <span className={parentClass}>Incidencias RRSS</span>
                        <span className={separatorClass}>/</span>
                        <span className={childClass}>Crear incidente</span>
                    </div>
                );
            case 'historial-rss':
                return (
                    <div className={baseClass}>
                        <span className={parentClass}>Incidencias RRSS</span>
                        <span className={separatorClass}>/</span>
                        <span className={childClass}>Historial</span>
                    </div>
                );

            // Grupo Comentarios
            case 'nuevo-comentario':
                return (
                    <div className={baseClass}>
                        <span className={parentClass}>Comentarios</span>
                        <span className={separatorClass}>/</span>
                        <span className={childClass}>Capturar comentarios</span>
                    </div>
                );
            case 'historial-comentario':
                return (
                    <div className={baseClass}>
                        <span className={parentClass}>Comentarios</span>
                        <span className={separatorClass}>/</span>
                        <span className={childClass}>Historial</span>
                    </div>
                );

            // Vistas Sueltas
            case 'roles':
                return <h1 className="text-xl font-bold theme-text-main tracking-tight">Roles</h1>;
            case 'changelog':
                return <h1 className="text-xl font-bold theme-text-main tracking-tight">Changelog</h1>;
            case 'config':
                return <h1 className="text-xl font-bold theme-text-main tracking-tight">Configuración</h1>;
            case 'ayuda':
                return <h1 className="text-xl font-bold theme-text-main tracking-tight">Ayuda</h1>;

            default:
                return <h1 className="text-xl font-bold theme-text-main tracking-tight capitalize">{currentView.replace(/-/g, ' ')}</h1>;
        }
    };

    return (
        <div className={`h-screen print:h-auto print:block flex relative font-sans transition-colors duration-300 ${isAdmin ? 'is-admin' : ''}`}>

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
            />

            <main className="flex-1 print:block flex flex-col h-full print:h-auto relative overflow-x-hidden print:overflow-visible w-full bg-[var(--surface)]">

                <header className="h-16 border-b theme-border theme-bg-container flex items-center justify-between px-4 sm:px-6 no-print shadow-sm z-10">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 -ml-2 theme-text-muted hover:theme-text-main rounded-lg"><Menu className="w-6 h-6"/></button>
                        <div className="flex items-center">
                            {renderHeaderTitle()}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                        <button onClick={toggleTheme} className="p-2 theme-text-muted hover:theme-text-main rounded-lg transition-colors" title="Cambiar Tema">
                            {isDarkMode ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}
                        </button>
                        
                        {isAdmin ? (
                            <div className="flex items-center gap-3 pl-2 relative" onClick={(e) => e.stopPropagation()}>
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold theme-text-main leading-none">{user?.displayName}</p>
                                    <p className="text-[10px] theme-text-muted uppercase font-bold mt-1 tracking-wider">Administrador</p>
                                </div>
                                
                                <div className="relative">
                                    {user?.photoURL ? (
                                        <img 
                                            src={user.photoURL} 
                                            alt="Perfil" 
                                            referrerPolicy="no-referrer"
                                            title="Menú de cuenta"
                                            className="w-10 h-10 rounded-full border-[3px] border-[var(--primary)] shadow-sm cursor-pointer hover:scale-105 transition-transform" 
                                            onClick={() => setProfileMenuOpen(!profileMenuOpen)} 
                                        />
                                    ) : (
                                        <button 
                                            onClick={() => setProfileMenuOpen(!profileMenuOpen)} 
                                            title="Menú de cuenta"
                                            className="w-10 h-10 rounded-full bg-[var(--primary)] hover:brightness-110 flex items-center justify-center text-white font-bold cursor-pointer hover:scale-105 transition-transform"
                                        >
                                            {user?.displayName?.charAt(0) || 'A'}
                                        </button>
                                    )}

                                    {profileMenuOpen && (
                                        <div className="absolute right-0 mt-3 w-48 theme-bg-container border theme-border rounded-xl shadow-2xl py-2 z-50 fade-in">
                                            <div className="px-4 py-3 border-b theme-border sm:hidden">
                                                <p className="text-sm font-bold theme-text-main truncate">{user?.displayName}</p>
                                                <p className="text-xs theme-text-muted mt-0.5">Administrador</p>
                                            </div>
                                            <button 
                                                onClick={logoutAdmin}
                                                className="w-full text-left px-4 py-3 text-sm font-medium text-[var(--error)] hover:bg-[var(--error)]/10 transition-colors flex items-center gap-3"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Cerrar Sesión
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setLoginModalOpen(true)} className={`px-4 py-2 text-sm font-bold rounded-lg transition-all shadow-sm flex items-center gap-2 bg-[var(--primary)] text-white hover:brightness-110`}>
                                <Lock className="w-4 h-4"/>
                                <span className="hidden sm:inline">Entrar como Admin</span>
                            </button>
                        )}
                    </div>
                </header>

                <div id="print-header" className="hidden text-black font-bold text-2xl">Reporte: Innova Social</div>

                <div id="main-content" className="flex-1 print:block overflow-y-auto print:overflow-visible p-4 sm:p-8 print:p-0 w-full">
                    {currentView === 'dashboard' && <DashboardView incidents={incidents} rrssIncidents={rrssIncidents} comments={comments} isAdmin={isAdmin} navigate={navigate} setSelectedIncidentId={setSelectedIncidentId} setDetailModalOpen={setDetailModalOpen} />}
                    
                    {currentView === 'protocolo' && <StaticProtocoloView />}
                    {currentView === 'nuevo' && <NewIncidentView isAdmin={isAdmin} user={user} showToast={showToast} navigate={navigate} />}
                    {currentView === 'historial' && <HistorialView incidents={incidents} showToast={showToast} setSelectedIncidentId={setSelectedIncidentId} setDetailModalOpen={setDetailModalOpen} isAdmin={isAdmin} />}
                    {currentView === 'checklist' && <ChecklistView checklistState={checklistState} setChecklistState={setChecklistState} isAdmin={isAdmin} showToast={showToast} setConfirmModal={setConfirmModal} />}
                    
                    {/* VISTAS GENERALES */}
                    {currentView === 'roles' && <RolesView />}
                    {currentView === 'changelog' && <ChangelogView />}
                    {currentView === 'glosario' && <GlosarioView />}
                    {currentView === 'ayuda' && <AyudaView isAdmin={isAdmin} />}
                    {currentView === 'config' && <ConfigView isDarkMode={isDarkMode} toggleTheme={toggleTheme} incidents={incidents} checklistState={checklistState} showToast={showToast} isAdmin={isAdmin} />}
                    
                    {/* VISTAS DE RRSS */}
                    {currentView === 'protocolo-rss' && <ProtocoloRRSSView />}
                    {currentView === 'nuevo-rss' && <NewRRSSIncidentView isAdmin={isAdmin} user={user} showToast={showToast} navigate={navigate} />}
                    {currentView === 'historial-rss' && <HistorialRRSSView rrssIncidents={rrssIncidents} showToast={showToast} isAdmin={isAdmin} updateRrssIncident={updateRrssIncident} deleteRrssIncident={deleteRrssIncident} />}

                    {/* NUEVAS VISTAS DE COMENTARIOS CONECTADAS */}
                    {currentView === 'nuevo-comentario' && <NewCommentView isAdmin={isAdmin} user={user} showToast={showToast} navigate={navigate} />}
                    {currentView === 'historial-comentario' && <HistorialCommentView comments={comments} showToast={showToast} isAdmin={isAdmin} updateComment={updateComment} deleteComment={deleteComment} />}
                </div>
            </main>

            <DetailModal 
                isOpen={detailModalOpen} 
                onClose={() => setDetailModalOpen(false)} 
                incident={incidents.find((i: any) => i.id === selectedIncidentId)} 
                isAdmin={isAdmin} 
                onToggleStatus={toggleIncidentStatus} 
                onEdit={() => { setDetailModalOpen(false); setEditModalOpen(true); }} 
                onDelete={deleteIncident} 
            />
            
            <EditIncidentModal 
                isOpen={editModalOpen} 
                onClose={() => setEditModalOpen(false)} 
                incident={incidents.find((i: any) => i.id === selectedIncidentId)} 
                onUpdate={updateIncident} 
            />

            <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} onGoogleLogin={loginWithGoogle} />
            <ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} msg={confirmModal.msg} onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })} onConfirm={() => { confirmModal.onConfirm(); setConfirmModal({ ...confirmModal, isOpen: false }); }} />
        </div>
    );
}