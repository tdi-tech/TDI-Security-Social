import React from 'react';
import { Leaf, Eye, ShieldAlert, FileText, Megaphone, MessageSquare, HelpCircle, Lock, Users, Bell, Settings, Server, Database, Clock } from 'lucide-react';

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
                <h2 className="text-3xl font-black theme-text-main tracking-tight">Innova Management</h2>
                <p className="text-sm theme-text-muted mt-2 max-w-xl mx-auto leading-relaxed">
                    Plataforma para la gestión de seguridad y control operativo de incidencias de hackeos, contingencias en Redes Sociales y mitigación de comentarios negativos. Desarrollada por el área de IT de Tierra de Ideas.
                </p>
            </div>

            <div className="space-y-10">
                {/* ==========================================
                    SECCIÓN: GUÍA DE ROLES
                ========================================== */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold theme-text-muted uppercase tracking-widest flex items-center gap-2">
                        <HelpCircle className="w-4 h-4 text-gray-500" /> Jerarquía de Accesos (Zero-Trust)
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="theme-bg-container theme-border border p-5 rounded-xl flex items-start gap-4 shadow-sm transition-colors hover:border-gray-700">
                            <div className="p-2 bg-slate-500/10 rounded-lg h-9 w-9 flex items-center justify-center flex-shrink-0">
                                <Eye className="w-5 h-5 text-slate-400" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold theme-text-main text-sm">Lector (Público)</h4>
                                <p className="text-xs theme-text-muted mt-1 leading-relaxed">
                                    Diseñado para consulta abierta del personal. Permite revisar el glosario, leer los protocolos y auditar el historial general. La identidad de los autores permanece oculta. Restringido por Firewall en la nube.
                                </p>
                            </div>
                        </div>

                        <div className="theme-bg-container theme-border border p-5 rounded-xl flex items-start gap-4 shadow-sm transition-colors hover:border-[var(--primary)]">
                            <div className="p-2 bg-blue-500/10 rounded-lg h-9 w-9 flex items-center justify-center flex-shrink-0">
                                <MessageSquare className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold theme-text-main text-sm">Editor CM</h4>
                                <p className="text-xs theme-text-muted mt-1 leading-relaxed">
                                    Rol operativo por defecto. Permite crear, editar y eliminar incidentes de RRSS y Comentarios. Dispone del panel de configuración de alertas visuales/sonoras. Cuenta con protección de inactividad automática.
                                </p>
                            </div>
                        </div>

                        <div className="theme-bg-container theme-border border p-5 rounded-xl flex items-start gap-4 shadow-sm transition-colors hover:border-[var(--primary)]">
                            <div className="p-2 bg-orange-500/10 rounded-lg h-9 w-9 flex items-center justify-center flex-shrink-0">
                                <Users className="w-5 h-5 text-orange-500" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold theme-text-main text-sm">Administrador CM</h4>
                                <p className="text-xs theme-text-muted mt-1 leading-relaxed">
                                    Nivel gerencial. Además de las funciones del Editor, puede acceder a la pestaña de "Gestión de Usuarios" para asignar roles al equipo y habilitar/deshabilitar cuentas que no sean de rango IT.
                                </p>
                            </div>
                        </div>

                        <div className="theme-bg-container theme-border border p-5 rounded-xl flex items-start gap-4 shadow-sm transition-colors hover:border-[var(--primary)]">
                            <div className="p-2 bg-[var(--primary)]/10 rounded-lg h-9 w-9 flex items-center justify-center flex-shrink-0">
                                <ShieldAlert className="w-5 h-5 text-[var(--primary)]" />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold theme-text-main text-sm">Administrador IT</h4>
                                <p className="text-xs theme-text-muted mt-1 leading-relaxed">
                                    Control total del sistema. Puede pre-registrar usuarios, eliminar cuentas, monitorear la salud de Firestore y operar de forma exclusiva las copias de seguridad encriptadas globales. Privilegios intocables.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==========================================
                    SECCIÓN: MANUAL DE MÓDULOS (SOLO LOGGEADOS)
                ========================================== */}
                {isAdmin ? (
                    <div className="space-y-6 fade-in pt-4 border-t theme-border">
                        <h3 className="text-xs font-bold theme-text-muted uppercase tracking-widest flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 text-[var(--primary)]" /> Panel de Control y Operación de Administrador
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            
                            <div className="theme-bg-container theme-border border p-5 rounded-xl flex items-start gap-4 shadow-sm">
                                <div className="p-2 bg-red-500/10 rounded-lg h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <Bell className="w-5 h-5 text-red-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold theme-text-main text-sm">Centro de Notificaciones</h4>
                                    <p className="text-xs theme-text-muted mt-1 leading-relaxed">
                                        Campana de alertas en tiempo real que registra cuándo otros miembros del equipo crean, editan o eliminan un reporte. Incluye accesos directos ("Ver Incidente") y limpieza automática de lectura.
                                    </p>
                                </div>
                            </div>

                            <div className="theme-bg-container theme-border border p-5 rounded-xl flex items-start gap-4 shadow-sm">
                                <div className="p-2 bg-purple-500/10 rounded-lg h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <Settings className="w-5 h-5 text-purple-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold theme-text-main text-sm">Preferencias de Usuario</h4>
                                    <p className="text-xs theme-text-muted mt-1 leading-relaxed">
                                        Panel de configuración en la nube para personalizar el tema visual y elegir qué notificaciones de módulos específicos deseas recibir con soporte para tonos de audio sintetizados nativamente.
                                    </p>
                                </div>
                            </div>

                            <div className="theme-bg-container theme-border border p-5 rounded-xl flex items-start gap-4 shadow-sm">
                                <div className="p-2 bg-orange-500/10 rounded-lg h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <Megaphone className="w-5 h-5 text-orange-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold theme-text-main text-sm">Crisis de Reputación</h4>
                                    <p className="text-xs theme-text-muted mt-1 leading-relaxed">
                                        Módulo especializado para registrar picos inusuales de alertas en canales digitales. Ayuda a documentar el nivel de riesgo reputacional (Bajo, Medio, Alto) y aplicar la matriz de escalamiento.
                                    </p>
                                </div>
                            </div>

                            <div className="theme-bg-container theme-border border p-5 rounded-xl flex items-start gap-4 shadow-sm">
                                <div className="p-2 bg-emerald-500/10 rounded-lg h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <Server className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold theme-text-main text-sm">Monitor Analítico y Salud DB</h4>
                                    <p className="text-xs theme-text-muted mt-1 leading-relaxed">
                                        Panel analítico exclusivo para el Administrador IT que evalúa el consumo de cuota en Firebase y permite purgar rastros obsoletos o liberar caché local para optimizar el rendimiento.
                                    </p>
                                </div>
                            </div>

                            <div className="theme-bg-container theme-border border p-5 rounded-xl flex items-start gap-4 shadow-sm">
                                <div className="p-2 bg-amber-500/10 rounded-lg h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <Database className="w-5 h-5 text-amber-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold theme-text-main text-sm">Backups Core Unificado</h4>
                                    <p className="text-xs theme-text-muted mt-1 leading-relaxed">
                                        Centro exclusivo de IT para compilar y descargar respaldos globales de la plataforma con cifrado criptográfico AES-256. Su motor inverso inyecta inteligentemente registros borrados omitiendo duplicaciones.
                                    </p>
                                </div>
                            </div>

                            <div className="theme-bg-container theme-border border p-5 rounded-xl flex items-start gap-4 shadow-sm">
                                <div className="p-2 bg-blue-500/10 rounded-lg h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <Clock className="w-5 h-5 text-blue-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold theme-text-main text-sm">Cierre por Inactividad & UX</h4>
                                    <p className="text-xs theme-text-muted mt-1 leading-relaxed">
                                        Vigía que detecta el abandono de la app por 10 minutos para proteger la terminal. El sistema conserva tu vista de trabajo actual incluso si actualizas la página mediante F5.
                                    </p>
                                </div>
                            </div>

                            <div className="theme-bg-container theme-border border p-5 rounded-xl flex items-start gap-4 shadow-sm md:col-span-2">
                                <div className="p-2 bg-emerald-500/10 rounded-lg h-9 w-9 flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold theme-text-main text-sm">Reportes Ejecutivos y Exportación Universal</h4>
                                    <p className="text-xs theme-text-muted mt-1 leading-relaxed">
                                        El Dashboard permite descargar un <strong>Reporte Ejecutivo en PDF</strong> con métricas en tiempo real. Todos los historiales cuentan con <strong>Exportación Inteligente CSV</strong> por año/mes (con aplanamiento para Comentarios en Excel) y anexos en formato Word (.docx).
                                    </p>
                                </div>
                            </div>

                        </div>
                    </div>
                ) : (
                    <div className="p-5 theme-bg-lowest border border-dashed theme-border rounded-xl flex items-center gap-4 shadow-inner fade-in">
                        <div className="p-2 bg-amber-500/10 rounded-lg h-9 w-9 flex items-center justify-center flex-shrink-0">
                            <Lock className="w-4 h-4 text-amber-500" />
                        </div>
                        <p className="text-xs theme-text-muted leading-relaxed flex-1">
                            Las funciones avanzadas de captura de incidentes, manipulación de listas de verificación compartidas, monitoreo de salud del servidor y exportación de datos en sábanas CSV están restringidas únicamente para el personal técnico autorizado de IT y Community Managers.
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