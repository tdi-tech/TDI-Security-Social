import React, { useMemo, useState, useEffect } from 'react';
import { 
    ShieldAlert, ListChecks, BookOpen, Users, Clock, Activity, 
    AlertTriangle, CheckCircle2, Lock, Megaphone, MessageSquare, 
    FileText, X, ChevronRight, PieChart, TrendingUp, MapPin, Download
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
// 🛡️ Importamos auth para evaluar el dominio antes de abrir listeners
import { db, appId, auth } from '../firebase/config'; 
import { StatCard, ActionBtn } from '../components/UIComponents';
import { DetailModal, EditIncidentModal } from './HackViews';

export const DashboardView = ({ 
    isAdmin, navigate, showToast, 
    toggleIncidentStatus, updateIncident, deleteIncident 
}: any) => {

    const [incidents, setIncidents] = useState<any[]>([]);
    const [rrssIncidents, setRrssIncidents] = useState<any[]>([]);
    const [comments, setComments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState('seguridad');
    const [mounted, setMounted] = useState(false);
    
    const [previewModal, setPreviewModal] = useState<{isOpen: boolean, type: string, data: any}>({isOpen: false, type: '', data: null});
    const [selectedHackeo, setSelectedHackeo] = useState<any>(null);
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);

    useEffect(() => {
        // 🛡️ SENSOR: Evita disparar peticiones si el usuario logueado no pertenece a la empresa
        const u = auth.currentUser;
        if (u && !u.isAnonymous && u.email && !u.email.endsWith('@tierradeideas.mx')) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        const unsub1 = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'incidents'), snap => {
            const arr: any[] = []; snap.forEach(d => arr.push({id: d.id, ...d.data()}));
            setIncidents(arr.sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()));
        }, () => {}); // Catch 100% silencioso

        const unsub2 = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'rrss_incidents'), snap => {
            const arr: any[] = []; snap.forEach(d => arr.push({id: d.id, ...d.data()}));
            setRrssIncidents(arr.sort((a,b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()));
        }, () => {}); // Catch 100% silencioso

        const unsub3 = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'comments'), snap => {
            const arr: any[] = []; snap.forEach(d => arr.push({id: d.id, ...d.data()}));
            setComments(arr.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        }, () => {}); // Catch 100% silencioso
        
        const timer = setTimeout(() => setIsLoading(false), 800);
        return () => { unsub1(); unsub2(); unsub3(); clearTimeout(timer); };
    }, []);

    useEffect(() => {
        setMounted(false);
        const timer = setTimeout(() => setMounted(true), 100);
        return () => clearTimeout(timer);
    }, [activeTab]);

    const hackStats = useMemo(() => {
        let open = 0, resolved = 0, critical = 0;
        const vectorCounts: Record<string, number> = {};
        const platformCounts: Record<string, number> = {};

        incidents.forEach((inc: any) => {
            if (inc.estado !== 'Resuelto') open++;
            if (inc.estado === 'Resuelto') resolved++;
            if (inc.impacto === 'Alto' || inc.impacto === 'Crítico') critical++;
            if (inc.vector) vectorCounts[inc.vector] = (vectorCounts[inc.vector] || 0) + 1;
            if (inc.plataforma) platformCounts[inc.plataforma] = (platformCounts[inc.plataforma] || 0) + 1;
        });

        const topVectors = Object.entries(vectorCounts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([name, count]) => ({
            name, count, percent: incidents.length ? Math.round((count / incidents.length) * 100) : 0 
        }));
        const topPlatform = Object.keys(platformCounts).sort((a,b) => platformCounts[b] - platformCounts[a])[0] || 'N/A';

        return { total: incidents.length, open, resolved, critical, topVectors, topPlatform };
    }, [incidents]);

    const rrssStats = useMemo(() => {
        let open = 0, resolved = 0, highRisk = 0;
        const networkCounts: Record<string, number> = {};

        rrssIncidents.forEach((inc: any) => {
            if (inc.estado !== 'Resuelto') open++;
            if (inc.estado === 'Resuelto') resolved++;
            if (inc.riesgo === 'Alto' || inc.riesgo === 'Critico') highRisk++;
            if (inc.medio) networkCounts[inc.medio] = (networkCounts[inc.medio] || 0) + 1;
        });

        const topNetwork = Object.keys(networkCounts).sort((a,b) => networkCounts[b] - networkCounts[a])[0] || 'N/A';
        const resolutionRate = rrssIncidents.length > 0 ? Math.round((resolved / rrssIncidents.length) * 100) : 0;

        return { total: rrssIncidents.length, open, resolved, highRisk, topNetwork, resolutionRate };
    }, [rrssIncidents]);

    const commentsStats = useMemo(() => {
        let organic = 0, paid = 0, totalIndividuales = 0, neutral = 0, negativo = 0;
        const campusCounts: Record<string, number> = {};

        comments.forEach((com: any) => {
            if (com.contenido === 'Orgánico') organic++;
            if (com.contenido === 'Pautado') paid++;
            
            const cList = com.comentariosList || [];
            totalIndividuales += cList.length;
            
            cList.forEach((c: any) => {
                if (c.sentiment === 'Negativo') negativo++;
                else if (c.sentiment === 'Neutral') neutral++;
                const camp = c.campus && c.campus !== 'Sin especificar' ? c.campus : null;
                if (camp) campusCounts[camp] = (campusCounts[camp] || 0) + 1;
            });
        });

        const topCampus = Object.keys(campusCounts).sort((a,b) => campusCounts[b] - campusCounts[a])[0] || 'Ninguno';
        const totalSentiment = (negativo + neutral) || 1; 

        return { totalReportes: comments.length, totalIndividuales, organic, paid, negativo, neutral, totalSentiment, topCampus };
    }, [comments]);

    const handleDownloadReport = () => {
        if (activeTab === 'seguridad' && hackStats.total === 0) return showToast("No hay datos de Seguridad.", true);
        if (activeTab === 'rrss' && (!isAdmin || rrssStats.total === 0)) return showToast("Sin acceso o sin datos RRSS.", true);
        if (activeTab === 'comentarios' && (!isAdmin || commentsStats.totalReportes === 0)) return showToast("Sin acceso o sin datos.", true);
        window.print();
    };

    const RestrictedArea = () => (
        <div className="theme-bg-container theme-border border rounded-2xl p-10 text-center shadow-sm fade-in mt-6">
            <Lock className="w-12 h-12 theme-text-muted mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-bold theme-text-main mb-2">Área Restringida</h3>
            <p className="theme-text-muted text-sm max-w-md mx-auto">Inicia sesión como Administrador para visualizar estas métricas.</p>
        </div>
    );

    if (isLoading) {
        return (
            <div className="fade-in pb-20 space-y-8 animate-pulse">
                <div className="h-10 w-full sm:w-1/2 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {[1,2,3,4].map(i => <div key={i} className="h-28 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
                        <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
                    </div>
                    <div className="h-96 bg-gray-200 dark:bg-gray-800 rounded-2xl"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <style type="text/css" media="print">
                {` body { background-color: white !important; } .print-report-container { display: block !important; color: black !important; } .dashboard-interactive-view { display: none !important; } `}
            </style>

            <div className="fade-in pb-20 relative dashboard-interactive-view">
                
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                    <div className="flex flex-col sm:flex-row items-center gap-2 p-1.5 bg-black/5 dark:bg-white/5 border theme-border rounded-xl w-full md:w-fit shadow-inner">
                        <button onClick={() => setActiveTab('seguridad')} className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'seguridad' ? 'bg-[var(--surface)] shadow-md theme-text-main scale-100' : 'theme-text-muted hover:theme-text-main scale-95'}`}><ShieldAlert className="w-4 h-4" /> Seguridad y Accesos</button>
                        <button onClick={() => setActiveTab('rrss')} className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'rrss' ? 'bg-[var(--surface)] shadow-md theme-text-main scale-100' : 'theme-text-muted hover:theme-text-main scale-95'}`}><Megaphone className="w-4 h-4" /> Reputación RRSS</button>
                        <button onClick={() => setActiveTab('comentarios')} className={`w-full sm:w-auto px-5 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'comentarios' ? 'bg-[var(--surface)] shadow-md theme-text-main scale-100' : 'theme-text-muted hover:theme-text-main scale-95'}`}><MessageSquare className="w-4 h-4" /> Comentarios</button>
                    </div>
                    <button onClick={handleDownloadReport} className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-[var(--primary)] text-white hover:brightness-110 transition-all shadow-sm"><Download className="w-4 h-4" /> Descargar PDF</button>
                </div>

                <div className="space-y-6">
                    {activeTab === 'seguridad' && (
                        <div className="fade-in space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard title="Total Registros" value={hackStats.total} color="blue" icon={<Activity className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                                <StatCard title="Abiertos" value={hackStats.open} color="orange" icon={<AlertTriangle className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                                <StatCard title="Resueltos" value={hackStats.resolved} color="emerald" icon={<CheckCircle2 className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                                <StatCard title="Impacto Alto" value={hackStats.critical} color="red" icon={<ShieldAlert className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <div className="lg:col-span-2 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="p-5 theme-bg-container border theme-border rounded-xl shadow-sm">
                                            <h4 className="text-xs font-bold theme-text-muted uppercase tracking-wider mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-500"/> Top 3 Vectores de Ataque</h4>
                                            <div className="space-y-3">
                                                {hackStats.topVectors.length > 0 ? hackStats.topVectors.map((vec, i) => (
                                                    <div key={i}>
                                                        <div className="flex justify-between text-xs mb-1"><span className="font-bold theme-text-main truncate pr-2">{vec.name}</span><span className="theme-text-muted">{vec.percent}%</span></div>
                                                        <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all duration-1000 ease-out" style={{ width: mounted ? `${vec.percent}%` : '0%' }}></div></div>
                                                    </div>
                                                )) : <p className="text-xs theme-text-muted italic">No hay datos suficientes.</p>}
                                            </div>
                                        </div>
                                        <div className="p-5 theme-bg-container border theme-border rounded-xl shadow-sm flex flex-col justify-center items-center text-center gap-2">
                                            <div className="p-4 bg-red-500/10 text-red-500 rounded-full mb-2"><ShieldAlert className="w-8 h-8"/></div>
                                            <p className="text-xs font-bold theme-text-muted uppercase tracking-wider">Plataforma más Vulnerable</p>
                                            <p className="text-2xl font-black theme-text-main truncate max-w-full px-4">{hackStats.topPlatform}</p>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <h3 className="text-xs font-bold theme-text-muted uppercase tracking-wider mb-3 ml-1">Acciones Rápidas</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            <ActionBtn onClick={() => navigate('nuevo')} icon={isAdmin ? <ShieldAlert className="w-5 h-5 text-red-500"/> : <Lock className="w-5 h-5 text-gray-400"/>} title="Reportar Incidente" desc={isAdmin ? "Protocolo de emergencia." : "Solo Administrador."} bgIcon={isAdmin ? "bg-red-500/10" : "bg-gray-500/10"} />
                                            <ActionBtn onClick={() => navigate('checklist')} icon={isAdmin ? <ListChecks className="w-5 h-5 text-emerald-500"/> : <Lock className="w-5 h-5 text-gray-400"/>} title="Checklist Rápido" desc={isAdmin ? "Verifica pasos urgentes." : "Solo Administrador."} bgIcon={isAdmin ? "bg-emerald-500/10" : "bg-gray-500/10"} />
                                            <ActionBtn onClick={() => navigate('historial')} icon={<Clock className="w-5 h-5 text-slate-400"/>} title="Historial" desc="Casos documentados." bgIcon="bg-slate-500/10" />
                                            <ActionBtn onClick={() => navigate('protocolo')} icon={<BookOpen className="w-5 h-5 text-blue-500"/>} title="Protocolo IT" desc="Guía de contención." bgIcon="bg-blue-500/10" />
                                            <ActionBtn onClick={() => navigate('roles')} icon={<Users className="w-5 h-5 text-purple-500"/>} title="Matriz de Roles" desc="A quién notificar." bgIcon="bg-purple-500/10" />
                                            <ActionBtn onClick={() => navigate('glosario')} icon={<BookOpen className="w-5 h-5 text-orange-500"/>} title="Glosario Ciber" desc="Conceptos técnicos." bgIcon="bg-orange-500/10" />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex flex-col h-full">
                                    <h3 className="text-xs font-bold theme-text-muted uppercase tracking-wider mb-3 ml-1 flex items-center gap-2"><Clock className="w-4 h-4"/> Actividad Reciente</h3>
                                    <div className="theme-bg-container theme-border border rounded-2xl overflow-hidden shadow-sm flex-1 flex flex-col p-2 min-h-[16rem]">
                                        {incidents.length === 0 ? (
                                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                                                <ShieldAlert className="w-8 h-8 theme-text-muted opacity-30 mb-3" />
                                                <p className="theme-text-muted text-sm">Sin incidentes registrados.</p>
                                            </div>
                                        ) : (
                                            <div className="flex-1 overflow-y-auto space-y-2">
                                                {incidents.slice(0, 5).map((inc: any) => (
                                                    <div key={inc.id} onClick={() => { setSelectedHackeo(inc); setDetailModalOpen(true); }} className="p-3 theme-bg-low rounded-xl hover:border-red-500 border border-transparent transition-colors cursor-pointer group">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className="text-sm font-bold theme-text-main truncate group-hover:text-red-500 transition-colors">{inc.plataforma}</p>
                                                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase ${inc.estado === 'Resuelto' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>{inc.estado}</span>
                                                        </div>
                                                        <p className="text-xs theme-text-muted truncate">{new Date(inc.fecha).toLocaleDateString()} - {inc.vector}</p>
                                                    </div>
                                                ))}
                                                <button onClick={() => navigate('historial')} className="w-full mt-2 py-2 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">Ver historial completo</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'rrss' && (
                        !isAdmin ? <RestrictedArea /> : (
                            <div className="fade-in space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatCard title="Crisis Registradas" value={rrssStats.total} color="blue" icon={<Activity className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                                    <StatCard title="En Proceso" value={rrssStats.open} color="orange" icon={<Clock className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                                    <StatCard title="Controladas" value={rrssStats.resolved} color="emerald" icon={<CheckCircle2 className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                                    <StatCard title="Riesgo Alto" value={rrssStats.highRisk} color="red" icon={<AlertTriangle className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="p-5 theme-bg-container border theme-border rounded-xl shadow-sm flex items-center justify-between gap-4">
                                                <div>
                                                    <p className="text-xs font-bold theme-text-muted uppercase tracking-wider mb-1">Índice de Resolución</p>
                                                    <div className="flex items-end gap-2"><span className="text-3xl font-black text-emerald-500">{rrssStats.resolutionRate}%</span><span className="text-xs font-medium theme-text-muted mb-1.5">casos cerrados</span></div>
                                                </div>
                                                <div className="relative w-20 h-20 flex-shrink-0">
                                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="12" className="text-gray-200 dark:text-gray-800" />
                                                        <circle cx="50" cy="50" r="40" fill="transparent" stroke="currentColor" strokeWidth="12" strokeLinecap="round" className="text-emerald-500 transition-all duration-1000 ease-out" strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={mounted ? (2 * Math.PI * 40) * (1 - rrssStats.resolutionRate / 100) : 2 * Math.PI * 40} />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="p-5 theme-bg-container border theme-border rounded-xl shadow-sm flex items-center gap-4">
                                                <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl"><Megaphone className="w-6 h-6"/></div>
                                                <div><p className="text-xs font-bold theme-text-muted uppercase tracking-wider mb-0.5">Canal más Crítico</p><p className="text-xl font-bold theme-text-main truncate">{rrssStats.topNetwork}</p></div>
                                            </div>
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
                                            {rrssIncidents.length === 0 ? (
                                                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center"><Megaphone className="w-8 h-8 theme-text-muted opacity-30 mb-3" /><p className="theme-text-muted text-sm">Sin casos de crisis recientes.</p></div>
                                            ) : (
                                                <div className="flex-1 overflow-y-auto space-y-2">
                                                    {rrssIncidents.slice(0, 5).map((inc: any) => (
                                                        <div key={inc.id} onClick={() => setPreviewModal({isOpen: true, type: 'rrss', data: inc})} className="p-3 theme-bg-low rounded-xl hover:border-orange-500 border border-transparent transition-colors cursor-pointer group">
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
                            </div>
                        )
                    )}

                    {activeTab === 'comentarios' && (
                        !isAdmin ? <RestrictedArea /> : (
                            <div className="fade-in space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                                    <StatCard title="Reportes Creados" value={commentsStats.totalReportes} color="purple" icon={<FileText className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                                    <StatCard title="Total Comentarios" value={commentsStats.totalIndividuales} color="blue" icon={<MessageSquare className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                                    <StatCard title="Contenido Orgánico" value={commentsStats.organic} color="emerald" icon={<Activity className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                                    <StatCard title="Contenido Pautado" value={commentsStats.paid} color="orange" icon={<Activity className="w-12 h-12 opacity-10 absolute -right-2 -bottom-2"/>}/>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <div className="lg:col-span-2 space-y-6">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="p-5 theme-bg-container border theme-border rounded-xl shadow-sm">
                                                <h4 className="text-xs font-bold theme-text-muted uppercase tracking-wider mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-purple-500"/> Análisis de Sentimiento</h4>
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex flex-col"><span className="text-2xl font-black text-red-500 leading-none">{commentsStats.negativo}</span><span className="text-[10px] font-bold theme-text-muted uppercase">Negativos</span></div>
                                                    <div className="flex flex-col text-right"><span className="text-2xl font-black text-slate-500 leading-none">{commentsStats.neutral}</span><span className="text-[10px] font-bold theme-text-muted uppercase">Neutrales</span></div>
                                                </div>
                                                <div className="h-4 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden flex shadow-inner">
                                                    <div className="h-full bg-red-500 transition-all duration-1000 ease-out" style={{ width: mounted ? `${(commentsStats.negativo / commentsStats.totalSentiment) * 100}%` : '0%' }}></div>
                                                    <div className="h-full bg-slate-400 dark:bg-slate-500 transition-all duration-1000 ease-out delay-300" style={{ width: mounted ? `${(commentsStats.neutral / commentsStats.totalSentiment) * 100}%` : '0%' }}></div>
                                                </div>
                                            </div>
                                            <div className="p-5 theme-bg-container border theme-border rounded-xl shadow-sm flex items-center gap-4">
                                                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl"><MapPin className="w-6 h-6"/></div>
                                                <div><p className="text-xs font-bold theme-text-muted uppercase tracking-wider mb-0.5">Campus con más Alertas</p><p className="text-xl font-bold theme-text-main truncate">{commentsStats.topCampus}</p></div>
                                            </div>
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
                                            {comments.length === 0 ? (
                                                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center"><MessageSquare className="w-8 h-8 theme-text-muted opacity-30 mb-3" /><p className="theme-text-muted text-sm">Sin reportes de comentarios.</p></div>
                                            ) : (
                                                <div className="flex-1 overflow-y-auto space-y-2">
                                                    {comments.slice(0, 5).map((com: any) => (
                                                        <div key={com.id} onClick={() => setPreviewModal({isOpen: true, type: 'comment', data: com})} className="p-3 theme-bg-low rounded-xl hover:border-blue-500 border border-transparent transition-colors cursor-pointer group">
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
                            </div>
                        )
                    )}
                </div>

                {/* MODAL DE VISTA RÁPIDA */}
                {previewModal.isOpen && previewModal.data && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 fade-in">
                        <div className="theme-bg-container rounded-2xl w-full max-w-md shadow-2xl border theme-border flex flex-col">
                            <div className={`p-4 border-b theme-border flex justify-between items-center ${previewModal.type === 'rrss' ? 'bg-orange-500/5' : 'bg-blue-500/5'}`}>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${previewModal.type === 'rrss' ? 'bg-orange-500/20 text-orange-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                        {previewModal.type === 'rrss' ? <Megaphone className="w-5 h-5"/> : <MessageSquare className="w-5 h-5"/>}
                                    </div>
                                    <div><h3 className="font-bold theme-text-main">Vista Rápida</h3><p className="text-[10px] theme-text-muted font-medium uppercase tracking-wider">{previewModal.type === 'rrss' ? 'Crisis RRSS' : 'Comentarios'}</p></div>
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
                                <button onClick={() => { setPreviewModal({isOpen: false, type: '', data: null}); navigate(previewModal.type === 'rrss' ? 'historial-rss' : 'historial-comentario'); }} className={`w-full py-2.5 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all hover:brightness-110 ${previewModal.type === 'rrss' ? 'bg-orange-600' : 'bg-blue-600'}`}>Ver historial completo <ChevronRight className="w-4 h-4"/></button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <DetailModal isOpen={detailModalOpen} onClose={() => setDetailModalOpen(false)} incident={selectedHackeo} isAdmin={isAdmin} onToggleStatus={toggleIncidentStatus} onEdit={() => { setDetailModalOpen(false); setEditModalOpen(true); }} onDelete={deleteIncident} />
            <EditIncidentModal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} incident={selectedHackeo} onUpdate={updateIncident} />
        </>
    );
};