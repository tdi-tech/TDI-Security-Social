import React from 'react';
import { Leaf, Eye, ShieldAlert, FileText, Megaphone, MessageSquare, HelpCircle, Lock } from 'lucide-react';

export const AyudaView = ({ isAdmin }: any) => {
    const currentYear = new Date().getFullYear();

    return (
        <div className="fade-in max-w-4xl mx-auto pb-10">
            {/* ==========================================
                ENCABEZADO DE LA PLATAFORMA
            ========================================== */}
            <div className="text-center mb-12 mt-6">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--primary)] flex items-center justify-center mb-4 shadow-md shadow-[var(--primary)]/20">
                    <Leaf className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-3xl font-black theme-text-main tracking-tight">Innova Social</h2>
                <p className="text-sm theme-text-muted mt-2 max-w-xl mx-auto leading-relaxed">
                    Plataforma para la gestión de seguridad y control operativo de incidencias de hackeos, contingencias en Redes Sociales y mitigación de comentarios negativos. Desarrollada por el área de IT de Tierra de Ideas.
                </p>
            </div>

            <div className="space-y-10">
                {/* ==========================================
                    SECCIÓN: GUÍA GENERAL (VISIBLE PARA TODOS)
                ========================================== */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold theme-text-muted uppercase tracking-widest flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-gray-500" /> Descripción de Roles
                    </h3>
                    
                    {/* Corrección de la caja alargada usando h-9 y flex-shrink-0 */}
                    <div className="theme-bg-container theme-border border p-5 rounded-xl flex items-start gap-4 shadow-sm transition-colors hover:border-gray-700">
                        <div className="p-2 bg-slate-500/10 rounded-lg h-9 w-9 flex items-center justify-center flex-shrink-0">
                            <Eye className="w-5 h-5 text-slate-400" />
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold theme-text-main text-sm">Modo Lector (Público)</h4>
                            <p className="text-sm theme-text-muted mt-1 leading-relaxed">
                                Diseñado para consulta abierta del personal. Permite revisar el glosario, leer los protocolos de actuación oficiales corporativos y auditar el historial general de eventos activos. Por estrictas políticas de confidencialidad y privacidad, la identidad de los autores que reportan los incidentes permanece anónima en este modo.
                            </p>
                        </div>
                    </div>
                </div>

                {/* ==========================================
                    SECCIÓN: MANUAL DE ADMINISTRACIÓN (SOLO LOGGEADOS)
                ========================================== */}
                {isAdmin ? (
                    <div className="space-y-6 fade-in pt-4 border-t theme-border">
                        <h3 className="text-xs font-bold theme-text-muted uppercase tracking-widest flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-[var(--primary)]" /> Panel de Control y Operación de Administrador
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            {/* Bloque Gestión de Hackeos (IT) */}
                            <div className="theme-bg-container theme-border border p-5 rounded-xl flex items-start gap-4 shadow-sm">
                                <div className="p-2 bg-red-500/10 rounded-lg h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <ShieldAlert className="w-5 h-5 text-red-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold theme-text-main text-sm">1. Seguridad y Hackeos (Área IT)</h4>
                                    <p className="text-xs theme-text-muted mt-1 leading-relaxed">
                                        Permite levantar reportes críticos de accesos no autorizados o pérdida de cuentas de la organización. Cuenta con un <strong>Checklist Rápido</strong> global y compartido para asegurar la contención inmediata del activo en tiempo real.
                                    </p>
                                </div>
                            </div>

                            {/* Bloque Respuesta de Crisis RRSS (Community Managers) */}
                            <div className="theme-bg-container theme-border border p-5 rounded-xl flex items-start gap-4 shadow-sm">
                                <div className="p-2 bg-orange-500/10 rounded-lg h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <Megaphone className="w-5 h-5 text-orange-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold theme-text-main text-sm">2. Crisis de Reputación (Community Managers)</h4>
                                    <p className="text-xs theme-text-muted mt-1 leading-relaxed">
                                        Módulo especializado para registrar picos inusuales de alertas en canales digitales. Ayuda a documentar el nivel de riesgo reputacional (Bajo, Medio, Alto) y aplicar la matriz de escalamiento del protocolo oficial de redes sociales.
                                    </p>
                                </div>
                            </div>

                            {/* Bloque Comentarios Negativos (Community Managers) */}
                            <div className="theme-bg-container theme-border border p-5 rounded-xl flex items-start gap-4 shadow-sm">
                                <div className="p-2 bg-blue-500/10 rounded-lg h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <MessageSquare className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold theme-text-main text-sm">3. Trazabilidad de Comentarios Negativos</h4>
                                    <p className="text-xs theme-text-muted mt-1 leading-relaxed">
                                        Herramienta de control para capturar quejas o ataques focalizados en pautas o posteos orgánicos organizados por campus. Mantiene un registro dinámico para evaluar la efectividad de las respuestas emitidas.
                                    </p>
                                </div>
                            </div>

                            {/* Bloque Reportes y Evidencia */}
                            <div className="theme-bg-container theme-border border p-5 rounded-xl flex items-start gap-4 shadow-sm">
                                <div className="p-2 bg-emerald-500/10 rounded-lg h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold theme-text-main text-sm">Evidencias, Exportación y PDF</h4>
                                    <p className="text-xs theme-text-muted mt-1 leading-relaxed">
                                        Recuerda que en el Checklist de contención debes vincular el enlace directo a la carpeta de Google Drive con las capturas de logs. Todos los historiales permiten descargar la base de datos en formato **CSV** para Excel, y cada reporte individual cuenta con impresión formateada limpia a **PDF**.
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                ) : (
                    /* Remplazo del emoji del candado por un icono vectorial integrado con excelente estilo */
                    <div className="p-5 theme-bg-lowest border border-dashed theme-border rounded-xl flex items-center gap-4 shadow-inner fade-in">
                        <div className="p-2 bg-amber-500/10 rounded-lg h-9 w-9 flex items-center justify-center flex-shrink-0">
                            <Lock className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-xs theme-text-muted leading-relaxed flex-1">
                            Las funciones avanzadas de captura de incidentes, manipulación de listas de verificación compartidas, auditoría de identidades y exportación de datos en sábanas CSV están restringidas únicamente para el personal técnico autorizado de **IT** y **Community Managers**.
                        </p>
                    </div>
                )}
            </div>

            {/* ==========================================
                PIE DE PÁGINA CORPORATIVO
            ========================================== */}
            <div className="mt-16 text-center border-t theme-border pt-6 no-print">
                <p className="text-xs font-bold theme-text-muted uppercase tracking-widest">&copy; {currentYear} Tierra de Ideas.</p>
                <p className="text-xs theme-text-muted mt-1">Todos los derechos reservados.</p>
            </div>
        </div>
    );
};