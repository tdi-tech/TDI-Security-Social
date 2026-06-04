import React, { useMemo } from 'react';
import { 
    ShieldAlert, ListChecks, BookOpen, Users, Clock, Activity, 
    AlertTriangle, CheckCircle2, Lock, Megaphone, MessageSquare, 
    FileText 
} from 'lucide-react';
import { StatCard, ActionBtn } from '../components/UIComponents';

export const DashboardView = ({ 
    incidents, 
    rrssIncidents, 
    comments, 
    isAdmin, 
    navigate, 
    setSelectedIncidentId, 
    setDetailModalOpen 
}: any) => {

    // MÉTRICAS SEGURAS: Previene crasheos si Firebase está cargando
    const hackStats = useMemo(() => {
        let open = 0, resolved = 0, critical = 0;
        const list = incidents || [];
        list.forEach((inc: any) => {
            if (inc.estado !== 'Resuelto') open++;
            if (inc.estado === 'Resuelto') resolved++;
            if (inc.impacto === 'Alto' || inc.impacto === 'Crítico') critical++;
        });
        return { total: list.length, open, resolved, critical };
    }, [incidents]);

    const rrssStats = useMemo(() => {
        let open = 0, resolved = 0, highRisk = 0;
        const list = rrssIncidents || [];
        list.forEach((inc: any) => {
            if (inc.estado !== 'Resuelto') open++;
            if (inc.estado === 'Resuelto') resolved++;
            if (inc.riesgo === 'Alto') highRisk++;
        });
        return { total: list.length, open, resolved, highRisk };
    }, [rrssIncidents]);

    const commentsStats = useMemo(() => {
        let organic = 0, paid = 0, totalIndividuales = 0;
        const list = comments || [];
        list.forEach((com: any) => {
            if (com.contenido === 'Orgánico') organic++;
            if (com.contenido === 'Pautado') paid++;
            totalIndividuales += (com.comentariosList?.length || 1);
        });
        return { totalReportes: list.length, totalIndividuales, organic, paid };
    }, [comments]);

    return (
        <div className="fade-in space-y-12 pb-20">
            
            {/* ==========================================
                SECCIÓN 1: HACKEOS (Visible para todos)
            ========================================== */}
            <section className="space-y-6">
                <div className="border-b theme-border pb-3">
                    <h2 className="text-2xl font-bold theme-text-main flex items-center gap-3">
                        <ShieldAlert className="w-7 h-7 text-[var(--error)]" /> 
                        Seguridad y Accesos
                    </h2>
                    <p className="text-sm theme-text-muted mt-1 ml-10">Métricas globales y protocolos de actuación ante hackeos y vulnerabilidades corporativas.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                            <StatCard title="Total Registros" value={hackStats.total} color="blue" icon={<Activity className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                            <StatCard title="Abiertos" value={hackStats.open} color="orange" icon={<AlertTriangle className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                            <StatCard title="Resueltos" value={hackStats.resolved} color="emerald" icon={<CheckCircle2 className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                            <StatCard title="Impacto Alto" value={hackStats.critical} color="red" icon={<ShieldAlert className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                        </div>
                        
                        <div>
                            <h3 className="text-xs font-bold theme-text-muted uppercase tracking-wider mb-3 ml-1">Acciones Rápidas</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <ActionBtn 
                                    onClick={() => navigate('nuevo')} 
                                    icon={isAdmin ? <ShieldAlert className="w-5 h-5 text-red-500"/> : <Lock className="w-5 h-5 text-gray-400"/>} 
                                    title="Reportar Incidente" 
                                    desc={isAdmin ? "Inicia protocolo de emergencia." : "Requiere Administrador."} 
                                    bgIcon={isAdmin ? "bg-red-500/10" : "bg-gray-500/10"} 
                                />
                                <ActionBtn 
                                    onClick={() => navigate('checklist')} 
                                    icon={isAdmin ? <ListChecks className="w-5 h-5 text-emerald-500"/> : <Lock className="w-5 h-5 text-gray-400"/>} 
                                    title="Checklist Rápido" 
                                    desc={isAdmin ? "Verifica pasos de seguridad." : "Requiere Administrador."} 
                                    bgIcon={isAdmin ? "bg-emerald-500/10" : "bg-gray-500/10"} 
                                />
                                <ActionBtn onClick={() => navigate('historial')} icon={<Clock className="w-5 h-5 text-slate-400"/>} title="Historial" desc="Consulta incidentes pasados." bgIcon="bg-slate-500/10" />
                                <ActionBtn onClick={() => navigate('protocolo')} icon={<BookOpen className="w-5 h-5 text-blue-500"/>} title="Leer Protocolo" desc="Guía de actuación oficial." bgIcon="bg-blue-500/10" />
                                <ActionBtn onClick={() => navigate('roles')} icon={<Users className="w-5 h-5 text-purple-500"/>} title="Roles" desc="Responsabilidades del equipo." bgIcon="bg-purple-500/10" />
                                <ActionBtn onClick={() => navigate('glosario')} icon={<BookOpen className="w-5 h-5 text-orange-500"/>} title="Glosario" desc="Términos técnicos del sistema." bgIcon="bg-orange-500/10" />
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col h-full">
                        <h3 className="text-xs font-bold theme-text-muted uppercase tracking-wider mb-3 ml-1 flex items-center gap-2"><Clock className="w-4 h-4"/> Actividad Reciente</h3>
                        <div className="theme-bg-container theme-border border rounded-2xl overflow-hidden shadow-sm flex-1 flex flex-col p-2 min-h-[16rem]">
                            {(!incidents || incidents.length === 0) ? (
                                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                    <ShieldAlert className="w-8 h-8 theme-text-muted opacity-30 mb-3" />
                                    <p className="theme-text-muted text-sm">Sin incidentes registrados.</p>
                                </div>
                            ) : (
                                <div className="flex-1 overflow-y-auto space-y-2">
                                    {incidents.slice(0, 4).map((inc: any) => (
                                        <div key={inc.id} onClick={() => { setSelectedIncidentId(inc.id); setDetailModalOpen(true); }} className="p-3 theme-bg-low rounded-xl hover:border-[var(--primary)] border border-transparent transition-colors cursor-pointer group">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="text-sm font-bold theme-text-main truncate group-hover:text-[var(--primary)] transition-colors">{inc.plataforma}</p>
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${inc.estado === 'Resuelto' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>{inc.estado}</span>
                                            </div>
                                            <p className="text-xs theme-text-muted truncate">{new Date(inc.fecha).toLocaleDateString()} - {inc.vector}</p>
                                        </div>
                                    ))}
                                    <button onClick={() => navigate('historial')} className="w-full mt-2 py-2 text-xs font-bold text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors">Ver historial completo</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* ==========================================
                BLOQUEO INTELIGENTE PARA LECTORES
            ========================================== */}
            {!isAdmin ? (
                <div className="theme-bg-container theme-border border rounded-2xl p-10 text-center shadow-sm">
                    <Lock className="w-12 h-12 theme-text-muted mx-auto mb-4 opacity-30" />
                    <h3 className="text-lg font-bold theme-text-main mb-2">Área Restringida</h3>
                    <p className="theme-text-muted text-sm max-w-md mx-auto">
                        Inicia sesión como Administrador para visualizar y gestionar las métricas operativas de <strong>Crisis RRSS</strong> y <strong>Reportes de Comentarios</strong>.
                    </p>
                </div>
            ) : (
                <>
                    {/* ==========================================
                        SECCIÓN 2: RRSS (Solo Admin)
                    ========================================== */}
                    <section className="space-y-6 pt-8 border-t theme-border fade-in">
                        <div className="border-b theme-border pb-3">
                            <h2 className="text-2xl font-bold theme-text-main flex items-center gap-3">
                                <Megaphone className="w-7 h-7 text-orange-500" /> 
                                Reputación y Crisis RRSS
                            </h2>
                            <p className="text-sm theme-text-muted mt-1 ml-10">Seguimiento de picos de comentarios, crisis de reputación y actuación en redes sociales.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatCard title="Crisis Registradas" value={rrssStats.total} color="blue" icon={<Activity className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                                    <StatCard title="En Proceso" value={rrssStats.open} color="orange" icon={<Clock className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                                    <StatCard title="Controladas" value={rrssStats.resolved} color="emerald" icon={<CheckCircle2 className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                                    <StatCard title="Riesgo Alto" value={rrssStats.highRisk} color="red" icon={<AlertTriangle className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                                </div>
                                
                                <div>
                                    <h3 className="text-xs font-bold theme-text-muted uppercase tracking-wider mb-3 ml-1">Acciones Rápidas</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <ActionBtn onClick={() => navigate('nuevo-rss')} icon={<Megaphone className="w-5 h-5 text-orange-500"/>} title="Registrar Crisis" desc="Abre un nuevo caso RRSS." bgIcon="bg-orange-500/10" />
                                        <ActionBtn onClick={() => navigate('historial-rss')} icon={<Clock className="w-5 h-5 text-blue-500"/>} title="Historial RRSS" desc="Casos de reputación pasados." bgIcon="bg-blue-500/10" />
                                        <ActionBtn onClick={() => navigate('protocolo-rss')} icon={<BookOpen className="w-5 h-5 text-purple-500"/>} title="Protocolo Oficial" desc="Estrategia de atención." bgIcon="bg-purple-500/10" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col h-full">
                                <h3 className="text-xs font-bold theme-text-muted uppercase tracking-wider mb-3 ml-1 flex items-center gap-2"><Clock className="w-4 h-4"/> Actividad Reciente</h3>
                                <div className="theme-bg-container theme-border border rounded-2xl overflow-hidden shadow-sm flex-1 flex flex-col p-2 min-h-[16rem]">
                                    {(!rrssIncidents || rrssIncidents.length === 0) ? (
                                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                            <Megaphone className="w-8 h-8 theme-text-muted opacity-30 mb-3" />
                                            <p className="theme-text-muted text-sm">Sin casos de crisis recientes.</p>
                                        </div>
                                    ) : (
                                        <div className="flex-1 overflow-y-auto space-y-2">
                                            {rrssIncidents.slice(0, 4).map((inc: any) => (
                                                <div key={inc.id} onClick={() => navigate('historial-rss')} className="p-3 theme-bg-low rounded-xl hover:border-orange-500 border border-transparent transition-colors cursor-pointer group">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="text-sm font-bold theme-text-main truncate group-hover:text-orange-500 transition-colors">{inc.redSocial}</p>
                                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${inc.estado === 'Resuelto' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>{inc.estado}</span>
                                                    </div>
                                                    <p className="text-xs theme-text-muted truncate">Riesgo {inc.riesgo} • {new Date(inc.fecha).toLocaleDateString()}</p>
                                                </div>
                                            ))}
                                            <button onClick={() => navigate('historial-rss')} className="w-full mt-2 py-2 text-xs font-bold text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors">Ver historial completo</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ==========================================
                        SECCIÓN 3: COMENTARIOS (Solo Admin)
                    ========================================== */}
                    <section className="space-y-6 pt-8 border-t theme-border fade-in">
                        <div className="border-b theme-border pb-3">
                            <h2 className="text-2xl font-bold theme-text-main flex items-center gap-3">
                                <MessageSquare className="w-7 h-7 text-blue-500" /> 
                                Interacciones y Comentarios
                            </h2>
                            <p className="text-sm theme-text-muted mt-1 ml-10">Trazabilidad de quejas individuales, interacciones orgánicas o pautadas por campus.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatCard title="Reportes Creados" value={commentsStats.totalReportes} color="purple" icon={<FileText className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                                    <StatCard title="Total Comentarios" value={commentsStats.totalIndividuales} color="blue" icon={<MessageSquare className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                                    <StatCard title="Contenido Orgánico" value={commentsStats.organic} color="emerald" icon={<Activity className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                                    <StatCard title="Contenido Pautado" value={commentsStats.paid} color="orange" icon={<Activity className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                                </div>
                                
                                <div>
                                    <h3 className="text-xs font-bold theme-text-muted uppercase tracking-wider mb-3 ml-1">Acciones Rápidas</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <ActionBtn onClick={() => navigate('nuevo-comentario')} icon={<MessageSquare className="w-5 h-5 text-blue-500"/>} title="Capturar Comentarios" desc="Crea un registro de mensajes." bgIcon="bg-blue-500/10" />
                                        <ActionBtn onClick={() => navigate('historial-comentario')} icon={<Clock className="w-5 h-5 text-slate-500"/>} title="Historial Comentarios" desc="Consulta registros anteriores." bgIcon="bg-slate-500/10" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex flex-col h-full">
                                <h3 className="text-xs font-bold theme-text-muted uppercase tracking-wider mb-3 ml-1 flex items-center gap-2"><Clock className="w-4 h-4"/> Actividad Reciente</h3>
                                <div className="theme-bg-container theme-border border rounded-2xl overflow-hidden shadow-sm flex-1 flex flex-col p-2 min-h-[16rem]">
                                    {(!comments || comments.length === 0) ? (
                                        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                            <MessageSquare className="w-8 h-8 theme-text-muted opacity-30 mb-3" />
                                            <p className="theme-text-muted text-sm">Sin reportes de comentarios.</p>
                                        </div>
                                    ) : (
                                        <div className="flex-1 overflow-y-auto space-y-2">
                                            {comments.slice(0, 4).map((com: any) => (
                                                <div key={com.id} onClick={() => navigate('historial-comentario')} className="p-3 theme-bg-low rounded-xl hover:border-blue-500 border border-transparent transition-colors cursor-pointer group">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="text-sm font-bold theme-text-main truncate group-hover:text-blue-500 transition-colors">Reporte del {com.fechaInicio}</p>
                                                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md uppercase bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{com.contenido}</span>
                                                    </div>
                                                    <p className="text-xs theme-text-muted truncate">Finaliza: {com.fechaFin}</p>
                                                </div>
                                            ))}
                                            <button onClick={() => navigate('historial-comentario')} className="w-full mt-2 py-2 text-xs font-bold text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors">Ver historial completo</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};