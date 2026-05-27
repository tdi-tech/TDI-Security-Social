import React, { useMemo } from 'react';
import { ShieldAlert, ListChecks, BookOpen, Users, Clock, Activity, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { StatCard, ActionBtn } from '../components/UIComponents';

export const DashboardView = ({ incidents, navigate, setSelectedIncidentId, setDetailModalOpen }: any) => {
    const stats = useMemo(() => {
        let open = 0, resolved = 0, critical = 0;
        incidents.forEach((inc: any) => {
            if (inc.estado !== 'Resuelto') open++;
            if (inc.estado === 'Resuelto') resolved++;
            if (inc.impacto === 'Alto' || inc.impacto === 'Crítico') critical++;
        });
        return { total: incidents.length, open, resolved, critical };
    }, [incidents]);

    return (
        <div className="fade-in space-y-8 pb-20">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard title="Total Incidentes" value={stats.total} color="blue" icon={<Activity className="w-16 h-16 opacity-5 absolute -right-2 -bottom-2"/>}/>
                <StatCard title="Nuevos / Abiertos" value={stats.open} color="orange" icon={<AlertTriangle className="w-16 h-16 opacity-5 absolute -right-2 -bottom-2"/>}/>
                <StatCard title="Resueltos" value={stats.resolved} color="emerald" icon={<CheckCircle2 className="w-16 h-16 opacity-5 absolute -right-2 -bottom-2"/>}/>
                <StatCard title="Impacto Alto" value={stats.critical} color="red" icon={<ShieldAlert className="w-16 h-16 opacity-5 absolute -right-2 -bottom-2"/>}/>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <h3 className="text-xl font-bold theme-text-main mb-4 flex items-center gap-2">Acciones Rápidas</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        <ActionBtn onClick={() => navigate('nuevo')} icon={<ShieldAlert className="w-5 h-5 text-red-500"/>} title="Reportar Incidente" desc="Iniciar protocolo de emergencia inmediata." bgIcon="bg-red-500/10" />
                        <ActionBtn onClick={() => navigate('checklist')} icon={<ListChecks className="w-5 h-5 text-emerald-500"/>} title="Checklist Rápido" desc="Verificar pasos críticos de seguridad." bgIcon="bg-emerald-500/10" />
                        <ActionBtn onClick={() => navigate('protocolo')} icon={<BookOpen className="w-5 h-5 text-blue-500"/>} title="Leer Protocolo" desc="Guía de actuación oficial y procedimientos." bgIcon="bg-blue-500/10" />
                        <ActionBtn onClick={() => navigate('roles')} icon={<Users className="w-5 h-5 text-purple-500"/>} title="Roles" desc="Ver responsabilidades asignadas al personal." bgIcon="bg-purple-500/10" />
                        <ActionBtn onClick={() => navigate('historial')} icon={<Clock className="w-5 h-5 text-slate-400"/>} title="Historial" desc="Consulta incidentes pasados y reportes." bgIcon="bg-slate-500/10" />
                        <ActionBtn onClick={() => navigate('glosario')} icon={<BookOpen className="w-5 h-5 text-orange-500"/>} title="Glosario" desc="Términos técnicos y acrónimos del sistema." bgIcon="bg-orange-500/10" />
                    </div>
                </div>
                
                <div className="flex flex-col h-full">
                    <h3 className="text-xl font-bold theme-text-main mb-4 flex items-center gap-2"><Clock className="w-5 h-5"/> Recientes</h3>
                    <div className="theme-bg-container theme-border border rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col min-h-[16rem]">
                        {incidents.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                <div className="w-12 h-12 rounded-full theme-bg-low flex items-center justify-center mb-4">
                                    <ShieldAlert className="w-6 h-6 theme-text-muted" />
                                </div>
                                <h4 className="theme-text-main font-medium mb-1">No hay incidentes registrados actualmente.</h4>
                                <p className="theme-text-muted text-xs italic">El sistema está operando bajo parámetros normales.</p>
                            </div>
                        ) : (
                            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                                {incidents.slice(0, 4).map((inc: any) => (
                                    <div key={inc.id} onClick={() => { setSelectedIncidentId(inc.id); setDetailModalOpen(true); }} className="flex items-center justify-between p-3 theme-bg-low rounded-lg hover:brightness-110 transition-all cursor-pointer border border-transparent hover:border-[var(--primary)]">
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium theme-text-main truncate">{inc.plataforma}</p>
                                            <p className="text-xs theme-text-muted truncate">{new Date(inc.fecha).toLocaleDateString()} - {inc.vector}</p>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded ${inc.estado === 'Resuelto' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-orange-500/20 text-orange-500'}`}>{inc.estado}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};