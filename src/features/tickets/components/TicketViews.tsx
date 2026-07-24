import React, { useState, useRef, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { 
    Save, Download, Trash2, Ticket, Printer, X, Edit3, Link as LinkIcon, 
    Search, ChevronDown, ChevronRight, ChevronLeft, FileText, Loader2, 
    Calendar, AlertTriangle, CheckCircle2, Clock, Send, Lock, ExternalLink,
    Eye, EyeOff, Users, Check
} from 'lucide-react';
import { collection, addDoc, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db, appId, auth } from '../../../services/firebase/config';
import DOMPurify from 'dompurify';

const inputStyles = "w-full p-3 rounded-xl theme-bg-low border theme-border theme-text-main focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-sm";
const gridInputExactClass = "w-full h-12 px-3.5 rounded-xl theme-bg-low border theme-border theme-text-main focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition-all text-xs font-semibold box-border flex items-center";
const editorStyles = `.wysiwyg-content ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin: 0.5rem 0; } .wysiwyg-content ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin: 0.5rem 0; }`;

const PLATAFORMAS_OPTIONS = ['TikTok', 'Instagram', 'Facebook', 'LinkedIn'];

const EditorToolbar = ({ onCommand }: { onCommand: (cmd: string, val?: string) => void }) => {
    return (
        <div className="flex flex-wrap items-center gap-2 p-2 border-b theme-border bg-black/20 text-gray-400 select-none">
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => onCommand('undo')} className="p-1.5 hover:bg-white/10 rounded hover:text-white transition-colors" title="Deshacer (Ctrl+Z)"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg></button>
            <div className="w-px h-4 bg-gray-700 mx-1"></div>
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => onCommand('bold')} className="px-2 py-1 font-bold text-sm hover:bg-white/10 rounded hover:text-white transition-colors" title="Negrita">B</button>
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => onCommand('italic')} className="px-2 py-1 italic font-serif text-sm hover:bg-white/10 rounded hover:text-white transition-colors" title="Cursiva">I</button>
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => onCommand('underline')} className="px-2 py-1 underline text-sm hover:bg-white/10 rounded hover:text-white transition-colors" title="Subrayado">U</button>
            <div className="w-px h-4 bg-gray-700 mx-1"></div>
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => onCommand('insertUnorderedList')} className="p-1.5 hover:bg-white/10 rounded hover:text-white transition-colors" title="Lista"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></button>
            <button type="button" onMouseDown={e => e.preventDefault()} onClick={() => onCommand('removeFormat')} className="px-2 py-1 text-xs font-bold hover:bg-white/10 rounded hover:text-white transition-colors" title="Limpiar Formato">Tx</button>
        </div>
    );
};

export const SolicitudTicketsView = ({ showToast, navigate }: any) => {
    const [formData, setFormData] = useState({
        prioridad: '🟢 Baja', tema: '', mensaje: '', plataforma: 'Instagram',
        objetivo: '', fechaLimite: '', pin: '', formato: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPin, setShowPin] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);

    const execCommand = (command: string, value: string = '') => {
        document.execCommand(command, false, value);
        if (editorRef.current) {
            setFormData(prev => ({ ...prev, formato: editorRef.current?.innerHTML || '' }));
            editorRef.current.focus();
        }
    };

    const handleEditorBlur = () => { if (editorRef.current) setFormData(prev => ({ ...prev, formato: editorRef.current?.innerHTML || '' })); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.pin.trim()) return showToast('Por favor ingresa el PIN corporativo.', true);
        setIsSubmitting(true);
        try {
            const cleanHTML = DOMPurify.sanitize(editorRef.current ? editorRef.current.innerHTML : formData.formato);
            await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'tickets'), {
                ...formData, formato: cleanHTML, estado: 'Pendiente', timestamp: new Date().toISOString(),
                fechaEntregaReal: '', linkArte: '', notasInternas: '', autor: 'Innova Cliente (Web)',
                responsable: '', readBy: []
            });
            showToast('¡Ticket emergente enviado con éxito a producción!');
            setFormData({ prioridad: '🟢 Baja', tema: '', mensaje: '', plataforma: 'Instagram', objetivo: '', fechaLimite: '', pin: '', formato: '' });
            if (editorRef.current) editorRef.current.innerHTML = '';
        } catch (error: any) {
            showToast('Acceso denegado: El PIN corporativo es incorrecto.', true);
        }
        setIsSubmitting(false);
    };

    return (
        <>
            <style>{editorStyles}</style>
            <div className="max-w-4xl mx-auto space-y-8 fade-in pb-16">
                <div className="theme-bg-container p-6 sm:p-10 rounded-[2rem] border theme-border shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-700">
                        <Ticket className="w-48 h-48" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <Send className="w-4 h-4" /> Solicitudes Emergentes
                        </p>
                        <h2 className="text-4xl font-black theme-text-main mb-4 tracking-tight">Emisión de Ticket de Contenido</h2>
                        <p className="theme-text-muted text-base max-w-2xl leading-relaxed">
                            Abre una solicitud directa para el equipo de producción. Tu ticket será evaluado en tiempo real en nuestra consola de gestión escalonada.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 px-2 sm:px-6">
                    <div className="p-6 bg-purple-500/10 border border-purple-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-500 text-white rounded-xl shadow-md"><Lock className="w-5 h-5"/></div>
                            <div>
                                <h4 className="font-bold theme-text-main text-sm">Autenticación de Cliente</h4>
                                <p className="text-xs theme-text-muted">Ingresa tu PIN de seguridad asignado por Tierra de Ideas.</p>
                            </div>
                        </div>
                        <div className="relative flex items-center w-full sm:w-56">
                            <input 
                                type={showPin ? "text" : "password"} 
                                placeholder="PIN Corporativo" 
                                required 
                                value={formData.pin} 
                                onChange={(e) => setFormData({...formData, pin: e.target.value})} 
                                className={`${inputStyles} w-full text-center font-mono tracking-widest text-base font-bold bg-white dark:bg-gray-900 border-purple-500/50 pr-10`} 
                            />
                            <button 
                                type="button" 
                                onClick={() => setShowPin(!showPin)}
                                className="absolute right-3 text-gray-400 hover:text-purple-500 transition-colors focus:outline-none"
                                title={showPin ? "Ocultar PIN" : "Mostrar PIN"}
                            >
                                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8 theme-bg-container rounded-[1.5rem] border theme-border shadow-sm space-y-6 border-l-[6px] border-l-purple-500">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold theme-text-muted uppercase tracking-wider">Semáforo de Prioridad</label>
                                <select value={formData.prioridad} onChange={(e) => setFormData({...formData, prioridad: e.target.value})} className={`${inputStyles} font-bold`}>
                                    <option value="🟢 Baja">🟢 Baja</option>
                                    <option value="🟡 Media">🟡 Media</option>
                                    <option value="🟠 Alta">🟠 Alta</option>
                                    <option value="🔴 Crítica">🔴 Crítica</option>
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold theme-text-muted uppercase tracking-wider">Plataforma</label>
                                <select value={formData.plataforma} onChange={(e) => setFormData({...formData, plataforma: e.target.value})} className={inputStyles}>
                                    {PLATAFORMAS_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold theme-text-muted uppercase tracking-wider">Fecha Límite / Salida</label>
                                <input type="date" required value={formData.fechaLimite} onChange={(e) => setFormData({...formData, fechaLimite: e.target.value})} className={`${inputStyles} [color-scheme:light] dark:[color-scheme:dark]`} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5"><label className="text-xs font-bold theme-text-muted uppercase tracking-wider">Tema de la publicación</label><input type="text" required placeholder="Ej: Apertura de inscripciones ciclo escolar..." value={formData.tema} onChange={(e) => setFormData({...formData, tema: e.target.value})} className={inputStyles} /></div>
                            <div className="space-y-1.5"><label className="text-xs font-bold theme-text-muted uppercase tracking-wider">Objetivo del contenido</label><input type="text" required placeholder="Ej: Tráfico a landing page, captación de leads..." value={formData.objetivo} onChange={(e) => setFormData({...formData, objetivo: e.target.value})} className={inputStyles} /></div>
                        </div>

                        <div className="space-y-1.5"><label className="text-xs font-bold theme-text-muted uppercase tracking-wider">Mensaje o Copy Sugerido</label><textarea rows={3} required placeholder="Redacta el mensaje principal que se debe comunicar..." value={formData.mensaje} onChange={(e) => setFormData({...formData, mensaje: e.target.value})} className={`${inputStyles} resize-none leading-relaxed`}></textarea></div>

                        <div className="space-y-1.5 pt-2">
                            <label className="text-xs font-bold theme-text-muted uppercase tracking-wider flex justify-between items-center">Formato Especificado (Editor Visual)<span className="font-normal text-purple-500">Requerimientos visuales o de guion</span></label>
                            <div className="border border-gray-300 dark:border-gray-700 rounded-xl overflow-hidden bg-[var(--surface)] shadow-inner">
                                <EditorToolbar onCommand={execCommand} />
                                <div ref={editorRef} contentEditable onBlur={handleEditorBlur} className="w-full p-4 theme-bg-low theme-text-main outline-none min-h-[160px] max-h-[350px] overflow-y-auto text-sm leading-relaxed custom-scrollbar wysiwyg-content" data-placeholder="Detalla si es Reel 30s, Carrusel de 5 slides, Video con dron, etc..."></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-black bg-purple-600 text-white hover:bg-purple-500 shadow-lg transition-all disabled:opacity-50">
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>}
                            {isSubmitting ? 'Verificando firewall...' : 'Emitir Ticket a Producción'}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

const CustomResponsableSelector = ({ selectedValue, users, onSelect }: { selectedValue: string, users: any[], onSelect: (val: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // 🔥 BLINDAJE 1: Tipado explícito (u: any) para el compilador estricto
    const selectedUser = users.find((u: any) => (u.displayName || u.email) === selectedValue);

    useEffect(() => {
        const handleClickOutside = (e: any) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={containerRef}>
            <div 
                onClick={() => setIsOpen(!isOpen)}
                className={`${gridInputExactClass} justify-between cursor-pointer select-none hover:border-purple-500`}
            >
                <div className="flex items-center gap-2 truncate">
                    {selectedUser ? (
                        <>
                            {selectedUser.photoURL ? (
                                <img src={selectedUser.photoURL} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0 border border-purple-500/50" />
                            ) : (
                                <div className="w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-black flex items-center justify-center flex-shrink-0">
                                    {/* 🔥 BLINDAJE 2: Evita crash visual si el usuario no tiene nombre registrado */}
                                    {(selectedUser.displayName || selectedUser.email || 'U').charAt(0).toUpperCase()}
                                </div>
                            )}
                            <span className="font-semibold text-xs truncate">{selectedUser.displayName || selectedUser.email}</span>
                        </>
                    ) : (
                        <span className="text-gray-400 text-xs">-- Sin asignar --</span>
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {isOpen && (
                <div className="absolute z-[100000] top-full left-0 right-0 mt-1 theme-bg-container border theme-border rounded-xl shadow-2xl max-h-52 overflow-y-auto custom-scrollbar p-1 space-y-0.5">
                    <div 
                        onClick={() => { onSelect(''); setIsOpen(false); }}
                        className="p-2 rounded-lg hover:theme-bg-low text-xs text-gray-400 cursor-pointer flex items-center gap-2"
                    >
                        <div className="w-5 h-5 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-[10px]">-</div>
                        <span>-- Sin asignar --</span>
                    </div>
                    {/* 🔥 BLINDAJE 1: Tipado explícito (u: any) */}
                    {users.map((u: any) => {
                        const val = u.displayName || u.email;
                        const isSelected = val === selectedValue;
                        return (
                            <div 
                                key={u.email} 
                                onClick={() => { onSelect(val); setIsOpen(false); }}
                                className={`p-2 rounded-lg flex items-center justify-between cursor-pointer text-xs transition-colors ${isSelected ? 'bg-purple-500/10 text-purple-500 font-bold' : 'hover:theme-bg-low theme-text-main'}`}
                            >
                                <div className="flex items-center gap-2 truncate">
                                    {u.photoURL ? (
                                        <img src={u.photoURL} alt="" className="w-5 h-5 rounded-full object-cover flex-shrink-0 border border-purple-500/30" />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-purple-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                                            {/* 🔥 BLINDAJE 2: Fallback seguro de avatar */}
                                            {(val || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="truncate">{val}</span>
                                </div>
                                <span className="text-[10px] opacity-60 ml-2 flex-shrink-0">{u.role === 'ADMIN_IT' ? 'TI' : u.role === 'ADMIN_CM' ? 'CM' : 'Editor'}</span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export const GestionTicketsView = ({ showToast, isAdmin, appUsers, user, updateTicketStatus, updateTicketInternals, deleteTicket }: any) => {
    const [tickets, setTickets] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [filterEstado, setFilterEstado] = useState('Todos');

    // 🔥 BLINDAJE 1: Tipado explícito (u: any)
    const activeTeamUsers = useMemo(() => {
        return (appUsers || []).filter((u: any) => !u.disabled);
    }, [appUsers]);

    useEffect(() => {
        setIsLoading(true);
        const unsub = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'tickets'), (snapshot) => {
            const arr: any[] = [];
            const currentUser = user || auth.currentUser;
            
            snapshot.forEach((d) => {
                const data = d.data();
                arr.push({ id: d.id, ...data });
                
                if (currentUser && data.estado === 'Pendiente') {
                    // 🔥 BLINDAJE 3: Previene caída si currentUser no tiene uid temporalmente en la recarga
                    const isAlreadyRead = (data.readBy || []).some((id: string) => 
                        (currentUser?.uid && id === currentUser.uid) || (currentUser?.email && id === currentUser.email)
                    );
                    if (!isAlreadyRead) {
                        const idsToAdd = [currentUser?.uid, currentUser?.email].filter(Boolean);
                        updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tickets', d.id), {
                            readBy: arrayUnion(...idsToAdd)
                        }).catch(() => {});
                    }
                }
            });
            arr.sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());
            setTickets(arr);
            setTimeout(() => setIsLoading(false), 500);
        });
        return () => unsub();
    }, [user]);

    // 🔥 BLINDAJE 1: Tipado explícito (t: any)
    const filteredTickets = useMemo(() => {
        if (filterEstado === 'Todos') return tickets;
        return tickets.filter((t: any) => t.estado === filterEstado);
    }, [tickets, filterEstado]);

    const handleUpdateStatus = async (id: string, nuevoEstado: string) => {
        if (updateTicketStatus) {
            await updateTicketStatus(id, nuevoEstado, user || auth.currentUser);
            if (selectedTicket && selectedTicket.id === id) {
                setSelectedTicket({ ...selectedTicket, estado: nuevoEstado });
            }
        }
    };

    const handleInstantResponsableChange = async (newVal: string) => {
        if (!selectedTicket) return;
        setSelectedTicket((prev: any) => ({ ...prev, responsable: newVal }));
        try {
            const updatePayload: any = { responsable: newVal };
            const currentUser = user || auth.currentUser;
            if (currentUser) {
                const idsToAdd = [currentUser.uid, currentUser.email].filter(Boolean);
                updatePayload.readBy = arrayUnion(...idsToAdd);
            }
            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'tickets', selectedTicket.id), updatePayload);
            showToast('Responsable del ticket guardado');
        } catch (e) {
            showToast('Error al guardar responsable', true);
        }
    };

    const handleSaveInternals = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTicket) return;

        if (updateTicketInternals) {
            const success = await updateTicketInternals(selectedTicket.id, selectedTicket, user || auth.currentUser, appUsers);
            if (success) setIsDetailOpen(false);
        }
    };

    const handleDelete = (id: string) => {
        if (deleteTicket) {
            deleteTicket(id, () => setIsDetailOpen(false));
        }
    };

    const getStatusBadge = (estado: string) => {
        switch(estado) {
            case 'Pendiente': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30';
            case 'En Producción': return 'bg-purple-500/10 text-purple-600 border-purple-500/30';
            case 'En Revisión': return 'bg-blue-500/10 text-blue-600 border-blue-500/30';
            case 'Resuelto': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
            default: return 'bg-gray-500/10 text-gray-500';
        }
    };

    return (
        <div className="space-y-6 fade-in pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div><h2 className="text-2xl font-bold theme-text-main">Consola de Gestión de Tickets</h2><p className="theme-text-muted text-sm mt-1">Control de flujo, aprobación y tiempos de entrega para Innovaschools.</p></div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className={`${inputStyles} sm:w-48 font-bold`}>
                        <option value="Todos">Todos los Estados</option>
                        <option value="Pendiente">🟡 Pendientes</option>
                        <option value="En Producción">🟣 En Producción</option>
                        <option value="En Revisión">🔵 En Revisión</option>
                        <option value="Resuelto">🟢 Resueltos</option>
                    </select>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 fade-in">
                    {[1, 2, 3, 4, 5, 6].map(card => (
                        <div key={card} className="p-5 theme-bg-container rounded-xl border theme-border shadow-sm h-44 animate-pulse flex flex-col justify-between">
                            <div className="flex items-start gap-3 mb-3 w-full">
                                <div className="w-10 h-10 rounded-lg bg-gray-300 dark:bg-gray-700 flex-shrink-0"></div>
                                <div className="flex-1 space-y-2 py-1 w-full"><div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div><div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div></div>
                            </div>
                            <div className="space-y-2 mt-2 w-full"><div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-full"></div><div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div></div>
                            <div className="mt-auto pt-3 border-t theme-border flex gap-2 w-full"><div className="h-6 w-16 bg-gray-300 dark:bg-gray-700 rounded-md"></div><div className="h-6 w-20 bg-gray-300 dark:bg-gray-700 rounded-md"></div></div>
                        </div>
                    ))}
                </div>
            ) : filteredTickets.length === 0 ? (
                <div className="text-center py-16 theme-bg-container rounded-2xl border theme-border"><Ticket className="w-12 h-12 theme-text-muted mx-auto mb-4 opacity-30" /><p className="theme-text-muted">No hay tickets registrados bajo el filtro actual.</p></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* 🔥 BLINDAJE 1: Tipado explícito (t: any) y (u: any) en la línea del error del build */}
                    {filteredTickets.map((t: any) => {
                        const assignedObj = activeTeamUsers.find((u: any) => (u.displayName || u.email) === t.responsable);
                        return (
                            <div key={t.id} onClick={() => { setSelectedTicket(t); setIsDetailOpen(true); }} className="p-5 theme-bg-container rounded-xl border theme-border shadow-sm hover:border-purple-500 transition-all cursor-pointer flex flex-col justify-between h-full border-l-4 border-l-purple-500 group">
                                <div>
                                    <div className="flex justify-between items-start mb-2 gap-2">
                                        <span className="text-xs font-bold">{t.prioridad}</span>
                                        <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-md border uppercase ${getStatusBadge(t.estado)}`}>{t.estado}</span>
                                    </div>
                                    <h3 className="font-bold theme-text-main text-base group-hover:text-purple-500 transition-colors line-clamp-1">{t.tema}</h3>
                                    <p className="text-xs theme-text-muted line-clamp-2 mt-1 mb-3">{t.mensaje}</p>
                                </div>
                                <div className="pt-3 border-t theme-border flex flex-col gap-2 text-[11px] theme-text-muted">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold px-2 py-0.5 theme-bg-low rounded">{t.plataforma}</span>
                                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> Límite: {t.fechaLimite}</span>
                                    </div>
                                    {t.responsable && (
                                        <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-medium truncate pt-1 border-t theme-border/40">
                                            {assignedObj && assignedObj.photoURL ? (
                                                <img src={assignedObj.photoURL} alt="" className="w-4 h-4 rounded-full object-cover flex-shrink-0 border border-purple-500/40" />
                                            ) : (
                                                <Users className="w-3.5 h-3.5 flex-shrink-0"/>
                                            )}
                                            <span className="truncate">Asignado a: <strong className="font-bold">{t.responsable}</strong></span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {isDetailOpen && selectedTicket && ReactDOM.createPortal(
                <div className="fixed inset-0 w-screen h-screen bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4 fade-in overflow-y-auto">
                    <div className="theme-bg-container rounded-2xl w-full max-w-2xl shadow-2xl border theme-border flex flex-col max-h-[90vh] overflow-hidden my-auto">
                        <div className="p-5 border-b theme-border flex justify-between items-center bg-purple-500/5">
                            <div className="flex items-center gap-3"><div className="p-2 bg-purple-500/20 text-purple-500 rounded-lg"><Ticket className="w-5 h-5"/></div><div><h3 className="font-bold theme-text-main text-lg">{selectedTicket.tema}</h3><p className="text-xs theme-text-muted">Solicitado por Innovaschools</p></div></div>
                            <div className="flex items-center gap-2">
                                {isAdmin && <button onClick={() => handleDelete(selectedTicket.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg" title="Eliminar ticket"><Trash2 className="w-5 h-5"/></button>}
                                <button onClick={() => setIsDetailOpen(false)} className="p-2 theme-text-muted hover:theme-text-main rounded-lg" title="Cerrar modal"><X className="w-5 h-5"/></button>
                            </div>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                            <div className="flex flex-wrap gap-3 items-center justify-between p-4 theme-bg-low rounded-xl border theme-border">
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold">{selectedTicket.prioridad}</span>
                                    <span className="text-xs font-bold px-2 py-1 bg-purple-500/10 text-purple-500 rounded">{selectedTicket.plataforma}</span>
                                </div>
                                
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-black/5 dark:bg-white/5 rounded-lg border theme-border text-xs font-bold theme-text-main">
                                    <Calendar className="w-3.5 h-3.5 text-purple-500" />
                                    <span>Límite: <span className="text-purple-600 dark:text-purple-400">{selectedTicket.fechaLimite}</span></span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold theme-text-muted">Estatus:</span>
                                    <select value={selectedTicket.estado} onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)} className={`${inputStyles} py-1 px-3 w-auto font-bold text-xs`}>
                                        <option value="Pendiente">🟡 Pendiente</option><option value="En Producción">🟣 En Producción</option><option value="En Revisión">🔵 En Revisión</option><option value="Resuelto">🟢 Resuelto</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div><p className="text-xs font-bold theme-text-muted uppercase mb-1">Mensaje o Copy Solicitado</p><div className="p-4 theme-bg-low rounded-xl border theme-border text-sm whitespace-pre-wrap">{selectedTicket.mensaje}</div></div>
                                <div><p className="text-xs font-bold theme-text-muted uppercase mb-1">Objetivo del Contenido</p><p className="p-3 theme-bg-low rounded-xl border theme-border text-sm font-medium">{selectedTicket.objetivo}</p></div>
                                <div><p className="text-xs font-bold theme-text-muted uppercase mb-1">Formato Especificado</p><div className="p-4 theme-bg-low rounded-xl border theme-border text-sm wysiwyg-content" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(selectedTicket.formato || '<p>Sin formato visual adjunto.</p>') }}></div></div>
                            </div>

                            <form onSubmit={handleSaveInternals} className="pt-4 border-t theme-border space-y-5">
                                <h4 className="font-bold text-sm theme-text-main flex items-center gap-2"><Clock className="w-4 h-4 text-purple-500"/> Gestión Interna de Producción</h4>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold theme-text-muted flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-purple-500"/> Responsable Asignado</label>
                                        <CustomResponsableSelector 
                                            selectedValue={selectedTicket.responsable || ''} 
                                            users={activeTeamUsers} 
                                            onSelect={handleInstantResponsableChange} 
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold theme-text-muted">Fecha Real de Entrega</label>
                                        <input type="date" value={selectedTicket.fechaEntregaReal || ''} onChange={e => setSelectedTicket({...selectedTicket, fechaEntregaReal: e.target.value})} className={`${gridInputExactClass} [color-scheme:light] dark:[color-scheme:dark]`} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold theme-text-muted">Link del Arte / Drive Final</label>
                                        <input type="url" placeholder="https://drive..." value={selectedTicket.linkArte || ''} onChange={e => setSelectedTicket({...selectedTicket, linkArte: e.target.value})} className={gridInputExactClass} />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold theme-text-muted">Notas Internas para el Equipo</label>
                                        <input type="text" placeholder="Comentarios de avance..." value={selectedTicket.notasInternas || ''} onChange={e => setSelectedTicket({...selectedTicket, notasInternas: e.target.value})} className={gridInputExactClass} />
                                    </div>
                                </div>

                                {selectedTicket.linkArte && <a href={selectedTicket.linkArte} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-500 hover:underline"><ExternalLink className="w-3.5 h-3.5"/> Abrir Arte Adjunto</a>}
                                <button type="submit" className="w-full py-3 rounded-xl font-bold bg-purple-600 text-white hover:bg-purple-500 flex items-center justify-center gap-2 shadow-md transition-all"><Save className="w-4 h-4"/> Guardar Metadatos Internos</button>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};