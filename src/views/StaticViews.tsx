import React from 'react';

// Íconos requeridos para todas las vistas (Protocolo, Roles, Glosario y RRSS)
import { 
    AlertTriangle, ShieldAlert, CheckCircle, Clock, Info, Activity, 
    AlertCircle, FileText, Target, Search, MessageSquare, RefreshCw, 
    BookOpen, Lightbulb, Printer, Key, Smartphone, Laptop, Archive, 
    Mail, Bot, UserX, Users, UserCog, Scale, Trash2
} from 'lucide-react';

import { RoleCard, GlossaryCard } from '../components/UIComponents';

// ==========================================
// VISTA: PROTOCOLO DE HACKEOS
// ==========================================
export const StaticProtocoloView = () => (
    <div className="fade-in max-w-5xl mx-auto space-y-8 pb-10 print:pb-0">
        
        {/* Título alternativo que solo sale en impresión */}
        <h1 className="hidden print:block text-3xl font-bold text-black mb-8 border-b pb-4">TDI Secure Social - Protocolo Oficial</h1>

        {/* Cabecera */}
        <div className="theme-bg-container p-8 rounded-2xl border theme-border shadow-sm text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 print:border-none print:shadow-none print:p-0">
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="w-8 h-8 text-[var(--primary)]" />
                </div>
                <div>
                    <h2 className="text-2xl sm:text-3xl font-bold theme-text-main mb-2">Protocolo de Respuesta a Incidentes</h2>
                    <p className="theme-text-muted text-sm sm:text-base">1. Objetivo y Alcance: Establecer los lineamientos para <strong>prevenir, detectar, contener, erradicar y recuperar</strong> cuentas corporativas ante un incidente de seguridad.</p>
                </div>
            </div>
            <button onClick={() => window.print()} className="px-4 py-2 bg-[var(--primary)] hover:brightness-110 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 no-print whitespace-nowrap">
                <Printer className="w-4 h-4"/> Imprimir Protocolo
            </button>
        </div>

        {/* Principios */}
        <div className="space-y-4 print:break-inside-avoid">
            <h3 className="text-lg font-bold theme-text-main flex items-center gap-2 border-b theme-border pb-2">
                <CheckCircle className="w-5 h-5 text-[var(--primary)]" /> 2. Principios de Prevención
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 theme-bg-low rounded-xl border theme-border shadow-sm">
                    <Key className="w-6 h-6 text-[var(--success)] mb-3" />
                    <h4 className="font-bold theme-text-main mb-1 text-sm">Credenciales únicas</h4>
                    <p className="text-xs theme-text-muted">Mínimo 12 caracteres, no reutilizar.</p>
                </div>
                <div className="p-5 theme-bg-low rounded-xl border theme-border shadow-sm">
                    <Smartphone className="w-6 h-6 text-[var(--success)] mb-3" />
                    <h4 className="font-bold theme-text-main mb-1 text-sm">2FA Obligatorio</h4>
                    <p className="text-xs theme-text-muted">Usar App (Authy/Google), nunca SMS.</p>
                </div>
                <div className="p-5 theme-bg-low rounded-xl border theme-border shadow-sm">
                    <Laptop className="w-6 h-6 text-[var(--success)] mb-3" />
                    <h4 className="font-bold theme-text-main mb-1 text-sm">Equipos Exclusivos</h4>
                    <p className="text-xs theme-text-muted">Prohibido torrents, crack o navegación personal.</p>
                </div>
                <div className="p-5 theme-bg-low rounded-xl border theme-border shadow-sm">
                    <Archive className="w-6 h-6 text-[var(--success)] mb-3" />
                    <h4 className="font-bold theme-text-main mb-1 text-sm">Gestor de Contraseñas</h4>
                    <p className="text-xs theme-text-muted">Bitwarden/1Password. Nunca en navegador.</p>
                </div>
            </div>
        </div>

        {/* Fases de Respuesta */}
        <div className="space-y-4 print:break-inside-avoid">
            <h3 className="text-lg font-bold theme-text-main flex items-center gap-2 border-b theme-border pb-2">
                <Activity className="w-5 h-5 text-[var(--primary)]" /> 3. Fases de Respuesta
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-5 rounded-xl border bg-yellow-50/50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-900/30">
                    <h4 className="font-bold text-yellow-800 dark:text-yellow-400 mb-2 flex items-center gap-2"><Search className="w-4 h-4"/> 3.1 Detección <span className="text-xs font-bold bg-yellow-200 dark:bg-yellow-800 px-2 py-0.5 rounded-full ml-auto">0-10 min</span></h4>
                    <ul className="list-disc list-inside text-sm theme-text-main opacity-90 space-y-1">
                        <li>Preservar evidencia (capturas, URLs).</li>
                        <li>Reportar internamente por canal seguro.</li>
                    </ul>
                </div>
                <div className="p-5 rounded-xl border bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30">
                    <h4 className="font-bold text-red-800 dark:text-red-400 mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> 3.2 Contención <span className="text-xs font-bold bg-red-200 dark:bg-red-800 px-2 py-0.5 rounded-full ml-auto">10-60 min</span></h4>
                    <ul className="list-disc list-inside text-sm theme-text-main opacity-90 space-y-1">
                        <li><strong>Cambiar contraseñas desde dispositivo limpio.</strong></li>
                        <li>Cerrar sesiones activas y revocar apps.</li>
                    </ul>
                </div>
                <div className="p-5 rounded-xl border bg-orange-50/50 border-orange-200 dark:bg-orange-900/10 dark:border-orange-900/30">
                    <h4 className="font-bold text-orange-800 dark:text-orange-400 mb-2 flex items-center gap-2"><Trash2 className="w-4 h-4"/> 3.3 Erradicación</h4>
                    <ul className="list-disc list-inside text-sm theme-text-main opacity-90 space-y-1">
                        <li>Escaneo profundo / Formateo de equipo.</li>
                        <li>Rotación de tokens y APIs.</li>
                    </ul>
                </div>
                <div className="p-5 rounded-xl border bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30">
                    <h4 className="font-bold text-green-800 dark:text-green-400 mb-2 flex items-center gap-2"><RefreshCw className="w-4 h-4"/> 3.4 Recuperación</h4>
                    <ul className="list-disc list-inside text-sm theme-text-main opacity-90 space-y-1">
                        <li>Restaurar contenido y monitoreo intensivo 72h.</li>
                    </ul>
                </div>
            </div>
        </div>

        {/* Amenazas con IA */}
        <div className="space-y-4 print:break-inside-avoid">
            <h3 className="text-lg font-bold theme-text-main flex items-center gap-2 border-b theme-border pb-2">
                <Bot className="w-5 h-5 text-[var(--primary)]" /> 4. Amenazas con IA
            </h3>
            <div className="p-5 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-xl shadow-sm">
                <p className="font-bold text-[var(--primary)] mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5"/> Regla de Oro: Verifica siempre por un canal secundario.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3 bg-white/50 dark:bg-black/20 p-3 rounded-lg border theme-border">
                        <Mail className="w-5 h-5 text-[var(--primary)] flex-shrink-0" /> 
                        <span className="text-sm theme-text-main font-medium">Phishing hiper-personalizado.</span>
                    </div>
                    <div className="flex items-start gap-3 bg-white/50 dark:bg-black/20 p-3 rounded-lg border theme-border">
                        <MessageSquare className="w-5 h-5 text-[var(--primary)] flex-shrink-0" /> 
                        <span className="text-sm theme-text-main font-medium">Publicaciones "casi perfectas" fuera de contexto.</span>
                    </div>
                    <div className="flex items-start gap-3 bg-white/50 dark:bg-black/20 p-3 rounded-lg border theme-border">
                        <UserX className="w-5 h-5 text-[var(--primary)] flex-shrink-0" /> 
                        <span className="text-sm theme-text-main font-medium">Deepfakes para recuperación de cuentas.</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// ==========================================
// VISTA: ROLES Y RESPONSABILIDADES
// ==========================================
export const RolesView = () => (
    <div className="fade-in max-w-5xl mx-auto space-y-8 pb-10">
        {/* Cabecera */}
        <div className="theme-bg-container p-8 rounded-2xl border theme-border shadow-sm text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-8 h-8 text-[var(--primary)]" />
            </div>
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold theme-text-main mb-2">Roles y Responsabilidades</h2>
                <p className="theme-text-muted text-sm sm:text-base">Estructura organizativa, líneas de defensa y asignación de tareas específicas ante incidentes de seguridad.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RoleCard title="Community Manager" desc="Primera Línea de Defensa" icon={<UserCog className="w-8 h-8" />} color="primary" list={["Detección y reporte", "Contención básica", "Documentación", "Comunicación con audiencia"]} />
            <RoleCard title="TI / Soporte Técnico" desc="Análisis y Limpieza" icon={<Laptop className="w-8 h-8" />} color="purple" list={["Análisis forense", "Limpieza profunda", "Monitoreo", "Gestión de accesos"]} />
            <RoleCard title="Marketing / Dirección" desc="Toma de Decisiones" icon={<Target className="w-8 h-8" />} color="warning" list={["Validación de comunicación", "Pausas de campaña", "Asignación de recursos"]} />
            <RoleCard title="Legal / Cumplimiento" desc="Regulación y Evidencia" icon={<Scale className="w-8 h-8" />} color="success" list={["Evaluación de impacto", "Notificaciones a autoridades", "Gestión de evidencias"]} />
        </div>
    </div>
);

// ==========================================
// VISTA: GLOSARIO DE TÉRMINOS
// ==========================================
export const GlosarioView = () => (
    <div className="fade-in max-w-5xl mx-auto space-y-8 pb-10">
        {/* Cabecera */}
        <div className="theme-bg-container p-8 rounded-2xl border theme-border shadow-sm text-center sm:text-left flex flex-col sm:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-8 h-8 text-[var(--primary)]" />
            </div>
            <div>
                <h2 className="text-2xl sm:text-3xl font-bold theme-text-main mb-2">Glosario de Términos</h2>
                <p className="theme-text-muted text-sm sm:text-base">Conceptos clave de ciberseguridad para estandarizar la comunicación del equipo.</p>
            </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <GlossaryCard title="2FA (Two-Factor Auth)" desc="Capa extra de seguridad. Código temporal + contraseña." />
            <GlossaryCard title="Keylogger" desc="Malware que registra lo que tecleas para robar credenciales." />
            <GlossaryCard title="Phishing" desc="Suplantación de identidad para engañar a la víctima." />
            <GlossaryCard title="SIM Swapping" desc="Robo de número de teléfono para interceptar SMS." />
            <GlossaryCard title="Deepfake" desc="Audio/Video generado por IA para imitar a una persona real." />
            <GlossaryCard title="Token API" desc="Llave digital que conecta apps externas a tu cuenta." />
        </div>
    </div>
);

// ==========================================
// VISTA: PROTOCOLO RRSS
// ==========================================
export const ProtocoloRRSSView = () => {
    return (
        <div className="fade-in max-w-5xl mx-auto space-y-8 pb-10">
            
            {/* Cabecera */}
            <div className="theme-bg-container p-8 rounded-2xl border theme-border shadow-sm text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 relative print:border-none print:shadow-none print:p-0">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                        <ShieldAlert className="w-8 h-8 text-[var(--primary)]" />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold theme-text-main mb-2">Protocolo atención en RRSS Innova</h2> {/*[cite: 5] */}
                        <p className="theme-text-muted text-sm sm:text-base">
                            Definir un protocolo para manejar las incidencias de las redes tiene sentido en la medida en que contribuye a proteger el prestigio de Innova y evitar que una comunidad dispuesta a escuchar e interactuar, se convierta en una comunidad tóxica anclada en la crítica destructiva.
                        </p> {/*[cite: 5] */}
                    </div>
                </div>
                <button onClick={() => window.print()} className="px-4 py-2 bg-[var(--primary)] hover:brightness-110 text-white rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2 no-print whitespace-nowrap">
                    <Printer className="w-4 h-4"/> Imprimir Protocolo
                </button>
            </div>

            {/* Objetivo */}
            <div className="theme-bg-low p-6 rounded-2xl border theme-border flex items-start gap-4 shadow-sm">
                <Target className="w-6 h-6 text-[var(--primary)] flex-shrink-0 mt-1" />
                <div>
                    <h3 className="font-bold theme-text-main text-lg mb-1">Objetivo</h3> {/*[cite: 5] */}
                    <p className="text-sm theme-text-main opacity-90">
                        El presente documento tiene por objetivo establecer el procedimiento para alinear la comunicación de redes sociales a la estrategia actual de Innova Schools, con el fin de servir como protocolo de actuación que permita orientar a los colaboradores que integran el departamento de comunicación en redes sociales.
                    </p> {/*[cite: 5] */}
                </div>
            </div>

            {/* Definición y Detección */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <h3 className="text-lg font-bold theme-text-main flex items-center gap-2 border-b theme-border pb-2">
                        <Info className="w-5 h-5 text-[var(--primary)]" /> ¿Qué es una incidencia en redes sociales?
                    </h3> {/*[cite: 5] */}
                    <p className="text-sm theme-text-muted mb-4">
                        Situaciones que producen un pico de comentarios negativos hacía Innova, (bien sean críticas o incluso burlas) durante un periodo de tiempo específico. Estas incidencias pueden variar en gravedad y origen, pero algunas de las más comunes incluyen:
                    </p> {/*[cite: 5] */}
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3 text-sm theme-text-main"><AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5"/> <span className="opacity-90"><strong>Comentarios negativos de padres o estudiantes:</strong> Críticas públicas sobre la calidad de la educación, el trato por parte de los docentes o el personal en general, las instalaciones o cualquier otro aspecto de la escuela.</span></li> {/*[cite: 5] */}
                        <li className="flex items-start gap-3 text-sm theme-text-main"><AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5"/> <span className="opacity-90"><strong>Comentarios negativos en GMB</strong></span></li> {/*[cite: 5] */}
                        <li className="flex items-start gap-3 text-sm theme-text-main"><AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5"/> <span className="opacity-90"><strong>Problemas de seguridad o bienestar:</strong> Publicaciones sobre incidentes de acoso, intimidación, discriminación, violencia, accidentes en campus u otros problemas de seguridad que afectan a los estudiantes.</span></li> {/*[cite: 5] */}
                        <li className="flex items-start gap-3 text-sm theme-text-main"><AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5"/> <span className="opacity-90"><strong>Quejas sobre políticas o decisiones:</strong> Descontento público relacionado con políticas escolares, decisiones de la administración, cambios en el currículo, etc.</span></li> {/*[cite: 5] */}
                        <li className="flex items-start gap-3 text-sm theme-text-main"><AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5"/> <span className="opacity-90"><strong>Publicaciones inapropiadas de estudiantes o personal:</strong> Publicaciones en redes sociales por parte de estudiantes o personal de la escuela que puedan ser consideradas inapropiadas, ofensivas o controvertidas.</span></li> {/*[cite: 5] */}
                        <li className="flex items-start gap-3 text-sm theme-text-main"><AlertCircle className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5"/> <span className="opacity-90"><strong>Situaciones sociales:</strong> Quejas o comentarios negativos de vecinos, o comunidad cercana a las instalaciones de algún campus de Innova.</span></li> {/*[cite: 5] */}
                    </ul>
                </div>

                <div className="space-y-4">
                    <h3 className="text-lg font-bold theme-text-main flex items-center gap-2 border-b theme-border pb-2">
                        <Activity className="w-5 h-5 text-[var(--primary)]" /> ¿Cómo saber si es una incidencia?
                    </h3> {/*[cite: 5] */}
                    <div className="theme-bg-container rounded-2xl border theme-border p-5 space-y-4 shadow-sm">
                        <p className="text-sm theme-text-main font-bold mb-2">Señales de alerta:</p>
                        <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs font-bold">a</span>
                            <p className="text-sm theme-text-main opacity-90">El volumen de comentarios o reacciones negativas se dispara en un momento específico.</p> {/*[cite: 5] */}
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs font-bold">b</span>
                            <p className="text-sm theme-text-main opacity-90">Las críticas suben de tono y pasan a otros escenarios de influencia, lejos de las redes.</p> {/*[cite: 5] */}
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center text-xs font-bold">c</span>
                            <p className="text-sm theme-text-main opacity-90">El flujo de actividad relacionada con la situación negativa se extiende durante varios días o incluso semanas.</p> {/*[cite: 5] */}
                        </div>
                        <div className="mt-4 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                                Es importante tener claro que no todas las críticas, ni comentarios negativos suponen una incidencia, por ello es necesario categorizar las críticas para las respuestas oportunas y adecuadas.
                            </p> {/*[cite: 5] */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Categorización de Riesgos */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold theme-text-main flex items-center gap-2 border-b theme-border pb-2">
                    <AlertTriangle className="w-5 h-5 text-[var(--primary)]" /> Categorización de Riesgos
                </h3> {/*[cite: 5] */}
                <p className="text-sm theme-text-muted mb-4">Esta tabla proporciona una guía para evaluar y categorizar los distintos niveles de riesgo en función de su gravedad y el impacto potencial en la reputación y operación de Innova.</p> {/*[cite: 5] */}
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Bajo */}
                    <div className="p-5 rounded-xl border bg-green-50/50 border-green-200 dark:bg-green-900/10 dark:border-green-900/30 flex flex-col h-full shadow-sm">
                        <div className="flex items-center gap-2 mb-3"><span className="w-3 h-3 rounded-full bg-green-500"></span><h4 className="font-bold text-green-800 dark:text-green-400">Nivel Bajo</h4></div> {/*[cite: 5] */}
                        <p className="text-sm theme-text-main mb-3 opacity-90 italic">Riesgos de menor impacto que pueden manejarse fácilmente sin afectar significativamente la reputación de Innova.</p> {/*[cite: 5] */}
                        <div className="mt-auto pt-3 border-t border-green-200 dark:border-green-800/50">
                            <p className="text-xs theme-text-main opacity-80"><strong>Ejemplos:</strong> Comentarios negativos sobre la institución y/o quejas de padres de familia o alumnos que no trascienden a otros espacios y que no son recurrentes.</p> {/*[cite: 5] */}
                        </div>
                    </div>
                    {/* Intermedio */}
                    <div className="p-5 rounded-xl border bg-yellow-50/50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-900/30 flex flex-col h-full shadow-sm">
                        <div className="flex items-center gap-2 mb-3"><span className="w-3 h-3 rounded-full bg-yellow-500"></span><h4 className="font-bold text-yellow-800 dark:text-yellow-400">Nivel Intermedio</h4></div> {/*[cite: 5] */}
                        <p className="text-sm theme-text-main mb-3 opacity-90 italic">Riesgos que tienen el potencial de generar una preocupación entre la comunidad escolar y pueden requerir una respuesta más proactiva para evitar que escalen.</p> {/*[cite: 5] */}
                        <div className="mt-auto pt-3 border-t border-yellow-200 dark:border-yellow-800/50">
                            <p className="text-xs theme-text-main opacity-80"><strong>Ejemplos:</strong> Difamación o calumnias, situaciones de acoso, bullying. Comentarios negativos en Google My Business.</p> {/*[cite: 5] */}
                        </div>
                    </div>
                    {/* Alto */}
                    <div className="p-5 rounded-xl border bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30 flex flex-col h-full shadow-sm">
                        <div className="flex items-center gap-2 mb-3"><span className="w-3 h-3 rounded-full bg-red-500"></span><h4 className="font-bold text-red-800 dark:text-red-400">Nivel Alto</h4></div> {/*[cite: 5] */}
                        <p className="text-sm theme-text-main mb-3 opacity-90 italic">Riesgos críticos que pueden tener un impacto significativo en la reputación y la operación normal de la escuela si no se maneja.</p> {/*[cite: 5] */}
                        <div className="mt-auto pt-3 border-t border-red-200 dark:border-red-800/50">
                            <p className="text-xs theme-text-main opacity-80"><strong>Ejemplos:</strong> Situaciones de emergencia, como accidentes en algún campus que ponen en riesgo la vida de cualquier persona, publicaciones inapropiadas de alumnos o personal que trascienden a otros espacios como medios masivos de comunicación. Situaciones que implican temas legales, o en los que intervienen autoridades.</p> {/*[cite: 5] */}
                        </div>
                    </div>
                </div>
            </div>

            {/* Plan de Manejo y Consideraciones */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold theme-text-main flex items-center gap-2 border-b theme-border pb-2">
                    <CheckCircle className="w-5 h-5 text-[var(--primary)]" /> Plan de Manejo y Consideraciones
                </h3> {/*[cite: 5] */}
                
                <div className="flex justify-center mb-6">
                    <div className="flex flex-wrap items-center gap-2 text-sm font-bold theme-text-main">
                        <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">Detección</span> ➡️ 
                        <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">Respuesta</span> ➡️ 
                        <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">Reacción</span> ➡️ 
                        <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">Recuperación</span> ➡️ 
                        <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg">Aprendizaje</span>
                    </div> {/*[cite: 5] */}
                </div>

                <div className="theme-bg-container rounded-2xl border theme-border p-5 shadow-sm">
                    <p className="text-sm theme-text-muted mb-4">Es necesario detectar el escenario en el que nos econtramos; uno de prevención en el que identificamos a tiempo una incidencia y actuamos antes de que salga de control, por otro lado detectamos la reacción en la que la incidencia ya salió de control. Debemos considerar lo siguiente:</p> {/*[cite: 5] */}
                    <ul className="space-y-3">
                        <li className="text-sm theme-text-main"><span className="font-bold text-[var(--primary)]">a) Respuesta oportuna:</span> Es fundamental actuar con prontitud para evitar que la situación se agrave. Si existen dudas acerca de la respuesta es indispensable antes tocar base con el equipo Innova.</li> {/*[cite: 5] */}
                        <li className="text-sm theme-text-main"><span className="font-bold text-[var(--primary)]">b) Empatía y profesionalismo:</span> Responder a los comentarios con empatía y mantener un tono profesional en todo momento.</li> {/*[cite: 5] */}
                        <li className="text-sm theme-text-main"><span className="font-bold text-[var(--primary)]">c) Ofrecer soluciones:</span> Si se trata de una queja válida, ofrecer soluciones concretas y transparentes.</li> {/*[cite: 5] */}
                        <li className="text-sm theme-text-main"><span className="font-bold text-[var(--primary)]">d) Canalizar la comunicación:</span> En casos más complejos, derivar la comunicación a instancias superiores o a canales privados para resolver la situación de manera más adecuada.</li> {/*[cite: 5] */}
                        <li className="text-sm theme-text-main"><span className="font-bold text-[var(--primary)]">e) Seguimiento:</span> Realizar un seguimiento de la incidencia para asegurarse de que se ha resuelto satisfactoriamente y tomar medidas para prevenir situaciones similares en el futuro.</li> {/*[cite: 5] */}
                    </ul>
                </div>
            </div>

            {/* Fases de Actuación Detalladas */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold theme-text-main flex items-center gap-2 border-b theme-border pb-2">
                    <FileText className="w-5 h-5 text-[var(--primary)]" /> Fases de Actuación Detalladas
                </h3> {/*[cite: 5] */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-5 theme-bg-low rounded-xl border theme-border shadow-sm">
                        <h4 className="font-bold theme-text-main flex items-center gap-2 mb-2"><Search className="w-4 h-4 text-[var(--primary)]"/> a) Detección de señales:</h4> {/*[cite: 5] */}
                        <p className="text-sm theme-text-main opacity-90">En esta fase realizamos un ejercicio de escucha activa permanente para identificar señales que reflejan una alerta. Se deben examinar las conversaciones en redes sociales, las menciones y comentarios de los usuarios para identificar a tiempo escenarios de riesgo. La detección temprana permite una respuesta más rápida y efectiva, lo que puede ayudar a mitigar el impacto negativo de la crisis.</p> {/*[cite: 5] */}
                    </div>
                    
                    <div className="p-5 theme-bg-low rounded-xl border theme-border shadow-sm">
                        <h4 className="font-bold theme-text-main flex items-center gap-2 mb-2"><MessageSquare className="w-4 h-4 text-[var(--primary)]"/> b) Respuesta:</h4> {/*[cite: 5] */}
                        <p className="text-sm theme-text-main opacity-90">Una vez que se detecta una incidencia en las redes sociales, la fase de respuesta implica tomar medidas inmediatas para abordar la situación. Se debe responder a los comentarios o publicaciones relevantes de manera oportuna y adecuada, mostrando empatía, profesionalismo y transparencia.</p> {/*[cite: 5] */}
                    </div>

                    <div className="p-5 theme-bg-low rounded-xl border theme-border shadow-sm">
                        <h4 className="font-bold theme-text-main flex items-center gap-2 mb-2"><Activity className="w-4 h-4 text-[var(--primary)]"/> c) Reacción:</h4> {/*[cite: 5] */}
                        <p className="text-sm theme-text-main opacity-90">Después de brindar la respuesta inicial, la fase de reacción implica seguir monitoreando de cerca la situación y ajustar la estrategia según sea necesario. Se deben evaluar continuamente las reacciones de la comunidad escolar y del público en general, y estar preparado para adaptarse a medida que evoluciona la incidencia. Es importante mantener una comunicación abierta y transparente durante esta fase para mantener la confianza y la credibilidad.</p> {/*[cite: 5] */}
                    </div>

                    <div className="p-5 theme-bg-low rounded-xl border theme-border shadow-sm">
                        <h4 className="font-bold theme-text-main flex items-center gap-2 mb-2"><RefreshCw className="w-4 h-4 text-[var(--primary)]"/> d) Recuperación</h4> {/*[cite: 5] */}
                        <p className="text-sm theme-text-main opacity-90">Una vez que la situación ha sido gestionada y está bajo control, comienza la fase de recuperación. En esta etapa, se trabaja para restaurar la reputación y la imagen Innova, así como para reconstruir las relaciones con la comunidad escolar y otros stakeholders afectados. Se pueden implementar estrategias de relaciones públicas y de marketing para destacar los aspectos positivos de la institución y demostrar el compromiso con la mejora continua.</p> {/*[cite: 5] */}
                    </div>

                    <div className="p-5 theme-bg-low rounded-xl border theme-border md:col-span-2 shadow-sm">
                        <h4 className="font-bold theme-text-main flex items-center gap-2 mb-2"><BookOpen className="w-4 h-4 text-[var(--primary)]"/> e) Aprendizaje</h4> {/*[cite: 5] */}
                        <p className="text-sm theme-text-main opacity-90">La fase final del plan para el manejo de incidencias en redes sociales es la fase de aprendizaje. Se lleva a cabo una evaluación exhaustiva de la incidencia, identificando lo que funcionó bien y lo que se podría mejorar en el futuro. Se documentan las lecciones aprendidas y se actualiza el protocolo de actuación en consecuencia, con el objetivo de estar mejor preparados para enfrentar futuras incidencias de manera más efectiva.</p> {/*[cite: 5] */}
                    </div>
                </div>

                <div className="mt-6 p-4 bg-[var(--primary)]/10 border border-[var(--primary)]/20 rounded-xl text-center shadow-sm">
                    <p className="text-sm font-bold theme-text-main">
                        Es importante documentar la incidencia en la matriz de seguimiento con el fin de dar continuidad al caso y seguimiento del mismo. Y en cualquier caso independientemente de su nivel de riesgo, dar aviso al responsable del departamento de comunicación.
                    </p> {/*[cite: 5] */}
                </div>
            </div>
        </div>
    );
};