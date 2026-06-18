import React, { useState, useMemo, useEffect } from 'react';
import { 
    Save, Download, Trash2, MessageSquare, Printer, X, Edit3, 
    Link as LinkIcon, Calendar, PlusCircle, Share2, MapPin, 
    Frown, Meh, Search, ChevronDown, ChevronRight, ChevronLeft 
} from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, appId } from '../firebase/config';

const inputStyles = "w-full p-2.5 rounded-xl theme-bg-low border theme-border theme-text-main focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-all";
const radioLabelStyles = "flex items-center gap-2 text-sm font-medium theme-text-main cursor-pointer";

const getMonthName = (monthNum: string) => {
    const months: any = { '01': 'Enero', '02': 'Febrero', '03': 'Marzo', '04': 'Abril', '05': 'Mayo', '06': 'Junio', '07': 'Julio', '08': 'Agosto', '09': 'Septiembre', '10': 'Octubre', '11': 'Noviembre', '12': 'Diciembre' };
    return months[monthNum] || 'Desconocido';
};

const renderSentimentBadge = (sentiment: string) => {
    if (!sentiment) return null;
    if (sentiment === 'Negativo') return <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 flex items-center gap-1 shadow-sm transition-transform hover:scale-105"><Frown className="w-3.5 h-3.5" /> Negativo</span>;
    if (sentiment === 'Neutral') return <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/30 flex items-center gap-1 shadow-sm transition-transform hover:scale-105"><Meh className="w-3.5 h-3.5" /> Neutral</span>;
    return null;
};

export const NewCommentView = ({ isAdmin, showToast, navigate, user, logAction }: any) => {
    const [formData, setFormData] = useState<any>({
        fechaInicio: '', fechaFin: '', contenido: 'Orgánico', evidencia: '',
        comentariosList: [{ usuario: '', comentario: '', redSocial: 'Facebook', campus: 'Sin especificar', sentiment: '', posteoTipo: 'url', posteoUrl: '', posteoTexto: '' }]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const addComentario = () => {
        const last = formData.comentariosList[formData.comentariosList.length - 1];
        setFormData({ ...formData, comentariosList: [...formData.comentariosList, { usuario: '', comentario: '', redSocial: last.redSocial, campus: last.campus, sentiment: '', posteoTipo: last.posteoTipo, posteoUrl: last.posteoUrl, posteoTexto: last.posteoTexto }] });
    };

    const updateComentario = (index: number, field: string, value: string) => {
        const newList = [...formData.comentariosList]; newList[index][field] = value;
        setFormData({ ...formData, comentariosList: newList });
    };

    const removeComentario = (index: number) => {
        const newList = formData.comentariosList.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, comentariosList: newList });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) return showToast('Permisos insuficientes.', true);
        setIsSubmitting(true);
        try {
            const docRef = await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'comments'), { 
                ...formData, autor: user?.displayName || 'Administrador', timestamp: new Date().toISOString() 
            });

            // INYECCIÓN DE LA NOTIFICACIÓN AL CREAR
            if (logAction) await logAction('Creó un nuevo reporte de comentarios', 'Comentarios', 'create', docRef.id);

            showToast('Reporte guardado exitosamente.'); navigate('historial-comentario');
        } catch (error) { showToast('Error al guardar.', true); }
        setIsSubmitting(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 fade-in pb-10">
            <div className="theme-bg-container p-6 rounded-2xl border theme-border shadow-sm">
                <div className="border-b theme-border pb-4 mb-6">
                    <h2 className="text-xl font-bold theme-text-main flex items-center gap-2"><MessageSquare className="w-6 h-6 text-blue-500" /> Crear Reporte de Comentarios</h2>
                    <p className="text-sm theme-text-muted mt-1 ml-8">Registra comentarios independientes o grupales durante un periodo.</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 theme-bg-lowest border theme-border rounded-xl">
                        <div className="space-y-3 md:col-span-1">
                            <label className="text-sm font-bold theme-text-main flex items-center gap-2"><Calendar className="w-4 h-4 text-blue-500"/> Periodo del reporte</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1"><label className="text-xs font-medium theme-text-muted">Inicio</label><input type="date" required value={formData.fechaInicio} onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})} className={`${inputStyles} [color-scheme:light] dark:[color-scheme:dark]`} /></div>
                                <div className="space-y-1"><label className="text-xs font-medium theme-text-muted">Fin</label><input type="date" required value={formData.fechaFin} onChange={(e) => setFormData({...formData, fechaFin: e.target.value})} className={`${inputStyles} [color-scheme:light] dark:[color-scheme:dark]`} /></div>
                            </div>
                        </div>
                        <div className="space-y-3 md:col-span-1 flex flex-col justify-center pl-0 md:pl-4 border-t md:border-t-0 md:border-l theme-border pt-4 md:pt-0 mt-2 md:mt-0">
                            <label className="text-sm font-bold theme-text-main">Tipo de Contenido General</label>
                            <div className="flex items-center gap-6 mt-1">
                                <label className={radioLabelStyles}><input type="radio" name="contenido" value="Orgánico" checked={formData.contenido === 'Orgánico'} onChange={(e) => setFormData({...formData, contenido: e.target.value})} className="w-4 h-4 text-blue-500" /> Orgánico</label>
                                <label className={radioLabelStyles}><input type="radio" name="contenido" value="Pautado" checked={formData.contenido === 'Pautado'} onChange={(e) => setFormData({...formData, contenido: e.target.value})} className="w-4 h-4 text-blue-500" /> Pautado</label>
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b theme-border pb-2">
                            <h3 className="text-lg font-bold theme-text-main">Registro de Comentarios</h3>
                            <button type="button" onClick={addComentario} className="flex items-center gap-1.5 text-xs font-bold text-blue-500 hover:text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-lg"><PlusCircle className="w-4 h-4"/> Agregar otro</button>
                        </div>
                        {formData.comentariosList.map((c: any, idx: number) => (
                            <div key={idx} className="p-5 theme-bg-low border theme-border rounded-xl relative fade-in space-y-4 shadow-sm group border-l-4 border-l-blue-500">
                                {formData.comentariosList.length > 1 && (<button type="button" onClick={() => removeComentario(idx)} className="absolute -top-3 -right-3 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>)}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1"><label className="text-xs font-medium theme-text-muted">Red Social</label><select value={c.redSocial} onChange={(e) => updateComentario(idx, 'redSocial', e.target.value)} className={inputStyles}><option>Facebook</option><option>Tiktok</option><option>Instagram</option><option>Grupos FB</option></select></div>
                                    <div className="space-y-1"><label className="text-xs font-medium theme-text-muted">Nombre de Usuario</label><input type="text" required placeholder="@usuario o Nombre" value={c.usuario} onChange={(e) => updateComentario(idx, 'usuario', e.target.value)} className={inputStyles} /></div>
                                    <div className="space-y-1"><label className="text-xs font-medium theme-text-muted">Campus</label><select value={c.campus} onChange={(e) => updateComentario(idx, 'campus', e.target.value)} className={inputStyles}>{['Sin especificar', 'Atizapán', 'Coacalco', 'Cuautitlán Izcalli', 'Ecatepec', 'Tecamac', 'Tultepec', 'Zumpango', 'Tizayuca', 'Querétaro: la Joya', 'Querétaro: el Marqués', 'Huehuetoca', 'Chalco'].map(camp => <option key={camp}>{camp}</option>)}</select></div>
                                    <div className="space-y-1"><label className="text-xs font-medium theme-text-muted">Sentiment</label><select required value={c.sentiment} onChange={(e) => updateComentario(idx, 'sentiment', e.target.value)} className={`${inputStyles} ${!c.sentiment ? 'text-gray-400' : ''}`}><option value="" disabled>Seleccionar...</option><option value="Neutral" className="text-gray-700 dark:text-gray-300">Neutral</option><option value="Negativo" className="text-red-600 dark:text-red-400">Negativo</option></select></div>
                                </div>
                                <div className="space-y-1"><label className="text-xs font-medium theme-text-muted">Comentario del usuario</label><textarea required rows={2} placeholder="Escribe el comentario..." value={c.comentario} onChange={(e) => updateComentario(idx, 'comentario', e.target.value)} className={`${inputStyles} resize-none`}></textarea></div>
                                <div className="pt-3 border-t theme-border border-dashed">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3"><label className="text-xs font-bold theme-text-main">Formato del Post Original:</label><div className="flex items-center gap-6"><label className={radioLabelStyles}><input type="radio" value="url" checked={c.posteoTipo === 'url'} onChange={() => { updateComentario(idx, 'posteoTipo', 'url'); updateComentario(idx, 'posteoTexto', ''); }} className="w-4 h-4 text-blue-500" /> URL</label><label className={radioLabelStyles}><input type="radio" value="texto" checked={c.posteoTipo === 'texto'} onChange={() => { updateComentario(idx, 'posteoTipo', 'texto'); updateComentario(idx, 'posteoUrl', ''); }} className="w-4 h-4 text-blue-500" /> Texto</label></div></div>
                                    {c.posteoTipo === 'url' ? (<input type="url" placeholder="https://..." value={c.posteoUrl} onChange={(e) => updateComentario(idx, 'posteoUrl', e.target.value)} required className={inputStyles} />) : (<input type="text" placeholder="Post original..." value={c.posteoTexto} onChange={(e) => updateComentario(idx, 'posteoTexto', e.target.value)} required className={inputStyles} />)}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-1 pt-4 border-t theme-border"><label className="text-sm font-medium theme-text-main flex items-center gap-2">URL de Evidencias <span className="text-[10px] font-normal theme-text-muted">(Drive, Slides)</span></label><input type="url" value={formData.evidencia} onChange={(e) => setFormData({...formData, evidencia: e.target.value})} className={inputStyles} /></div>
                    <div className="pt-4 flex items-center justify-end gap-3 border-t theme-border">
                        <button type="button" onClick={() => navigate('dashboard')} className="px-5 py-2.5 rounded-xl font-medium theme-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors">Cancelar</button>
                        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 transition-all disabled:opacity-50">{isSubmitting ? 'Guardando...' : <><Save className="w-5 h-5"/> Guardar Reporte</>}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const HistorialCommentView = ({ comments, showToast, isAdmin, updateComment, deleteComment }: any) => {
    const [selectedComment, setSelectedComment] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [filterYear, setFilterYear] = useState('Todos');
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [pagePerMonth, setPagePerMonth] = useState<Record<string, number>>({});
    const itemsPerPage = 30;

    // ESTADOS DEL MODAL DE EXPORTACIÓN
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [exportType, setExportType] = useState('all'); // all | year | month
    const [exportYear, setExportYear] = useState('');
    const [exportMonth, setExportMonth] = useState('');

    const getNormalizedComments = (com: any) => {
        if (com.comentariosList && com.comentariosList.length > 0) return com.comentariosList.map((c: any) => ({ ...c, redSocial: c.redSocial || com.redSocial || 'Facebook', campus: c.campus || com.campus || 'Sin especificar', sentiment: c.sentiment || com.sentiment || '', posteoTipo: c.posteoTipo || com.posteoTipo || 'url', posteoUrl: c.posteoUrl || com.posteoUrl || '', posteoTexto: c.posteoTexto || com.posteoTexto || '' }));
        return [{ usuario: com.usuario || 'N/A', comentario: com.descripcion || 'Sin comentario', redSocial: com.redSocial || 'Facebook', campus: com.campus || 'Sin especificar', sentiment: com.sentiment || '', posteoTipo: com.posteoTipo || 'url', posteoUrl: com.posteoUrl || '', posteoTexto: com.posteoTexto || '' }];
    };

    const availableYears = useMemo(() => {
        const years = new Set(comments.map((c: any) => c.fechaInicio ? c.fechaInicio.split('-')[0] : null).filter(Boolean));
        return Array.from(years).sort((a: any, b: any) => b.localeCompare(a));
    }, [comments]);

    // OBTENER MESES DISPONIBLES EN BASE AL AÑO SELECCIONADO PARA EXPORTAR
    const availableMonthsForExport = useMemo(() => {
        if (!exportYear) return [];
        const months = new Set(
            comments
                .filter((c: any) => c.fechaInicio && c.fechaInicio.split('-')[0] === exportYear)
                .map((c: any) => c.fechaInicio.split('-')[1])
        );
        return Array.from(months).sort((a: any, b: any) => b.localeCompare(a));
    }, [comments, exportYear]);

    const filteredComments = useMemo(() => {
        return comments.filter((com: any) => {
            const year = com.fechaInicio ? com.fechaInicio.split('-')[0] : '';
            const matchYear = filterYear === 'Todos' || year === filterYear;
            const term = searchTerm.toLowerCase();
            const list = getNormalizedComments(com);
            
            const matchSearch = term === '' || 
                (isAdmin && com.autor && com.autor.toLowerCase().includes(term)) ||
                (com.contenido && com.contenido.toLowerCase().includes(term)) ||
                list.some((c: any) => 
                    (c.usuario && c.usuario.toLowerCase().includes(term)) ||
                    (c.comentario && c.comentario.toLowerCase().includes(term)) ||
                    (c.redSocial && c.redSocial.toLowerCase().includes(term)) ||
                    (c.campus && c.campus.toLowerCase().includes(term)) ||
                    (c.sentiment && c.sentiment.toLowerCase().includes(term))
                );
            return matchYear && matchSearch;
        });
    }, [comments, searchTerm, filterYear, isAdmin]);

    const groupedData = useMemo(() => {
        const groups: Record<string, Record<string, any[]>> = {};
        filteredComments.forEach((com: any) => {
            const year = com.fechaInicio ? com.fechaInicio.split('-')[0] : 'Sin Fecha';
            const month = com.fechaInicio ? com.fechaInicio.split('-')[1] : '00';
            if (!groups[year]) groups[year] = {};
            if (!groups[year][month]) groups[year][month] = [];
            groups[year][month].push(com);
        });
        return groups;
    }, [filteredComments]);

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
    const openDetail = (com: any) => { setSelectedComment(com); setIsDetailOpen(true); };
    const openEdit = () => { setEditData({ ...selectedComment, comentariosList: getNormalizedComments(selectedComment) }); setIsDetailOpen(false); setIsEditOpen(true); };
    const handleDelete = () => { setIsDetailOpen(false); deleteComment(selectedComment.id); };
    const handleEditUpdate = (e: React.FormEvent) => { e.preventDefault(); updateComment(editData.id, editData); setIsEditOpen(false); };

    // LÓGICA DE EXPORTACIÓN INTELIGENTE (DESGLOSADA POR COMENTARIO)
    const handleExecuteExport = () => {
        let dataToExport = comments;
        let filenameSuffix = 'Todo';

        if (exportType === 'year') {
            if (!exportYear) return showToast('Selecciona un año para exportar', true);
            dataToExport = comments.filter((i: any) => i.fechaInicio && i.fechaInicio.split('-')[0] === exportYear);
            filenameSuffix = exportYear;
        } else if (exportType === 'month') {
            if (!exportYear || !exportMonth) return showToast('Selecciona año y mes para exportar', true);
            dataToExport = comments.filter((i: any) => i.fechaInicio && i.fechaInicio.startsWith(`${exportYear}-${exportMonth}`));
            filenameSuffix = `${exportYear}_${exportMonth}`;
        }

        if (dataToExport.length === 0) return showToast('No hay datos registrados en esa fecha', true);

        // 1. Separamos cada dato en su propia columna en los encabezados
        const headers = isAdmin 
            ? ['Fecha Inicio,Fecha Fin,Contenido Global,Evidencias,Red Social,Campus,Sentiment,Usuario,Tipo Posteo,Posteo Original,Comentario,Autor'] 
            : ['Fecha Inicio,Fecha Fin,Contenido Global,Evidencias,Red Social,Campus,Sentiment,Usuario,Tipo Posteo,Posteo Original,Comentario'];
        
        // 2. Aplanamos los datos: 1 Fila = 1 Comentario individual
        const rows = dataToExport.flatMap((i: any) => {
            const list = getNormalizedComments(i);
            
            return list.map((c: any) => {
                // Función auxiliar para escapar comillas dobles y saltos de línea y evitar que se rompa el CSV
                const escape = (text: string) => `"${(text || '').toString().replace(/"/g, '""')}"`;
                
                const posteoOriginal = c.posteoTipo === 'url' ? c.posteoUrl : c.posteoTexto;
                
                const baseData = [
                    escape(i.fechaInicio),
                    escape(i.fechaFin),
                    escape(i.contenido),
                    escape(i.evidencia),
                    escape(c.redSocial),
                    escape(c.campus),
                    escape(c.sentiment || 'N/A'),
                    escape(c.usuario),
                    escape(c.posteoTipo),
                    escape(posteoOriginal),
                    escape(c.comentario)
                ].join(',');

                return isAdmin ? `${baseData},${escape(i.autor || 'Admin')}` : baseData;
            });
        });

        const link = document.createElement("a"); 
        // \uFEFF es el BOM de UTF-8 que fuerza a Excel a leer correctamente los acentos
        link.href = encodeURI("data:text/csv;charset=utf-8,\uFEFF" + [headers, ...rows].join("\n")); 
        link.download = `Comentarios_${filenameSuffix}_${new Date().toISOString().split('T')[0]}.csv`; 
        document.body.appendChild(link); 
        link.click(); 
        document.body.removeChild(link);

        setIsExportModalOpen(false);
        showToast('Exportación desglosada completada exitosamente');
    };

    return (
        <>
            <div className="space-y-6 fade-in pb-10">
                <div className={(isDetailOpen || isEditOpen) ? 'print:hidden' : ''}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                        <div><h2 className="text-2xl font-bold theme-text-main">Historial de Comentarios</h2><p className="theme-text-muted text-sm mt-1">Registro organizado de incidencias y reputación.</p></div>
                        <button onClick={() => setIsExportModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-all text-sm font-bold shadow-sm"><Download className="w-4 h-4"/> Exportar CSV</button>
                    </div>

                    <div className="p-4 theme-bg-container border theme-border rounded-xl shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="relative w-full md:w-2/3 flex items-center">
                            <Search className="absolute left-3 text-gray-400 w-4 h-4 pointer-events-none" />
                            <input type="text" placeholder="Buscar por usuario, campus, red, contenido..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`${inputStyles} pl-10 pr-10`} />
                            {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-3 p-1 rounded-md text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-800 dark:hover:text-white transition-colors" title="Limpiar búsqueda"><X className="w-4 h-4" /></button>}
                        </div>
                        <div className="flex w-full md:w-auto items-center justify-between md:justify-end gap-4">
                            <div className="flex items-center gap-2"><label className="text-xs font-bold theme-text-muted whitespace-nowrap">Año</label><select value={filterYear} onChange={(e) => setFilterYear(e.target.value)} className={`${inputStyles} py-1.5 px-3 min-w-[100px]`}><option value="Todos">Todos</option>{availableYears.map((y: any) => <option key={y} value={y}>{y}</option>)}</select></div>
                            <div className="bg-black/5 dark:bg-white/5 border theme-border px-3 py-1.5 rounded-lg whitespace-nowrap"><span className="text-xs font-bold theme-text-main">{filteredComments.length}</span><span className="text-[10px] theme-text-muted font-medium ml-1">de {comments.length}</span></div>
                        </div>
                    </div>

                    {filteredComments.length === 0 ? (
                        <div className="text-center py-12 theme-bg-container rounded-2xl border theme-border"><MessageSquare className="w-12 h-12 theme-text-muted mx-auto mb-4 opacity-30" /><p className="theme-text-muted">No se encontraron reportes con los criterios actuales.</p></div>
                    ) : (
                        <div className="space-y-4">
                            {Object.keys(groupedData).sort((a, b) => b.localeCompare(a)).map(year => {
                                const isYearExpanded = !!expandedSections[year];
                                const totalInYear = Object.values(groupedData[year]).flat().length;

                                return (
                                    <div key={year} className="theme-bg-container border theme-border rounded-xl overflow-hidden shadow-sm">
                                        <button onClick={() => toggleSection(year)} className="w-full flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
                                            <div className="flex items-center gap-3">{isYearExpanded ? <ChevronDown className="w-5 h-5 theme-text-muted" /> : <ChevronRight className="w-5 h-5 theme-text-muted" />}<h3 className="text-lg font-bold theme-text-main">{year}</h3><span className="bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs font-bold">{totalInYear}</span></div>
                                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
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
                                                                        {paginatedMonthItems.map((com: any) => {
                                                                            const list = getNormalizedComments(com);
                                                                            const firstComment = list[0];
                                                                            const hasMore = list.length > 1;
                                                                            const uniqueNetworks = Array.from(new Set(list.map((c: any) => c.redSocial)));
                                                                            const hasNegative = list.some((c: any) => c.sentiment === 'Negativo');
                                                                            const cardSentimentStatus = hasNegative ? 'Negativo' : (list.some((c: any) => c.sentiment === 'Neutral') ? 'Neutral' : '');

                                                                            return (
                                                                                <div key={com.id} onClick={() => openDetail(com)} className={`p-4 theme-bg-container rounded-xl border shadow-sm transition-colors cursor-pointer group flex flex-col h-full border-l-4 ${hasNegative ? 'border-red-500/50 hover:border-red-500 border-l-red-500' : 'theme-border hover:border-blue-500 border-l-blue-500'}`}>
                                                                                    <div className="flex items-start gap-3 mb-3">
                                                                                        <div className={`w-8 h-8 rounded-lg theme-bg-low flex items-center justify-center flex-shrink-0 transition-colors ${hasNegative ? 'group-hover:bg-red-500' : 'group-hover:bg-blue-500'}`}><MessageSquare className="w-4 h-4 theme-text-muted group-hover:text-white transition-colors" /></div>
                                                                                        <div className="flex-1 min-w-0">
                                                                                            <h3 className="font-bold theme-text-main truncate text-sm">Reporte del {com.fechaInicio}</h3>
                                                                                            <p className="text-[10px] font-semibold theme-text-muted mt-0.5 truncate flex items-center gap-1">al {com.fechaFin}{isAdmin && <><span className="mx-1">|</span> Por: <span className="text-blue-500 truncate">{com.autor || 'Administrador'}</span></>}</p>
                                                                                        </div>
                                                                                    </div>
                                                                                    <div className="text-sm theme-text-main line-clamp-2 min-h-[40px] opacity-90 mb-1"><span className="font-bold mr-1">{firstComment.usuario}:</span>{firstComment.comentario}</div>
                                                                                    {hasMore && <p className="text-[10px] font-bold text-blue-500 mb-2">+ {list.length - 1} comentario(s) más</p>}
                                                                                    <div className="mt-auto pt-3 border-t theme-border flex flex-wrap gap-2 items-center"><span className="px-2 py-1 text-[10px] font-bold rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">{com.contenido}</span>{renderSentimentBadge(cardSentimentStatus)}{uniqueNetworks.map((net: any) => <span key={net} className="px-2 py-1 text-[10px] font-bold rounded-md bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">{net}</span>)}</div>
                                                                                </div>
                                                                            );
                                                                        })}
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

            {/* MODAL DE EXPORTACIÓN INTELIGENTE */}
            {isExportModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 fade-in">
                    <div className="theme-bg-container rounded-2xl w-full max-w-md shadow-2xl border theme-border flex flex-col overflow-hidden">
                        <div className="p-5 border-b theme-border flex justify-between items-center bg-blue-500/5">
                            <h3 className="font-bold theme-text-main flex items-center gap-2"><Download className="w-5 h-5 text-blue-500" /> Exportación Inteligente CSV</h3>
                            <button onClick={() => setIsExportModalOpen(false)} className="p-2 theme-text-muted hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="p-6 space-y-5">
                            <p className="text-sm theme-text-muted">Selecciona el alcance de los datos que deseas descargar en formato CSV para tu reporte.</p>
                            <div className="space-y-3">
                                <label className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${exportType === 'all' ? 'border-blue-500 bg-blue-500/5' : 'theme-border theme-bg-low hover:border-gray-400'}`}>
                                    <input type="radio" name="exportType" checked={exportType === 'all'} onChange={() => setExportType('all')} className="w-4 h-4 text-blue-500" />
                                    <div><p className="text-sm font-bold theme-text-main">Todo el Historial</p><p className="text-xs theme-text-muted">Descarga todos los incidentes registrados.</p></div>
                                </label>
                                
                                <label className={`flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${exportType === 'year' ? 'border-blue-500 bg-blue-500/5' : 'theme-border theme-bg-low hover:border-gray-400'}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="exportType" checked={exportType === 'year'} onChange={() => { setExportType('year'); if(!exportYear && availableYears.length) setExportYear(String(availableYears[0])); }} className="w-4 h-4 text-blue-500" />
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

                                <label className={`flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${exportType === 'month' ? 'border-blue-500 bg-blue-500/5' : 'theme-border theme-bg-low hover:border-gray-400'}`}>
                                    <div className="flex items-center gap-3">
                                        <input type="radio" name="exportType" checked={exportType === 'month'} onChange={() => { setExportType('month'); if(!exportYear && availableYears.length) setExportYear(String(availableYears[0])); }} className="w-4 h-4 text-blue-500" />
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
                            <button onClick={handleExecuteExport} className="px-5 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 flex items-center gap-2 shadow-sm"><Download className="w-4 h-4"/> Generar CSV</button>
                        </div>
                    </div>
                </div>
            )}

            {isDetailOpen && selectedComment && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 fade-in print:static print:block print:p-0 print:bg-transparent">
                    <div className="theme-bg-container rounded-2xl w-full max-w-2xl shadow-2xl border theme-border overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-full">
                        <div className="p-5 border-b theme-border flex justify-between items-center bg-blue-500/5 no-print">
                            <div className="flex items-center gap-3"><div className="p-2 bg-blue-500/20 rounded-lg"><MessageSquare className="w-5 h-5 text-blue-500" /></div><div><h3 className="font-bold theme-text-main text-lg">Reporte de Comentarios</h3><p className="text-xs theme-text-muted font-medium">Periodo: {selectedComment.fechaInicio} al {selectedComment.fechaFin}</p></div></div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => window.print()} className="p-2 theme-text-muted hover:theme-text-main hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"><Printer className="w-5 h-5"/></button>
                                {isAdmin && (
                                    <><button onClick={openEdit} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors"><Edit3 className="w-5 h-5"/></button><button onClick={handleDelete} className="p-2 text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-colors"><Trash2 className="w-5 h-5"/></button></>
                                )}
                                <button onClick={() => setIsDetailOpen(false)} className="p-2 theme-text-muted hover:theme-text-main bg-black/5 dark:bg-white/5 rounded-lg"><X className="w-5 h-5"/></button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar print:overflow-visible flex-1">
                            <div className="mb-6 flex items-center gap-2"><span className="px-3 py-1 bg-blue-500/10 text-blue-500 rounded-lg text-xs font-bold uppercase tracking-wider">{selectedComment.contenido}</span>{selectedComment.evidencia && (<a href={selectedComment.evidencia} target="_blank" rel="noreferrer" className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:brightness-110 no-print"><LinkIcon className="w-3 h-3"/> Evidencias</a>)}</div>
                            <div className="space-y-4">
                                <p className="text-sm font-bold theme-text-muted uppercase tracking-wider flex items-center gap-2 border-b theme-border pb-2">Desglose de Comentarios <span className="px-2 py-0.5 bg-blue-500 text-white rounded-full text-xs">{getNormalizedComments(selectedComment).length}</span></p>
                                {getNormalizedComments(selectedComment).map((c: any, idx: number) => (
                                    <div key={idx} className={`p-4 theme-bg-low rounded-xl border space-y-3 print:border-gray-300 ${c.sentiment === 'Negativo' ? 'border-red-500/30 bg-red-500/5' : 'theme-border'}`}>
                                        <div className="flex flex-wrap items-center gap-3 border-b theme-border pb-2 border-dashed">
                                            <span className="font-bold text-sm text-blue-500 break-all">{c.usuario}</span>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider"><span className="flex items-center gap-1"><Share2 className="w-3 h-3"/> {c.redSocial}</span><span>•</span><span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {c.campus}</span>{c.sentiment && (<><span>•</span>{renderSentimentBadge(c.sentiment)}</>)}</div>
                                        </div>
                                        <p className="text-sm theme-text-main whitespace-pre-wrap">{c.comentario}</p>
                                        <div className="pt-2">
                                            <p className="text-[10px] theme-text-muted font-bold uppercase tracking-wider mb-1">Publicación Original</p>
                                            {c.posteoTipo === 'url' ? (<a href={c.posteoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline break-all inline-flex items-start gap-1"><LinkIcon className="w-3 h-3 flex-shrink-0 mt-0.5" /> {c.posteoUrl}</a>) : (<p className="text-xs theme-text-main italic">"{c.posteoTexto}"</p>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 pt-4 border-t theme-border flex justify-between items-center">{isAdmin ? <p className="text-sm font-bold theme-text-muted italic flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span>Reportado por: <span className="theme-text-main">{selectedComment.autor || 'Administrador'}</span></p> : <p className="text-sm font-bold theme-text-muted italic flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-gray-400"></span>Registro de sistema</p>}</div>
                        </div>
                    </div>
                </div>
            )}

            {isEditOpen && editData && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 fade-in">
                    <div className="theme-bg-container rounded-2xl w-full max-w-3xl shadow-2xl border theme-border flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b theme-border flex justify-between items-center bg-blue-500/5">
                            <h3 className="font-bold theme-text-main flex items-center gap-2"><Edit3 className="w-5 h-5 text-blue-500" /> Editar Reporte de Comentarios</h3>
                            <button onClick={() => setIsEditOpen(false)} className="p-2 theme-text-muted hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <form id="editCommentForm" onSubmit={handleEditUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 theme-bg-lowest border theme-border rounded-xl">
                                    <div><label className="text-xs font-bold theme-text-muted">Fecha Inicio</label><input type="date" required value={editData.fechaInicio} onChange={e => setEditData({...editData, fechaInicio: e.target.value})} className={`${inputStyles} [color-scheme:light] dark:[color-scheme:dark]`} /></div>
                                    <div><label className="text-xs font-bold theme-text-muted">Fecha Fin</label><input type="date" required value={editData.fechaFin} onChange={e => setEditData({...editData, fechaFin: e.target.value})} className={`${inputStyles} [color-scheme:light] dark:[color-scheme:dark]`} /></div>
                                    <div><label className="text-xs font-bold theme-text-muted">Contenido Global</label><select value={editData.contenido} onChange={e => setEditData({...editData, contenido: e.target.value})} className={inputStyles}><option value="Orgánico">Orgánico</option><option value="Pautado">Pautado</option></select></div>
                                    <div><label className="text-xs font-bold theme-text-muted">Evidencia (Drive/Slides)</label><input type="url" value={editData.evidencia} onChange={e => setEditData({...editData, evidencia: e.target.value})} className={inputStyles} /></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b theme-border pb-2">
                                        <label className="text-sm font-bold theme-text-main">Comentarios Registrados</label>
                                        <button type="button" onClick={() => { const last = editData.comentariosList[editData.comentariosList.length - 1] || {}; setEditData({...editData, comentariosList: [...editData.comentariosList, { usuario:'', comentario:'', redSocial: last.redSocial || 'Facebook', campus: last.campus || 'Sin especificar', sentiment: '', posteoTipo: last.posteoTipo || 'url', posteoUrl: last.posteoUrl || '', posteoTexto: last.posteoTexto || '' }]}); }} className="text-xs flex items-center gap-1 font-bold text-blue-500 hover:underline"><PlusCircle className="w-3 h-3"/> Agregar otro</button>
                                    </div>
                                    {editData.comentariosList.map((c: any, idx: number) => (
                                        <div key={idx} className="flex flex-col gap-3 p-4 theme-bg-low border theme-border rounded-xl relative group">
                                            {editData.comentariosList.length > 1 && (<button type="button" onClick={() => { const newList = editData.comentariosList.filter((_:any, i:number) => i !== idx); setEditData({...editData, comentariosList: newList}); }} className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-3 h-3"/></button>)}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div><label className="text-xs font-medium theme-text-muted">Red Social</label><select value={c.redSocial} onChange={(e) => { const n = [...editData.comentariosList]; n[idx].redSocial = e.target.value; setEditData({...editData, comentariosList: n}); }} className={inputStyles}><option>Facebook</option><option>Tiktok</option><option>Instagram</option><option>Grupos FB</option></select></div>
                                                <div><label className="text-xs font-medium theme-text-muted">Usuario</label><input type="text" required value={c.usuario} onChange={(e) => { const n = [...editData.comentariosList]; n[idx].usuario = e.target.value; setEditData({...editData, comentariosList: n}); }} className={inputStyles} /></div>
                                                <div><label className="text-xs font-medium theme-text-muted">Campus</label><select value={c.campus} onChange={(e) => { const n = [...editData.comentariosList]; n[idx].campus = e.target.value; setEditData({...editData, comentariosList: n}); }} className={inputStyles}>{['Sin especificar', 'Atizapán', 'Coacalco', 'Cuautitlán Izcalli', 'Ecatepec', 'Tecamac', 'Tultepec', 'Zumpango', 'Tizayuca', 'Querétaro: la Joya', 'Querétaro: el Marqués', 'Huehuetoca', 'Chalco'].map(camp => <option key={camp}>{camp}</option>)}</select></div>
                                                <div><label className="text-xs font-medium theme-text-muted">Sentiment</label><select required value={c.sentiment} onChange={(e) => { const n = [...editData.comentariosList]; n[idx].sentiment = e.target.value; setEditData({...editData, comentariosList: n}); }} className={`${inputStyles} ${!c.sentiment ? 'text-gray-400' : ''}`}><option value="" disabled>Seleccionar...</option><option value="Neutral" className="text-gray-700 dark:text-gray-300">Neutral</option><option value="Negativo" className="text-red-600 dark:text-red-400">Negativo</option></select></div>
                                            </div>
                                            <div><label className="text-xs font-medium theme-text-muted">Comentario</label><textarea required rows={2} value={c.comentario} onChange={(e) => { const n = [...editData.comentariosList]; n[idx].comentario = e.target.value; setEditData({...editData, comentariosList: n}); }} className={`${inputStyles} resize-none`}></textarea></div>
                                            <div className="pt-2">
                                                <div className="flex items-center gap-4 mb-2"><label className="text-xs font-bold theme-text-muted">Formato Post Original:</label><select value={c.posteoTipo} onChange={(e) => { const n = [...editData.comentariosList]; n[idx].posteoTipo = e.target.value; n[idx].posteoUrl = ''; n[idx].posteoTexto = ''; setEditData({...editData, comentariosList: n}); }} className={`${inputStyles} py-1 px-2 w-auto text-xs`}><option value="url">URL</option><option value="texto">Texto</option></select></div>
                                                {c.posteoTipo === 'url' ? (<input type="url" placeholder="URL del post..." value={c.posteoUrl} onChange={(e) => { const n = [...editData.comentariosList]; n[idx].posteoUrl = e.target.value; setEditData({...editData, comentariosList: n}); }} className={inputStyles} />) : (<input type="text" placeholder="Texto del post..." value={c.posteoTexto} onChange={(e) => { const n = [...editData.comentariosList]; n[idx].posteoTexto = e.target.value; setEditData({...editData, comentariosList: n}); }} className={inputStyles} />)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t theme-border flex justify-end gap-3 bg-black/5 dark:bg-white/5">
                            <button onClick={() => setIsEditOpen(false)} className="px-5 py-2 rounded-xl font-bold theme-text-main hover:bg-black/10 dark:hover:bg-white/10 transition-colors">Cancelar</button>
                            <button type="submit" form="editCommentForm" className="px-5 py-2 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500 flex items-center gap-2"><Save className="w-4 h-4"/> Actualizar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};