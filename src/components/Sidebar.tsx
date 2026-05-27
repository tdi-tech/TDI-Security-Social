import React from 'react';
import { LayoutDashboard, ShieldAlert, FileText, ListChecks, Users, BookOpen, AlertTriangle, Settings, HelpCircle } from 'lucide-react';
import { NavBtn } from './UIComponents';

export const Sidebar = ({ sidebarOpen, setSidebarOpen, currentView, navigate, isAdmin, cloudStatus }: any) => {
    const isLector = cloudStatus.includes('Lector');
    const isError = cloudStatus.includes('Error');
    const isConnecting = cloudStatus.includes('Conectando');
    
    const dotColor = isConnecting ? 'bg-[var(--warning)] animate-pulse' : isError ? 'bg-[var(--error)]' : isLector ? 'bg-slate-400' : 'bg-[var(--success)]';
    const textColor = isError ? 'text-[var(--error)]' : isConnecting ? 'text-[var(--warning)]' : isLector ? 'theme-text-muted' : 'text-[var(--success)]';

    return (
        <>
            {/* Overlay Móvil */}
            {sidebarOpen && <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden" onClick={() => setSidebarOpen(false)}></div>}

            {/* Panel Lateral */}
            <aside className={`fixed md:static inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 transition-transform duration-300 w-64 flex-shrink-0 theme-bg-lowest border-r theme-border flex flex-col z-40`}>
                <div className="p-6 flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <ShieldAlert className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-base theme-text-main leading-tight">TDI Security</h1>
                        <p className="text-[10px] theme-text-muted font-medium tracking-wide uppercase mt-0.5">Protocolo v2.0</p>
                    </div>
                </div>
                <nav className="flex-1 overflow-y-auto px-4 space-y-1">
                    <NavBtn id="dashboard" current={currentView} icon={LayoutDashboard} label="Dashboard" onClick={() => navigate('dashboard')} />
                    <NavBtn id="protocolo" current={currentView} icon={BookOpen} label="Protocolo" onClick={() => navigate('protocolo')} />
                    
                    {isAdmin && <NavBtn id="nuevo" current={currentView} icon={AlertTriangle} label="Nuevo Incidente" onClick={() => navigate('nuevo')} />}
                    {isAdmin && <NavBtn id="checklist" current={currentView} icon={ListChecks} label="Checklist Rápido" onClick={() => navigate('checklist')} />}
                    
                    <NavBtn id="historial" current={currentView} icon={FileText} label="Historial" onClick={() => navigate('historial')} />
                    <NavBtn id="roles" current={currentView} icon={Users} label="Roles" onClick={() => navigate('roles')} />
                    <NavBtn id="glosario" current={currentView} icon={BookOpen} label="Glosario" onClick={() => navigate('glosario')} />
                </nav>
                <div className="p-4 border-t theme-border space-y-2">
                    <div className="theme-bg-low rounded-xl p-4 theme-border border shadow-sm">
                        <p className="text-xs font-bold theme-text-main mb-2">Estado del Sistema</p>
                        <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${dotColor}`}></span>
                            <span className={`text-xs font-medium ${textColor}`}>{cloudStatus}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-2 pt-2">
                        {/* AHORA TODOS PUEDEN VER EL BOTÓN DE CONFIG */}
                        <button 
                            onClick={() => navigate('config')} 
                            className={`flex items-center gap-2 text-xs py-2 flex-1 transition-colors ${currentView === 'config' ? 'theme-text-main font-bold' : 'theme-text-muted hover:theme-text-main'}`}
                        >
                            <Settings className="w-4 h-4"/> Config
                        </button>
                        
                        <button 
                            onClick={() => navigate('ayuda')} 
                            className={`flex items-center gap-2 text-xs py-2 flex-1 transition-colors ${currentView === 'ayuda' ? 'theme-text-main font-bold' : 'theme-text-muted hover:theme-text-main'}`}
                        >
                            <HelpCircle className="w-4 h-4"/> Ayuda
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};