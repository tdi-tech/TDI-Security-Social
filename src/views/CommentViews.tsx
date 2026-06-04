import React, { useState } from 'react';
import { Save, Download, Trash2, MessageSquare, Printer, X, Edit3, Link as LinkIcon, Calendar, PlusCircle, Share2, MapPin } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db, appId } from '../firebase/config';

// ==========================================
// ESTILOS COMPARTIDOS
// ==========================================
const inputStyles = "w-full p-2.5 rounded-xl theme-bg-low border theme-border theme-text-main focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-all";
const radioLabelStyles = "flex items-center gap-2 text-sm font-medium theme-text-main cursor-pointer";

// ==========================================
// VISTA 1: CREAR REPORTE DE COMENTARIO
// ==========================================
export const NewCommentView = ({ isAdmin, showToast, navigate, user }: any) => {
    const [formData, setFormData] = useState<any>({
        fechaInicio: '',
        fechaFin: '',
        contenido: 'Orgánico',
        evidencia: '',
        comentariosList: [{ 
            usuario: '', 
            comentario: '',
            redSocial: 'Facebook',
            campus: 'Sin especificar',
            posteoTipo: 'url',
            posteoUrl: '',
            posteoTexto: ''
        }]
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const addComentario = () => {
        const last = formData.comentariosList[formData.comentariosList.length - 1];
        setFormData({ 
            ...formData, 
            comentariosList: [
                ...formData.comentariosList, 
                { 
                    usuario: '', 
                    comentario: '',
                    redSocial: last.redSocial, 
                    campus: last.campus,       
                    posteoTipo: last.posteoTipo, 
                    posteoUrl: last.posteoUrl,   
                    posteoTexto: last.posteoTexto 
                }
            ] 
        });
    };

    const updateComentario = (index: number, field: string, value: string) => {
        const newList = [...formData.comentariosList];
        newList[index][field] = value;
        setFormData({ ...formData, comentariosList: newList });
    };

    const removeComentario = (index: number) => {
        const newList = formData.comentariosList.filter((_: any, i: number) => i !== index);
        setFormData({ ...formData, comentariosList: newList });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAdmin) {
            showToast('Permisos insuficientes.', true);
            return;
        }
        setIsSubmitting(true);
        try {
            const commentsRef = collection(db, 'artifacts', appId, 'public', 'data', 'comments');
            await addDoc(commentsRef, {
                ...formData,
                autor: user?.displayName || 'Administrador',
                timestamp: new Date().toISOString()
            });
            showToast('Reporte de comentarios guardado exitosamente.');
            navigate('historial-comentario');
        } catch (error) {
            showToast('Error al guardar el reporte.', true);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 fade-in pb-10">
            <div className="theme-bg-container p-6 rounded-2xl border theme-border shadow-sm">
                <div className="border-b theme-border pb-4 mb-6">
                    <h2 className="text-xl font-bold theme-text-main flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-[var(--primary)]" />
                        Crear Reporte de Comentarios
                    </h2>
                    <p className="text-sm theme-text-muted mt-1 ml-8">Registra comentarios independientes o grupales durante un periodo.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* 1. DATOS GLOBALES DEL REPORTE */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 theme-bg-lowest border theme-border rounded-xl">
                        <div className="space-y-3 md:col-span-1">
                            <label className="text-sm font-bold theme-text-main flex items-center gap-2"><Calendar className="w-4 h-4"/> Periodo del reporte</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium theme-text-muted">Inicio</label>
                                    <input type="date" required value={formData.fechaInicio} onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})} className={`${inputStyles} [color-scheme:light] dark:[color-scheme:dark]`} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium theme-text-muted">Fin</label>
                                    <input type="date" required value={formData.fechaFin} onChange={(e) => setFormData({...formData, fechaFin: e.target.value})} className={`${inputStyles} [color-scheme:light] dark:[color-scheme:dark]`} />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 md:col-span-1 flex flex-col justify-center pl-0 md:pl-4 border-t md:border-t-0 md:border-l theme-border pt-4 md:pt-0 mt-2 md:mt-0">
                            <label className="text-sm font-bold theme-text-main">Tipo de Contenido General</label>
                            <div className="flex items-center gap-6 mt-1">
                                <label className={radioLabelStyles}>
                                    <input type="radio" name="contenido" value="Orgánico" checked={formData.contenido === 'Orgánico'} onChange={(e) => setFormData({...formData, contenido: e.target.value})} className="w-4 h-4 text-[var(--primary)] bg-gray-100 border-gray-300 focus:ring-[var(--primary)] dark:focus:ring-[var(--primary)] dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                                    Orgánico
                                </label>
                                <label className={radioLabelStyles}>
                                    <input type="radio" name="contenido" value="Pautado" checked={formData.contenido === 'Pautado'} onChange={(e) => setFormData({...formData, contenido: e.target.value})} className="w-4 h-4 text-[var(--primary)] bg-gray-100 border-gray-300 focus:ring-[var(--primary)] dark:focus:ring-[var(--primary)] dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600" />
                                    Pautado
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* 2. SECCIÓN DINÁMICA DE COMENTARIOS */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b theme-border pb-2">
                            <h3 className="text-lg font-bold theme-text-main">Registro de Comentarios</h3>
                            <button type="button" onClick={addComentario} className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)] hover:brightness-125 transition-colors bg-[var(--primary)]/10 px-3 py-1.5 rounded-lg shadow-sm">
                                <PlusCircle className="w-4 h-4"/> Agregar otro
                            </button>
                        </div>

                        {formData.comentariosList.map((c: any, idx: number) => (
                            <div key={idx} className="p-5 theme-bg-low border theme-border rounded-xl relative fade-in space-y-4 shadow-sm group">
                                {formData.comentariosList.length > 1 && (
                                    <button type="button" onClick={() => removeComentario(idx)} className="absolute -top-3 -right-3 p-1.5 bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-colors shadow-sm opacity-0 group-hover:opacity-100" title="Eliminar este comentario">
                                        <Trash2 className="w-4 h-4"/>
                                    </button>
                                )}
                                
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-6 h-6 rounded-full bg-[var(--primary)]/20 text-[var(--primary)] flex items-center justify-center font-bold text-xs">{idx + 1}</div>
                                    <h4 className="font-bold text-sm theme-text-main">Detalle del Usuario</h4>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium theme-text-muted">Red Social</label>
                                        <select value={c.redSocial} onChange={(e) => updateComentario(idx, 'redSocial', e.target.value)} className={inputStyles}>
                                            <option>Facebook</option><option>Tiktok</option><option>Instagram</option><option>Grupos FB</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium theme-text-muted">Campus</label>
                                        <select value={c.campus} onChange={(e) => updateComentario(idx, 'campus', e.target.value)} className={inputStyles}>
                                            {['Sin especificar', 'Atizapán', 'Coacalco', 'Cuautitlán Izcalli', 'Ecatepec', 'Tecamac', 'Tultepec', 'Zumpango', 'Tizayuca', 'Querétaro: la Joya', 'Querétaro: el Marqués', 'Huehuetoca', 'Chalco'].map(camp => <option key={camp}>{camp}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium theme-text-muted">Nombre de Usuario</label>
                                        <input type="text" required placeholder="@usuario o Nombre" value={c.usuario} onChange={(e) => updateComentario(idx, 'usuario', e.target.value)} className={inputStyles} />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-medium theme-text-muted">Comentario del usuario</label>
                                    <textarea required rows={2} placeholder="Escribe el comentario exacto o el contexto..." value={c.comentario} onChange={(e) => updateComentario(idx, 'comentario', e.target.value)} className={`${inputStyles} resize-none`}></textarea>
                                </div>

                                <div className="pt-3 border-t theme-border border-dashed">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-3">
                                        <label className="text-xs font-bold theme-text-main">Formato del Post Original:</label>
                                        <div className="flex items-center gap-6">
                                            <label className={radioLabelStyles}>
                                                <input type="radio" value="url" checked={c.posteoTipo === 'url'} onChange={() => { updateComentario(idx, 'posteoTipo', 'url'); updateComentario(idx, 'posteoTexto', ''); }} className="w-4 h-4 text-[var(--primary)]" /> Colocar URL
                                            </label>
                                            <label className={radioLabelStyles}>
                                                <input type="radio" value="texto" checked={c.posteoTipo === 'texto'} onChange={() => { updateComentario(idx, 'posteoTipo', 'texto'); updateComentario(idx, 'posteoUrl', ''); }} className="w-4 h-4 text-[var(--primary)]" /> Escribir texto
                                            </label>
                                        </div>
                                    </div>
                                    {c.posteoTipo === 'url' ? (
                                        <input type="url" placeholder="https://..." value={c.posteoUrl} onChange={(e) => updateComentario(idx, 'posteoUrl', e.target.value)} required className={inputStyles} />
                                    ) : (
                                        <input type="text" placeholder="Escribe de qué trataba el post original..." value={c.posteoTexto} onChange={(e) => updateComentario(idx, 'posteoTexto', e.target.value)} required className={inputStyles} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 3. EVIDENCIA GLOBAL */}
                    <div className="space-y-1 pt-4 border-t theme-border">
                        <label className="text-sm font-medium theme-text-main flex items-center gap-2">URL de Evidencias <span className="text-[10px] font-normal theme-text-muted">(Carpeta Drive, Slides general, etc.)</span></label>
                        <input type="url" placeholder="https://docs.google.com/presentation/d/..." value={formData.evidencia} onChange={(e) => setFormData({...formData, evidencia: e.target.value})} className={inputStyles} />
                    </div>

                    <div className="pt-4 flex items-center justify-end gap-3 border-t theme-border">
                        <button type="button" onClick={() => navigate('dashboard')} className="px-5 py-2.5 rounded-xl font-medium theme-text-main hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            Cancelar
                        </button>
                        <button type="submit" disabled={isSubmitting} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold bg-[var(--primary)] text-white hover:brightness-110 transition-all disabled:opacity-50">
                            {isSubmitting ? 'Guardando...' : <><Save className="w-5 h-5"/> Guardar Reporte</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// ==========================================
// VISTA 2: HISTORIAL DE COMENTARIOS
// ==========================================
export const HistorialCommentView = ({ comments, showToast, isAdmin, updateComment, deleteComment }: any) => {
    const [selectedComment, setSelectedComment] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editData, setEditData] = useState<any>(null);

    const getNormalizedComments = (com: any) => {
        if (com.comentariosList && com.comentariosList.length > 0) {
            return com.comentariosList.map((c: any) => ({
                usuario: c.usuario || 'N/A',
                comentario: c.comentario || 'Sin comentario',
                redSocial: c.redSocial || com.redSocial || 'Facebook',
                campus: c.campus || com.campus || 'Sin especificar',
                posteoTipo: c.posteoTipo || com.posteoTipo || 'url',
                posteoUrl: c.posteoUrl || com.posteoUrl || '',
                posteoTexto: c.posteoTexto || com.posteoTexto || ''
            }));
        }
        return [{ 
            usuario: com.usuario || 'N/A', 
            comentario: com.descripcion || 'Sin comentario',
            redSocial: com.redSocial || 'Facebook',
            campus: com.campus || 'Sin especificar',
            posteoTipo: com.posteoTipo || 'url',
            posteoUrl: com.posteoUrl || '',
            posteoTexto: com.posteoTexto || ''
        }];
    };

    const openDetail = (com: any) => {
        setSelectedComment(com);
        setIsDetailOpen(true);
    };

    const openEdit = () => {
        setEditData({ 
            ...selectedComment, 
            comentariosList: getNormalizedComments(selectedComment) 
        });
        setIsDetailOpen(false);
        setIsEditOpen(true);
    };

    const handleDelete = () => {
        setIsDetailOpen(false);
        deleteComment(selectedComment.id);
    };

    const handleEditUpdate = (e: React.FormEvent) => {
        e.preventDefault();
        updateComment(editData.id, editData);
        setIsEditOpen(false);
    };

    const exportToCSV = () => {
        if (comments.length === 0) {
            showToast('No hay datos para exportar', true);
            return;
        }
        
        const headers = isAdmin 
            ? ['Fecha Inicio,Fecha Fin,Contenido Global,Evidencias,Comentarios Individuales (Red - Campus - Usuario - Posteo - Comentario),Autor']
            : ['Fecha Inicio,Fecha Fin,Contenido Global,Evidencias,Comentarios Individuales (Red - Campus - Usuario - Posteo - Comentario)'];
            
        const rows = comments.map((i: any) => {
            const list = getNormalizedComments(i);
            const comentariosString = list.map((c: any) => {
                const postInfo = c.posteoTipo === 'url' ? c.posteoUrl : c.posteoTexto;
                return `[${c.redSocial} | ${c.campus}] ${c.usuario}: ${c.comentario} (Post: ${postInfo})`;
            }).join('\n').replace(/"/g, '""');

            const baseData = `"${i.fechaInicio}","${i.fechaFin}","${i.contenido}","${i.evidencia || ''}","${comentariosString}"`;
            return isAdmin ? `${baseData},"${i.autor || 'Administrador'}"` : baseData;
        });

        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Historial_Comentarios_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <>
            <div className="space-y-6 fade-in pb-10">
                <div className={(isDetailOpen || isEditOpen) ? 'print:hidden' : ''}>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div>
                            <h2 className="text-2xl font-bold theme-text-main">Historial de Comentarios</h2>
                            <p className="theme-text-muted text-sm mt-1">Registro y seguimiento de interacciones por periodo.</p>
                        </div>
                        <button onClick={exportToCSV} className="flex items-center gap-2 px-4 py-2 bg-[var(--primary)] text-white rounded-lg hover:brightness-110 transition-all text-sm font-bold shadow-sm">
                            <Download className="w-4 h-4"/> Exportar CSV
                        </button>
                    </div>

                    {comments.length === 0 ? (
                        <div className="text-center py-12 theme-bg-container rounded-2xl border theme-border">
                            <MessageSquare className="w-12 h-12 theme-text-muted mx-auto mb-4 opacity-50" />
                            <p className="theme-text-muted">No hay reportes de comentarios aún.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {comments.map((com: any) => {
                                const list = getNormalizedComments(com);
                                const firstComment = list[0];
                                const hasMore = list.length > 1;

                                const uniqueNetworks = Array.from(new Set(list.map((c: any) => c.redSocial)));

                                return (
                                    <div key={com.id} onClick={() => openDetail(com)} className="p-5 theme-bg-container rounded-xl border theme-border shadow-sm hover:border-[var(--primary)] transition-colors cursor-pointer group flex flex-col h-full">
                                        <div className="flex items-start gap-3 mb-3">
                                            {/* CAMBIADO: Ícono de MessageSquare en la tarjeta */}
                                            <div className="w-10 h-10 rounded-lg theme-bg-low flex items-center justify-center flex-shrink-0 group-hover:bg-[var(--primary)] transition-colors">
                                                <MessageSquare className="w-5 h-5 theme-text-muted group-hover:text-white transition-colors" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold theme-text-main truncate text-sm">Reporte del {com.fechaInicio}</h3>
                                                <p className="text-[10px] font-semibold theme-text-muted mt-0.5 truncate flex items-center gap-1">
                                                    al {com.fechaFin}
                                                    {isAdmin && (
                                                        <><span className="mx-1">|</span> Por: <span className="text-[var(--primary)] truncate">{com.autor || 'Administrador'}</span></>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <div className="text-sm theme-text-main line-clamp-2 min-h-[40px] opacity-90 mb-1">
                                            <span className="font-bold mr-1">{firstComment.usuario}:</span> 
                                            {firstComment.comentario}
                                        </div>
                                        {hasMore && (
                                            <p className="text-[10px] font-bold text-[var(--primary)] mb-2">+ {list.length - 1} comentario(s) más</p>
                                        )}
                                        
                                        <div className="mt-auto pt-3 border-t theme-border flex flex-wrap gap-2">
                                            <span className="px-2 py-1 text-[10px] font-bold rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                                {com.contenido}
                                            </span>
                                            {uniqueNetworks.map((net: any) => (
                                                <span key={net} className="px-2 py-1 text-[10px] font-bold rounded-md bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
                                                    {net}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal de Detalle */}
            {isDetailOpen && selectedComment && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 fade-in print:static print:block print:p-0 print:bg-transparent">
                    <div className="theme-bg-container rounded-2xl w-full max-w-2xl shadow-2xl border theme-border overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:w-full print:max-w-full">
                        
                        <div className="p-5 border-b theme-border flex justify-between items-center bg-[var(--primary)]/5 no-print">
                            <div className="flex items-center gap-3">
                                {/* CAMBIADO: Ícono de MessageSquare en el modal */}
                                <div className="p-2 bg-[var(--primary)]/20 rounded-lg"><MessageSquare className="w-5 h-5 text-[var(--primary)]" /></div>
                                <div>
                                    <h3 className="font-bold theme-text-main text-lg">Reporte de Comentarios</h3>
                                    <p className="text-xs theme-text-muted font-medium">Periodo: {selectedComment.fechaInicio} al {selectedComment.fechaFin}</p>
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
                            
                            <div className="mb-6 flex items-center gap-2">
                                <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg text-xs font-bold uppercase tracking-wider">{selectedComment.contenido}</span>
                                {selectedComment.evidencia && (
                                    <a href={selectedComment.evidencia} target="_blank" rel="noreferrer" className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:brightness-110 no-print">
                                        <LinkIcon className="w-3 h-3"/> Evidencias
                                    </a>
                                )}
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm font-bold theme-text-muted uppercase tracking-wider flex items-center gap-2 border-b theme-border pb-2">
                                    Desglose de Comentarios <span className="px-2 py-0.5 bg-[var(--primary)] text-white rounded-full text-xs">{getNormalizedComments(selectedComment).length}</span>
                                </p>
                                
                                {getNormalizedComments(selectedComment).map((c: any, idx: number) => (
                                    <div key={idx} className="p-4 theme-bg-low rounded-xl border theme-border space-y-3 print:border-gray-300">
                                        
                                        <div className="flex flex-wrap items-center gap-3 border-b theme-border pb-2 border-dashed">
                                            <span className="font-bold text-sm text-[var(--primary)] break-all">{c.usuario}</span>
                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                                                <span className="flex items-center gap-1"><Share2 className="w-3 h-3"/> {c.redSocial}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {c.campus}</span>
                                            </div>
                                        </div>
                                        
                                        <p className="text-sm theme-text-main whitespace-pre-wrap">{c.comentario}</p>
                                        
                                        <div className="pt-2">
                                            <p className="text-[10px] theme-text-muted font-bold uppercase tracking-wider mb-1">Publicación Original</p>
                                            {c.posteoTipo === 'url' ? (
                                                <a href={c.posteoUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline break-all inline-flex items-start gap-1"><LinkIcon className="w-3 h-3 flex-shrink-0 mt-0.5" /> {c.posteoUrl}</a>
                                            ) : (
                                                <p className="text-xs theme-text-main italic">"{c.posteoTexto}"</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-4 border-t theme-border flex justify-between items-center">
                                {isAdmin ? (
                                    <p className="text-sm font-bold theme-text-muted italic flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-[var(--primary)]"></span>
                                        Reportado por: <span className="theme-text-main">{selectedComment.autor || 'Administrador'}</span>
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
            {isEditOpen && editData && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 fade-in">
                    <div className="theme-bg-container rounded-2xl w-full max-w-3xl shadow-2xl border theme-border flex flex-col max-h-[90vh]">
                        <div className="p-5 border-b theme-border flex justify-between items-center bg-[var(--primary)]/5">
                            <h3 className="font-bold theme-text-main flex items-center gap-2"><Edit3 className="w-5 h-5 text-[var(--primary)]" /> Editar Reporte de Comentarios</h3>
                            <button onClick={() => setIsEditOpen(false)} className="p-2 theme-text-muted hover:bg-black/5 dark:hover:bg-white/5 rounded-lg"><X className="w-5 h-5"/></button>
                        </div>
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                            
                            <form id="editCommentForm" onSubmit={handleEditUpdate} className="space-y-6">
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 theme-bg-lowest border theme-border rounded-xl">
                                    <div><label className="text-xs font-bold theme-text-muted">Fecha Inicio</label><input type="date" required value={editData.fechaInicio} onChange={e => setEditData({...editData, fechaInicio: e.target.value})} className={`${inputStyles} [color-scheme:light] dark:[color-scheme:dark]`} /></div>
                                    <div><label className="text-xs font-bold theme-text-muted">Fecha Fin</label><input type="date" required value={editData.fechaFin} onChange={e => setEditData({...editData, fechaFin: e.target.value})} className={`${inputStyles} [color-scheme:light] dark:[color-scheme:dark]`} /></div>
                                    <div><label className="text-xs font-bold theme-text-muted">Contenido Global</label>
                                        <select value={editData.contenido} onChange={e => setEditData({...editData, contenido: e.target.value})} className={inputStyles}>
                                            <option value="Orgánico">Orgánico</option><option value="Pautado">Pautado</option>
                                        </select>
                                    </div>
                                    <div><label className="text-xs font-bold theme-text-muted">Evidencia (Drive/Slides)</label><input type="url" value={editData.evidencia} onChange={e => setEditData({...editData, evidencia: e.target.value})} className={inputStyles} /></div>
                                </div>

                                {/* LISTA DINÁMICA DE COMENTARIOS EN EDICIÓN */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b theme-border pb-2">
                                        <label className="text-sm font-bold theme-text-main">Comentarios Registrados</label>
                                        <button type="button" onClick={() => {
                                            const last = editData.comentariosList[editData.comentariosList.length - 1] || {};
                                            setEditData({...editData, comentariosList: [...editData.comentariosList, {
                                                usuario:'', comentario:'', redSocial: last.redSocial || 'Facebook', campus: last.campus || 'Sin especificar', posteoTipo: last.posteoTipo || 'url', posteoUrl: last.posteoUrl || '', posteoTexto: last.posteoTexto || ''
                                            }]});
                                        }} className="text-xs flex items-center gap-1 font-bold text-[var(--primary)] hover:underline">
                                            <PlusCircle className="w-3 h-3"/> Agregar otro
                                        </button>
                                    </div>
                                    
                                    {editData.comentariosList.map((c: any, idx: number) => (
                                        <div key={idx} className="flex flex-col gap-3 p-4 theme-bg-low border theme-border rounded-xl relative group">
                                            {editData.comentariosList.length > 1 && (
                                                <button type="button" onClick={() => {
                                                    const newList = editData.comentariosList.filter((_:any, i:number) => i !== idx);
                                                    setEditData({...editData, comentariosList: newList});
                                                }} className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-600 rounded-full hover:bg-red-500 hover:text-white transition-colors shadow-sm opacity-0 group-hover:opacity-100">
                                                    <Trash2 className="w-3 h-3"/>
                                                </button>
                                            )}
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                <div>
                                                    <label className="text-xs font-medium theme-text-muted">Red Social</label>
                                                    <select value={c.redSocial} onChange={(e) => { const n = [...editData.comentariosList]; n[idx].redSocial = e.target.value; setEditData({...editData, comentariosList: n}); }} className={inputStyles}>
                                                        <option>Facebook</option><option>Tiktok</option><option>Instagram</option><option>Grupos FB</option>
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium theme-text-muted">Campus</label>
                                                    <select value={c.campus} onChange={(e) => { const n = [...editData.comentariosList]; n[idx].campus = e.target.value; setEditData({...editData, comentariosList: n}); }} className={inputStyles}>
                                                        {['Sin especificar', 'Atizapán', 'Coacalco', 'Cuautitlán Izcalli', 'Ecatepec', 'Tecamac', 'Tultepec', 'Zumpango', 'Tizayuca', 'Querétaro: la Joya', 'Querétaro: el Marqués', 'Huehuetoca', 'Chalco'].map(camp => <option key={camp}>{camp}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="text-xs font-medium theme-text-muted">Usuario</label>
                                                    <input type="text" required value={c.usuario} onChange={(e) => { const n = [...editData.comentariosList]; n[idx].usuario = e.target.value; setEditData({...editData, comentariosList: n}); }} className={inputStyles} />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-medium theme-text-muted">Comentario</label>
                                                <textarea required rows={2} value={c.comentario} onChange={(e) => { const n = [...editData.comentariosList]; n[idx].comentario = e.target.value; setEditData({...editData, comentariosList: n}); }} className={`${inputStyles} resize-none`}></textarea>
                                            </div>

                                            <div className="pt-2">
                                                <div className="flex items-center gap-4 mb-2">
                                                    <label className="text-xs font-bold theme-text-muted">Formato Post Original:</label>
                                                    <select value={c.posteoTipo} onChange={(e) => { const n = [...editData.comentariosList]; n[idx].posteoTipo = e.target.value; n[idx].posteoUrl = ''; n[idx].posteoTexto = ''; setEditData({...editData, comentariosList: n}); }} className={`${inputStyles} py-1 px-2 w-auto text-xs`}>
                                                        <option value="url">URL</option><option value="texto">Texto</option>
                                                    </select>
                                                </div>
                                                {c.posteoTipo === 'url' ? (
                                                    <input type="url" placeholder="URL del post..." value={c.posteoUrl} onChange={(e) => { const n = [...editData.comentariosList]; n[idx].posteoUrl = e.target.value; setEditData({...editData, comentariosList: n}); }} className={inputStyles} />
                                                ) : (
                                                    <input type="text" placeholder="Texto del post..." value={c.posteoTexto} onChange={(e) => { const n = [...editData.comentariosList]; n[idx].posteoTexto = e.target.value; setEditData({...editData, comentariosList: n}); }} className={inputStyles} />
                                                )}
                                            </div>

                                        </div>
                                    ))}
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t theme-border flex justify-end gap-3 bg-black/5 dark:bg-white/5">
                            <button onClick={() => setIsEditOpen(false)} className="px-5 py-2 rounded-xl font-bold theme-text-main hover:bg-black/10 dark:hover:bg-white/10 transition-colors">Cancelar</button>
                            <button type="submit" form="editCommentForm" className="px-5 py-2 rounded-xl font-bold bg-[var(--primary)] text-white hover:brightness-110 flex items-center gap-2"><Save className="w-4 h-4"/> Actualizar</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};