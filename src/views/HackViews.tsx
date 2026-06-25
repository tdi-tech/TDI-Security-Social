import React, { useState, useEffect, useMemo } from 'react';
import { 
    Download, FileText, ShieldAlert, CheckCircle2, Printer, Link as LinkIcon, 
    Camera, Megaphone, Key, LogOut, PowerOff, MailCheck, MonitorDot, 
    RefreshCw, Globe, Clock, MessageSquare, ListChecks, AlertTriangle, 
    Save, X, Edit3, Trash2, Search, ChevronDown, ChevronRight, ChevronLeft
} from 'lucide-react';
import { doc, setDoc, addDoc, collection, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../firebase/config';

const inputStyles = "w-full p-2.5 rounded-xl theme-bg-low border theme-border theme-text-main focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-all";

const getMonthName = (monthNum: string) => {
    const months: any = { '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril', '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto', '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre' };
    return months[monthNum] || 'Desconocido';
};

const checklistData = [
    { id: 'c1', icon: Camera, text: 'Evidencia capturada (capturas, logs, URLs)' },
    { id: 'c2', icon: Megaphone, text: 'Reporte interno realizado a TI/Manager' },
    { id: 'c3', icon: Key, text: 'Cambio de contraseñas desde dispositivo limpio' },
    { id: 'c4', icon: LogOut, text: 'Sesiones activas cerradas en todas las plataformas' },
    { id: 'c5', icon: PowerOff, text: 'Apps de terceros revocadas' },
    { id: 'c6', icon: MailCheck, text: 'Correo/teléfono de recuperación verificados' },
    { id: 'c7', icon: MonitorDot, text: 'Equipo aislado y escaneado con Antivirus' },
    { id: 'c8', icon: RefreshCw, text: 'Tokens/APIs regenerados' },
    { id: 'c9', icon: Globe, text: 'Contenido legítimo restaurado' },
    { id: 'c10', icon: Clock, text: 'Monitoreo activo programado (72h)' },
    { id: 'c11', icon: FileText, text: 'Reporte post-incidente iniciado' },
    { id: 'c12', icon: MessageSquare, text: 'Comunicación externa emitida (si aplica)' }
];

export const NewIncidentView = ({ isAdmin, user, showToast, navigate, logAction }: any) => {
    const [vector, setVector] = useState('Desconocido');
    const [otroVector, setOtroVector] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!isAdmin || !user) return showToast('Modo de Solo Lectura / Sin conexión', true);
        setIsSubmitting(true);

        const formData = new FormData(e.target);
        const finalVector = vector === 'Otro' ? otroVector || 'Otro' : vector;
        const autorNombre = user.displayName || user.email || 'Administrador';
        const newId = Date.now().toString();

        const newIncident = {
            id: newId,
            fecha: new Date().toISOString(),
            autor: autorNombre,
            plataforma: formData.get('plataforma'),
            vector: finalVector,
            descripcion: formData.get('descripcion'),
            vistas: Number(formData.get('vistas')) || 0,
            interacciones: Number(formData.get('interacciones')) || 0,
            impacto: formData.get('impacto'),
            contencion: formData.get('contencion'),
            erradicacion: formData.get('erradicacion'),
            lecciones: formData.get('lecciones'),
            estado: 'Abierto'
        };

        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'incidents', newId), newIncident);
            if (logAction) await logAction('Creó un nuevo registro de seguridad', 'Hackeos', 'create', newId);
            showToast('Incidente de seguridad guardado exitosamente.');
            navigate('historial');
        } catch (err: any) {
            showToast('Error al guardar: ' + err.message, true);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 fade-in pb-10">
            <div className="theme-bg-container p-6 rounded-2xl border theme-border shadow-sm">
                <div className="border-b theme-border pb-4 mb-6">
                    <h2 className="text-xl font-bold theme-text-main flex items-center gap-2"><AlertTriangle className="w-6 h-6 text-[var(--error)]" /> Reportar Incidente de Seguridad</h2>
                    <p className="text-sm theme-text-muted mt-1 ml-8">Registra un evento crítico relacionado con accesos no autorizados o pérdida de cuentas corporativas.</p>
                </div>
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex flex-col gap-4">
                        <h3 className="text-sm font-bold theme-text-main uppercase tracking-wider flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs">1</span> Datos Básicos</h3>
                        <div className="p-5 theme-bg-lowest border theme-border rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1"><label className="text-xs font-medium theme-text-muted">Plataforma(s) Afectada(s)</label><input type="text" name="plataforma" required className={inputStyles} placeholder="Ej: Instagram, Facebook..." /></div>
                            <div className="space-y-1"><label className="text-xs font-medium theme-text-muted">Vector de Ataque</label>
                                <select value={vector} onChange={(e) => setVector(e.target.value)} className={inputStyles}>
                                    <option value="Desconocido">Desconocido</option><option value="Phishing">Phishing</option><option value="Malware/Troyano">Malware/Troyano</option><option value="Contraseña Débil">Contraseña Débil</option><option value="App Tercera">App de Terceros</option><option value="Torrents/P2P">Descargas P2P/Torrents</option><option value="Otro">Otro (Especificar)</option>
                                </select>
                                {vector === 'Otro' && <input type="text" value={otroVector} onChange={(e) => setOtroVector(e.target.value)} required className={`${inputStyles} mt-2 fade-in`} placeholder="Especifica el vector..." />}
                            </div>
                            <div className="space-y-1 md:col-span-2"><label className="text-xs font-medium theme-text-muted">Descripción del Incidente</label><textarea name="descripcion" required rows={3} className={`${inputStyles} resize-none`} placeholder="¿Qué sucedió?"></textarea></div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="text-sm font-bold theme-text-main uppercase tracking-wider flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs">2</span> Impacto y Alcance</h3>
                        <div className="p-5 theme-bg-lowest border theme-border rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="space-y-1"><label className="text-xs font-medium theme-text-muted">Vistas Estimadas</label><input type="number" name="vistas" className={inputStyles} placeholder="0" /></div>
                            <div className="space-y-1"><label className="text-xs font-medium theme-text-muted">Interacciones</label><input type="number" name="interacciones" className={inputStyles} placeholder="0" /></div>
                            <div className="space-y-1"><label className="text-xs font-medium theme-text-muted">Nivel de Impacto</label><select name="impacto" className={inputStyles}><option value="Bajo">🟢 Bajo</option><option value="Medio">🟡 Medio</option><option value="Alto">🔴 Alto</option><option value="Crítico">🟣 Crítico</option></select></div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="text-sm font-bold theme-text-main uppercase tracking-wider flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs">3</span> Acciones Tomadas</h3>
                        <div className="p-5 theme-bg-lowest border theme-border rounded-xl grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1"><label className="text-xs font-medium theme-text-muted">Contención Inmediata</label><textarea name="contencion" rows={3} className={`${inputStyles} resize-none`} placeholder="Ej: Cambio de contraseña..."></textarea></div>
                            <div className="space-y-1"><label className="text-xs font-medium theme-text-muted">Erradicación / Limpieza</label><textarea name="erradicacion" rows={3} className={`${inputStyles} resize-none`} placeholder="Ej: Formateo de equipo..."></textarea></div>
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <h3 className="text-sm font-bold theme-text-main uppercase tracking-wider flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs">4</span> Cierre</h3>
                        <div className="p-5 theme-bg-lowest border theme-border rounded-xl space-y-1"><label className="text-xs font-medium theme-text-muted">Lecciones Aprendidas</label><textarea name="lecciones" rows={2} className={`${inputStyles} resize-none`} placeholder="¿Qué podríamos mejorar?"></textarea></div>
                    </div>
                    <div className="pt-4 flex items-center justify-end gap-3 border-t theme-border">
                        <button type="button" onClick={() => navigate('dashboard')} className="px-5 py-2.5 rounded-xl font-medium theme-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-[var(--primary)] text-white hover:brightness-110 transition-all disabled:opacity-50">{isSubmitting ? 'Guardando...' : <><Save className="w-5 h-5"/> Guardar Incidente</>}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const HistorialView = ({ showToast, setSelectedIncidentId, setDetailModalOpen, isAdmin }: any) => {
    
    // 🔄 ESTADOS LOCALES PARA LAZY LOADING
    const [incidents, setIncidents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterYear, setFilterYear] = useState('Todos');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [pagePerMonth, setPagePerMonth] = useState<Record<string, number>>({});
    const itemsPerPage = 30;

    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportType, setExportType] = useState('all');
    const [exportYear, setExportYear] = useState('');
    const [exportMonth, setExportMonth] = useState('');

    // 🔄 EFECTO DE CARGA INDEPENDIENTE
    useEffect(() => {
        setIsLoading(true);
        const incidentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'incidents');
        const unsub = onSnapshot(incidentsRef, (snapshot) => {
            const data: any[] = [];
            snapshot.forEach((doc) => data.push(doc.data()));
            data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
            setIncidents(data);
            setTimeout(() => setIsLoading(false), 600); // 600ms de gracia para que se luzca la animación del skeleton
        });
        return () => unsub();
    }, []);

    const availableYears = useMemo(() => {
        const years = new Set(incidents.map((i: any) => i.fecha ? i.fecha.split('-')[0] : null).filter(Boolean));
        return Array.from(years).sort((a: any, b: any) => b.localeCompare(a));
    }, [incidents]);

    const availableMonthsForExport = useMemo(() => {
        if (!exportYear) return [];
        const months = new Set(
            incidents
                .filter((i: any) => i.fecha && i.fecha.split('-')[0] === exportYear)
                .map((i: any) => i.fecha.split('-')[1])
        );
        return Array.from(months).sort((a: any, b: any) => b.localeCompare(a));
    }, [incidents, exportYear]);

    const filteredIncidents = useMemo(() => {
        return incidents.filter((inc: any) => {
            const year = inc.fecha ? inc.fecha.split('-')[0] : '';
            const matchYear = filterYear === 'Todos' || year === filterYear;
            const term = searchTerm.toLowerCase();
            const matchSearch = term === '' || 
                (inc.plataforma && inc.plataforma.toLowerCase().includes(term)) ||
                (inc.vector && inc.vector.toLowerCase().includes(term)) ||
                (inc.impacto && inc.impacto.toLowerCase().includes(term)) ||
                (inc.estado && inc.estado.toLowerCase().includes(term)) ||
                (inc.descripcion && inc.descripcion.toLowerCase().includes(term)) ||
                (isAdmin && inc.autor && inc.autor.toLowerCase().includes(term));
            return matchYear && matchSearch;
        });
    }, [incidents, searchTerm, filterYear, isAdmin]);

    const groupedData = useMemo(() => {
        const groups: Record<string, Record<string, any[]>> = {};
        filteredIncidents.forEach((inc: any) => {
            const year = inc.fecha ? inc.fecha.split('-')[0] : 'Sin Fecha';
            const month = inc.fecha ? inc.fecha.split('-')[1] : '00';
            if (!groups[year]) groups[year] = {};
            if (!groups[year][month]) groups[year][month] = [];
            groups[year][month].push(inc);
        });
        return groups;
    }, [filteredIncidents]);

    useEffect(() => {
        if (Object.keys(groupedData).length > 0) {
            const sortedYears = Object.keys(groupedData).sort((a, b) => b.localeCompare(a));
            const newestYear = sortedYears[0];
            const sortedMonths = Object.keys(groupedData[newestYear]).sort((a, b) => b.localeCompare(a));
            const newestMonth = sortedMonths[0];
            setExpandedSections(prev => ({ ...prev, [newestYear]: true, [`${newestYear}-${newestMonth}`]: true }));
        }
    }, [groupedData]);

    const toggleSection = (key: string) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

    const handleExecuteExport = () => {
        let dataToExport = incidents;
        let filenameSuffix = 'Todo';

        if (exportType === 'year') {
            if (!exportYear) return showToast('Selecciona un año para exportar', true);
            dataToExport = incidents.filter((i: any) => i.fecha && i.fecha.split('-')[0] === exportYear);
            filenameSuffix = exportYear;
        } else if (exportType === 'month') {
            if (!exportYear || !exportMonth) return showToast('Selecciona año y mes para exportar', true);
            dataToExport = incidents.filter((i: any) => i.fecha && i.fecha.startsWith(`${exportYear}-${exportMonth}`));
            filenameSuffix = `${exportYear}_${exportMonth}`;
        }

        if (dataToExport.length === 0) return showToast('No hay datos registrados en esa fecha', true);

        const headers = [ 'ID', 'Fecha', 'Autor', 'Plataforma', 'Vector de Ataque', 'Impacto', 'Estado', 'Vistas Estimadas', 'Interacciones', 'Descripción', 'Contención Inmediata', 'Erradicación', 'Lecciones Aprendidas' ];
        let csvContent = headers.join(',') + '\n';
        const escapeCSV = (str: any) => { if (!str) return '""'; return '"' + str.toString().replace(/"/g, '""') + '"'; };
        
        dataToExport.forEach((inc: any) => {
            const row = [ inc.id, new Date(inc.fecha).toLocaleString().replace(/,/g, ''), escapeCSV(isAdmin ? (inc.autor || 'Admin') : 'Anónimo'), escapeCSV(inc.plataforma), escapeCSV(inc.vector), escapeCSV(inc.impacto), escapeCSV(inc.estado), inc.vistas || 0, inc.interacciones || 0, escapeCSV(inc.descripcion), escapeCSV(inc.contencion), escapeCSV(inc.erradicacion), escapeCSV(inc.lecciones) ];
            csvContent += row.join(',') + '\n';
        });

        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a"); 
        link.href = URL.createObjectURL(blob); 
        link.download = `Hackeos_${filenameSuffix}_${new Date().toISOString().split('T')[0]}.csv`; 
        link.click();
        
        setIsExportModalOpen(false);
        showToast('Exportación completada exitosamente');
    };

    return (
        <>
            <div className="fade-in space-y-6 pb-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div><h2 className="text-2xl font-bold theme-text-main">Historial de Seguridad</h2><p className="theme-text-muted text-sm mt-1">Registro de vulnerabilidades, hackeos y recuperación de cuentas.</p></div>
                    <button onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-[var(--error)] text-white rounded-lg hover:brightness-110 transition-all text-sm font-bold shadow-sm"><Download className="w-4 h-4" /> Exportar CSV</button>
                </div>
                <div className="p-4 theme-bg-container border theme-border rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-2/3 flex items-center">
                        <Search className="absolute left-3 text-gray-400 w-4 h-4 pointer-events-none" />
                        <input type="text" placeholder="Buscar por plataforma, vector, impacto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${inputStyles} pl-10 pr-10`} />
                        {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 p-1 rounded-md text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white transition-colors" title="Limpiar búsqueda"><X className="w-4 h-4" /></button>}
                    </div>
                    <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-4">
                        <div className="flex items-center gap-2"><label className="text-xs font-bold theme-text-muted whitespace-nowrap">Año</label><select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className={`${inputStyles} py-1.5 px-3 min-w-[100px]`}><option value="Todos">Todos</option>{availableYears.map((y: any) => <option key={y} value={y}>{y}</option>)}</select></div>
                        <div className="bg-black/5 dark:bg-white/5 border theme-border px-3 py-1.5 rounded-lg whitespace-nowrap"><span className="text-xs font-bold theme-text-main">{filteredIncidents.length}</span><span className="text-[10px] theme-text-muted font-medium ml-1">de {incidents.length}</span></div>
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 fade-in">
                        {[1, 2, 3, 4, 5, 6].map(card => (
                            <div key={card} className="p-5 theme-bg-container rounded-xl border theme-border shadow-sm h-44 animate-pulse flex flex-col">
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-lg bg-gray-300 dark:bg-gray-700 flex-shrink-0"></div>
                                    <div className="flex-1 space-y-2 py-1">
                                        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                                    </div>
                                </div>
                                <div className="space-y-2 mt-2">
                                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                                    <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                                </div>
                                <div className="mt-auto pt-3 border-t theme-border flex gap-2">
                                    <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                                    <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filteredIncidents.length === 0 ? (
                    <div className="text-center py-12 theme-bg-container rounded-2xl border theme-border"><ShieldAlert className="w-12 h-12 theme-text-muted mx-auto mb-4 opacity-30" /><p className="theme-text-muted">No se encontraron incidentes con los criterios actuales.</p></div>
                ) : (
                    <div className="space-y-4">
                        {Object.keys(groupedData).sort((a, b) => b.localeCompare(a)).map(year => {
                            const isYearExpanded = !!expandedSections[year];
                            const totalInYear = Object.values(groupedData[year]).flat().length;

                            return (
                                <div key={year} className="theme-bg-container border theme-border rounded-xl overflow-hidden shadow-sm">
                                    <button onClick={() => toggleSection(year)} className="w-full flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                        <div className="flex items-center gap-3">{isYearExpanded ? <ChevronDown className="w-5 h-5 theme-text-muted" /> : <ChevronRight className="w-5 h-5 theme-text-muted" />}<h3 className="text-lg font-bold theme-text-main">{year}</h3><span className="bg-[var(--error)]/10 text-[var(--error)] px-2 py-0.5 rounded-full text-xs font-bold">{totalInYear}</span></div>
                                        <div className="w-2 h-2 rounded-full bg-[var(--error)]"></div>
                                    </button>
                                    {isYearExpanded && (
                                        <div className="p-4 space-y-4 border-t theme-border bg-[var(--background)]">
                                            {Object.keys(groupedData[year]).sort((a, b) => b.localeCompare(a)).map(month => {
                                                const monthKey = `${year}-${month}`;
                                                const isMonthExpanded = !!expandedSections[monthKey];
                                                const monthItems = groupedData[year][month];
                                                const currentMonthPage = pagePerMonth[monthKey] || 1;
                                                const totalMonthPages = Math.ceil(monthItems.length / itemsPerPage);
                                                const paginatedMonthItems = monthItems.slice((currentMonthPage - 1) * itemsPerPage, currentMonthPage * itemsPerPage);

                                                return (
                                                    <div key={monthKey} className="border theme-border rounded-lg overflow-hidden bg-[var(--surface)]">
                                                        <button onClick={() => toggleSection(monthKey)} className="w-full flex items-center gap-2 p-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">{isMonthExpanded ? <ChevronDown className="w-4 h-4 theme-text-muted" /> : <ChevronRight className="w-4 h-4 theme-text-muted" />}<h4 className="text-sm font-bold theme-text-main uppercase tracking-wider">{getMonthName(month)}</h4><span className="text-xs theme-text-muted">({monthItems.length})</span></button>
                                                        {isMonthExpanded && (
                                                            <div className="border-t theme-border bg-[var(--surface)]">
                                                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                    {paginatedMonthItems.map((inc: any) => (
                                                                        <div key={inc.id} onClick={() => { setSelectedIncidentId(inc.id); setDetailModalOpen(true); }} className="p-5 theme-bg-container rounded-xl border theme-border shadow-sm hover:border-[var(--error)] transition-colors cursor-pointer group flex flex-col h-full border-l-4 border-l-[var(--error)]">
                                                                            <div className="flex items-start gap-3 mb-3">
                                                                                <div className="w-10 h-10 rounded-lg theme-bg-low flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--error)] transition-colors"><ShieldAlert className="w-5 h-5 text-[var(--error)] group-hover:text-white transition-colors" /></div>
                                                                                <div className="flex-1 min-w-0">
                                                                                    <h3 className="font-bold theme-text-main truncate text-base">{inc.plataforma}</h3>
                                                                                    <p className="text-[10px] font-semibold theme-text-muted mt-0.5 truncate">{new Date(inc.fecha).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}{isAdmin && inc.autor && <><span className="mx-1">|</span> Por: <span className="text-[var(--primary)] truncate">{inc.autor}</span></>}</p>
                                                                                </div>
                                                                            </div>
                                                                            <div className="text-sm theme-text-main line-clamp-2 min-h-[40px] opacity-90 mb-3"><span className="font-bold mr-1">Vector: {inc.vector} -</span> {inc.descripcion}</div>
                                                                            <div className="mt-auto flex items-center justify-between gap-2 pt-3 border-t theme-border"><span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${inc.estado === 'Resuelto' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>{inc.estado}</span><span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">Impacto: {inc.impacto}</span></div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                {totalMonthPages > 1 && (
                                                                    <div className="p-4 flex items-center justify-between border-t theme-border bg-black/5 dark:bg-white/5">
                                                                        <p className="text-xs theme-text-muted">Mostrando <span className="font-bold theme-text-main">{((currentMonthPage - 1) * itemsPerPage) + 1}</span> a <span className="font-bold theme-text-main">{Math.min(currentMonthPage * itemsPerPage, monthItems.length)}</span> de <span className="font-bold theme-text-main">{monthItems.length}</span> reportes</p>
                                                                        <div className="flex items-center gap-2">
                                                                            <button type="button" onClick={(e) => { e.stopPropagation(); setPagePerMonth(prev => ({...prev, [monthKey]: Math.max((prev[monthKey] || 1) - 1, 1)})) }} disabled={currentMonthPage === 1} className="p-1.5 rounded-lg theme-bg-low border theme-border theme-text-main hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                                                                            <span className="text-xs font-bold theme-text-main px-2">Página {currentMonthPage} de {totalMonthPages}</span>
                                                                            <button type="button" onClick={(e) => { e.stopPropagation(); setPagePerMonth(prev => ({...prev, [monthKey]: Math.min((prev[monthKey] || 1) + 1, totalMonthPages)})) }} disabled={currentMonthPage === totalMonthPages} className="p-1.5 rounded-lg theme-bg-low border theme-border theme-text-main hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><ChevronRight className="w-4 h-4" /></button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* MODAL DE EXPORTACIÓN INTELIGENTE (FUERA DEL CONTENEDOR PRINCIPAL) */}
            {isExportModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 fade-in">
                    <div className="theme-bg-container rounded-2xl w-full max-w-md shadow-2xl border theme-border flex flex-col overflow-hidden">
                        <div className="p-5 border-b theme-border flex justify-between items-center bg-red-500/5">
                            <h3 className="font-bold theme-text-main flex items-center gap-2"><Download className="w-5 h-5 text-red-500" /> Exportación Inteligente CSV</h3>
                            <button onClick={() => setIsExportModalOpen(false)} className="p-2 theme-text-muted hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <p className="text-sm theme-text-muted">Selecciona el alcance de los datos que deseas descargar en formato CSV para tu reporte.</p>
                            <div className="space-y-3">
                                <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${exportType === 'all' ? 'border-red-500 bg-red-500/5' : 'theme-border theme-bg-low hover:border-gray-400'}`}>
                                    <input type="radio" name="exportType" checked={exportType === 'all'} onChange={() => setExportType('all')} className="w-4 h-4 text-red-500" />
                                    <div><p className="text-sm font-bold theme-text-main">Todo el Historial</p><p className="text-xs theme-text-muted">Descarga todos los incidentes registrados.</p></div>
                                </label>
                                
                                <label className={`flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${exportType === 'year' ? 'border-red-500 bg-red-500/5' : 'theme-border theme-bg-low hover:border-gray-400'}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="exportType" checked={exportType === 'year'} onChange={() => { setExportType('year'); if(!exportYear && availableYears.length) setExportYear(String(availableYears[0])); }} className="w-4 h-4 text-red-500" />
                                        <div><p className="text-sm font-bold theme-text-main">Filtrar por Año</p><p className="text-xs theme-text-muted">Descarga un año en específico.</p></div>
                                    </div>
                                    {exportType === 'year' && (
                                        <div className="ml-7 fade-in">
                                            <select value={exportYear} onChange={(e) => setExportYear(e.target.value)} className={inputStyles}>
                                                <option value="" disabled>Selecciona un año</option>
                                                {availableYears.map((y: any) => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </label>

                                <label className={`flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${exportType === 'month' ? 'border-red-500 bg-red-500/5' : 'theme-border theme-bg-low hover:border-gray-400'}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="exportType" checked={exportType === 'month'} onChange={() => { setExportType('month'); if(!exportYear && availableYears.length) setExportYear(String(availableYears[0])); }} className="w-4 h-4 text-red-500" />
                                        <div><p className="text-sm font-bold theme-text-main">Filtrar por Mes</p><p className="text-xs theme-text-muted">Descarga un mes y año específico.</p></div>
                                    </div>
                                    {exportType === 'month' && (
                                        <div className="ml-7 flex gap-3 fade-in">
                                            <select value={exportYear} onChange={(e) => setExportYear(e.target.value)} className={`${inputStyles} w-1/2`}>
                                                <option value="" disabled>Año</option>
                                                {availableYears.map((y: any) => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                            <select value={exportMonth} onChange={(e) => setExportMonth(e.target.value)} className={`${inputStyles} w-1/2`}>
                                                <option value="" disabled>Mes</option>
                                                {availableMonthsForExport.map((m: any) => <option key={m} value={m}>{getMonthName(m)}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                        <div className="p-4 border-t theme-border flex justify-end gap-3 bg-black/5 dark:bg-white/5">
                            <button onClick={() => setIsExportModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold theme-text-main hover:bg-black/10 dark:hover:bg-white/10 transition-colors">Cancelar</button>
                            <button onClick={handleExecuteExport} className="px-5 py-2.5 rounded-xl font-bold bg-red-600 text-white hover:bg-red-500 flex items-center gap-2 shadow-sm"><Download className="w-4 h-4"/> Generar CSV</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export const ChecklistView = ({ checklistState, setChecklistState, isAdmin, showToast, setConfirmModal }: any) => {
    const completedCount = checklistData.filter(i => checklistState[i.id]).length;
    const percent = Math.round((completedCount / checklistData.length) * 100) || 0;

    const handleToggle = async (id: string) => {
        if (!isAdmin) return showToast("Debes ser Administrador para modificar.", true);
        const newState = { ...checklistState, [id]: !checklistState[id] };
        if (!newState[id] && id === 'c1') newState.c1_link = '';
        setChecklistState(newState); 
        try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'appState', 'globalChecklist'), { items: newState }); } catch (e) { showToast("Error de sincronización", true); }
    };

    const updateLink = async (id: string, link: string) => {
        if (!isAdmin) return;
        const newState = { ...checklistState, [`${id}_link`]: link };
        setChecklistState(newState);
        try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'appState', 'globalChecklist'), { items: newState }); showToast('Enlace guardado'); } catch (e) { showToast("Error", true); }
    };

    const handleReset = () => {
        setConfirmModal({
            isOpen: true, title: 'Reiniciar Checklist', msg: 'Esto borrará el progreso para todos. ¿Continuar?',
            onConfirm: async () => { try { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'appState', 'globalChecklist'), { items: {} }); showToast('Checklist reiniciado'); } catch(e) { showToast("Error", true); } }
        });
    };

    return (
        <div className="fade-in max-w-4xl mx-auto pb-10 print:pb-0">
            <div className="theme-bg-container p-6 rounded-2xl border theme-border shadow-sm mb-6 print:border-none print:shadow-none print:p-0">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b theme-border pb-4 mb-6 no-print">
                    <div><h2 className="text-xl font-bold theme-text-main flex items-center gap-2"><ListChecks className="w-6 h-6 text-[var(--primary)]" />Checklist de Respuesta Rápida</h2><p className="text-sm theme-text-muted mt-1 ml-8">Pasos estandarizados para contener un incidente activo en tiempo real.</p></div>
                    {isAdmin && <button onClick={handleReset} className="text-xs font-bold text-[var(--error)] bg-[var(--error)]/10 px-3 py-1.5 rounded-lg hover:bg-[var(--error)]/20 transition-colors">Reiniciar Progreso</button>}
                </div>
                <h1 className="hidden print:block text-3xl font-bold text-black mb-8 border-b pb-4">Innova Management - Reporte de Checklist</h1>
                <div className="theme-bg-low rounded-xl border theme-border p-5 mb-6 print:border-gray-300 print:bg-white">
                    <div className="h-4 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden print:border print:border-gray-300"><div className="h-full bg-[var(--primary)] transition-all duration-500 print:bg-blue-600" style={{ width: `${percent}%` }}></div></div>
                    <div className="flex justify-between px-1 pt-3"><span className="text-xs font-medium theme-text-muted print:text-black">Progreso Global Compartido</span><span className="text-xs font-bold text-[var(--primary)] print:text-black">{percent}% Completado</span></div>
                </div>
                <div className="space-y-3 print:space-y-4">
                    {checklistData.map(item => {
                        const isChecked = checklistState[item.id] || false;
                        const IconComponent = item.icon;
                        return (
                            <div key={item.id} className={`p-4 rounded-xl border transition-all print:break-inside-avoid print:bg-white print:border-gray-300 ${isChecked ? 'bg-[var(--success)]/10 border-[var(--success)]/30' : 'theme-bg-lowest theme-border hover:border-[var(--primary)]/50 shadow-sm'}`}>
                                <div className={`flex items-center ${isAdmin ? 'cursor-pointer' : 'cursor-default opacity-90'}`} onClick={() => handleToggle(item.id)}>
                                    <div className={`w-6 h-6 rounded border-2 flex items-center justify-center mr-4 flex-shrink-0 transition-colors print:border-gray-400 ${isChecked ? 'bg-[var(--success)] border-[var(--success)] print:bg-green-500' : 'border-[var(--on-surface-variant)]'}`}>{isChecked && <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />}</div>
                                    <IconComponent className={`w-4 h-4 mr-3 flex-shrink-0 ${isChecked ? 'text-[var(--success)] print:text-green-600' : 'theme-text-muted print:text-gray-500'}`} />
                                    <span className={`text-sm font-medium ${isChecked ? 'text-[var(--success)] print:text-green-700 line-through' : 'theme-text-main print:text-black'}`}>{item.text}</span>
                                </div>
                                {isChecked && item.id === 'c1' && (
                                    <div className="ml-10 mt-4 pt-3 border-t border-[var(--success)]/20 print:border-gray-200 fade-in">
                                        <label className="text-xs font-bold text-[var(--success)] print:text-black uppercase tracking-wider mb-2 flex items-center gap-1"><LinkIcon className="w-3 h-3"/> Enlace a Carpeta de Evidencias (Drive)</label>
                                        <input type="url" placeholder="🔗 Pega la URL de Google Drive aquí..." defaultValue={checklistState[`${item.id}_link`] || ''} onBlur={(e) => updateLink(item.id, e.target.value)} className={`${inputStyles} bg-white dark:bg-black/20 no-print`} disabled={!isAdmin} />
                                        {checklistState[`${item.id}_link`] && <a href={checklistState[`${item.id}_link`]} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-500 hover:underline mt-2 block print-friendly break-all">{checklistState[`${item.id}_link`]}</a>}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="mt-8 flex justify-end no-print pt-6 border-t theme-border"><button onClick={() => window.print()} className="px-5 py-2.5 theme-bg-low theme-border border theme-text-main font-bold rounded-xl shadow-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex items-center gap-2"><Printer className="w-5 h-5"/> Imprimir Checklist</button></div>
            </div>
        </div>
    );
};

export const DetailModal = ({ isOpen, onClose, incident, isAdmin, onToggleStatus, onEdit, onDelete }: any) => {
    if (!isOpen || !incident) return null;
    return (
        <>
            <style type="text/css" media="print">{` main { display: none !important; } `}</style>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 fade-in print:static print:block print:p-0 print:bg-transparent">
                <div className="theme-bg-container rounded-2xl w-full max-w-2xl shadow-2xl border theme-border overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-full">
                    <div className="p-5 border-b theme-border flex justify-between items-center bg-[var(--primary)]/5 no-print">
                        <div className="flex items-center gap-3"><div className="p-2 bg-[var(--primary)]/20 rounded-lg"><ShieldAlert className="w-5 h-5 text-[var(--primary)]" /></div><div><h3 className="font-bold theme-text-main text-lg">{incident.plataforma}</h3><p className="text-xs theme-text-muted font-medium">Fecha: {new Date(incident.fecha).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p></div></div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => window.print()} className="p-2 theme-text-muted hover:theme-text-main hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors" title="Imprimir"><Printer className="w-5 h-5"/></button>
                            {isAdmin && (
                                <><button onClick={onEdit} className="p-2 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors" title="Editar"><Edit3 className="w-5 h-5"/></button><button onClick={() => { onClose(); onDelete(incident.id); }} className="p-2 text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-colors" title="Eliminar"><Trash2 className="w-5 h-5"/></button></>
                            )}
                            <button onClick={onClose} className="p-2 theme-text-muted hover:theme-text-main bg-black/5 dark:bg-white/5 rounded-lg"><X className="w-5 h-5"/></button>
                        </div>
                    </div>
                    <div className="p-6 overflow-y-auto custom-scrollbar print:overflow-visible flex-1">
                        <div className="hidden print:block text-2xl font-bold text-black border-b border-gray-300 pb-4 mb-6">Reporte de Incidente de Seguridad - {incident.plataforma}<p className="text-sm font-normal text-gray-500 mt-1">Fecha: {new Date(incident.fecha).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</p></div>
                        <div className="mb-6 flex items-center gap-2"><span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${incident.estado === 'Resuelto' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>{incident.estado}</span><span className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1">Impacto: {incident.impacto}</span>{isAdmin && <button onClick={() => onToggleStatus(incident.id)} className="ml-auto px-3 py-1.5 bg-black/5 dark:bg-white/5 rounded-lg text-xs font-bold theme-text-main hover:brightness-110 transition-all no-print">Marcar como {incident.estado === 'Resuelto' ? 'Abierto' : 'Resuelto'}</button>}</div>
                        <div className="grid grid-cols-2 gap-6 mb-8 print:mt-4"><div><p className="text-xs theme-text-muted font-medium mb-1">Vector de Ataque</p><p className="font-bold theme-text-main text-lg">{incident.vector}</p></div><div><p className="text-xs theme-text-muted font-medium mb-1">Alcance Estimado</p><p className="font-bold theme-text-main text-sm">{incident.vistas} vistas • {incident.interacciones} interacciones</p></div></div>
                        <div className="space-y-6">
                            <div><p className="text-xs theme-text-muted font-medium mb-2 uppercase tracking-wider">Descripción del Incidente</p><div className="p-4 theme-bg-low rounded-xl border theme-border theme-text-main text-sm whitespace-pre-wrap leading-relaxed">{incident.descripcion}</div></div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="flex flex-col"><p className="text-xs theme-text-muted font-medium mb-2 uppercase tracking-wider">Contención Inmediata</p><div className="p-4 theme-bg-low rounded-xl border theme-border theme-text-main text-sm whitespace-pre-wrap leading-relaxed flex-1">{incident.contencion || 'No especificada'}</div></div>
                                <div className="flex flex-col"><p className="text-xs theme-text-muted font-medium mb-2 uppercase tracking-wider">Erradicación / Limpieza</p><div className="p-4 theme-bg-low rounded-xl border theme-border theme-text-main text-sm whitespace-pre-wrap leading-relaxed flex-1">{incident.erradicacion || 'No especificada'}</div></div>
                            </div>
                            <div><p className="text-xs theme-text-muted font-medium mb-2 uppercase tracking-wider">Lecciones Aprendidas</p><div className="p-4 theme-bg-low rounded-xl border theme-border theme-text-main text-sm whitespace-pre-wrap leading-relaxed">{incident.lecciones || 'No especificadas'}</div></div>
                        </div>
                        <div className="mt-8 pt-4 border-t theme-border flex justify-between items-center">{isAdmin ? <p className="text-sm font-bold theme-text-muted italic flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[var(--primary)]"></span>Reportado por: <span className="theme-text-main">{incident.autor || 'Administrador'}</span></p> : <p className="text-sm font-bold theme-text-muted italic flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-400"></span>Registro de sistema (Acceso público)</p>}</div>
                    </div>
                </div>
            </div>
        </>
    );
};

export const EditIncidentModal = ({ isOpen, onClose, incident, onUpdate }: any) => {
    const [vector, setVector] = useState('Desconocido');
    const [otroVector, setOtroVector] = useState('');

    useEffect(() => {
        if (incident) {
            const vectoresConocidos = ['Desconocido', 'Phishing', 'Malware/Troyano', 'Contraseña Débil', 'App Tercera', 'Torrents/P2P'];
            if (vectoresConocidos.includes(incident.vector)) { setVector(incident.vector); setOtroVector(''); } 
            else { setVector('Otro'); setOtroVector(incident.vector); }
        }
    }, [incident, isOpen]);

    if (!isOpen || !incident) return null;

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const finalVector = vector === 'Otro' ? otroVector || 'Otro' : vector;
        const updatedData = { plataforma: formData.get('plataforma'), vector: finalVector, descripcion: formData.get('descripcion'), vistas: Number(formData.get('vistas')) || 0, interacciones: Number(formData.get('interacciones')) || 0, impacto: formData.get('impacto'), contencion: formData.get('contencion'), erradicacion: formData.get('erradicacion'), lecciones: formData.get('lecciones') };
        onUpdate(incident.id, updatedData);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 fade-in">
            <div className="theme-bg-container rounded-2xl w-full max-w-3xl shadow-2xl border theme-border flex flex-col max-h-[90vh] overflow-hidden">
                <div className="p-5 border-b theme-border flex justify-between items-center bg-[var(--primary)]/5">
                    <h3 className="font-bold theme-text-main flex items-center gap-2"><Edit3 className="w-5 h-5 text-[var(--primary)]" /> Editar Incidente de Seguridad</h3>
                    <button onClick={onClose} className="p-2 theme-text-muted hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"><X className="w-5 h-5"/></button>
                </div>
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <form id="editHackForm" onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 theme-bg-lowest border theme-border rounded-xl">
                            <div className="space-y-1"><label className="text-xs font-bold theme-text-muted">Plataforma</label><input name="plataforma" type="text" required defaultValue={incident.plataforma} className={inputStyles} /></div>
                            <div className="space-y-1"><label className="text-xs font-bold theme-text-muted">Vector de Ataque</label>
                                <select value={vector} onChange={(e) => setVector(e.target.value)} className={inputStyles}><option value="Desconocido">Desconocido</option><option value="Phishing">Phishing</option><option value="Malware/Troyano">Malware/Troyano</option><option value="Contraseña Débil">Contraseña Débil</option><option value="App Tercera">App de Terceros</option><option value="Torrents/P2P">Descargas P2P/Torrents</option><option value="Otro">Otro (Especificar)</option></select>
                                {vector === 'Otro' && (<input type="text" value={otroVector} onChange={(e) => setOtroVector(e.target.value)} required className={`${inputStyles} mt-2 fade-in`} placeholder="Especifica..." />)}
                            </div>
                            <div className="space-y-1 md:col-span-2"><label className="text-xs font-bold theme-text-muted">Descripción del Incidente</label><textarea name="descripcion" required rows={2} defaultValue={incident.descripcion} className={`${inputStyles} resize-none`}></textarea></div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-5 theme-bg-lowest border theme-border rounded-xl">
                            <div className="space-y-1"><label className="text-xs font-bold theme-text-muted">Vistas</label><input name="vistas" type="number" defaultValue={incident.vistas} className={inputStyles} /></div>
                            <div className="space-y-1"><label className="text-xs font-bold theme-text-muted">Interacciones</label><input name="interacciones" type="number" defaultValue={incident.interacciones} className={inputStyles} /></div>
                            <div className="space-y-1"><label className="text-xs font-bold theme-text-muted">Nivel de Impacto</label>
                                <select name="impacto" defaultValue={incident.impacto} className={inputStyles}><option value="Bajo">Bajo</option><option value="Medio">Medio</option><option value="Alto">Alto</option><option value="Crítico">Crítico</option></select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 theme-bg-lowest border theme-border rounded-xl">
                            <div className="space-y-1"><label className="text-xs font-bold theme-text-muted">Contención Inmediata</label><textarea name="contencion" rows={3} defaultValue={incident.contencion} className={`${inputStyles} resize-none`}></textarea></div>
                            <div className="space-y-1"><label className="text-xs font-bold theme-text-muted">Erradicación</label><textarea name="erradicacion" rows={3} defaultValue={incident.erradicacion} className={`${inputStyles} resize-none`}></textarea></div>
                        </div>
                        <div className="p-5 theme-bg-lowest border theme-border rounded-xl space-y-1 mt-2"><label className="text-xs font-bold theme-text-muted">Lecciones Aprendidas</label><textarea name="lecciones" rows={2} defaultValue={incident.lecciones} className={`${inputStyles} resize-none`}></textarea></div>
                    </form>
                </div>
                <div className="p-4 border-t theme-border flex justify-end gap-3 bg-black/5 dark:bg-white/5">
                    <button onClick={onClose} className="px-5 py-2 rounded-xl font-bold theme-text-main hover:bg-black/10 dark:hover:bg-white/10 transition-colors">Cancelar</button>
                    <button type="submit" form="editHackForm" className="px-5 py-2 rounded-xl font-bold bg-[var(--primary)] text-white hover:brightness-110 flex items-center gap-2"><Save className="w-4 h-4"/> Actualizar Incidente</button>
                </div>
            </div>
        </div>
    );
};