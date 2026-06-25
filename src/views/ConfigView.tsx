import React, { useState, useEffect } from 'react';
import { 
    Settings, Moon, Sun, Bell, Volume2, VolumeX, 
    ShieldCheck, Megaphone, MessageSquare, 
    Server, Trash2, Cpu, AlertTriangle, CheckCircle2 
} from 'lucide-react';

export const ConfigView = ({ 
    isDarkMode, toggleTheme, userRole, userPrefs, updateUserPrefs, showToast,
    incidents, rrssIncidents, comments, notifications, deleteNotification
}: any) => {

    const [cacheSize, setCacheSize] = useState('0.00');
    const [isPurging, setIsPurging] = useState(false);

    const prefs = userPrefs || { sound: true, security: true, rrss: true, comments: true };

    // ==========================================
    // CÁLCULOS ANALÍTICOS Y LÍMITES REALES
    // ==========================================
    const totalIncidents = (incidents?.length || 0) + (rrssIncidents?.length || 0) + (comments?.length || 0);
    const totalTraces = notifications?.length || 0;
    const totalDocs = totalIncidents + totalTraces;
    
    // Estimación de peso en KB (1.5 KB promedio por documento en Firestore)
    const estimatedKB = (totalDocs * 1.5).toFixed(2);
    
    // ⚠️ LÍMITE OPERATIVO SEGURO PARA EL PLAN SPARK (GRATUITO)
    // El plan da 1GB (infinito para texto), pero solo 50,000 LECTURAS DIARIAS.
    // Fijamos la meta visual en 10,000 docs. Si pasan de ahí, corren riesgo de agotar las lecturas diarias.
    const SAFE_DOC_LIMIT = 10000;
    const usagePercent = Math.min((totalDocs / SAFE_DOC_LIMIT) * 100, 100).toFixed(1);

    useEffect(() => {
        let total = 0;
        for (let x in localStorage) {
            if (localStorage.hasOwnProperty(x)) {
                total += ((localStorage[x].length + x.length) * 2);
            }
        }
        setCacheSize((total / 1024).toFixed(2));
    }, []);

    const handleClearCache = () => {
        const currentView = localStorage.getItem('innova_current_view');
        const authHint = localStorage.getItem('auth_hint');
        localStorage.clear();
        if (currentView) localStorage.setItem('innova_current_view', currentView);
        if (authHint) localStorage.setItem('auth_hint', authHint);
        setCacheSize('0.00');
        showToast('Memoria caché local liberada correctamente.');
    };

    const handlePurgeTraces = async () => {
        if (totalTraces === 0) {
            showToast('El servidor ya está limpio. No hay rastros para purgar.');
            return;
        }
        setIsPurging(true);
        showToast('Iniciando purga de rastros en el servidor...');
        try {
            for (const notif of notifications) {
                if (deleteNotification) await deleteNotification(notif.id);
            }
            showToast('Limpieza profunda completada con éxito.');
        } catch (error) {
            showToast('Ocurrió un error al purgar los datos.', true);
        } finally {
            setIsPurging(false);
        }
    };

    const playSynthesizedNotification = () => {
        try {
            const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContext) return;
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine'; 
            const now = ctx.currentTime;
            osc.frequency.setValueAtTime(580, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);
            
            gain.gain.setValueAtTime(0.3, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(now);
            osc.stop(now + 0.35);
        } catch (error) {
            console.error("Audio bloqueado:", error);
        }
    };

    const handleTogglePref = (key: string) => {
        const newValue = !prefs[key];
        const newPrefs = { ...prefs, [key]: newValue };
        updateUserPrefs(newPrefs);
        showToast('Preferencias actualizadas en la nube');
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

    const cleanRole = userRole?.toUpperCase()?.trim() || '';
    const isITAdmin = cleanRole === 'ADMIN_IT';
    const isCMUser = cleanRole === 'ADMIN_CM' || cleanRole === 'EDITOR_CM';

    return (
        <div className="max-w-6xl mx-auto space-y-6 fade-in pb-10">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold theme-text-main flex items-center gap-2">
                        <Settings className="w-6 h-6 text-[var(--primary)]" />
                        Configuración
                    </h2>
                    <p className="theme-text-muted text-sm mt-1">Ajustes del sistema, preferencias y salud del servidor.</p>
                </div>
            </div>

            <div className={isITAdmin ? "grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch" : "grid grid-cols-1 gap-6"}>
                
                {/* COLUMNA IZQUIERDA: INTERFAZ Y NOTIFICACIONES */}
                <div className={isITAdmin ? "lg:col-span-1 flex flex-col gap-6" : "w-full flex flex-col gap-6"}>
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

                {/* COLUMNA DERECHA EXCLUSIVA: MONITOR DE SALUD DE LA BASE DE DATOS */}
                {isITAdmin && (
                    <div className="lg:col-span-2 flex flex-col gap-6 fade-in">
                        
                        <div className="theme-bg-container border theme-border rounded-2xl p-6 shadow-sm flex flex-col h-full">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <div>
                                    <h3 className="text-sm font-bold theme-text-main uppercase tracking-wider flex items-center gap-2">
                                        <Server className="w-4 h-4 text-emerald-500" /> Motor Analítico y Salud DB
                                    </h3>
                                    <p className="text-xs theme-text-muted mt-1">Monitoreo de almacenamiento de la cuota de Firebase.</p>
                                </div>
                                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                    <CheckCircle2 className="w-4 h-4" /> Servidor Estable
                                </div>
                            </div>

                            {/* BARRA DE PROGRESO RESTAURADA (LÍMITE SEGURO DE LECTURAS) */}
                            <div className="mb-8">
                                <div className="flex justify-between items-end mb-2">
                                    <p className="text-sm font-bold theme-text-main">Cuota Segura de Lecturas Diarias</p>
                                    <p className="text-xs font-mono font-bold text-[var(--primary)]">{usagePercent}% ({totalDocs} / {SAFE_DOC_LIMIT} Docs)</p>
                                </div>
                                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-3 overflow-hidden shadow-inner">
                                    <div 
                                        className={`h-3 rounded-full transition-all duration-1000 ease-out relative ${parseFloat(usagePercent) > 80 ? 'bg-red-500' : parseFloat(usagePercent) > 50 ? 'bg-orange-500' : 'bg-[var(--primary)]'}`} 
                                        style={{ width: `${usagePercent}%`, minWidth: '2%' }}
                                    >
                                        <div className="absolute top-0 right-0 bottom-0 left-0 bg-white/20 animate-pulse"></div>
                                    </div>
                                </div>
                                <p className="text-[10px] theme-text-muted mt-2 text-right">El porcentaje advierte sobre el riesgo de saturar el límite de 50,000 lecturas/día del Plan Spark.</p>
                            </div>

                            {/* TARJETAS DE CONTEO EXACTO */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                <div className="p-4 theme-bg-low border theme-border rounded-xl shadow-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        <p className="text-xs font-bold theme-text-muted uppercase tracking-wider">Registros Operativos</p>
                                    </div>
                                    <p className="text-2xl font-black theme-text-main">{totalIncidents}</p>
                                    <p className="text-[10px] text-emerald-500 font-bold mt-1">Estimado en base: {estimatedKB} KB</p>
                                </div>

                                <div className="p-4 theme-bg-low border theme-border rounded-xl shadow-sm border-orange-500/20 bg-orange-500/5">
                                    <div className="flex items-center gap-2 mb-1">
                                        <AlertTriangle className="w-4 h-4 text-orange-500" />
                                        <p className="text-xs font-bold text-orange-500/80 uppercase tracking-wider">Rastros del Sistema</p>
                                    </div>
                                    <p className="text-2xl font-black theme-text-main">{totalTraces}</p>
                                    <p className="text-[10px] text-orange-500 font-bold mt-1">Notificaciones • Volátiles</p>
                                </div>
                            </div>

                            {/* BOTONERA DE MANTENIMIENTO */}
                            <div className="mt-auto space-y-4 pt-4 border-t theme-border">
                                <h4 className="text-xs font-bold theme-text-muted uppercase tracking-widest mb-3">Herramientas de Limpieza</h4>
                                
                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 theme-bg-low border theme-border rounded-xl transition-colors hover:border-gray-500">
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Cpu className="w-5 h-5"/></div>
                                        <div>
                                            <p className="text-sm font-bold theme-text-main">Limpiar Caché del Navegador</p>
                                            <p className="text-xs theme-text-muted">Tamaño actual local: {cacheSize} KB</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handleClearCache}
                                        className="w-full sm:w-auto px-4 py-2 border theme-border bg-[var(--surface)] text-sm font-bold theme-text-main rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors shadow-sm"
                                    >
                                        Liberar Memoria
                                    </button>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 theme-bg-low border border-red-500/30 rounded-xl transition-colors bg-red-500/5">
                                    <div className="flex items-center gap-3 w-full sm:w-auto">
                                        <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><Trash2 className="w-5 h-5"/></div>
                                        <div>
                                            <p className="text-sm font-bold theme-text-main text-red-500 dark:text-red-400">Purgar Rastros de Base de Datos</p>
                                            <p className="text-[11px] text-red-500/70 dark:text-red-400/70 max-w-xs leading-tight mt-0.5">
                                                Elimina definitivamente las alertas antiguas y notificaciones. Los incidentes operativos están blindados.
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={handlePurgeTraces}
                                        disabled={isPurging || totalTraces === 0}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-500 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isPurging ? 'Purgando...' : 'Vaciar Servidor'}
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};