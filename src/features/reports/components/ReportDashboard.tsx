import React, { useState, useRef, useCallback, useMemo } from 'react';
import { Chart as ChartJS, ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { collection, getDocs } from 'firebase/firestore';
import { db, appId } from '../../../services/firebase/config';
import { normalizeComments, normalizeRRSS, generateCSV, downloadCSV, type ReportRow } from '../utils/csvExport';
import { calcSentiment, calcRedSocial, calcOrigen, calcTrend, calcCampusRanking, calcTopUsers, useReportGenerator } from '../hooks/useReportGenerator';
import { BarChart3, FileUp, FileDown, Database, UploadCloud, Box, Filter } from 'lucide-react';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, LineElement, PointElement, Tooltip, Legend);

const CHART_OPTIONS = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' as const, labels: { boxWidth: 10, boxHeight: 10, padding: 14 } } }
};

const RED_COLORS = ['#5b8def', '#e0485a', '#2fd9c4', '#f5a93f', '#4fd18b'];

const MESES = [
    { v: '01', n: 'Enero' }, { v: '02', n: 'Febrero' }, { v: '03', n: 'Marzo' }, { v: '04', n: 'Abril' },
    { v: '05', n: 'Mayo' }, { v: '06', n: 'Junio' }, { v: '07', n: 'Julio' }, { v: '08', n: 'Agosto' },
    { v: '09', n: 'Septiembre' }, { v: '10', n: 'Octubre' }, { v: '11', n: 'Noviembre' }, { v: '12', n: 'Diciembre' }
];

export const ReportDashboard = ({ showToast, isAdmin, userRole }: any) => {
    const [allData, setAllData] = useState<ReportRow[]>([]);
    const [rowData, setRowData] = useState<ReportRow[]>([]);
    const [sourceLabel, setSourceLabel] = useState('');
    const [fileInputKey, setFileInputKey] = useState(0);
    const [loadingDb, setLoadingDb] = useState(false);
    const [filterYear, setFilterYear] = useState('');
    const [filterMonth, setFilterMonth] = useState('');
    const [hasDbData, setHasDbData] = useState(false);

    const fileRef = useRef<HTMLInputElement>(null);
    const { generatePDF } = useReportGenerator();

    const availableYears = useMemo(() => {
        const years = new Set<string>();
        allData.forEach(r => { const y = r.fechaInicio ? r.fechaInicio.split('-')[0] : ''; if (y) years.add(y); });
        return Array.from(years).sort((a, b) => b.localeCompare(a));
    }, [allData]);

    const applyFilters = useCallback((data: ReportRow[], year: string, month: string) => {
        return data.filter(r => {
            if (!r.fechaInicio) return !year && !month;
            const [y, m] = r.fechaInicio.split('-');
            if (year && y !== year) return false;
            if (month && m !== month) return false;
            return true;
        });
    }, []);

    const handleYearChange = (year: string) => {
        setFilterYear(year);
        setFilterMonth('');
        setRowData(applyFilters(allData, year, ''));
    };

    const handleMonthChange = (month: string) => {
        setFilterMonth(month);
        setRowData(applyFilters(allData, filterYear, month));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.name.toLowerCase().endsWith('.csv')) {
            showToast('El archivo debe ser .csv', true);
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result as string;
            // Parseo simple del CSV
            try {
                const lines = text.split(/\r?\n/).filter(l => l.trim());
                if (lines.length < 2) { showToast('CSV sin datos', true); return; }
                const headers = lines[0].split(',').map(h => h.replace(/^"|"$/g, '').trim());
                const idx = (name: string) => headers.indexOf(name);
                const required = ['Fecha Inicio', 'Red Social', 'Campus', 'Sentiment', 'Usuario', 'Comentario'];
                const missing = required.filter(r => idx(r) === -1);
                if (missing.length) { showToast(`Faltan columnas: ${missing.join(', ')}`, true); return; }

                const parsed: ReportRow[] = [];
                for (let i = 1; i < lines.length; i++) {
                    const vals = parseCSVLine(lines[i]);
                    parsed.push({
                        fechaInicio: vals[idx('Fecha Inicio')] || '',
                        fechaFin: vals[idx('Fecha Fin')] || vals[idx('Fecha Inicio')] || '',
                        contenido: vals[idx('Contenido Global')] || 'Orgánico',
                        redSocial: vals[idx('Red Social')] || 'Sin especificar',
                        campus: vals[idx('Campus')] || 'Sin especificar',
                        sentiment: vals[idx('Sentiment')] || 'Sin clasificar',
                        usuario: vals[idx('Usuario')] || 'Anónimo',
                        comentario: vals[idx('Comentario')] || '',
                        posteoOriginal: vals[idx('Posteo Original')] || '',
                        evidencias: vals[idx('Evidencias')] || ''
                    });
                }
                setAllData(parsed);
                setRowData(parsed);
                setHasDbData(false);
                setFilterYear('');
                setFilterMonth('');
                setSourceLabel(`CSV: ${file.name}`);
                showToast(`${parsed.length} registros cargados desde CSV`);
            } catch (err) {
                showToast('Error al leer el CSV', true);
            }
        };
        reader.readAsText(file, 'UTF-8');
        e.target.value = '';
        setFileInputKey(k => k + 1);
    };

    // Parser CSV simple con soporte de comillas
    const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (inQuotes) {
                if (ch === '"') {
                    if (line[i + 1] === '"') { current += '"'; i++; }
                    else inQuotes = false;
                } else current += ch;
            } else {
                if (ch === '"') inQuotes = true;
                else if (ch === ',') { result.push(current.trim()); current = ''; }
                else current += ch;
            }
        }
        result.push(current.trim());
        return result;
    };

    const loadFromFirestore = useCallback(async () => {
        if (!isAdmin) { showToast('Permisos insuficientes', true); return; }
        setLoadingDb(true);
        try {
            const [commentsSnap, rrssSnap] = await Promise.all([
                getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'comments')),
                getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'rrss_incidents'))
            ]);

            const comments: ReportRow[] = [];
            commentsSnap.forEach(d => comments.push(...normalizeComments(d.data())));
            const rrss: ReportRow[] = [];
            rrssSnap.forEach(d => rrss.push(...normalizeRRSS(d.data())));

            const all = [...comments, ...rrss];
            setAllData(all);
            setRowData(all);
            setHasDbData(true);
            setFilterYear('');
            setFilterMonth('');
            setSourceLabel(`Firestore: ${comments.length} comentarios + ${rrss.length} RRSS`);
            showToast(`${all.length} registros cargados desde Firebase`);
        } catch (err) {
            showToast('Error al leer de Firebase', true);
        } finally {
            setLoadingDb(false);
        }
    }, [isAdmin, showToast]);

    // Exportar CSV
    const handleExportCSV = () => {
        if (!rowData.length) { showToast('No hay datos para exportar', true); return; }
        const csv = generateCSV(rowData);
        downloadCSV(csv, `Reporte_${new Date().toISOString().slice(0, 10)}.csv`);
        showToast('CSV exportado');
    };

    // Generar PDF (usa los datos filtrados y las gráficas visibles)
    const handleGeneratePDF = async () => {
        if (!rowData.length) { showToast('No hay datos para el PDF', true); return; }
        await generatePDF(rowData, sourceLabel || 'Datos cargados');
    };

    // Datos para gráficas
    const sentiment = calcSentiment(rowData);
    const redSocial = calcRedSocial(rowData);
    const origen = calcOrigen(rowData);
    const trend = calcTrend(rowData);
    const campusRank = calcCampusRanking(rowData);
    const topUsers = calcTopUsers(rowData);

    const hasData = rowData.length > 0;

    return (
        <div className="max-w-7xl mx-auto space-y-6 fade-in pb-16">
            <div className="theme-bg-container p-6 sm:p-10 rounded-[2rem] border theme-border shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <BarChart3 className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                    <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">Módulo Analítico</p>
                    <h2 className="text-3xl font-black theme-text-main mb-4">Dashboard de Reportes</h2>
                    <p className="theme-text-muted text-base max-w-2xl leading-relaxed">
                        Genera informes visuales a partir de exportaciones de Comentarios y RRSS. Sube un CSV o carga datos directamente desde Firebase (no se almacenan en la nube).
                    </p>
                </div>
            </div>

            {/* Fuentes de datos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 theme-bg-container border theme-border rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg"><FileUp className="w-5 h-5 text-blue-500" /></div>
                        <div>
                            <h3 className="font-bold theme-text-main">Subir CSV</h3>
                            <p className="text-xs theme-text-muted">Formato de exportación de Comentarios/RRSS</p>
                        </div>
                    </div>
                    <button onClick={() => fileRef.current?.click()} className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 transition-colors flex items-center justify-center gap-2">
                        <UploadCloud className="w-4 h-4" /> Seleccionar archivo CSV
                    </button>
                    <input key={fileInputKey} ref={fileRef} type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                </div>

                <div className="p-5 theme-bg-container border theme-border rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg"><Database className="w-5 h-5 text-emerald-500" /></div>
                        <div>
                            <h3 className="font-bold theme-text-main">Datos de Firebase</h3>
                            <p className="text-xs theme-text-muted">Comentarios + RRSS en tiempo real</p>
                        </div>
                    </div>
                    <button onClick={loadFromFirestore} disabled={loadingDb || !isAdmin} className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                        {loadingDb ? <><Box className="w-4 h-4 animate-spin" /> Cargando...</> : <><Database className="w-4 h-4" /> Cargar desde Firebase</>}
                    </button>
                    {!isAdmin && <p className="text-[11px] text-amber-500 font-bold mt-2">Requiere permisos de administrador</p>}
                </div>
            </div>

            {/* Filtros de temporalidad (solo para datos de Firebase) */}
            {hasDbData && (
                <div className="p-5 theme-bg-container border theme-border rounded-2xl shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-indigo-500/10 rounded-lg"><Filter className="w-5 h-5 text-indigo-500" /></div>
                        <div>
                            <h3 className="font-bold theme-text-main">Filtro de temporalidad</h3>
                            <p className="text-xs theme-text-muted">Selecciona el período del reporte (mes y año)</p>
                        </div>
                        {filterYear && (
                            <button onClick={() => { setFilterYear(''); setFilterMonth(''); setRowData(allData); }} className="ml-auto text-xs font-bold text-indigo-600 hover:underline">Limpiar filtros</button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold theme-text-muted uppercase tracking-wider">Año</label>
                            <select value={filterYear} onChange={(e) => handleYearChange(e.target.value)} className="w-full p-2.5 rounded-lg theme-bg-low border theme-border theme-text-main outline-none focus:border-[var(--primary)]">
                                <option value="">Todos los años</option>
                                {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold theme-text-muted uppercase tracking-wider">Mes</label>
                            <select value={filterMonth} onChange={(e) => handleMonthChange(e.target.value)} disabled={!filterYear} className="w-full p-2.5 rounded-lg theme-bg-low border theme-border theme-text-main outline-none focus:border-[var(--primary)] disabled:opacity-50">
                                <option value="">Todos los meses</option>
                                {MESES.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
                            </select>
                        </div>
                    </div>
                    <p className="text-[11px] theme-text-muted font-bold mt-3">
                        Mostrando {rowData.length} de {allData.length} registros
                    </p>
                </div>
            )}

            {/* Estado sin datos */}
            {!hasData && (
                <div className="text-center py-20 theme-bg-container rounded-2xl border theme-border border-dashed">
                    <BarChart3 className="w-16 h-16 theme-text-muted mx-auto mb-4 opacity-40" />
                    <h3 className="font-bold theme-text-main text-lg mb-2">Sin datos cargados</h3>
                    <p className="theme-text-muted text-sm">Sube un CSV o carga datos desde Firebase para generar el reporte.</p>
                </div>
            )}

            {/* KPIs */}
            {hasData && (
                <>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <KpiCard label="Total registros" value={rowData.length} color="#5b8def" />
                        <KpiCard label="% Negativo" value={`${sentiment.data[0] !== undefined ? Math.round((rowData.filter(r => r.sentiment === 'Negativo').length / rowData.length) * 100) : 0}%`} color="#e0485a" />
                        <KpiCard label="Campus crítico" value={campusRank[0] ? campusRank[0][1] : '—'} sub={campusRank[0]?.[0]} color="#f5a93f" />
                        <KpiCard label="Red dominante" value={redSocial.data[0] !== undefined ? redSocial.data[0] : '—'} sub={redSocial.labels[0]} color="#2fd9c4" />
                    </div>

                    {/* Gráficas */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <ChartCard title="Sentimiento" sub="Distribución por tono">
                            <div className="h-52"><Doughnut data={{ labels: sentiment.labels, datasets: [{ data: sentiment.data, backgroundColor: sentiment.colors, borderColor: '#101a2e', borderWidth: 3 }] }} options={CHART_OPTIONS} /></div>
                        </ChartCard>
                        <ChartCard title="Red social" sub="Volumen por plataforma">
                            <div className="h-52"><Bar data={{ labels: redSocial.labels, datasets: [{ data: redSocial.data, backgroundColor: redSocial.labels.map((_, i) => RED_COLORS[i % RED_COLORS.length]), borderRadius: 6 }] }} options={CHART_OPTIONS} /></div>
                        </ChartCard>
                        <ChartCard title="Origen del contenido" sub="Pautado vs orgánico">
                            <div className="h-52"><Bar data={{ labels: origen.labels, datasets: [{ label: 'Registros', data: origen.totals, backgroundColor: '#5b8def', borderRadius: 6 }, { label: '% Negativo', data: origen.negPct, backgroundColor: '#e0485a', borderRadius: 6 }] }} options={{ ...CHART_OPTIONS, scales: { y: { beginAtZero: true } } }} /></div>
                        </ChartCard>
                    </div>

                    {/* Tendencia + campus */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ChartCard title="Tendencia por período" sub="Volumen y % negatividad">
                            <div className="h-60"><Line data={{ labels: trend.labels, datasets: [{ label: 'Comentarios', data: trend.totals, backgroundColor: 'rgba(91,141,239,0.55)', borderColor: '#5b8def', yAxisID: 'y' }, { label: '% Negativo', data: trend.negPct, borderColor: '#e0485a', backgroundColor: '#e0485a', yAxisID: 'y1' }] }} options={{ responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, position: 'left' }, y1: { beginAtZero: true, max: 100, position: 'right', grid: { display: false } } }, plugins: { legend: { position: 'bottom' } } }} /></div>
                        </ChartCard>
                        <ChartCard title="Incidencias por campus" sub="Ranking descendente">
                            <div className="space-y-3">
                                {campusRank.slice(0, 8).map(([name, count], i) => {
                                    const max = campusRank[0]?.[1] || 1;
                                    const pct = Math.max(4, Math.round((count / max) * 100));
                                    return (
                                        <div key={name} className="flex items-center gap-3">
                                            <span className="text-xs font-bold theme-text-main w-2">{i + 1}</span>
                                            <span className="text-xs theme-text-muted w-32 truncate">{name}</span>
                                            <div className="flex-1 h-2 bg-black/5 dark:bg-white/5 rounded overflow-hidden">
                                                <div className="h-full rounded" style={{ width: `${pct}%`, background: name === 'Sin especificar' ? '#f5a93f' : '#5b8def' }}></div>
                                            </div>
                                            <span className="text-xs font-bold theme-text-main w-8 text-right">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </ChartCard>
                    </div>

                    {/* Usuarios recurrentes + acciones */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <ChartCard title="Usuarios más recurrentes" sub="Con más de un comentario">
                            <div className="space-y-3">
                                {topUsers.length ? topUsers.map(u => (
                                    <div key={u.name} className="flex items-center justify-between p-3 theme-bg-low rounded-lg border theme-border">
                                        <div>
                                            <p className="text-sm font-bold theme-text-main">{u.name}</p>
                                            <p className="text-xs theme-text-muted">Predominante: {u.dominant}</p>
                                        </div>
                                        <span className="px-2 py-1 rounded-lg text-xs font-bold" style={{ background: `${sentimentColor(u.dominant)}20`, color: sentimentColor(u.dominant) }}>{u.count}×</span>
                                    </div>
                                )) : <p className="text-sm theme-text-muted">Ningún usuario con más de un comentario.</p>}
                            </div>
                        </ChartCard>
                        <div className="p-5 theme-bg-container border theme-border rounded-2xl shadow-sm flex flex-col justify-center gap-3">
                            <h3 className="font-bold theme-text-main text-lg">Exportar informe</h3>
                            <p className="text-sm theme-text-muted">Genera un PDF formal con KPIs, tablas y resumen ejecutivo, o exporta los datos en formato CSV.</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={handleGeneratePDF} className="py-3 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-500 transition-colors flex items-center justify-center gap-2">
                                    <FileDown className="w-4 h-4" /> PDF
                                </button>
                                <button onClick={handleExportCSV} className="py-3 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-500 transition-colors flex items-center justify-center gap-2">
                                    <Database className="w-4 h-4" /> CSV
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

// Helpers visuales
const KpiCard = ({ label, value, sub, color }: any) => (
    <div className="p-5 theme-bg-container border theme-border rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full" style={{ background: color }}></div>
        <p className="text-[10px] font-bold uppercase tracking-wider theme-text-muted">{label}</p>
        <p className="text-3xl font-black theme-text-main mt-2">{value}</p>
        {sub && <p className="text-xs theme-text-muted mt-1 truncate">{sub}</p>}
    </div>
);

const ChartCard = ({ title, sub, children }: any) => (
    <div className="p-5 theme-bg-container border theme-border rounded-2xl shadow-sm">
        <h4 className="font-bold theme-text-main">{title}</h4>
        <p className="text-xs theme-text-muted mb-3">{sub}</p>
        {children}
    </div>
);

const sentimentColor = (s: string) => {
    if (s === 'Negativo') return '#e0485a';
    if (s === 'Neutral') return '#7c8db5';
    if (s === 'Positivo') return '#4fd18b';
    return '#5b8def';
};