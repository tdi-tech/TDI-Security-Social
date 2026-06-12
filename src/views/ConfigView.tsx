import React from 'react';
import { Settings, Moon, Sun, Database, Download, ShieldAlert } from 'lucide-react';

export const ConfigView = ({ isDarkMode, toggleTheme, incidents, checklistState, showToast, isAdmin, userRole }: any) => {

    // Función de exportación de respaldo (Backup) en formato JSON
    const handleExportDB = () => {
        try {
            const data = {
                incidents,
                checklistState,
                exportDate: new Date().toISOString()
            };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            // CAMBIO APLICADO: backup_innova_management
            downloadAnchorNode.setAttribute("download", `backup_innova_management_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            showToast('Base de datos exportada correctamente');
        } catch (error) {
            showToast('Error al exportar los datos', true);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 fade-in pb-10">
            
            {/* ENCABEZADO */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold theme-text-main flex items-center gap-2">
                        <Settings className="w-6 h-6 text-[var(--primary)]" />
                        Configuración
                    </h2>
                    <p className="theme-text-muted text-sm mt-1">Ajustes del sistema, preferencias y respaldo de datos.</p>
                </div>
            </div>

            <div className="space-y-6">
                
                {/* 1. PREFERENCIAS DE INTERFAZ */}
                <div className="theme-bg-container border theme-border rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold theme-text-main mb-4 border-b theme-border pb-2">Preferencias de Interfaz</h3>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium theme-text-main">Tema Visual</p>
                            <p className="text-xs theme-text-muted mt-0.5">Alternar entre modo claro y oscuro.</p>
                        </div>
                        <button 
                            onClick={toggleTheme}
                            className="flex items-center gap-2 px-4 py-2 theme-bg-low border theme-border rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-bold text-sm theme-text-main"
                        >
                            {isDarkMode ? <Sun className="w-4 h-4"/> : <Moon className="w-4 h-4"/>}
                            {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
                        </button>
                    </div>
                </div>

                {/* 2. EXPORTACIÓN DE BASE DE DATOS (RESTRINGIDO) */}
                {userRole === 'ADMIN_IT' ? (
                    <div className="theme-bg-container border theme-border rounded-2xl p-6 shadow-sm fade-in">
                        <h3 className="text-lg font-bold theme-text-main mb-4 border-b theme-border pb-2 flex items-center gap-2">
                            <Database className="w-5 h-5 text-[var(--primary)]" /> Respaldo de Base de Datos
                        </h3>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                            <div>
                                <p className="font-medium theme-text-main">Exportar JSON de Seguridad</p>
                                <p className="text-xs theme-text-muted mt-0.5">Descarga un respaldo completo de las colecciones de incidencias y checklist.</p>
                            </div>
                            <button 
                                onClick={handleExportDB}
                                className="flex items-center gap-2 px-5 py-2.5 bg-[var(--primary)] text-white rounded-xl hover:brightness-110 transition-all font-bold text-sm shadow-sm"
                            >
                                <Download className="w-4 h-4"/> Exportar Datos
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="theme-bg-container border theme-border rounded-2xl p-6 shadow-sm opacity-70">
                        <h3 className="text-lg font-bold theme-text-main mb-4 border-b theme-border pb-2 flex items-center gap-2">
                            <Database className="w-5 h-5 text-gray-500" /> Respaldo de Base de Datos
                        </h3>
                        <div className="flex items-center gap-3 p-4 theme-bg-lowest rounded-xl border theme-border">
                            <ShieldAlert className="w-5 h-5 text-orange-500 flex-shrink-0" />
                            <p className="text-sm theme-text-muted">
                                No tienes los permisos suficientes para exportar la base de datos. Solo el <strong className="theme-text-main">Administrador IT</strong> puede realizar respaldos generales.
                            </p>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};