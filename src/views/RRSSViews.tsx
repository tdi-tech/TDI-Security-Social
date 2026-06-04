import React, { useState } from 'react';
import { Save, Download, Trash2, Smartphone, Printer, X, Edit3, Link as LinkIcon, HardDrive } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, appId } from '../firebase/config';

// ==========================================
// ESTILOS COMPARTIDOS PARA FORMULARIOS NEUTROS
// ==========================================
const inputStyles = "w-full p-2.5 rounded-xl theme-bg-low border theme-border theme-text-main focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-all";

// ==========================================
// VISTA 1: CREAR INCIDENTE RRSS
// ==========================================
export const NewRRSSIncidentView = ({ isAdmin, showToast, navigate, user }: any) => {
    const [formData, setFormData] = useState({
        totalIncidencias: 1,
        fecha: new Date().toISOString().split('T')[0],
        usuario: '',
        medio: 'Facebook Comentario',
        campus: 'Atizapán',
        riesgo: 'Bajo',
        descripcion: '',
        area: 'Operaciones',
        comentarios: '',
        enlacePublicacion: '',
        enlaceDrive: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) {
            showToast('Permisos insuficientes.', true);
            return;
        }
        setIsSubmitting(true);
        try {
            const rrssRef = collection(db, 'artifacts', appId, 'public', 'data', 'rrss_incidents');
            await addDoc(rrssRef, {
                ...formData,
                autor: user?.displayName || 'Administrador',
                timestamp: new Date().toISOString()
            });
            showToast('Incidente RRSS guardado exitosamente.');
            navigate('historial-rss');
        } catch (error) {
            showToast('Error al guardar el incidente.', true);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 fade-in">
            <div className="theme-bg-container p-6 rounded-2xl border theme-border shadow-sm">
                <div className="border-b theme-border pb-4 mb-6">
                    <h2 className="text-xl font-bold theme-text-main flex items-center gap-2">
                        <Smartphone className="w-6 h-6 text-[var(--primary)]" />
                        Crear Incidente de RRSS
                    </h2>
                    <p className="text-sm theme-text-muted mt-1 ml-8">Registra nuevas incidencias detectadas en redes sociales.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="text-sm font-medium theme-text-main">Total de incidencias</label>
                            <input type="number" min="1" required value={formData.totalIncidencias} onChange={(e) => setFormData({...formData, totalIncidencias: parseInt(e.target.value)})} className={inputStyles} />
                        </div>
                        
                        <div className="space-y-1">
                            <label className="text-sm font-medium theme-text-main">Fecha de recepción</label>
                            <input type="date" required value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} className={`${inputStyles} [color-scheme:light] dark:[color-scheme:dark]`} />
                        </div>
                        
                        <div className="space-y-1">
                            <label className="text-sm font-medium theme-text-main">Nombre / Usuario</label>
                            <input type="text" required placeholder="@usuario o Nombre" value={formData.usuario} onChange={(e) => setFormData({...formData, usuario: e.target.value})} className={inputStyles} />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium theme-text-main">Medio de recepción</label>
                            <select value={formData.medio} onChange={(e) => setFormData({...formData, medio: e.target.value})} className={inputStyles}>
                                <option>Facebook Comentario</option>
                                <option>TikTok</option>
                                <option>FB Grupos</option>
                                <option>LinkedIn</option>
                                <option>Facebook DM</option>
                                <option>Instagram DM</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium theme-text-main">Campus</label>
                            <select value={formData.campus} onChange={(e) => setFormData({...formData, campus: e.target.value})} className={inputStyles}>
                                {['Atizapán', 'Coacalco', 'Cuautitlán Izcalli', 'Ecatepec', 'Tecamac', 'Tultepec', 'Zumpango', 'Tizayuca', 'Querétaro: la Joya', 'Querétaro: el Marqués', 'Huehuetoca', 'Chalco'].map(c => <option key={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium theme-text-main">Nivel de Riesgo</label>
                            <select value={formData.riesgo} onChange={(e) => setFormData({...formData, riesgo: e.target.value})} className={inputStyles}>
                                <option value="Bajo">Bajo</option>
                                <option value="Medio">Medio</option>
                                <option value="Alto">Alto</option>
                                <option value="Critico">Crítico</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-medium theme-text-main">Área Responsable</label>
                            <select value={formData.area} onChange={(e) => setFormData({...formData, area: e.target.value})} className={inputStyles}>
                                <option>Operaciones</option>
                                <option>Area 2</option>
                                <option>Area 3</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium theme-text-main">Descripción de incidencia</label>
                        <textarea required rows={3} value={formData.descripcion} onChange={(e) => setFormData({...formData, descripcion: e.target.value})} className={`${inputStyles} resize-none`}></textarea>
                    </div>

                    <div className="p-4 theme-bg-lowest border theme-border rounded-xl space-y-4">
                        <h3 className="font-bold theme-text-main text-sm">Comentarios y Evidencia</h3>
                        <div className="space-y-1">
                            <label className="text-xs font-medium theme-text-muted">Comentarios adicionales</label>
                            <textarea rows={2} value={formData.comentarios} onChange={(e) => setFormData({...formData, comentarios: e.target.value})} className={`${inputStyles} resize-none`}></textarea>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-medium theme-text-muted">Enlace de la publicación</label>
                                <input type="url" placeholder="https://" value={formData.enlacePublicacion} onChange={(e) => setFormData({...formData, enlacePublicacion: e.target.value})} className={inputStyles} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-medium theme-text-muted">Enlace a Google Drive</label>
                                <input type="url" placeholder="https://drive.google.com/..." value={formData.enlaceDrive} onChange={(e) => setFormData({...formData, enlaceDrive: e.target.value})} className={inputStyles} />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t theme-border">
                        <button type="button" onClick={() => navigate('dashboard')} className="px-5 py-2.5 rounded-xl font-medium theme-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-[var(--primary)] text-white hover:brightness-110 transition-all disabled:opacity-50">
                            {isSubmitting ? 'Guardando...' : <><Save className="w-5 h-5"/> Guardar Incidente</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ==========================================
// VISTA 2: HISTORIAL RRSS (TARJETAS Y MODALES)
// ==========================================
export const HistorialRRSSView = ({ rrssIncidents, showToast, isAdmin, updateRrssIncident, deleteRrssIncident }: any) => {
    const [selectedIncident, setSelectedIncident] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const openDetail = (inc: any) => {
        setSelectedIncident(inc);
        setIsDetailOpen(true);
    };

    const openEdit = () => {
        setIsDetailOpen(false);
        setIsEditOpen(true);
    };

    const handleDelete = () => {
        setIsDetailOpen(false);
        deleteRrssIncident(selectedIncident.id);
    };

    const exportToCSV = () => {
        if (rrssIncidents.length === 0) {
            showToast('No hay datos para exportar', true);
            return;
        }
        
        // Si es Admin incluye la columna Autor, si es Lector no.
        const headers = isAdmin 
            ? ['Fecha,Usuario RRSS,Medio,Campus,Riesgo,Area Responsable,Total,Descripcion,Comentarios,Autor']
            : ['Fecha,Usuario RRSS,Medio,Campus,Riesgo,Area Responsable,Total,Descripcion,Comentarios'];
            
        const rows = rrssIncidents.map((i: any) => {
            const baseData = `"${i.fecha}","${i.usuario}","${i.medio}","${i.campus}","${i.riesgo}","${i.area}","${i.totalIncidencias}","${i.descripcion.replace(/"/g, '""')}","${i.comentarios.replace(/"/g, '""')}"`;
            return isAdmin ? `${baseData},"${i.autor || 'Administrador'}"` : baseData;
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Historial_RRSS_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const getRiskColor = (risk: string) => {
        switch(risk) {
            case 'Bajo': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'Medio': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Alto': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            case 'Critico': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <>
            <div className="space-y-6 fade-in">
                <div className={(isDetailOpen || isEditOpen) ? 'print:hidden' : ''}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold theme-text-main">Historial RRSS</h2>
                            <p className="theme-text-muted text-sm mt-1">Registro histórico de incidencias en redes sociales.</p>
                        </div>
                        <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:brightness-110 transition-all text-sm font-bold shadow-sm">
                            <Download className="w-4 h-4"/> Exportar CSV
                        </button>
                    </div>

                    {rrssIncidents.length === 0 ? (
                        <div className="text-center py-12 theme-bg-container rounded-2xl border theme-border">
                            <Smartphone className="w-12 h-12 theme-text-muted mx-auto mb-4 opacity-50" />
                            <p className="theme-text-muted">No hay registros de RRSS aún.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {rrssIncidents.map((inc: any) => (
                                /* CAMBIO: Agregamos el hover azul a la tarjeta (hover:border-[var(--primary)]) */
                                <div key={inc.id} onClick={() => openDetail(inc)} className="p-5 theme-bg-container rounded-xl border theme-border shadow-sm hover:border-[var(--primary)] transition-colors cursor-pointer group">
                                    <div className="flex items-start gap-3 mb-3">
                                        {/* CAMBIO: Mismo comportamiento que hackeos (fondo gris -> azul en hover, icono gris -> blanco en hover) */}
                                        <div className="w-10 h-10 rounded-lg theme-bg-low flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--primary)] transition-colors">
                                            <Smartphone className="w-5 h-5 theme-text-muted group-hover:text-white transition-colors" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold theme-text-main truncate text-base">{inc.medio}</h3>
                                            <p className="text-xs font-semibold theme-text-muted mt-0.5 truncate flex items-center gap-1">
                                                {inc.fecha} 
                                                {isAdmin && (
                                                    <><span className="mx-1">|</span> Por: <span className="text-[var(--primary)] truncate">{inc.autor || 'Administrador'}</span></>
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="text-sm theme-text-main line-clamp-2 min-h-[40px] opacity-90">
                                        <span className="font-bold mr-1">{inc.usuario}:</span> 
                                        {inc.descripcion}
                                    </div>
                                    
                                    <div className="mt-4 flex items-center gap-2 pt-3 border-t theme-border">
                                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md uppercase tracking-wider ${getRiskColor(inc.riesgo)}`}>
                                            {inc.riesgo}
                                        </span>
                                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                            Incidencias: {inc.totalIncidencias}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Detalle */}
            {isDetailOpen && selectedIncident && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 fade-in print:static print:block print:p-0 print:bg-transparent">
                    <div className="theme-bg-container rounded-2xl w-full max-w-2xl shadow-2xl border theme-border overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-full">
                        
                        <div className="p-5 border-b theme-border flex justify-between items-center bg-[var(--primary)]/5 no-print">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[var(--primary)]/20 rounded-lg"><Smartphone className="w-5 h-5 text-[var(--primary)]" /></div>
                                <div>
                                    <h3 className="font-bold theme-text-main text-lg">{selectedIncident.medio}</h3>
                                    <p className="text-xs theme-text-muted font-medium">{selectedIncident.fecha}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => window.print()} className="p-2 theme-text-muted hover:theme-text-main hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors" title="Imprimir"><Printer className="w-5 h-5"/></button>
                                {isAdmin && (
                                    <>
                                        <button onClick={openEdit} className="p-2 text-[var(--primary)] hover:bg-[var(--primary)]/10 rounded-lg transition-colors" title="Editar"><Edit3 className="w-5 h-5"/></button>
                                        <button onClick={handleDelete} className="p-2 text-[var(--error)] hover:bg-[var(--error)]/10 rounded-lg transition-colors" title="Eliminar"><Trash2 className="w-5 h-5"/></button>
                                    </>
                                )}
                                <button onClick={() => setIsDetailOpen(false)} className="p-2 theme-text-muted hover:theme-text-main bg-black/5 dark:bg-white/5 rounded-lg"><X className="w-5 h-5"/></button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar print:overflow-visible flex-1">
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8 print:mt-4">
                                <div><p className="text-xs theme-text-muted font-medium mb-1">Total de Incidencias</p><p className="font-bold theme-text-main text-lg">{selectedIncident.totalIncidencias}</p></div>
                                <div><p className="text-xs theme-text-muted font-medium mb-1">Campus</p><p className="font-bold theme-text-main">{selectedIncident.campus}</p></div>
                                <div><p className="text-xs theme-text-muted font-medium mb-1">Área</p><p className="font-bold theme-text-main">{selectedIncident.area}</p></div>
                                <div><p className="text-xs theme-text-muted font-medium mb-1">Nivel de Riesgo</p><span className={`inline-block px-3 py-1 rounded-md text-xs font-bold ${getRiskColor(selectedIncident.riesgo)}`}>{selectedIncident.riesgo}</span></div>
                                <div className="col-span-2"><p className="text-xs theme-text-muted font-medium mb-1">Usuario RRSS</p><p className="font-bold theme-text-main bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-lg inline-block">{selectedIncident.usuario}</p></div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs theme-text-muted font-medium mb-2 uppercase tracking-wider">Descripción de la incidencia</p>
                                    <div className="p-4 theme-bg-low rounded-xl border theme-border theme-text-main whitespace-pre-wrap text-sm leading-relaxed">{selectedIncident.descripcion}</div>
                                </div>
                                {selectedIncident.comentarios && (
                                    <div>
                                        <p className="text-xs theme-text-muted font-medium mb-2 uppercase tracking-wider">Comentarios adicionales</p>
                                        <div className="p-4 theme-bg-low rounded-xl border theme-border theme-text-main whitespace-pre-wrap text-sm">{selectedIncident.comentarios}</div>
                                    </div>
                                )}
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {selectedIncident.enlacePublicacion && (
                                        <a href={selectedIncident.enlacePublicacion} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 theme-bg-low border theme-border rounded-xl hover:border-[var(--primary)] transition-colors group no-print">
                                            <div className="p-2 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg group-hover:scale-110 transition-transform"><LinkIcon className="w-4 h-4"/></div>
                                            <div className="overflow-hidden"><p className="text-xs font-bold theme-text-main">Ver Publicación</p><p className="text-[10px] theme-text-muted truncate">{selectedIncident.enlacePublicacion}</p></div>
                                        </a>
                                    )}
                                    {selectedIncident.enlaceDrive && (
                                        <a href={selectedIncident.enlaceDrive} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 theme-bg-low border theme-border rounded-xl hover:border-[var(--primary)] transition-colors group no-print">
                                            <div className="p-2 bg-green-500/10 text-green-600 rounded-lg group-hover:scale-110 transition-transform"><HardDrive className="w-4 h-4"/></div>
                                            <div className="overflow-hidden"><p className="text-xs font-bold theme-text-main">Evidencia (Drive)</p><p className="text-[10px] theme-text-muted truncate">{selectedIncident.enlaceDrive}</p></div>
                                        </a>
                                    )}
                                </div>
                            </div>

                            <div className="mt-8 pt-4 border-t theme-border flex justify-between items-center">
                                {isAdmin ? (
                                    <p className="text-sm font-bold theme-text-muted italic flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[var(--primary)]"></span>
                                        Reportado por: <span className="theme-text-main">{selectedIncident.autor || 'Administrador'}</span>
                                    </p>
                                ) : (
                                    <p className="text-sm font-bold theme-text-muted italic flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                        Registro de sistema (Acceso público)
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Edición */}
            {isEditOpen && selectedIncident && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 fade-in">
                    <div className="theme-bg-container rounded-2xl w-full max-w-2xl shadow-2xl border theme-border flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b theme-border flex justify-between items-center">
                            <h3 className="font-bold theme-text-main flex items-center gap-2"><Edit3 className="w-5 h-5 text-[var(--primary)]" /> Editar Incidente RRSS</h3>
                            <button onClick={() => setIsEditOpen(false)} className="p-2 theme-text-muted hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            <form id="editRrssForm" onSubmit={(e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                updateRrssIncident(selectedIncident.id, {
                                    totalIncidencias: parseInt(fd.get('total') as string),
                                    fecha: fd.get('fecha'), usuario: fd.get('usuario'),
                                    medio: fd.get('medio'), campus: fd.get('campus'),
                                    riesgo: fd.get('riesgo'), area: fd.get('area'),
                                    descripcion: fd.get('descripcion'), comentarios: fd.get('comentarios'),
                                    enlacePublicacion: fd.get('enlacePub'), enlaceDrive: fd.get('enlaceDrive')
                                });
                                setIsEditOpen(false);
                            }} className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-xs font-bold theme-text-muted">Total</label><input name="total" type="number" min="1" required defaultValue={selectedIncident.totalIncidencias} className={inputStyles} /></div>
                                    <div><label className="text-xs font-bold theme-text-muted">Fecha</label><input name="fecha" type="date" required defaultValue={selectedIncident.fecha} className={`${inputStyles} [color-scheme:light] dark:[color-scheme:dark]`} /></div>
                                    <div><label className="text-xs font-bold theme-text-muted">Usuario</label><input name="usuario" type="text" required defaultValue={selectedIncident.usuario} className={inputStyles} /></div>
                                    <div><label className="text-xs font-bold theme-text-muted">Medio</label>
                                        <select name="medio" defaultValue={selectedIncident.medio} className={inputStyles}>
                                            <option>Facebook Comentario</option><option>TikTok</option><option>FB Grupos</option><option>LinkedIn</option><option>Facebook DM</option><option>Instagram DM</option>
                                        </select>
                                    </div>
                                    <div><label className="text-xs font-bold theme-text-muted">Campus</label>
                                        <select name="campus" defaultValue={selectedIncident.campus} className={inputStyles}>
                                            {['Atizapán', 'Coacalco', 'Cuautitlán Izcalli', 'Ecatepec', 'Tecamac', 'Tultepec', 'Zumpango', 'Tizayuca', 'Querétaro: la Joya', 'Querétaro: el Marqués', 'Huehuetoca', 'Chalco'].map(c => <option key={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div><label className="text-xs font-bold theme-text-muted">Riesgo</label>
                                        <select name="riesgo" defaultValue={selectedIncident.riesgo} className={inputStyles}>
                                            <option value="Bajo">Bajo</option><option value="Medio">Medio</option><option value="Alto">Alto</option><option value="Critico">Crítico</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2"><label className="text-xs font-bold theme-text-muted">Área</label>
                                        <select name="area" defaultValue={selectedIncident.area} className={inputStyles}>
                                            <option>Operaciones</option><option>Area 2</option><option>Area 3</option>
                                        </select>
                                    </div>
                                </div>
                                <div><label className="text-xs font-bold theme-text-muted">Descripción</label><textarea name="descripcion" rows={3} required defaultValue={selectedIncident.descripcion} className={inputStyles}></textarea></div>
                                <div><label className="text-xs font-bold theme-text-muted">Comentarios</label><textarea name="comentarios" rows={2} defaultValue={selectedIncident.comentarios} className={inputStyles}></textarea></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="text-xs font-bold theme-text-muted">Enlace Publicación</label><input name="enlacePub" type="url" defaultValue={selectedIncident.enlacePublicacion} className={inputStyles} /></div>
                                    <div><label className="text-xs font-bold theme-text-muted">Enlace Drive</label><input name="enlaceDrive" type="url" defaultValue={selectedIncident.enlaceDrive} className={inputStyles} /></div>
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t theme-border flex justify-end gap-3 bg-black/5 dark:bg-white/5">
                            <button onClick={() => setIsEditOpen(false)} className="px-5 py-2 rounded-xl font-bold theme-text-main hover:bg-black/10 dark:hover:bg-white/10 transition-colors">Cancelar</button>
                            <button type="submit" form="editRrssForm" className="px-5 py-2 rounded-xl font-bold bg-[var(--primary)] text-white hover:brightness-110 flex items-center gap-2"><Save className="w-4 h-4"/> Actualizar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};