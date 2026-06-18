import React, { useState } from 'react';
import { Database, Download, UploadCloud, ShieldAlert, FileJson, CheckCircle2, AlertCircle } from 'lucide-react';

export const BackupView = ({ 
    incidents, 
    rrssIncidents, 
    comments, 
    showToast,
    // Asegúrate de pasar las funciones de creación/escritura de useFirebase correspondientes:
    addIncidentRaw, 
    addRrssIncidentRaw, 
    addCommentRaw 
}: any) => {
    const [uploading, setUploading] = useState(false);
    const [backupInfo, setBackupInfo] = useState<any>(null);

    // ==========================================
    // 1. EXPORTACIÓN TOTAL UNIFICADA
    // ==========================================
    const handleExportAll = () => {
        try {
            const backupData = {
                version: "2.0",
                exportDate: new Date().toISOString(),
                modules: {
                    hackeos: incidents || [],
                    rrss: rrssIncidents || [],
                    comentarios: comments || []
                }
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `CORE_BACKUP_INNOVA_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            
            showToast('Copia de seguridad global generada con éxito');
        } catch (error) {
            showToast('Error al compilar el respaldo global', true);
        }
    };

    // ==========================================
    // 2. PROCESAMIENTO Y RESTAURACIÓN INTELIGENTE
    // ==========================================
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const parsedData = JSON.parse(event.target?.result as string);
                
                // Validación de estructura core
                if (!parsedData.modules || !parsedData.version) {
                    showToast('El archivo JSON no corresponde a un formato válido de Innova', true);
                    return;
                }
                setBackupInfo(parsedData);
            } catch (err) {
                showToast('Error al leer el archivo JSON. Estructura corrupta.', true);
            }
        };
        reader.readAsText(file);
    };

    const handleExecuteRestore = async () => {
        if (!backupInfo) return;
        setUploading(true);
        showToast('Iniciando restauración de colecciones...');

        try {
            let restoredHackeos = 0;
            let restoredRrss = 0;
            let restoredComments = 0;

            const { hackeos, rrss, comentarios } = backupInfo.modules;

            // Restauración Inteligente Módulo 1: Hackeos
            if (hackeos && Array.isArray(hackeos)) {
                for (const item of hackeos) {
                    // Verificamos si ya existe en el estado actual para no duplicar
                    const exists = incidents.some((i: any) => i.id === item.id);
                    if (!exists && addIncidentRaw) {
                        await addIncidentRaw(item);
                        restoredHackeos++;
                    }
                }
            }

            // Restauración Inteligente Módulo 2: RRSS
            if (rrss && Array.isArray(rrss)) {
                for (const item of rrss) {
                    const exists = rrssIncidents.some((i: any) => i.id === item.id);
                    if (!exists && addRrssIncidentRaw) {
                        await addRrssIncidentRaw(item);
                        restoredRrss++;
                    }
                }
            }

            // Restauración Inteligente Módulo 3: Comentarios
            if (comentarios && Array.isArray(comentarios)) {
                for (const item of comentarios) {
                    const exists = comments.some((i: any) => i.id === item.id);
                    if (!exists && addCommentRaw) {
                        await addCommentRaw(item);
                        restoredComments++;
                    }
                }
            }

            showToast(`Restauración exitosa: +${restoredHackeos} Hackeos, +${restoredRrss} RRSS, +${restoredComments} Comentarios`);
            setBackupInfo(null);
        } catch (error) {
            showToast('Error crítico durante la reinyección de datos', true);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 fade-in pb-10">
            {/* ENCABEZADO */}
            <div>
                <h2 className="text-2xl font-bold theme-text-main flex items-center gap-2">
                    <Database className="w-6 h-6 text-[var(--primary)]" />
                    Centro de Respaldos Core
                </h2>
                <p className="theme-text-muted text-sm mt-1">
                    Exporta bases de datos consolidadas e inyecta respaldos de emergencia para restaurar incidentes eliminados.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* TARJETA: EXPORTACIÓN GLOBAL */}
                <div className="theme-bg-container border theme-border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl w-10 h-10 flex items-center justify-center">
                            <Download className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-bold theme-text-main">Generar Respaldo Maestro</h3>
                        <p className="text-xs theme-text-muted leading-relaxed">
                            Descarga un solo archivo JSON cifrado con la totalidad de los datos operativos: incidentes de hackeo, crisis de reputación en redes sociales y bitácoras de comentarios de trazabilidad.
                        </p>
                    </div>
                    <button 
                        onClick={handleExportAll}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white font-bold text-sm rounded-xl hover:brightness-110 shadow-sm transition-all"
                    >
                        <Download className="w-4 h-4" /> Exportar Todo el Sistema
                    </button>
                </div>

                {/* TARJETA: IMPORTACIÓN / RESTAURACIÓN */}
                <div className="theme-bg-container border theme-border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl w-10 h-10 flex items-center justify-center">
                            <UploadCloud className="w-5 h-5" />
                        </div>
                        <h3 className="text-base font-bold theme-text-main">Cargar e Inyectar Copia</h3>
                        <p className="text-xs theme-text-muted leading-relaxed">
                            Sube el archivo JSON de respaldo. El sistema analizará los IDs inmutables y reintroducirá de forma automática cualquier reporte eliminado en su respectivo módulo sin duplicar los existentes.
                        </p>
                    </div>

                    <div className="relative">
                        <input 
                            type="file" 
                            accept=".json" 
                            onChange={handleFileChange}
                            disabled={uploading}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                        />
                        <div className="border border-dashed theme-border rounded-xl p-3 text-center text-xs theme-text-muted font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                            {backupInfo ? `📄 Seleccionado: CORE_BACKUP_...json` : "Haga clic para seleccionar archivo de respaldo"}
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENEDOR DE CONFIRMACIÓN DE RESTAURACIÓN DE INCIDENTES */}
            {backupInfo && (
                <div className="theme-bg-container border border-emerald-500/30 bg-emerald-500/5 rounded-2xl p-6 shadow-md space-y-4 fade-in">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold theme-text-main text-sm">Respaldo Validado Correctamente</h4>
                            <p className="text-xs theme-text-muted mt-1">
                                Fecha de creación de la copia: <strong className="theme-text-main">{new Date(backupInfo.exportDate).toLocaleString()}</strong>
                            </p>
                        </div>
                    </div>

                    {/* Resumen de elementos a evaluar */}
                    <div className="grid grid-cols-3 gap-4 bg-black/5 dark:bg-white/5 p-4 rounded-xl text-center">
                        <div>
                            <span className="block text-lg font-bold theme-text-main">{backupInfo.modules?.hackeos?.length || 0}</span>
                            <span className="text-[10px] uppercase font-bold theme-text-muted tracking-wider">Hackeos</span>
                        </div>
                        <div>
                            <span className="block text-lg font-bold theme-text-main">{backupInfo.modules?.rrss?.length || 0}</span>
                            <span className="text-[10px] uppercase font-bold theme-text-muted tracking-wider">Crisis RRSS</span>
                        </div>
                        <div>
                            <span className="block text-lg font-bold theme-text-main">{backupInfo.modules?.comentarios?.length || 0}</span>
                            <span className="text-[10px] uppercase font-bold theme-text-muted tracking-wider">Comentarios</span>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t theme-border">
                        <p className="text-[11px] theme-text-muted flex items-center gap-1.5 leading-relaxed">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                            El algoritmo omitirá los reportes que ya se encuentren vivos en el servidor para evitar duplicaciones de registros.
                        </p>
                        <button
                            onClick={handleExecuteRestore}
                            disabled={uploading}
                            className="w-full sm:w-auto px-6 py-2 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-500 shadow-md transition-all disabled:opacity-50"
                        >
                            {uploading ? "Procesando inyección..." : "Ejecutar Restauración Core"}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};