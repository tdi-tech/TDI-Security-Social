import React from 'react';
import { Sun, Moon, Download, RefreshCw } from 'lucide-react';

export const ConfigView = ({ isDarkMode, toggleTheme, incidents, checklistState, showToast, isAdmin }: any) => {
    
    const handleBackup = () => {
        const data = { 
            fechaExportacion: new Date().toISOString(),
            totalIncidentes: incidents.length,
            incidentes: incidents, 
            estadoChecklist: checklistState 
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Backup_TDI_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        showToast('Copia de seguridad exportada correctamente');
    };

    const handleClearCache = () => {
        localStorage.clear();
        window.location.reload();
    };

    return (
        <div className="fade-in max-w-3xl mx-auto pb-10">
            <h2 className="text-2xl font-bold theme-text-main mb-6 border-b theme-border pb-4">Ajustes del Sistema</h2>

            <div className="space-y-8">
                {/* 1. Preferencias de Interfaz (VISIBLE PARA TODOS) */}
                <section>
                    <h3 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider mb-4">1. Preferencias de Interfaz</h3>
                    <div className="theme-bg-container theme-border border rounded-xl p-5 flex items-center justify-between shadow-sm">
                        <div>
                            <h4 className="font-bold theme-text-main text-sm">Tema del Panel</h4>
                            <p className="text-xs theme-text-muted mt-1">Cambia entre modo claro y oscuro.</p>
                        </div>
                        <button onClick={toggleTheme} className="px-4 py-2 theme-bg-low theme-border border rounded-lg font-medium text-sm flex items-center gap-2 theme-text-main hover:brightness-95 dark:hover:brightness-110 transition-all">
                            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                            {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
                        </button>
                    </div>
                </section>

                {/* 2. Gestión de Datos (SOLO ADMINISTRADORES) */}
                {isAdmin && (
                    <section className="animate-fade-in">
                        <h3 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider mb-4">2. Gestión de Datos</h3>
                        <div className="theme-bg-container theme-border border rounded-xl p-5 flex items-center justify-between shadow-sm">
                            <div>
                                <h4 className="font-bold theme-text-main text-sm">Copia de Seguridad (JSON)</h4>
                                <p className="text-xs theme-text-muted mt-1">Descarga toda la base de datos de Firebase cruda.</p>
                            </div>
                            <button onClick={handleBackup} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center gap-2">
                                <Download className="w-4 h-4" /> Exportar BD
                            </button>
                        </div>
                    </section>
                )}

                {/* 3. Zona Peligrosa (SOLO ADMINISTRADORES) */}
                {isAdmin && (
                    <section className="animate-fade-in">
                        <h3 className="text-sm font-bold text-[var(--error)] uppercase tracking-wider mb-4">3. Zona Peligrosa</h3>
                        <div className="border border-[var(--error)]/30 bg-[var(--error)]/5 rounded-xl p-5 flex items-center justify-between shadow-sm">
                            <div>
                                <h4 className="font-bold text-[var(--error)] text-sm">Limpiar Caché y Refrescar</h4>
                                <p className="text-xs theme-text-muted mt-1">Soluciona problemas de lentitud y fuerza la recarga web.</p>
                            </div>
                            <button onClick={handleClearCache} className="px-4 py-2 bg-[var(--error)] hover:brightness-110 text-white rounded-lg font-bold text-sm shadow-sm transition-colors flex items-center gap-2">
                                <RefreshCw className="w-4 h-4" /> Purgar Caché
                            </button>
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
};