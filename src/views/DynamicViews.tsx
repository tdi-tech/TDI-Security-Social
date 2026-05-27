import React, { useState } from 'react';
import { Download, FileText, ShieldAlert, CheckCircle2, Printer, Link as LinkIcon, Camera, Megaphone, Key, LogOut, PowerOff, MailCheck, MonitorDot, RefreshCw, Globe, Clock, MessageSquare, ListChecks, History } from 'lucide-react';
import { FilterBtn } from '../components/UIComponents';
import { doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../firebase/config';

// Arreglo del checklist usando íconos de Lucide
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

export const HistorialView = ({ incidents, showToast, setSelectedIncidentId, setDetailModalOpen, isAdmin }: any) => {
    const [filter, setFilter] = useState('todos');

    const exportToCSV = () => {
        if (incidents.length === 0) return showToast('No hay incidentes para exportar.', true);
        const headers = [ 'ID', 'Fecha', 'Autor', 'Plataforma', 'Vector de Ataque', 'Impacto', 'Estado', 'Vistas Estimadas', 'Interacciones', 'Descripción', 'Contención Inmediata', 'Erradicación', 'Lecciones Aprendidas' ];
        let csvContent = headers.join(',') + '\n';
        
        const escapeCSV = (str: any) => {
            if (!str) return '""';
            return '"' + str.toString().replace(/"/g, '""') + '"';
        };

        incidents.forEach((inc: any) => {
            const row = [
                inc.id, 
                new Date(inc.fecha).toLocaleString().replace(/,/g, ''), 
                escapeCSV(isAdmin ? (inc.autor || 'Admin') : 'Anónimo'),
                escapeCSV(inc.plataforma), 
                escapeCSV(inc.vector), 
                escapeCSV(inc.impacto), 
                escapeCSV(inc.estado),
                inc.vistas || 0, 
                inc.interacciones || 0, 
                escapeCSV(inc.descripcion), 
                escapeCSV(inc.contencion), 
                escapeCSV(inc.erradicacion), 
                escapeCSV(inc.lecciones)
            ];
            csvContent += row.join(',') + '\n';
        });

        const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `incidentes_TDI_React_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    const filtered = filter === 'todos' ? incidents : incidents.filter((i: any) => i.estado === filter);

    return (
        <div className="fade-in space-y-6 pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold theme-text-main flex items-center gap-3">
                    <History className="w-7 h-7 text-[var(--primary)]" />
                    Historial de Incidentes
                </h2>
                <div className="flex flex-wrap items-center gap-2">
                    <FilterBtn active={filter === 'todos'} onClick={() => setFilter('todos')} label="Todos" color="slate" />
                    <FilterBtn active={filter === 'Abierto'} onClick={() => setFilter('Abierto')} label="Abiertos" color="yellow" />
                    <FilterBtn active={filter === 'Resuelto'} onClick={() => setFilter('Resuelto')} label="Resueltos" color="emerald" />
                    <div className="w-px h-6 bg-slate-700 mx-1"></div>
                    <button onClick={exportToCSV} className="px-4 py-2 text-xs font-bold rounded-lg bg-[var(--primary)] text-white hover:brightness-110 flex items-center gap-2 transition-colors shadow-sm">
                        <Download className="w-4 h-4" /> Exportar CSV
                    </button>
                </div>
            </div>
            <div className="space-y-4">
                {filtered.length === 0 ? (
                    <div className="theme-bg-container theme-border border p-8 rounded-xl text-center shadow-sm">
                        <FileText className="w-12 h-12 mx-auto theme-text-muted mb-3 opacity-50" />
                        <p className="theme-text-muted">No hay incidentes para mostrar en este filtro.</p>
                    </div>
                ) : (
                    filtered.map((inc: any) => (
                        <div key={inc.id} onClick={() => { setSelectedIncidentId(inc.id); setDetailModalOpen(true); }} className="theme-bg-container theme-border border p-5 rounded-xl flex items-center justify-between cursor-pointer hover:border-[var(--primary)] shadow-sm transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full theme-bg-low flex items-center justify-center group-hover:bg-[var(--primary)] transition-colors">
                                    <ShieldAlert className="w-5 h-5 theme-text-muted group-hover:text-white transition-colors"/>
                                </div>
                                <div>
                                    <h4 className="font-bold theme-text-main text-sm sm:text-base">{inc.plataforma} - {inc.descripcion.length > 40 ? inc.descripcion.substring(0, 40) + '...' : inc.descripcion}</h4>
                                    <p className="text-xs theme-text-muted">
                                        {new Date(inc.fecha).toLocaleString()} 
                                        {isAdmin && inc.autor && <span className="text-[var(--primary)]"> | Por: {inc.autor}</span>}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-4">
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${inc.estado === 'Resuelto' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-orange-500/10 text-orange-500'}`}>{inc.estado}</span>
                                <span className="text-xs font-bold theme-text-muted w-16 text-right">{inc.impacto}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
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
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'appState', 'globalChecklist'), { items: newState });
        } catch (e) { showToast("Error de sincronización", true); }
    };

    const updateLink = async (id: string, link: string) => {
        if (!isAdmin) return;
        const newState = { ...checklistState, [`${id}_link`]: link };
        setChecklistState(newState);
        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'appState', 'globalChecklist'), { items: newState });
            showToast('Enlace de Drive guardado exitosamente');
        } catch (e) { showToast("Error al guardar enlace", true); }
    };

    const handleReset = () => {
        setConfirmModal({
            isOpen: true, title: 'Reiniciar Checklist', msg: 'Esto borrará el progreso y los enlaces para todos. ¿Continuar?',
            onConfirm: async () => {
                try {
                    await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'appState', 'globalChecklist'), { items: {} });
                    showToast('Checklist reiniciado');
                } catch(e) { showToast("Error", true); }
            }
        });
    };

    return (
        <div className="fade-in max-w-3xl mx-auto pb-10 print:pb-0">
            <div className="flex justify-between items-center mb-6 no-print">
                <h2 className="text-2xl font-bold theme-text-main flex items-center gap-3">
                    <ListChecks className="w-7 h-7 text-[var(--primary)]" />
                    Checklist de Respuesta Rápida
                </h2>
                {isAdmin && <button onClick={handleReset} className="text-xs theme-text-muted hover:theme-text-main underline">Reiniciar Checklist</button>}
            </div>

            {/* Título alternativo que solo sale en impresión */}
            <h1 className="hidden print:block text-3xl font-bold text-black mb-8 border-b pb-4">TDI Secure Social - Reporte de Checklist</h1>

            <div className="theme-bg-container theme-border border rounded-xl p-5 mb-6 shadow-sm print:border-gray-300 print:bg-white print:shadow-none">
                <div className="h-4 theme-bg-low rounded-full overflow-hidden print:border print:border-gray-300">
                    <div className="h-full bg-[var(--primary)] transition-all duration-500 print:bg-blue-600" style={{ width: `${percent}%` }}></div>
                </div>
                <div className="flex justify-between px-1 pt-3">
                    <span className="text-xs font-medium theme-text-muted print:text-black">Progreso Global Compartido</span>
                    <span className="text-xs font-bold text-[var(--primary)] print:text-black">{percent}%</span>
                </div>
            </div>
            
            <div className="space-y-3 print:space-y-4">
                {checklistData.map(item => {
                    const isChecked = checklistState[item.id] || false;
                    const IconComponent = item.icon;
                    return (
                        <div key={item.id} className={`p-4 rounded-xl border transition-all print:break-inside-avoid print:bg-white print:border-gray-300 ${isChecked ? 'bg-[var(--success)]/10 border-[var(--success)]/30' : 'theme-bg-container theme-border hover:border-[var(--primary)]/50 shadow-sm'}`}>
                            <div className={`flex items-center ${isAdmin ? 'cursor-pointer' : 'cursor-default opacity-90'}`} onClick={() => handleToggle(item.id)}>
                                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center mr-4 flex-shrink-0 transition-colors print:border-gray-400 ${isChecked ? 'bg-[var(--success)] border-[var(--success)] print:bg-green-500' : 'border-[var(--on-surface-variant)]'}`}>
                                    {isChecked && <CheckCircle2 className="w-4 h-4 text-white" strokeWidth={3} />}
                                </div>
                                <IconComponent className={`w-4 h-4 mr-3 flex-shrink-0 ${isChecked ? 'text-[var(--success)] print:text-green-600' : 'theme-text-muted print:text-gray-500'}`} />
                                <span className={`text-sm font-medium ${isChecked ? 'text-[var(--success)] print:text-green-700 line-through' : 'theme-text-main print:text-black'}`}>{item.text}</span>
                            </div>
                            
                            {isChecked && item.id === 'c1' && (
                                <div className="ml-10 mt-4 pt-3 border-t border-[var(--success)]/20 print:border-gray-200 fade-in">
                                    <label className="text-xs font-bold text-[var(--success)] print:text-black uppercase tracking-wider mb-2 block flex items-center gap-1">
                                        <LinkIcon className="w-3 h-3"/> Enlace a Carpeta de Evidencias (Drive)
                                    </label>
                                    <input
                                        type="url"
                                        placeholder="🔗 Pega la URL de Google Drive aquí..."
                                        defaultValue={checklistState[`${item.id}_link`] || ''}
                                        onBlur={(e) => updateLink(item.id, e.target.value)}
                                        className="theme-input w-full rounded-lg px-3 py-2 text-sm no-print"
                                        disabled={!isAdmin}
                                    />
                                    {checklistState[`${item.id}_link`] && (
                                        <a href={checklistState[`${item.id}_link`]} target="_blank" rel="noreferrer" className="text-sm font-medium text-blue-500 hover:underline mt-2 block print-friendly break-all">
                                            {checklistState[`${item.id}_link`]}
                                        </a>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
            <div className="mt-8 flex justify-end no-print">
                <button onClick={() => window.print()} className="px-6 py-3 theme-bg-low theme-border border theme-text-main font-bold rounded-lg shadow-sm hover:brightness-95 dark:hover:brightness-110 transition-all flex items-center gap-2"><Printer className="w-5 h-5"/> Imprimir Checklist</button>
            </div>
        </div>
    );
};