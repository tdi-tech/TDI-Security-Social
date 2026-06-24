import React, { useState } from 'react';
import { 
    Settings, Moon, Sun, Bell, Volume2, VolumeX, 
    ShieldCheck, Megaphone, MessageSquare, Search, 
    X, Activity 
} from 'lucide-react';

export const ConfigView = ({ 
    isDarkMode, toggleTheme, incidents, checklistState, showToast, 
    userRole, auditLogs, userPrefs, updateUserPrefs 
}: any) => {

    // ==========================================
    // ESTADOS LOCALES
    // ==========================================
    const [logSearch, setLogSearch] = useState('');

    // Prevenimos errores si userPrefs aún no carga desde Firebase
    const prefs = userPrefs || { sound: true, security: true, rrss: true, comments: true };

    // Filtrado del Log de Auditoría (Ya viene real desde Firebase mediante props)
    const logsToDisplay = auditLogs || [];

    const filteredLogs = logsToDisplay.filter((log: any) => {
        const term = logSearch.toLowerCase();
        return (
            (log.user && log.user.toLowerCase().includes(term)) ||
            (log.action && log.action.toLowerCase().includes(term)) ||
            (log.module && log.module.toLowerCase().includes(term))
        );
    });

    // ==========================================
    // FUNCIONES
    // ==========================================
    
    // 🔊 GENERADOR SINTETIZADO DIGITAL TIPO GOOGLE MEET / SLACK (SIN ARCHIVOS MP3)
    const playSynthesizedNotification = () => {
        try {
            // Inicializar el contexto de audio nativo del navegador
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            
            const ctx = new AudioContext();
            
            // Creamos los nodos del sintetizador (Oscilador de onda + Control de volumen)
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine'; // Onda senoidal pura para un tono suave y moderno
            
            // Efecto rampa de frecuencia (Slack-style chime): Inicia en 580Hz y sube rápido a 880Hz
            const now = ctx.currentTime;
            osc.frequency.setValueAtTime(580, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
            
            // Control del volumen (Fade-out para evitar golpes secos en la bocina)
            gain.gain.setValueAtTime(0.3, now); // Volumen al 30%
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35); // Se apaga suavemente en 350ms
            
            // Conectar el sintetizador hacia la salida de audio
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            // Arrancar y destruir de inmediato
            osc.start(now);
            osc.stop(now + 0.35);
        } catch (error) {
            console.error("La Web Audio API no está soportada o fue bloqueada:", error);
        }
    };

    const handleTogglePref = (key: string) => {
        const newValue = !prefs[key];
        const newPrefs = { ...prefs, [key]: newValue };
        
        updateUserPrefs(newPrefs);
        showToast('Preferencias actualizadas en la nube');

        // Si se activa el switch de sonido, detona el generador nativo
        if (key === 'sound' && newValue === true) {
            playSynthesizedNotification();
        }
    };

    const ToggleSwitch = ({ checked, onChange }: { checked: boolean, onChange: () => void }) => (
        <button 
            onClick={onChange}
            className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 dark:focus:ring-offset-gray-900 ${checked ? 'bg-[var(--primary)]' : 'bg-gray-300 dark:bg-gray-600'}`}
        >
            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform shadow-sm ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
        </button>
    );

    // ==========================================
    // CONTROL DE TRES NIVELES DE PERMISOS
    // ==========================================
    const cleanRole = userRole?.toUpperCase()?.trim() || '';
    
    const isITAdmin = cleanRole === 'ADMIN_IT';
    const isCMUser = cleanRole === 'ADMIN_CM' || cleanRole === 'EDITOR_CM';

    return (
        <div className="max-w-6xl mx-auto space-y-6 fade-in pb-10">
            
            {/* ENCABEZADO */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold theme-text-main flex items-center gap-2">
                        <Settings className="w-6 h-6 text-[var(--primary)]" />
                        Configuración
                    </h2>
                    <p className="theme-text-muted text-sm mt-1">Ajustes del sistema, preferencias y control de interfaz.</p>
                </div>
            </div>

            {/* ESTRUCTURA DINÁMICA DE GRID SEGÚN EL ROL ACUMULADO */}
            <div className={isITAdmin ? "grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch" : "grid grid-cols-1 gap-6"}>
                
                {/* ==========================================
                    BLOQUE DE INTERFAZ Y NOTIFICACIONES
                ========================================== */}
                <div className={isITAdmin ? "lg:col-span-1 flex flex-col gap-6" : "w-full flex flex-col gap-6"}>
                    
                    {/* 1. INTERFAZ */}
                    <div className="theme-bg-container border theme-border rounded-2xl p-6 shadow-sm">
                        <h3 className="text-sm font-bold theme-text-main mb-4 uppercase tracking-wider flex items-center gap-2">
                            <Moon className="w-4 h-4 text-purple-500" /> Interfaz
                        </h3>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-bold theme-text-main">Tema Visual</p>
                                <p className="text-xs theme-text-muted mt-0.5">Modo claro / oscuro</p>
                            </div>
                            <button 
                                onClick={toggleTheme}
                                className="flex items-center gap-2 px-3 py-1.5 theme-bg-low border theme-border rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-bold text-xs theme-text-main"
                            >
                                {isDarkMode ? <Sun className="w-3.5 h-3.5"/> : <Moon className="w-3.5 h-3.5"/>}
                                {isDarkMode ? 'Claro' : 'Oscuro'}
                            </button>
                        </div>
                    </div>

                    {/* 2. NOTIFICACIONES */}
                    {(isCMUser || isITAdmin) && (
                        <div className="theme-bg-container border theme-border rounded-2xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold theme-text-main mb-4 uppercase tracking-wider flex items-center gap-2">
                                <Bell className="w-4 h-4 text-orange-500" /> Notificaciones
                            </h3>
                            
                            <div className="space-y-5">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${prefs.sound ? 'bg-blue-500/10 text-blue-500' : 'bg-gray-500/10 text-gray-500'}`}>
                                            {prefs.sound ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold theme-text-main">Efectos de Sonido</p>
                                            <p className="text-xs theme-text-muted">Sonidos al recibir alertas</p>
                                        </div>
                                    </div>
                                    <ToggleSwitch checked={prefs.sound} onChange={() => handleTogglePref('sound')} />
                                </div>

                                <div className="h-px w-full bg-gray-200 dark:bg-gray-800"></div>

                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <ShieldCheck className="w-4 h-4 text-red-500" />
                                        <div>
                                            <p className="text-sm font-bold theme-text-main">Seguridad IT</p>
                                            <p className="text-xs theme-text-muted">Alertas de Hackeos</p>
                                        </div>
                                    </div>
                                    <ToggleSwitch checked={prefs.security} onChange={() => handleTogglePref('security')} />
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <Megaphone className="w-4 h-4 text-orange-500" />
                                        <div>
                                            <p className="text-sm font-bold theme-text-main">Crisis RRSS</p>
                                            <p className="text-xs theme-text-muted">Incidencias de Reputación</p>
                                        </div>
                                    </div>
                                    <ToggleSwitch checked={prefs.rrss} onChange={() => handleTogglePref('rrss')} />
                                </div>

                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="w-4 h-4 text-blue-500" />
                                        <div>
                                            <p className="text-sm font-bold theme-text-main">Comentarios</p>
                                            <p className="text-xs theme-text-muted">Reportes de Trazabilidad</p>
                                        </div>
                                    </div>
                                    <ToggleSwitch checked={prefs.comments} onChange={() => handleTogglePref('comments')} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ==========================================
                    COLUMNA EXCLUSIVA DE LOGS (ADMIN_IT)
                ========================================== */}
                {isITAdmin && (
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        
                        {/* 3. LOG DE AUDITORÍA */}
                        <div className="theme-bg-container border theme-border rounded-2xl p-6 shadow-sm flex flex-col flex-1 min-h-[400px]">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                                <h3 className="text-sm font-bold theme-text-main uppercase tracking-wider flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-emerald-500" /> Log de Auditoría
                                </h3>
                                <div className="relative w-full sm:w-64">
                                    <Search className="absolute left-2.5 top-2.5 text-gray-400 w-4 h-4 pointer-events-none" />
                                    <input 
                                        type="text" 
                                        placeholder="Buscar evento..." 
                                        value={logSearch} 
                                        onChange={(e) => setLogSearch(e.target.value)} 
                                        className="w-full p-2 pl-9 rounded-lg theme-bg-low border theme-border theme-text-main focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition-all text-xs" 
                                    />
                                    {logSearch && <button onClick={() => setLogSearch('')} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"><X className="w-4 h-4" /></button>}
                                </div>
                            </div>

                            <div className="flex-1 overflow-hidden flex flex-col border theme-border rounded-xl bg-[var(--surface)]">
                                <div className="flex-1 overflow-x-auto overflow-y-auto custom-scrollbar">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="bg-black/5 dark:bg-white/5 sticky top-0 backdrop-blur-md z-[1] shadow-sm">
                                            <tr>
                                                <th className="p-3 text-[10px] font-bold theme-text-muted uppercase tracking-wider border-b theme-border whitespace-nowrap">Fecha</th>
                                                <th className="p-3 text-[10px] font-bold theme-text-muted uppercase tracking-wider border-b theme-border whitespace-nowrap">Usuario</th>
                                                <th className="p-3 text-[10px] font-bold theme-text-muted uppercase tracking-wider border-b theme-border min-w-[200px]">Acción</th>
                                                <th className="p-3 text-[10px] font-bold theme-text-muted uppercase tracking-wider border-b theme-border whitespace-nowrap">Módulo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y theme-divide-border">
                                            {filteredLogs.length > 0 ? filteredLogs.map((log: any) => (
                                                <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                                    <td className="p-3 text-xs theme-text-main whitespace-nowrap">{new Date(log.date).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</td>
                                                    <td className="p-3 text-xs font-medium text-[var(--primary)] whitespace-nowrap">{log.user}</td>
                                                    <td className="p-3 text-xs theme-text-main">{log.action}</td>
                                                    <td className="p-3 text-xs">
                                                        <span className="px-2 py-1 rounded-md bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300 font-bold text-[10px] uppercase tracking-wider whitespace-nowrap">
                                                            {log.module}
                                                        </span>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan={4} className="p-8 text-center text-sm theme-text-muted italic">
                                                        No se encontraron eventos que coincidan con la búsqueda.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

            </div>
        </div>
    );
};