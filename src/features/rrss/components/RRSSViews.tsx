import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
    Save, Download, Trash2, Smartphone, Printer, X, Edit3, Link as LinkIcon, HardDrive, 
    Search, ChevronDown, ChevronRight, ChevronLeft, FileText, Loader2, Calendar, AlertTriangle
} from 'lucide-react';
import { collection, addDoc, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../../../services/firebase/config';
import { getMonthName } from '../../../shared/utils/date';
import DOMPurify from 'dompurify'; 

const inputStyles = "w-full p-3 rounded-xl theme-bg-low border theme-border theme-text-main focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all text-sm";
const radioLabelStyles = "flex items-center gap-2 text-sm font-medium theme-text-main cursor-pointer";
const editorStyles = `.wysiwyg-content ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin: 0.5rem 0; } .wysiwyg-content ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin: 0.5rem 0; }`;

const CAMPUS_OPTIONS = ['Atizapán', 'Coacalco', 'Cuautitlán Izcalli', 'Ecatepec', 'Tecamac', 'Tultepec', 'Zumpango', 'Tizayuca', 'Querétaro: la Joya', 'Querétaro: el Marqués', 'Huehuetoca', 'Chalco'];

const EditorToolbar = ({ onCommand }: { onCommand: (cmd: string, val?: string) => void }) => {
    const optionStyles = "bg-white text-black dark:bg-gray-800 dark:text-white";
    return (
        <div className="flex flex-wrap items-center gap-2 p-2 border-b theme-border bg-black/20 text-gray-400 select-none">
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => onCommand('undo')} className="p-1.5 hover:bg-white/10 rounded hover:text-white transition-colors" title="Deshacer (Ctrl+Z)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg></button>
            <div className="w-px h-4 bg-gray-700 mx-1"></div>
            <select onChange={(e) => onCommand('fontSize', e.target.value)} className="bg-transparent border border-gray-600 rounded text-xs p-1 outline-none hover:border-gray-400 theme-text-main cursor-pointer" title="Tamaño de texto" defaultValue="3">
                <option className={optionStyles} value="1">Muy Pequeño</option><option className={optionStyles} value="2">Pequeño</option><option className={optionStyles} value="3">Normal</option><option className={optionStyles} value="4">Mediano</option><option className={optionStyles} value="5">Grande</option><option className={optionStyles} value="6">Muy Grande</option><option className={optionStyles} value="7">Título</option>
            </select>
            <input type="color" aria-label="Color de texto" onChange={(e) => onCommand('foreColor', e.target.value)} className="w-6 h-6 p-0 border border-gray-600 rounded cursor-pointer bg-transparent hover:border-gray-400" title="Color de texto" />
            <div className="w-px h-4 bg-gray-700 mx-1"></div>
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => onCommand('bold')} className="px-2 py-1 font-bold text-sm hover:bg-white/10 rounded hover:text-white transition-colors" title="Negrita">B</button>
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => onCommand('italic')} className="px-2 py-1 italic font-serif text-sm hover:bg-white/10 rounded hover:text-white transition-colors" title="Cursiva">I</button>
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => onCommand('underline')} className="px-2 py-1 underline text-sm hover:bg-white/10 rounded hover:text-white transition-colors" title="Subrayado">U</button>
            <div className="w-px h-4 bg-gray-700 mx-1"></div>
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => onCommand('insertUnorderedList')} className="p-1.5 hover:bg-white/10 rounded hover:text-white transition-colors" title="Lista con viñetas"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></button>
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => onCommand('removeFormat')} className="px-2 py-1 text-xs font-bold hover:bg-white/10 rounded hover:text-white transition-colors" title="Limpiar Formato">Tx</button>
        </div>
    );
};

export const NewRRSSIncidentView = ({ isAdmin, showToast, navigate, user, logAction }: any) => {
    const [formData, setFormData] = useState({
        totalIncidencias: 1, fecha: new Date().toISOString().split('T')[0], usuario: '', medio: 'Facebook Comentario',
        campus: 'Atizapán', riesgo: 'Bajo', descripcion: '', area: 'Operaciones', comentarios: '', enlacePublicacion: '', enlaceDrive: '', reporteTexto: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);

    const execCommand = (command: string, value: string = '') => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            setFormData(prev => ({ ...prev, reporteTexto: editorRef.current?.innerHTML || '' }));
            if (command !== 'foreColor' && command !== 'fontSize') editorRef.current.focus();
        }
    };

    const handleEditorBlur = () => { if (editorRef.current) setFormData(prev => ({ ...prev, reporteTexto: editorRef.current?.innerHTML || '' })); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) return showToast('Permisos insuficientes.', true);
        setIsSubmitting(true);
        try {
            const finalReporte = editorRef.current ? editorRef.current.innerHTML : formData.reporteTexto;
            const cleanHTML = DOMPurify.sanitize(finalReporte); 
            const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'rrss_incidents'), {
                ...formData, reporteTexto: cleanHTML, autor: user?.displayName || 'Administrador', timestamp: new Date().toISOString()
            });
            
            if (logAction) await logAction('Creó un nuevo reporte de reputación', 'Incidencia RRSS', 'create', docRef.id);

            showToast('Incidente RRSS guardado exitosamente.'); navigate('historial-rss');
        } catch (error) { showToast('Error al guardar el incidente.', true); }
        setIsSubmitting(false);
    };

    return (
        <>
            <style>{editorStyles}</style>
            <div className="max-w-5xl mx-auto space-y-10 fade-in pb-16">

                {/* HERO HEADER CORPORATIVO */}
                <div className="theme-bg-container p-6 sm:p-10 rounded-[2rem] border theme-border shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-700">
                        <Smartphone className="w-48 h-48" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Smartphone className="w-4 h-4" /> Reputación Digital
                        </p>
                        <h2 className="text-4xl font-black theme-text-main mb-4 tracking-tight">Crear Incidente RRSS</h2>
                        <p className="theme-text-muted text-base max-w-2xl leading-relaxed">
                            Registra nuevas incidencias, quejas críticas o crisis detectadas en redes sociales. Clasifica el nivel de riesgo y genera un reporte oficial estructurado.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 px-2 sm:px-8">
                    
                    {/* SECCIÓN 1: PARÁMETROS GENERALES */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-black theme-text-main flex items-center gap-2 border-b-2 border-gray-200 dark:border-gray-800 pb-3">
                            <AlertTriangle className="w-5 h-5 text-orange-500" /> Parámetros Generales
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 sm:p-8 theme-bg-container rounded-[1.5rem] border theme-border shadow-sm border-l-[6px] border-l-orange-500">
                            <div className="space-y-1.5"><label htmlFor="nri-fecha" className="text-xs font-bold theme-text-muted uppercase tracking-wider">Fecha de Recepción</label><input id="nri-fecha" type="date" required value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} className={`${inputStyles} [color-scheme:light] dark:[color-scheme:dark]`} /></div>
                            <div className="space-y-1.5"><label htmlFor="nri-total" className="text-xs font-bold theme-text-muted uppercase tracking-wider">Volumen (Total Incidencias)</label><input id="nri-total" type="number" min="1" required value={formData.totalIncidencias} onChange={(e) => setFormData({...formData, totalIncidencias: parseInt(e.target.value)})} className={inputStyles} /></div>
                            <div className="space-y-1.5"><label htmlFor="nri-usuario" className="text-xs font-bold theme-text-muted uppercase tracking-wider">Identidad (Usuario)</label><input id="nri-usuario" type="text" required placeholder="@usuario o Nombre público" value={formData.usuario} onChange={(e) => setFormData({...formData, usuario: e.target.value})} className={inputStyles} /></div>
                            <div className="space-y-1.5"><label htmlFor="nri-medio" className="text-xs font-bold theme-text-muted uppercase tracking-wider">Medio / Red Social</label><select id="nri-medio" value={formData.medio} onChange={(e) => setFormData({...formData, medio: e.target.value})} className={inputStyles}><option value="Facebook Comentario">Facebook Comentario</option><option value="TikTok">TikTok</option><option value="FB Grupos">FB Grupos</option><option value="LinkedIn">LinkedIn</option><option value="Facebook DM">Facebook DM</option><option value="Instagram DM">Instagram DM</option></select></div>
                            <div className="space-y-1.5"><label htmlFor="nri-campus" className="text-xs font-bold theme-text-muted uppercase tracking-wider">Campus Implicado</label><select id="nri-campus" value={formData.campus} onChange={(e) => setFormData({...formData, campus: e.target.value})} className={inputStyles}>{CAMPUS_OPTIONS.map(c => <option key={c}>{c}</option>)}</select></div>
                            <div className="space-y-1.5"><label htmlFor="nri-area" className="text-xs font-bold theme-text-muted uppercase tracking-wider">Área Responsable</label><select id="nri-area" value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} className={inputStyles}><option value="Operaciones">Operaciones</option><option value="Legal">Legal</option><option value="Comercial - Call Center">Comercial - Call Center</option></select></div>
                            <div className="space-y-1.5 lg:col-span-3 border-t theme-border pt-4 mt-2"><label htmlFor="nri-riesgo" className="text-xs font-bold theme-text-muted uppercase tracking-wider">Nivel de Riesgo Operativo</label><select id="nri-riesgo" value={formData.riesgo} onChange={(e) => setFormData({...formData, riesgo: e.target.value})} className={`${inputStyles} font-bold ${formData.riesgo === 'Critico' ? 'text-red-500 bg-red-500/5 border-red-500/30' : formData.riesgo === 'Alto' ? 'text-orange-500 bg-orange-500/5 border-orange-500/30' : ''}`}><option value="Bajo">Bajo (Controlable)</option><option value="Medio">Medio (Atención Requerida)</option><option value="Alto">Alto (Alerta Escalada)</option><option value="Critico">Crítico (Peligro Inminente)</option></select></div>
                        </div>
                    </div>

                    {/* SECCIÓN 2: DESCRIPCIÓN Y REPORTE */}
                    <div className="space-y-4 pt-4">
                        <h3 className="text-xl font-black theme-text-main flex items-center gap-2 border-b-2 border-gray-200 dark:border-gray-800 pb-3">
                            <FileText className="w-5 h-5 text-orange-500" /> Detalles del Incidente
                        </h3>
                        <div className="space-y-6 p-6 sm:p-8 theme-bg-container rounded-[1.5rem] border theme-border shadow-sm">
                            <div className="space-y-1.5"><label htmlFor="nri-descripcion" className="text-xs font-bold theme-text-muted uppercase tracking-wider">Descripción Breve</label><textarea id="nri-descripcion" required rows={3} placeholder="Resuma el evento en un párrafo..." value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className={`${inputStyles} resize-none leading-relaxed`}></textarea></div>
                            <div className="space-y-1.5"><label htmlFor="nri-comentarios" className="text-xs font-bold theme-text-muted uppercase tracking-wider">Comentarios Adicionales <span className="text-[10px] bg-gray-200 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded ml-2">Opcional</span></label><textarea id="nri-comentarios" rows={2} placeholder="Notas internas o contexto adicional..." value={formData.comentarios} onChange={(e) => setFormData({...formData, comentarios: e.target.value})} className={`${inputStyles} resize-none leading-relaxed`}></textarea></div>
                            
                            <div className="space-y-1.5 pt-4">
                                <label className="text-xs font-bold theme-text-muted uppercase tracking-wider flex justify-between items-center">
                                    Reporte Oficial (Texto Enriquecido)
                                    <span className="font-normal text-orange-500 flex items-center gap-1"><Smartphone className="w-3 h-3"/> WYSIWYG Editor</span>
                                </label>
                                <div className="border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden bg-[var(--surface)] focus-within:border-orange-500 focus-within:ring-1 focus-within:ring-orange-500 transition-all shadow-inner">
                                    <EditorToolbar onCommand={execCommand} />
                                    <div ref={editorRef} contentEditable onBlur={handleEditorBlur} className="w-full p-6 theme-bg-low theme-text-main outline-none min-h-[250px] overflow-y-auto max-h-[500px] text-sm leading-relaxed custom-scrollbar wysiwyg-content" data-placeholder="Redacte la bitácora formal del evento aquí. Puede utilizar listas, negritas y colores para estructurar la información..." style={{ whiteSpace: 'pre-wrap' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECCIÓN 3: EVIDENCIAS */}
                    <div className="space-y-4 pt-4">
                        <h3 className="text-xl font-black theme-text-main flex items-center gap-2 border-b-2 border-gray-200 dark:border-gray-800 pb-3">
                            <LinkIcon className="w-5 h-5 text-orange-500" /> Referencias y Evidencias
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8 bg-black/5 dark:bg-white/5 rounded-[1.5rem] border theme-border shadow-inner">
                            <div className="space-y-1.5">
                                <label htmlFor="nri-enlacePub" className="text-xs font-bold theme-text-muted uppercase tracking-wider">Enlace a la Publicación Original</label>
                                <input id="nri-enlacePub" type="url" placeholder="https://facebook.com/..." value={formData.enlacePublicacion} onChange={(e) => setFormData({...formData, enlacePublicacion: e.target.value})} className={inputStyles} />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="nri-enlaceDrive" className="text-xs font-bold theme-text-muted uppercase tracking-wider">Repositorio de Evidencia (Drive)</label>
                                <input id="nri-enlaceDrive" type="url" placeholder="https://drive.google.com/..." value={formData.enlaceDrive} onChange={(e) => setFormData({...formData, enlaceDrive: e.target.value})} className={inputStyles} />
                            </div>
                        </div>
                    </div>

                    {/* BOTONES DE ACCIÓN */}
                    <div className="pt-8 flex flex-col sm:flex-row items-center justify-end gap-4 border-t-2 border-gray-200 dark:border-gray-800">
                        <button type="button" onClick={() => navigate('dashboard')} className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold theme-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Cancelar y Volver</button>
                        <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-black bg-orange-600 text-white hover:bg-orange-500 hover:-translate-y-0.5 shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:hover:translate-y-0">
                            {isSubmitting ? 'Guardando en la nube...' : <><Save className="w-5 h-5"/> Consolidar Incidente Oficial</>}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export const HistorialRRSSView = ({ showToast, isAdmin, updateRrssIncident, deleteRrssIncident }: any) => {
    const [rrssIncidents, setRrssIncidents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedIncident, setSelectedIncident] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const editEditorRef = useRef<HTMLDivElement>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterYear, setFilterYear] = useState('Todos');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [pagePerMonth, setPagePerMonth] = useState<Record<string, number>>({});
    const itemsPerPage = 30;
    
    // Estados del Modal de Exportación
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportType, setExportType] = useState('all'); 
    const [exportYear, setExportYear] = useState('');
    const [exportMonth, setExportMonth] = useState('');
    const [exportCampus, setExportCampus] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        setIsLoading(true);
        const rrssRef = collection(db, 'artifacts', appId, 'public', 'data', 'rrss_incidents');
        const unsub = onSnapshot(rrssRef, (snapshot) => {
            const data: any[] = [];
            snapshot.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
            data.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
            setRrssIncidents(data);
            setTimeout(() => setIsLoading(false), 600);
        });
        return () => unsub();
    }, []);

    useEffect(() => {
        setPagePerMonth({});
    }, [searchTerm, filterYear]);

    // 🔥 FIX: Resetea el campus si el usuario cambia el año o mes para evitar selecciones fantasma
    useEffect(() => {
        setExportCampus('');
    }, [exportType, exportYear, exportMonth]);

    const availableYears = useMemo(() => {
        const years = new Set(rrssIncidents.map((i: any) => i.fecha ? i.fecha.split('-')[0] : null).filter(Boolean));
        return Array.from(years).sort((a: any, b: any) => b.localeCompare(a));
    }, [rrssIncidents]);

    const availableMonthsForExport = useMemo(() => {
        if (!exportYear) return [];
        const months = new Set(
            rrssIncidents
                .filter((i: any) => i.fecha && i.fecha.split('-')[0] === exportYear)
                .map((i: any) => i.fecha.split('-')[1])
        );
        return Array.from(months).sort((a: any, b: any) => b.localeCompare(a));
    }, [rrssIncidents, exportYear]);

    // 🔥 FIX: Extracción inteligente de campus basada en la fecha seleccionada
    const availableCampusesForExport = useMemo(() => {
        let filtered = rrssIncidents;
        if (exportType === 'year' && exportYear) {
            filtered = rrssIncidents.filter((i: any) => i.fecha && i.fecha.split('-')[0] === exportYear);
        } else if (exportType === 'month' && exportYear && exportMonth) {
            filtered = rrssIncidents.filter((i: any) => i.fecha && i.fecha.startsWith(`${exportYear}-${exportMonth}`));
        }
        const campuses = new Set(filtered.map((i: any) => i.campus).filter(Boolean));
        return Array.from(campuses).sort((a: any, b: any) => a.localeCompare(b));
    }, [rrssIncidents, exportType, exportYear, exportMonth]);

    const filteredIncidents = useMemo(() => {
        return rrssIncidents.filter((inc: any) => {
            const year = inc.fecha ? inc.fecha.split('-')[0] : '';
            const matchYear = filterYear === 'Todos' || year === filterYear;
            const term = searchTerm.toLowerCase();
            
            const matchSearch = term === '' || 
                (isAdmin && inc.autor && inc.autor.toLowerCase().includes(term)) ||
                (inc.medio && inc.medio.toLowerCase().includes(term)) ||
                (inc.usuario && inc.usuario.toLowerCase().includes(term)) ||
                (inc.campus && inc.campus.toLowerCase().includes(term)) ||
                (inc.area && inc.area.toLowerCase().includes(term)) ||
                (inc.descripcion && inc.descripcion.toLowerCase().includes(term));
            
            return matchYear && matchSearch;
        });
    }, [rrssIncidents, searchTerm, filterYear, isAdmin]);

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

    const getMediaIcon = (medio: string) => {
        const m = medio || '';
        if (m.includes('Facebook') || m.includes('FB')) return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-500"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>;
        if (m.includes('Instagram')) return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-pink-500"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>;
        if (m.includes('TikTok')) return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-cyan-400"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/></svg>;
        if (m.includes('LinkedIn')) return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-blue-400"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>;
        return <Smartphone className="w-5 h-5 theme-text-muted" />;
    };

    const handleDownloadDocx = (inc: any) => {
        if (!inc) return;
        const cleanContent = DOMPurify.sanitize(inc.reporteTexto || '');
        const docContent = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Reporte de Incidencia RRSS</title><style>body { font-family: 'Arial', sans-serif; color: #222222; line-height: 1.5; } h2 { color: #f97316; border-b: 2px solid #f97316; padding-bottom: 5px; font-size: 18pt; } .table-info { width: 100%; border-collapse: collapse; margin-top: 15px; } .table-info td { padding: 8px; border: 1px solid #dddddd; font-size: 10.5pt; } .label { font-weight: bold; background-color: #f3f4f6; width: 30%; } .section-header { font-size: 12pt; font-weight: bold; color: #f97316; margin-top: 20px; margin-bottom: 5px; } .box { border: 1px solid #e5e7eb; padding: 10px; background: #fafafa; border-radius: 4px; font-size: 11pt; } ul { padding-left: 20px; list-style-type: disc; } ol { padding-left: 20px; list-style-type: decimal; }</style></head><body><h2>INNOVA MANAGEMENT - INFORME DE INCIDENCIA RRSS</h2><table class="table-info"><tr><td class="label">Fecha Recepción</td><td>${inc.fecha}</td></tr><tr><td class="label">Medio / Canal</td><td>${inc.medio}</td></tr><tr><td class="label">Usuario Afectado</td><td>${inc.usuario}</td></tr><tr><td class="label">Campus</td><td>${inc.campus}</td></tr><tr><td class="label">Área Responsable</td><td>${inc.area || 'N/A'}</td></tr><tr><td class="label">Nivel de Riesgo</td><td>${inc.riesgo}</td></tr><tr><td class="label">Volumen Incidencias</td><td>${inc.totalIncidencias}</td></tr><tr><td class="label">Registrado por</td><td>${inc.autor || 'Admin'}</td></tr></table><div class="section-header">Descripción del Evento:</div><div class="box">${inc.descripcion || ''}</div><div class="section-header">Comentarios Adicionales:</div><div class="box">${inc.comentarios || 'Sin comentarios adicionales.'}</div><div class="section-header">Bitácora / Reporte Estructurado:</div><div class="box">${cleanContent || 'Sin bitácora detallada de texto enriquecido.'}</div></body></html>`;
        const blob = new Blob([docContent], { type: 'application/msword' });
        const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = `Reporte_RRSS_${inc.usuario || 'Incidente'}_${inc.fecha}.docx`; link.click();
        showToast('Documento Word (.docx) descargado con éxito.');
    };

    const openDetail = (inc: any) => { setSelectedIncident(inc); setIsDetailOpen(true); };
    const openEdit = () => { setIsDetailOpen(false); setIsEditOpen(true); };
    const handleDelete = () => { setIsDetailOpen(false); deleteRrssIncident(selectedIncident.id); };

    const getRiskColor = (risk: string) => {
        switch(risk) {
            case 'Bajo': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Medio': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Alto': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            case 'Critico': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const execEditCommand = (command: string, value: string = '') => {
        document.execCommand(command, false, value);
        if (editEditorRef.current && command !== 'foreColor' && command !== 'fontSize') editEditorRef.current.focus();
    };

    const handleExecuteExport = () => {
        let dataToExport = rrssIncidents;
        let filenameSuffix = 'Todo';

        if (exportType === 'year') {
            if (!exportYear) return showToast('Selecciona un año para exportar', true);
            dataToExport = rrssIncidents.filter((i: any) => i.fecha && i.fecha.split('-')[0] === exportYear);
            if (exportCampus) dataToExport = dataToExport.filter((i: any) => i.campus === exportCampus);
            filenameSuffix = exportCampus ? `${exportYear}_${exportCampus}` : exportYear;

        } else if (exportType === 'month') {
            if (!exportYear || !exportMonth) return showToast('Selecciona año y mes para exportar', true);
            dataToExport = rrssIncidents.filter((i: any) => i.fecha && i.fecha.startsWith(`${exportYear}-${exportMonth}`));
            if (exportCampus) dataToExport = dataToExport.filter((i: any) => i.campus === exportCampus);
            filenameSuffix = exportCampus ? `${exportYear}_${exportMonth}_${exportCampus}` : `${exportYear}_${exportMonth}`;
        }

        if (dataToExport.length === 0) return showToast('No hay datos registrados con esos filtros', true);

        setIsExporting(true);

        setTimeout(() => {
            const headers = isAdmin ? ['Fecha,Usuario RRSS,Medio,Campus,Riesgo,Area Responsable,Total,Descripcion,Comentarios,Autor'] : ['Fecha,Usuario RRSS,Medio,Campus,Riesgo,Area Responsable,Total,Descripcion,Comentarios'];
            const rows = dataToExport.map((i: any) => {
                const safeDesc = i.descripcion ? i.descripcion.replace(/"/g, '""') : '';
                const safeCom = i.comentarios ? i.comentarios.replace(/"/g, '""') : '';
                const baseData = `"${i.fecha}","${i.usuario}","${i.medio}","${i.campus}","${i.riesgo}","${i.area}","${i.totalIncidencias}","${safeDesc}","${safeCom}"`;
                return isAdmin ? `${baseData},"${i.autor || 'Administrador'}"` : baseData;
            });

            const link = document.createElement("a"); 
            link.href = encodeURI("data:text/csv;charset=utf-8," + [headers, ...rows].join("\n")); 
            link.download = `Historial_RRSS_${filenameSuffix}_${new Date().toISOString().split('T')[0]}.csv`; 
            document.body.appendChild(link); 
            link.click(); 
            document.body.removeChild(link);

            setIsExporting(false);
            setIsExportModalOpen(false);
            showToast('Exportación completada exitosamente');
        }, 1500);
    };

    return (
        <>
            <style>{editorStyles}</style>
            <div className="space-y-6 fade-in pb-10">
                <div className={(isDetailOpen || isEditOpen) ? 'print:hidden' : ''}>
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div>
                            <h2 className="text-2xl font-bold theme-text-main">Historial RRSS</h2>
                            <p className="theme-text-muted text-sm mt-1">Registro histórico de incidencias en redes sociales.</p>
                        </div>
                        <button type="button" onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500 transition-all text-sm font-bold shadow-sm">
                            <Download className="w-4 h-4"/> Exportar CSV
                        </button>
                    </div>

                    <div className="p-4 theme-bg-container border theme-border rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-2/3 flex items-center">
                            <Search className="absolute left-3 text-gray-400 w-4 h-4 pointer-events-none" />
                            <input type="text" aria-label="Buscar" placeholder="Buscar por usuario, campus, medio, descripción..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${inputStyles} pl-10 pr-10`} />
                            {searchTerm && <button type="button" aria-label="Limpiar búsqueda" onClick={() => setSearchTerm('')} className="absolute right-3 p-1 rounded-md text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white transition-colors" title="Limpiar búsqueda"><X className="w-4 h-4" /></button>}
                        </div>
                        <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-4">
                            <div className="flex items-center gap-2"><label htmlFor="hr-filter-year" className="text-xs font-bold theme-text-muted whitespace-nowrap">Año</label><select id="hr-filter-year" value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className={`${inputStyles} py-1.5 px-3 min-w-[100px]`}><option value="Todos">Todos</option>{availableYears.map((y: any) => <option key={y} value={y}>{y}</option>)}</select></div>
                            <div className="bg-black/5 dark:bg-white/5 border theme-border px-3 py-1.5 rounded-lg whitespace-nowrap"><span className="text-xs font-bold theme-text-main">{filteredIncidents.length}</span><span className="text-[10px] theme-text-muted font-medium ml-1">de {rrssIncidents.length}</span></div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 fade-in">
                            {[1, 2, 3, 4, 5, 6].map(card => (
                                <div key={card} className="p-5 theme-bg-container rounded-xl border theme-border shadow-sm h-44 animate-pulse flex flex-col justify-between">
                                    <div className="flex items-start gap-3 mb-3 w-full">
                                        <div className="w-10 h-10 rounded-lg bg-gray-300 dark:bg-gray-700 flex-shrink-0"></div>
                                        <div className="flex-1 space-y-2 py-1 w-full">
                                            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
                                            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mt-2 w-full">
                                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
                                        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
                                    </div>
                                    <div className="mt-auto pt-3 border-t theme-border flex gap-2 w-full">
                                        <div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                                        <div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded-md"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredIncidents.length === 0 ? (
                        <div className="text-center py-12 theme-bg-container rounded-2xl border theme-border"><Smartphone className="w-12 h-12 theme-text-muted mx-auto mb-4 opacity-30" /><p className="theme-text-muted">No se encontraron registros con los criterios actuales.</p></div>
                    ) : (
                        <div className="space-y-4">
                            {Object.keys(groupedData).sort((a, b) => b.localeCompare(a)).map(year => {
                                const isYearExpanded = !!expandedSections[year];
                                const totalInYear = Object.values(groupedData[year]).flat().length;

                                return (
                                    <div key={year} className="theme-bg-container border theme-border rounded-xl overflow-hidden shadow-sm">
                                        <button type="button" onClick={() => toggleSection(year)} className="w-full flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-3">{isYearExpanded ? <ChevronDown className="w-5 h-5 theme-text-muted" /> : <ChevronRight className="w-5 h-5 theme-text-muted" />}<h3 className="text-lg font-bold theme-text-main">{year}</h3><span className="bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400 px-2 py-0.5 rounded-full text-xs font-bold">{totalInYear}</span></div>
                                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
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
                                                            <button type="button" onClick={() => toggleSection(monthKey)} className="w-full flex items-center gap-2 p-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">{isMonthExpanded ? <ChevronDown className="w-4 h-4 theme-text-muted" /> : <ChevronRight className="w-4 h-4 theme-text-muted" />}<h4 className="text-sm font-bold theme-text-main uppercase tracking-wider">{getMonthName(month)}</h4><span className="text-xs theme-text-muted">({monthItems.length})</span></button>
                                                            {isMonthExpanded && (
                                                                <div className="border-t theme-border bg-[var(--surface)]">
                                                                    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                                        {paginatedMonthItems.map((inc: any) => (
                                                                            <button type="button" key={inc.id} onClick={() => openDetail(inc)} className="text-left w-full p-5 theme-bg-container rounded-xl border theme-border shadow-sm hover:border-orange-500 transition-colors cursor-pointer group flex flex-col h-full border-l-4 border-l-orange-500">
                                                                                <div className="flex items-start gap-3 mb-3 w-full">
                                                                                    <div className="w-10 h-10 rounded-lg theme-bg-low flex items-center justify-center flex-shrink-0 group-hover:bg-orange-500 transition-colors [&>svg]:group-hover:text-white">{getMediaIcon(inc.medio)}</div>
                                                                                    <div className="flex-1 min-w-0">
                                                                                        <h3 className="font-bold theme-text-main truncate text-base">{inc.medio}</h3>
                                                                                        <p className="text-xs font-semibold theme-text-muted mt-0.5 truncate flex items-center gap-1">{inc.fecha} {isAdmin && <><span className="mx-1">|</span> Por: <span className="text-orange-500 truncate">{inc.autor || 'Administrador'}</span></>}</p>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="text-sm theme-text-main line-clamp-2 min-h-[40px] opacity-90 w-full"><span className="font-bold mr-1">{inc.usuario}:</span> {inc.descripcion}</div>
                                                                                <div className="text-[11px] theme-text-muted mt-2 px-1 w-full"><span className="font-semibold theme-text-main">Área responsable:</span> {inc.area || 'Operaciones'}</div>
                                                                                <div className="mt-4 flex items-center justify-between pt-3 border-t theme-border w-full">
                                                                                    <div className="flex items-center gap-2"><span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${getRiskColor(inc.riesgo)}`}>{inc.riesgo}</span><span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">Incidencias: {inc.totalIncidencias}</span></div>
                                                                                    
                                                                                    {inc.reporteTexto && (
                                                                                        <button type="button" onClick={(e) => { e.stopPropagation(); handleDownloadDocx(inc); }} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors no-print" title="Descargar reporte (.docx)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="12" y2="18"/><line x1="15" y1="15" x2="12" y2="18"/></svg></button>
                                                                                    )}
                                                                                </div>
                                                                            </button>
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
            </div>

            {/* MODAL DE EXPORTACIÓN INTELIGENTE CON FILTRO CAMPUS */}
            {isExportModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 fade-in">
                    <div className="theme-bg-container rounded-2xl w-full max-w-md shadow-2xl border theme-border flex flex-col overflow-hidden">
                        <div className="p-5 border-b theme-border flex justify-between items-center bg-orange-500/5">
                            <h3 className="font-bold theme-text-main flex items-center gap-2"><Download className="w-5 h-5 text-orange-500" /> Exportación Inteligente CSV</h3>
                            <button type="button" onClick={() => setIsExportModalOpen(false)} className="p-2 theme-text-muted hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <p className="text-sm theme-text-muted">Selecciona el alcance de los datos que deseas descargar en formato CSV para tu reporte.</p>
                            <div className="space-y-3">
                                <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${exportType === 'all' ? 'border-orange-500 bg-orange-500/5' : 'theme-border theme-bg-low hover:border-gray-400'}`}>
                                    <input type="radio" name="exportType" checked={exportType === 'all'} onChange={() => setExportType('all')} className="w-4 h-4 text-orange-500" />
                                    <div><p className="text-sm font-bold theme-text-main">Todo el Historial</p><p className="text-xs theme-text-muted">Descarga todos los incidentes registrados.</p></div>
                                </label>
                                
                                <label className={`flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${exportType === 'year' ? 'border-orange-500 bg-orange-500/5' : 'theme-border theme-bg-low hover:border-gray-400'}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="exportType" checked={exportType === 'year'} onChange={() => { setExportType('year'); if(!exportYear && availableYears.length) setExportYear(String(availableYears[0])); }} className="w-4 h-4 text-orange-500" />
                                        <div><p className="text-sm font-bold theme-text-main">Filtrar por Año y Campus</p><p className="text-xs theme-text-muted">Descarga un año y campus en específico.</p></div>
                                    </div>
                                    {exportType === 'year' && (
                                        <div className="ml-7 flex flex-col gap-3 fade-in mt-2">
                                            <select aria-label="Seleccionar año" value={exportYear} onChange={(e) => setExportYear(e.target.value)} className={inputStyles}>
                                                <option value="" disabled>Selecciona un año</option>
                                                {availableYears.map((y: any) => <option key={y} value={y}>{y}</option>)}
                                            </select>
                                            <select aria-label="Seleccionar campus" value={exportCampus} onChange={(e) => setExportCampus(e.target.value)} className={inputStyles}>
                                                <option value="">Todos los Campus</option>
                                                {availableCampusesForExport.length > 0 ? (
                                                    availableCampusesForExport.map((c: any) => <option key={c} value={c}>{c}</option>)
                                                ) : (
                                                    <option value="none" disabled>No hay campus en esta fecha</option>
                                                )}
                                            </select>
                                        </div>
                                    )}
                                </label>

                                <label className={`flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${exportType === 'month' ? 'border-orange-500 bg-orange-500/5' : 'theme-border theme-bg-low hover:border-gray-400'}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="exportType" checked={exportType === 'month'} onChange={() => { setExportType('month'); if(!exportYear && availableYears.length) setExportYear(String(availableYears[0])); }} className="w-4 h-4 text-orange-500" />
                                        <div><p className="text-sm font-bold theme-text-main">Filtrar por Mes y Campus</p><p className="text-xs theme-text-muted">Descarga un mes, año y campus específico.</p></div>
                                    </div>
                                    {exportType === 'month' && (
                                        <div className="ml-7 flex flex-col gap-3 fade-in mt-2">
                                            <div className="flex gap-3">
                                                <select aria-label="Seleccionar año" value={exportYear} onChange={(e) => setExportYear(e.target.value)} className={`${inputStyles} w-1/2`}>
                                                    <option value="" disabled>Año</option>
                                                    {availableYears.map((y: any) => <option key={y} value={y}>{y}</option>)}
                                                </select>
                                                <select aria-label="Seleccionar mes" value={exportMonth} onChange={(e) => setExportMonth(e.target.value)} className={`${inputStyles} w-1/2`}>
                                                    <option value="" disabled>Mes</option>
                                                    {availableMonthsForExport.map((m: any) => <option key={m} value={m}>{getMonthName(m)}</option>)}
                                                </select>
                                            </div>
                                            <select aria-label="Seleccionar campus" value={exportCampus} onChange={(e) => setExportCampus(e.target.value)} className={inputStyles}>
                                                <option value="">Todos los Campus</option>
                                                {availableCampusesForExport.length > 0 ? (
                                                    availableCampusesForExport.map((c: any) => <option key={c} value={c}>{c}</option>)
                                                ) : (
                                                    <option value="none" disabled>No hay campus en esta fecha</option>
                                                )}
                                            </select>
                                        </div>
                                    )}
                                </label>
                            </div>
                        </div>
                        <div className="p-4 border-t theme-border flex justify-end gap-3 bg-black/5 dark:bg-white/5">
                            <button type="button" onClick={() => setIsExportModalOpen(false)} className="px-5 py-2.5 rounded-xl font-bold theme-text-main hover:bg-black/10 dark:hover:bg-white/10 transition-colors">Cancelar</button>
                            <button type="button" onClick={handleExecuteExport} disabled={isExporting} className="px-5 py-2.5 rounded-xl font-bold bg-orange-600 text-white hover:bg-orange-500 flex items-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                {isExporting ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4"/>} 
                                {isExporting ? 'Generando...' : 'Generar CSV'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DETALLE DE REPORTE */}
            {isDetailOpen && selectedIncident && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 fade-in print:static print:block print:p-0 print:bg-transparent">
                    <div className="theme-bg-container rounded-2xl w-full max-w-2xl shadow-2xl border theme-border overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-full">
                        <div className="p-5 border-b theme-border flex justify-between items-center bg-orange-500/5 no-print">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-500/20 rounded-lg">{getMediaIcon(selectedIncident.medio)}</div>
                                <div><h3 className="font-bold theme-text-main text-lg">{selectedIncident.medio}</h3><p className="text-xs theme-text-muted font-medium">{selectedIncident.fecha}</p></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => window.print()} className="p-2 theme-text-muted hover:theme-text-main hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors" title="Imprimir"><Printer className="w-5 h-5"/></button>
                                {isAdmin && (
                                    <>
                                        <button type="button" onClick={openEdit} className="p-2 text-orange-500 hover:bg-orange-500/10 rounded-lg transition-colors" title="Editar"><Edit3 className="w-5 h-5"/></button>
                                        <button type="button" onClick={handleDelete} className="p-2 text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-colors" title="Eliminar"><Trash2 className="w-5 h-5"/></button>
                                    </>
                                )}
                                <button type="button" onClick={() => setIsDetailOpen(false)} className="p-2 theme-text-muted hover:theme-text-main bg-black/5 dark:bg-white/5 rounded-lg"><X className="w-5 h-5"/></button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar print:overflow-visible flex-1">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 print:mt-4">
                                <div><p className="text-xs theme-text-muted font-medium mb-1">Total de Incidencias</p><p className="font-bold theme-text-main text-lg">{selectedIncident.totalIncidencias}</p></div>
                                <div><p className="text-xs theme-text-muted font-medium mb-1">Campus</p><p className="font-bold theme-text-main">{selectedIncident.campus}</p></div>
                                <div><p className="text-xs theme-text-muted font-medium mb-1">Área Responsable</p><p className="font-bold theme-text-main">{selectedIncident.area || 'Operaciones'}</p></div>
                                <div><p className="text-xs theme-text-muted font-medium mb-1">Nivel de Riesgo</p><span className={`inline-block px-3 py-1 rounded-md text-xs font-bold ${getRiskColor(selectedIncident.riesgo)}`}>{selectedIncident.riesgo}</span></div>
                                <div className="col-span-2"><p className="text-xs theme-text-muted font-medium mb-1">Usuario RRSS</p><p className="font-bold theme-text-main bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg inline-block">{selectedIncident.usuario}</p></div>
                            </div>
                            <div className="space-y-6">
                                <div><p className="text-xs theme-text-muted font-medium mb-2 uppercase tracking-wider">Descripción de la incidencia</p><div className="p-4 theme-bg-low rounded-xl border theme-border theme-text-main whitespace-pre-wrap text-sm leading-relaxed">{selectedIncident.descripcion}</div></div>
                                {selectedIncident.comentarios && <div><p className="text-xs theme-text-muted font-medium mb-2 uppercase tracking-wider">Comentarios adicionales</p><div className="p-4 theme-bg-low rounded-xl border theme-border theme-text-main whitespace-pre-wrap text-sm">{selectedIncident.comentarios}</div></div>}
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                                    {selectedIncident.reporteTexto && (
                                        <button type="button" onClick={() => handleDownloadDocx(selectedIncident)} className="flex items-center gap-3 p-3 theme-bg-low border theme-border rounded-xl hover:border-blue-500 transition-colors group no-print text-left">
                                            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg group-hover:scale-110 transition-transform"><FileText className="w-4 h-4"/></div>
                                            <div className="overflow-hidden"><p className="text-xs font-bold theme-text-main">Reporte Oficial</p><p className="text-[10px] theme-text-muted truncate">Descargar (.docx)</p></div>
                                        </button>
                                    )}
                                    {selectedIncident.enlacePublicacion && (<a href={selectedIncident.enlacePublicacion} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 theme-bg-low border theme-border rounded-xl hover:border-orange-500 transition-colors group no-print"><div className="p-2 bg-orange-500/10 text-orange-500 rounded-lg group-hover:scale-110 transition-transform"><LinkIcon className="w-4 h-4"/></div><div className="overflow-hidden"><p className="text-xs font-bold theme-text-main">Ver Publicación</p><p className="text-[10px] theme-text-muted truncate">{selectedIncident.enlacePublicacion}</p></div></a>)}
                                    {selectedIncident.enlaceDrive && (<a href={selectedIncident.enlaceDrive} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 theme-bg-low border theme-border rounded-xl hover:border-orange-500 transition-colors group no-print"><div className="p-2 bg-green-500/10 text-green-600 rounded-lg group-hover:scale-110 transition-transform"><HardDrive className="w-4 h-4"/></div><div className="overflow-hidden"><p className="text-xs font-bold theme-text-main">Evidencia (Drive)</p><p className="text-[10px] theme-text-muted truncate">{selectedIncident.enlaceDrive}</p></div></a>)}
                                </div>
                            </div>
                            <div className="mt-8 pt-4 border-t theme-border flex justify-between items-center">
                                {isAdmin ? <p className="text-sm font-bold theme-text-muted italic flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span>Reportado por: <span className="theme-text-main">{selectedIncident.autor || 'Administrador'}</span></p> : <p className="text-sm font-bold theme-text-muted italic flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-400"></span>Registro de sistema (Acceso público)</p>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL DE EDICIÓN */}
            {isEditOpen && selectedIncident && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 fade-in">
                    <div className="theme-bg-container rounded-2xl w-full max-w-3xl shadow-2xl border theme-border flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b theme-border flex justify-between items-center bg-orange-500/5">
                            <h3 className="font-bold theme-text-main flex items-center gap-2"><Edit3 className="w-5 h-5 text-orange-500" /> Editar Incidente RRSS</h3>
                            <button type="button" onClick={() => setIsEditOpen(false)} className="p-2 theme-text-muted hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <form id="editRrssForm" onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                const cleanHTML = DOMPurify.sanitize(editEditorRef.current ? editEditorRef.current.innerHTML : (selectedIncident.reporteTexto || ''));
                                updateRrssIncident(selectedIncident.id, {
                                    totalIncidencias: parseInt(fd.get('total') as string), fecha: fd.get('fecha'), usuario: fd.get('usuario'),
                                    medio: fd.get('medio'), campus: fd.get('campus'), riesgo: fd.get('riesgo'), area: fd.get('area'),
                                    descripcion: fd.get('descripcion'), comentarios: fd.get('comentarios'),
                                    enlacePublicacion: fd.get('enlacePub'), enlaceDrive: fd.get('enlaceDrive'),
                                    reporteTexto: cleanHTML
                                });
                                setIsEditOpen(false);
                            }} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label htmlFor="er-total" className="text-xs font-bold theme-text-muted">Total</label><input id="er-total" name="total" type="number" min="1" required defaultValue={selectedIncident.totalIncidencias} className={inputStyles} /></div>
                                    <div><label htmlFor="er-fecha" className="text-xs font-bold theme-text-muted">Fecha</label><input id="er-fecha" name="fecha" type="date" required defaultValue={selectedIncident.fecha} className={`${inputStyles} [color-scheme:light] dark:[color-scheme:dark]`} /></div>
                                    <div><label htmlFor="er-usuario" className="text-xs font-bold theme-text-muted">Usuario</label><input id="er-usuario" name="usuario" type="text" required defaultValue={selectedIncident.usuario} className={inputStyles} /></div>
                                    <div><label htmlFor="er-medio" className="text-xs font-bold theme-text-muted">Medio</label><select id="er-medio" name="medio" defaultValue={selectedIncident.medio} className={inputStyles}><option value="Facebook Comentario">Facebook Comentario</option><option value="TikTok">TikTok</option><option value="FB Grupos">FB Grupos</option><option value="LinkedIn">LinkedIn</option><option value="Facebook DM">Facebook DM</option><option value="Instagram DM">Instagram DM</option></select></div>
                                    <div><label htmlFor="er-campus" className="text-xs font-bold theme-text-muted">Campus</label><select id="er-campus" name="campus" defaultValue={selectedIncident.campus} className={inputStyles}>{['Atizapán', 'Coacalco', 'Cuautitlán Izcalli', 'Ecatepec', 'Tecamac', 'Tultepec', 'Zumpango', 'Tizayuca', 'Querétaro: la Joya', 'Querétaro: el Marqués', 'Huehuetoca', 'Chalco'].map(c => <option key={c}>{c}</option>)}</select></div>
                                    <div><label htmlFor="er-riesgo" className="text-xs font-bold theme-text-muted">Riesgo</label><select id="er-riesgo" name="riesgo" defaultValue={selectedIncident.riesgo} className={inputStyles}><option value="Bajo">Bajo</option><option value="Medio">Medio</option><option value="Alto">Alto</option><option value="Critico">Crítico</option></select></div>
                                    <div className="col-span-2"><label htmlFor="er-area" className="text-xs font-bold theme-text-muted">Área Responsable</label><select id="er-area" name="area" defaultValue={selectedIncident.area || 'Operaciones'} className={inputStyles}><option value="Operaciones">Operaciones</option><option value="Legal">Legal</option><option value="Comercial - Call Center">Comercial - Call Center</option></select></div>
                                </div>
                                <div><label htmlFor="er-descripcion" className="text-xs font-bold theme-text-muted">Descripción</label><textarea id="er-descripcion" name="descripcion" rows={3} required defaultValue={selectedIncident.descripcion} className={inputStyles}></textarea></div>
                                <div><label htmlFor="er-comentarios" className="text-xs font-bold theme-text-muted">Comentarios</label><textarea id="er-comentarios" name="comentarios" rows={2} defaultValue={selectedIncident.comentarios} className={inputStyles}></textarea></div>
                                <div>
                                    <label className="text-xs font-bold theme-text-muted mb-1 block">Editar reporte (Texto Enriquecido)</label>
                                    <div className="border theme-border rounded-xl overflow-hidden bg-[var(--surface)] focus-within:border-gray-400 focus-within:ring-1 focus-within:ring-gray-400 transition-all">
                                        <EditorToolbar onCommand={execEditCommand} />
                                        <div className="w-full p-4 theme-bg-low theme-text-main outline-none min-h-[160px] overflow-y-auto max-h-[300px] text-sm leading-relaxed custom-scrollbar wysiwyg-content" ref={editEditorRef} contentEditable dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedIncident.reporteTexto || '') }} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label htmlFor="er-enlacePub" className="text-xs font-bold theme-text-muted">Enlace Publicación</label><input id="er-enlacePub" name="enlacePub" type="url" defaultValue={selectedIncident.enlacePublicacion} className={inputStyles} /></div>
                                    <div><label htmlFor="er-enlaceDrive" className="text-xs font-bold theme-text-muted">Enlace Drive</label><input id="er-enlaceDrive" name="enlaceDrive" type="url" defaultValue={selectedIncident.enlaceDrive} className={inputStyles} /></div>
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t theme-border flex justify-end gap-3 bg-black/5 dark:bg-white/5">
                            <button type="button" onClick={() => setIsEditOpen(false)} className="px-5 py-2 rounded-xl font-bold theme-text-main hover:bg-black/10 dark:hover:bg-white/10 transition-colors">Cancelar</button>
                            <button type="submit" form="editRrssForm" className="px-5 py-2 rounded-xl font-bold bg-orange-600 text-white hover:bg-orange-500 flex items-center gap-2"><Save className="w-4 h-4"/> Actualizar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};