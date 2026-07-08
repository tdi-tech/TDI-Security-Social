import React, { useState } from 'react';
import { 
    AlertTriangle, ShieldAlert, CheckCircle, Activity, 
    AlertCircle, FileText, Target, Search, MessageSquare, RefreshCw, 
    BookOpen, Printer, Key, Smartphone, Laptop, Archive, 
    Mail, Bot, UserX, Users, UserCog, Scale, Trash2, Info, ChevronDown
} from 'lucide-react';

// ==========================================
// VISTA: PROTOCOLO DE HACKEOS
// ==========================================
export const StaticProtocoloView = () => (
    <div className="fade-in max-w-5xl mx-auto space-y-12 pb-16">
        
        {/* Hero Header Corporativo */}
        <div className="theme-bg-container p-6 sm:p-10 rounded-[2rem] border theme-border shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-700">
                <ShieldAlert className="w-48 h-48" />
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                    <p className="text-xs font-bold text-[var(--primary)] uppercase tracking-widest mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4" /> Seguridad IT
                    </p>
                    <h2 className="text-4xl font-black theme-text-main mb-4 tracking-tight">Protocolo de Respuesta a Incidentes</h2>
                    <p className="theme-text-muted text-base max-w-2xl leading-relaxed">
                        Lineamientos oficiales para <strong>prevenir, detectar, contener, erradicar y recuperar</strong> cuentas corporativas ante un incidente de ciberseguridad.
                    </p>
                </div>
                <button type="button" onClick={() => window.print()} className="px-6 py-3 bg-[var(--primary)] hover:brightness-110 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 no-print whitespace-nowrap">
                    <Printer className="w-4 h-4"/> Imprimir Protocolo
                </button>
            </div>
        </div>

        {/* 1. Principios - Tarjetas Premium Fluidas */}
        <div className="print:break-inside-avoid px-4 sm:px-8 space-y-8">
            <h3 className="text-2xl font-black theme-text-main flex items-center gap-3 border-b-2 border-gray-200 dark:border-gray-800 pb-3 inline-flex">
                <CheckCircle className="w-6 h-6 text-[var(--primary)]" /> 1. Principios de Prevención
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="theme-bg-low p-6 rounded-2xl border theme-border shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[var(--success)]/50 transition-all duration-300 flex flex-col h-full group">
                    <Key className="w-8 h-8 text-[var(--success)] mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold theme-text-main text-lg mb-2">Credenciales Únicas</h4>
                    <p className="text-sm theme-text-muted leading-relaxed flex-1">Mínimo 12 caracteres, uso estricto y prohibición de reutilización en otras plataformas.</p>
                </div>
                <div className="theme-bg-low p-6 rounded-2xl border theme-border shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[var(--success)]/50 transition-all duration-300 flex flex-col h-full group">
                    <Smartphone className="w-8 h-8 text-[var(--success)] mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold theme-text-main text-lg mb-2">2FA Obligatorio</h4>
                    <p className="text-sm theme-text-muted leading-relaxed flex-1">Uso exclusivo de aplicaciones autenticadoras (Authy/Google Authenticator), nunca SMS.</p>
                </div>
                <div className="theme-bg-low p-6 rounded-2xl border theme-border shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[var(--success)]/50 transition-all duration-300 flex flex-col h-full group">
                    <Laptop className="w-8 h-8 text-[var(--success)] mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold theme-text-main text-lg mb-2">Equipos Exclusivos</h4>
                    <p className="text-sm theme-text-muted leading-relaxed flex-1">Prohibida la descarga de torrents, software no oficial o navegación de uso personal.</p>
                </div>
                <div className="theme-bg-low p-6 rounded-2xl border theme-border shadow-sm hover:shadow-md hover:-translate-y-1 hover:border-[var(--success)]/50 transition-all duration-300 flex flex-col h-full group">
                    <Archive className="w-8 h-8 text-[var(--success)] mb-4 group-hover:scale-110 transition-transform" />
                    <h4 className="font-bold theme-text-main text-lg mb-2">Bóveda Secreta</h4>
                    <p className="text-sm theme-text-muted leading-relaxed flex-1">Uso obligatorio de gestores (Bitwarden/1Password). Prohibido guardar en navegadores.</p>
                </div>
            </div>
        </div>

        {/* 2. Fases de Respuesta - Numeración Gigante */}
        <div className="print:break-inside-avoid px-4 sm:px-8 pt-6">
            <div className="border-b theme-border pb-6 mb-8">
                <h3 className="text-2xl font-black theme-text-main flex items-center gap-3">
                    <Activity className="w-6 h-6 text-[var(--primary)]" /> 2. Fases de Respuesta Operativa
                </h3>
            </div>
            
            <div className="space-y-12 pl-4">
                {/* Fase 1 */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                    <div className="w-24 flex-shrink-0">
                        <span className="text-5xl font-black text-yellow-500 opacity-20">01</span>
                    </div>
                    <div>
                        <h4 className="font-black text-yellow-600 dark:text-yellow-500 text-xl mb-2 flex items-center gap-3">
                            Detección
                            <span className="text-[10px] font-bold bg-yellow-500/10 px-2 py-1 rounded uppercase tracking-widest">0-10 min</span>
                        </h4>
                        <ul className="space-y-3 mt-4">
                            <li className="flex gap-3 text-base theme-text-main opacity-90"><span className="text-yellow-500 mt-1">●</span> Preservar evidencia de manera inmediata (tomar capturas, guardar logs y copiar URLs exactas).</li>
                            <li className="flex gap-3 text-base theme-text-main opacity-90"><span className="text-yellow-500 mt-1">●</span> Reportar el evento internamente al equipo de TI mediante un canal alterno y seguro.</li>
                        </ul>
                    </div>
                </div>

                {/* Fase 2 */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                    <div className="w-24 flex-shrink-0">
                        <span className="text-5xl font-black text-red-500 opacity-20">02</span>
                    </div>
                    <div>
                        <h4 className="font-black text-red-600 dark:text-red-500 text-xl mb-2 flex items-center gap-3">
                            Contención
                            <span className="text-[10px] font-bold bg-red-500/10 px-2 py-1 rounded uppercase tracking-widest">10-60 min</span>
                        </h4>
                        <ul className="space-y-3 mt-4">
                            <li className="flex gap-3 text-base theme-text-main opacity-90"><span className="text-red-500 mt-1">●</span> <strong>Cambiar las contraseñas inmediatamente desde un dispositivo completamente limpio.</strong></li>
                            <li className="flex gap-3 text-base theme-text-main opacity-90"><span className="text-red-500 mt-1">●</span> Forzar el cierre de sesiones activas en todos los dispositivos y revocar accesos a aplicaciones de terceros.</li>
                        </ul>
                    </div>
                </div>

                {/* Fase 3 */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                    <div className="w-24 flex-shrink-0">
                        <span className="text-5xl font-black text-orange-500 opacity-20">03</span>
                    </div>
                    <div>
                        <h4 className="font-black text-orange-600 dark:text-orange-500 text-xl mb-2 flex items-center gap-3">
                            Erradicación
                        </h4>
                        <ul className="space-y-3 mt-4">
                            <li className="flex gap-3 text-base theme-text-main opacity-90"><span className="text-orange-500 mt-1">●</span> Escaneo profundo con software antimalware autorizado o formateo total del equipo infectado.</li>
                            <li className="flex gap-3 text-base theme-text-main opacity-90"><span className="text-orange-500 mt-1">●</span> Rotación masiva de todos los tokens de acceso, webhooks y claves API potencialmente expuestas.</li>
                        </ul>
                    </div>
                </div>

                {/* Fase 4 */}
                <div className="flex flex-col md:flex-row gap-6 md:gap-12">
                    <div className="w-24 flex-shrink-0">
                        <span className="text-5xl font-black text-emerald-500 opacity-20">04</span>
                    </div>
                    <div>
                        <h4 className="font-black text-emerald-600 dark:text-emerald-500 text-xl mb-2 flex items-center gap-3">
                            Recuperación
                        </h4>
                        <ul className="space-y-3 mt-4">
                            <li className="flex gap-3 text-base theme-text-main opacity-90"><span className="text-emerald-500 mt-1">●</span> Restaurar el contenido legítimo y la imagen visual institucional en las plataformas afectadas.</li>
                            <li className="flex gap-3 text-base theme-text-main opacity-90"><span className="text-emerald-500 mt-1">●</span> Implementar un monitoreo técnico intensivo de comportamiento durante las 72 horas posteriores.</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. Amenazas IA */}
        <div className="print:break-inside-avoid px-4 sm:px-8 pt-6">
            <div className="border-b theme-border pb-6 mb-8">
                <h3 className="text-2xl font-black theme-text-main flex items-center gap-3">
                    <Bot className="w-6 h-6 text-[var(--primary)]" /> 3. Amenazas Impulsadas por IA
                </h3>
            </div>
            
            <div className="border-l-4 border-[var(--primary)] pl-6 py-2 mb-8">
                <p className="font-bold theme-text-main text-lg flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-[var(--primary)]"/> Regla de Oro
                </p>
                <p className="text-base theme-text-muted mt-2">
                    Toda solicitud inusual, urgente o que involucre credenciales/dinero debe verificarse siempre por un canal secundario (llamada telefónica o videollamada), sin excepciones.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 pl-6">
                <div className="space-y-3">
                    <Mail className="w-6 h-6 text-[var(--primary)]" /> 
                    <h4 className="font-bold theme-text-main">Phishing Hiper-personalizado</h4>
                    <p className="text-sm theme-text-muted leading-relaxed">Campañas generadas automáticamente mediante análisis de redes sociales para engañar con contexto real.</p>
                </div>
                <div className="space-y-3">
                    <MessageSquare className="w-6 h-6 text-[var(--primary)]" /> 
                    <h4 className="font-bold theme-text-main">Suplantación de Identidad</h4>
                    <p className="text-sm theme-text-muted leading-relaxed">Clonación del estilo exacto de redacción en correos o mensajes directos para hacerse pasar por directivos o proveedores.</p>
                </div>
                <div className="space-y-3">
                    <UserX className="w-6 h-6 text-[var(--primary)]" /> 
                    <h4 className="font-bold theme-text-main">Deepfakes</h4>
                    <p className="text-sm theme-text-muted leading-relaxed">Audios y videos manipulados utilizados para engañar a los sistemas biométricos de recuperación de cuentas o al personal.</p>
                </div>
            </div>
        </div>
    </div>
);


// ==========================================
// VISTA: COMITÉ DE INCIDENTES (ROLES - TIMELINE PURO)
// ==========================================
const rolesTimelineData = [
    {
        id: 'step-cm',
        title: 'Community Manager',
        subtitle: 'Primera Línea de Defensa',
        icon: UserCog,
        color: 'text-blue-500',
        lineColor: 'bg-blue-500',
        details: 'El Community Manager actúa como el centinela principal de la marca. Es el primer filtro operativo y el encargado directo de detectar anomalías en la interacción de la comunidad. Su objetivo es frenar la escalada inicial del incidente antes de que alcance proporciones críticas.',
        responsibilities: [
            'Detección y reporte inmediato de comportamientos anómalos, publicaciones no autorizadas o accesos no reconocidos.',
            'Contención básica en plataformas (ocultar contenido nocivo, pausar interacciones o comentarios públicos).',
            'Documentación forense inicial (resguardo inmediato de URLs exactas, capturas de pantalla de la intrusión).',
            'Mantener el canal de comunicación primaria con la audiencia si la plataforma sigue activa y bajo control.'
        ]
    },
    {
        id: 'step-it',
        title: 'TI / Soporte Técnico',
        subtitle: 'Análisis y Limpieza',
        icon: Laptop,
        color: 'text-purple-500',
        lineColor: 'bg-purple-500',
        details: 'Equipo tecnológico especializado encargado de asegurar la infraestructura subyacente. Su misión primordial es aislar la amenaza, investigar el origen de la brecha y restablecer el control absoluto sobre todos los activos digitales de la empresa.',
        responsibilities: [
            'Análisis forense profundo para determinar el vector de ataque exacto (Phishing, malware, robo de sesión).',
            'Limpieza profunda de la infraestructura (erradicación de malware, revocación de tokens OAuth y conexiones API).',
            'Forzar cierres de sesión globales, cambiar contraseñas y aplicar protocolos estrictos de Zero-Trust.',
            'Implementación de monitoreo técnico intensivo durante las 72 horas posteriores a la fase de recuperación.'
        ]
    },
    {
        id: 'step-mkt',
        title: 'Marketing / Dirección',
        subtitle: 'Toma de Decisiones Estratégicas',
        icon: Target,
        color: 'text-orange-500',
        lineColor: 'bg-orange-500',
        details: 'El nivel directivo evalúa el impacto del incidente a nivel corporativo y de negocio. Se encarga de orquestar los recursos financieros y humanos necesarios para mitigar el daño mediático y proteger el prestigio institucional.',
        responsibilities: [
            'Revisión, validación y aprobación final de los comunicados oficiales dirigidos al público y medios de prensa.',
            'Decisión sobre la suspensión estratégica de pautas y campañas publicitarias activas para evitar disonancia cognitiva.',
            'Asignación extraordinaria de recursos externos (agencias o consultores) para contener la crisis de reputación.',
            'Liderazgo en la estructuración de la estrategia general de relaciones públicas post-incidente.'
        ]
    },
    {
        id: 'step-legal',
        title: 'Legal / Cumplimiento',
        subtitle: 'Regulación y Evidencia',
        icon: Scale,
        color: 'text-emerald-500',
        lineColor: 'bg-emerald-500',
        details: 'El área normativa asegura que el manejo integral de la crisis cumpla con la ley vigente. Su función es blindar a la organización ante posibles demandas, multas regulatorias o repercusiones jurídicas derivadas de la exposición de datos.',
        responsibilities: [
            'Evaluación legal experta sobre la exposición de datos sensibles, propiedad intelectual de usuarios o clientes.',
            'Notificaciones formales y obligatorias a las autoridades gubernamentales competentes en caso de fuga de datos.',
            'Supervisión rigurosa y custodia legal de las evidencias digitales (logs de conexión, IPs, mensajes extorsivos).',
            'Revisión estricta de cualquier disculpa pública para evitar la admisión de responsabilidades legales no comprobadas.'
        ]
    }
];

export const RolesView = () => {
    const [activeStep, setActiveStep] = useState<number>(0);

    return (
        <div className="fade-in max-w-5xl mx-auto space-y-12 pb-16">
            {/* Hero Header Corporativo */}
            <div className="theme-bg-container p-6 sm:p-10 rounded-[2rem] border theme-border shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-700">
                    <Users className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                    <p className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4" /> Comité de Crisis Operativa
                    </p>
                    <h2 className="text-4xl font-black theme-text-main mb-4 tracking-tight">Roles y Responsabilidades</h2>
                    <p className="theme-text-muted text-base max-w-2xl leading-relaxed">
                        Flujo de escalamiento y responsabilidad operativa de cada área al enfrentar un hackeo, infección o pérdida de control en los activos digitales de la empresa.
                    </p>
                </div>
            </div>

            {/* Timeline Puro (Cero Cards, Cero Cajas) */}
            <div className="px-4 sm:px-12 max-w-4xl mx-auto">
                <div className="relative">
                    {/* Línea vertical de fondo */}
                    <div className="absolute left-[19px] sm:left-[23px] top-8 bottom-8 w-0.5 bg-gray-200 dark:bg-gray-800 z-0"></div>

                    <div className="space-y-8">
                        {rolesTimelineData.map((role, idx) => {
                            const isActive = activeStep === idx;
                            const isCompleted = activeStep > idx;
                            const IconComponent = role.icon;

                            return (
                                <div key={role.id} className="relative z-10 flex gap-6 sm:gap-10">
                                    {/* Nodo del Timeline (Ícono) */}
                                    <div className="flex flex-col items-center pt-1">
                                        <button 
                                            type="button"
                                            onClick={() => setActiveStep(idx)}
                                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 relative z-10 cursor-pointer ${
                                                isActive ? `${role.lineColor} text-white shadow-md scale-110` 
                                                : isCompleted ? `${role.lineColor} text-white opacity-50 hover:opacity-100`
                                                : 'bg-[var(--background)] text-gray-400 border-2 border-gray-300 dark:border-gray-700 hover:border-gray-500'
                                            }`}
                                        >
                                            <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </button>
                                    </div>

                                    {/* Contenido Editorial del Paso */}
                                    <div className="flex-1 pb-4">
                                        {/* Título clickeable */}
                                        <button 
                                            type="button"
                                            onClick={() => setActiveStep(idx)}
                                            className="text-left w-full group cursor-pointer"
                                        >
                                            <p className={`text-xs font-bold uppercase tracking-widest mb-1.5 transition-colors ${isActive ? role.color : 'text-gray-400 group-hover:text-gray-500'}`}>
                                                Paso 0{idx + 1}
                                            </p>
                                            <div className="flex items-start justify-between gap-4">
                                                <div>
                                                    <h3 className={`text-2xl sm:text-3xl font-black transition-colors tracking-tight ${isActive ? 'theme-text-main' : 'theme-text-muted group-hover:theme-text-main'}`}>
                                                        {role.title}
                                                    </h3>
                                                    <p className={`text-base font-medium mt-1.5 transition-colors ${isActive ? 'theme-text-main' : 'theme-text-muted'}`}>
                                                        {role.subtitle}
                                                    </p>
                                                </div>
                                                <div className={`mt-2 transition-transform duration-300 flex-shrink-0 ${isActive ? 'rotate-180' : 'rotate-0'}`}>
                                                    <ChevronDown className={`w-6 h-6 ${isActive ? role.color : 'text-gray-300 dark:text-gray-700'}`} />
                                                </div>
                                            </div>
                                        </button>

                                        {/* Contenido Expandible Libre (Sin cajas/cards) */}
                                        <div className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${isActive ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                                            <div className="overflow-hidden">
                                                <div className="pt-6 pr-2 sm:pr-8">
                                                    <p className="text-base theme-text-main leading-relaxed mb-8 opacity-90">
                                                        {role.details}
                                                    </p>
                                                    <h4 className="font-bold theme-text-main text-xs uppercase tracking-widest mb-5 flex items-center gap-2 opacity-60">
                                                        Responsabilidades Asignadas
                                                    </h4>
                                                    <ul className="space-y-5">
                                                        {role.responsibilities.map((resp, i) => (
                                                            <li key={i} className="flex items-start gap-4">
                                                                <span className={`text-lg leading-none ${role.color}`}>—</span>
                                                                <p className="text-base theme-text-main leading-relaxed opacity-90">{resp}</p>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================
// VISTA: GLOSARIO DE TÉRMINOS
// ==========================================
export const GlosarioView = () => (
    <div className="fade-in max-w-5xl mx-auto space-y-12 pb-16">
        {/* Hero Header Corporativo */}
        <div className="theme-bg-container p-6 sm:p-10 rounded-[2rem] border theme-border shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-700">
                <BookOpen className="w-48 h-48" />
            </div>
            <div className="relative z-10">
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Info className="w-4 h-4" /> Centro de Conocimiento
                </p>
                <h2 className="text-4xl font-black theme-text-main mb-4 tracking-tight">Glosario de Términos</h2>
                <p className="theme-text-muted text-base max-w-2xl leading-relaxed">
                    Conceptos clave de ciberseguridad, amenazas digitales y terminología técnica para estandarizar el lenguaje del equipo y prevenir confusiones.
                </p>
            </div>
        </div>
        
        {/* Diccionario Editorial (Lista Plana, sin cajas) */}
        <div className="px-4 sm:px-12 max-w-4xl mx-auto space-y-10">
            <div>
                <h4 className="font-black text-2xl theme-text-main mb-3">2FA (Two-Factor Authentication)</h4>
                <p className="text-base theme-text-muted leading-relaxed">Capa extra de seguridad obligatoria en los accesos corporativos. Requiere ingresar un código temporal dinámico generado en un dispositivo móvil vinculado, adicional a la contraseña tradicional.</p>
            </div>
            <div className="border-t theme-border pt-8">
                <h4 className="font-black text-2xl theme-text-main mb-3">Keylogger</h4>
                <p className="text-base theme-text-muted leading-relaxed">Tipo de software o hardware malicioso que se instala silenciosamente y registra cada pulsación en el teclado del usuario con el objetivo de capturar y robar credenciales bancarias o corporativas.</p>
            </div>
            <div className="border-t theme-border pt-8">
                <h4 className="font-black text-2xl theme-text-main mb-3">Phishing</h4>
                <p className="text-base theme-text-muted leading-relaxed">Técnica de ingeniería social que suplanta la identidad de empresas conocidas, plataformas oficiales o directivos mediante correos electrónicos o mensajes directos para engañar a la víctima y extraer su información confidencial.</p>
            </div>
            <div className="border-t theme-border pt-8">
                <h4 className="font-black text-2xl theme-text-main mb-3">SIM Swapping</h4>
                <p className="text-base theme-text-muted leading-relaxed">Ataque físico y digital complejo donde el cibercriminal suplanta a la víctima ante su operadora telefónica para clonar o robar su número de celular. El objetivo principal es interceptar los SMS para vulnerar cuentas con seguridad débil (SMS como 2FA).</p>
            </div>
            <div className="border-t theme-border pt-8">
                <h4 className="font-black text-2xl theme-text-main mb-3">Deepfake</h4>
                <p className="text-base theme-text-muted leading-relaxed">Contenido audiovisual hiperrealista generado o manipulado por Inteligencia Artificial, diseñado de manera fraudulenta para imitar con exactitud la voz, el rostro o los gestos de una persona real en tiempo real o grabaciones.</p>
            </div>
            <div className="border-t theme-border pt-8">
                <h4 className="font-black text-2xl theme-text-main mb-3">Token API / Autorización OAuth</h4>
                <p className="text-base theme-text-muted leading-relaxed">Llave de autorización digital invisible que permite conectar y otorgar permisos de lectura o escritura a plataformas de terceros (como Metricool o Hootsuite) directamente dentro de la cuenta corporativa principal sin necesidad de compartir contraseñas.</p>
            </div>
        </div>
    </div>
);

// ==========================================
// VISTA: PROTOCOLO RRSS
// ==========================================
export const ProtocoloRRSSView = () => {
    return (
        <div className="fade-in max-w-5xl mx-auto space-y-12 pb-16 print:pb-0">
            
            {/* Hero Header Corporativo */}
            <div className="theme-bg-container p-6 sm:p-10 rounded-[2rem] border theme-border shadow-sm relative overflow-hidden group print:border-none print:shadow-none print:p-0">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-105 group-hover:-rotate-3 transition-transform duration-700 no-print">
                    <MessageSquare className="w-48 h-48" />
                </div>
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                    <div>
                        <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                            <AlertCircle className="w-4 h-4" /> Reputación Digital
                        </p>
                        <h2 className="text-4xl font-black theme-text-main mb-4 tracking-tight">Protocolo de Atención en RRSS</h2>
                        <p className="theme-text-muted text-base max-w-2xl leading-relaxed">
                            Procedimientos oficiales para gestionar crisis mediáticas y proteger el prestigio institucional de Innova Schools en canales sociales.
                        </p> 
                    </div>
                    <button type="button" onClick={() => window.print()} className="px-6 py-3 bg-[var(--primary)] hover:brightness-110 text-white rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 no-print whitespace-nowrap hover:-translate-y-0.5">
                        <Printer className="w-4 h-4"/> Imprimir Protocolo
                    </button>
                </div>
            </div>

            {/* Objetivo (Estilo Cita Editorial) */}
            <div className="px-4 sm:px-8">
                <h3 className="font-black text-2xl theme-text-main mb-6 flex items-center gap-3">
                    <Target className="w-6 h-6 text-[var(--primary)]" /> Objetivo General
                </h3>
                <p className="text-lg theme-text-main opacity-90 leading-relaxed max-w-4xl font-serif italic border-l-4 border-[var(--primary)] pl-6 py-2">
                    "Establecer el procedimiento para alinear la comunicación de redes sociales a la estrategia actual, con el fin de servir como protocolo de actuación que oriente a los colaboradores y evite que una comunidad dispuesta a interactuar se convierta en una comunidad tóxica anclada en la crítica destructiva."
                </p>
            </div>

            {/* Definición y Señales (Editorial Layout) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 px-4 sm:px-8 pt-8">
                <div className="space-y-6">
                    <h3 className="text-2xl font-black theme-text-main border-b-2 border-gray-200 dark:border-gray-800 pb-3 inline-block">
                        ¿Qué es una incidencia?
                    </h3>
                    <p className="text-base theme-text-muted leading-relaxed">
                        Situaciones que producen un pico de comentarios negativos hacia Innova durante un periodo específico. Las más comunes incluyen:
                    </p>
                    <ul className="space-y-5 mt-6 pl-4 border-l-2 border-orange-500/30">
                        <li className="flex items-start gap-4 text-base theme-text-main">
                            <span className="text-orange-500 font-bold mt-0.5">—</span> 
                            <span className="opacity-90 leading-relaxed"><strong>Críticas de padres o estudiantes:</strong> Sobre la calidad, el trato del personal o instalaciones.</span>
                        </li>
                        <li className="flex items-start gap-4 text-base theme-text-main">
                            <span className="text-orange-500 font-bold mt-0.5">—</span> 
                            <span className="opacity-90 leading-relaxed"><strong>Ataques en plataformas abiertas:</strong> Reseñas maliciosas o bombardeos en Google My Business.</span>
                        </li>
                        <li className="flex items-start gap-4 text-base theme-text-main">
                            <span className="text-orange-500 font-bold mt-0.5">—</span> 
                            <span className="opacity-90 leading-relaxed"><strong>Problemas de seguridad/bienestar:</strong> Acoso, intimidación, discriminación o accidentes en campus.</span>
                        </li>
                        <li className="flex items-start gap-4 text-base theme-text-main">
                            <span className="text-orange-500 font-bold mt-0.5">—</span> 
                            <span className="opacity-90 leading-relaxed"><strong>Filtraciones y controversias:</strong> Publicaciones inapropiadas del personal o quejas comunitarias vecinales.</span>
                        </li>
                    </ul>
                </div>

                <div className="space-y-6">
                    <h3 className="text-2xl font-black theme-text-main border-b-2 border-gray-200 dark:border-gray-800 pb-3 inline-block">
                        Señales de Alerta
                    </h3>
                    <div className="space-y-8 mt-6">
                        <div className="flex items-start gap-5">
                            <span className="text-4xl font-black text-[var(--primary)] opacity-40 leading-none">A</span>
                            <p className="text-base theme-text-main opacity-90 leading-relaxed mt-1">El volumen de interacciones y comentarios negativos se dispara abruptamente en un periodo muy corto.</p>
                        </div>
                        <div className="flex items-start gap-5">
                            <span className="text-4xl font-black text-[var(--primary)] opacity-40 leading-none">B</span>
                            <p className="text-base theme-text-main opacity-90 leading-relaxed mt-1">Las críticas suben de nivel de agresividad y se trasladan a escenarios de influencia fuera de las redes sociales oficiales.</p>
                        </div>
                        <div className="flex items-start gap-5">
                            <span className="text-4xl font-black text-[var(--primary)] opacity-40 leading-none">C</span>
                            <p className="text-base theme-text-main opacity-90 leading-relaxed mt-1">El flujo de actividad relacionada a la crisis se mantiene prolongado durante varios días consecutivos sin ceder.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categorización de Riesgos (Líneas Planas) */}
            <div className="space-y-12 px-4 sm:px-8 pt-12 border-t border-gray-200 dark:border-gray-800">
                <div>
                    <h3 className="text-3xl font-black theme-text-main mb-3">Matriz de Riesgos</h3>
                    <p className="text-base theme-text-muted max-w-3xl">Guía estructural para evaluar y categorizar el impacto potencial de la crisis sobre la reputación institucional.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    <div className="flex flex-col h-full">
                        <div className="h-1.5 w-full bg-green-500 rounded-full mb-6 opacity-80"></div>
                        <h4 className="font-black text-2xl text-green-700 dark:text-green-500 mb-4">Nivel Bajo</h4>
                        <p className="text-base theme-text-main mb-8 opacity-90 leading-relaxed">Riesgos de impacto menor, aislados y manejables internamente sin repercusiones graves para la institución.</p>
                        <div className="mt-auto">
                            <p className="text-sm theme-text-main opacity-70 leading-relaxed"><strong>Casos Típicos:</strong><br/>Quejas puntuales de padres o alumnos sin recurrencia ni viralización externa.</p>
                        </div>
                    </div>

                    <div className="flex flex-col h-full">
                        <div className="h-1.5 w-full bg-yellow-500 rounded-full mb-6 opacity-80"></div>
                        <h4 className="font-black text-2xl text-yellow-700 dark:text-yellow-500 mb-4">Nivel Intermedio</h4>
                        <p className="text-base theme-text-main mb-8 opacity-90 leading-relaxed">Situaciones con potencial de generar ruido sostenido en la comunidad, requiriendo acción proactiva y respuestas estructuradas.</p>
                        <div className="mt-auto">
                            <p className="text-sm theme-text-main opacity-70 leading-relaxed"><strong>Casos Típicos:</strong><br/>Reportes de bullying o difamación, bombardeos de reseñas negativas coordinadas.</p>
                        </div>
                    </div>

                    <div className="flex flex-col h-full">
                        <div className="h-1.5 w-full bg-red-500 rounded-full mb-6 opacity-80"></div>
                        <h4 className="font-black text-2xl text-red-700 dark:text-red-500 mb-4">Nivel Crítico</h4>
                        <p className="text-base theme-text-main mb-8 opacity-90 leading-relaxed">Riesgos mediáticos que comprometen la operación normal, integridad física o legalidad, escalando a la prensa.</p>
                        <div className="mt-auto">
                            <p className="text-sm theme-text-main opacity-70 leading-relaxed"><strong>Casos Típicos:</strong><br/>Accidentes con riesgo vital en campus, filtración de material sensible o intervención de autoridades.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ciclo de Vida y Fases */}
            <div className="space-y-12 px-4 sm:px-8 pt-12 border-t border-gray-200 dark:border-gray-800">
                
                <div className="flex flex-col mb-12">
                    <h3 className="text-2xl font-black theme-text-main mb-6">Ciclo de Vida de Resolución</h3>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-sm font-black theme-text-main">
                        <span className="text-[var(--primary)] uppercase tracking-widest bg-[var(--primary)]/10 px-5 py-2.5 rounded-lg">1. Detección</span> <span className="text-gray-300 dark:text-gray-700">→</span> 
                        <span className="text-[var(--primary)] uppercase tracking-widest bg-[var(--primary)]/10 px-5 py-2.5 rounded-lg">2. Respuesta</span> <span className="text-gray-300 dark:text-gray-700">→</span> 
                        <span className="text-[var(--primary)] uppercase tracking-widest bg-[var(--primary)]/10 px-5 py-2.5 rounded-lg">3. Reacción</span> <span className="text-gray-300 dark:text-gray-700">→</span> 
                        <span className="text-[var(--primary)] uppercase tracking-widest bg-[var(--primary)]/10 px-5 py-2.5 rounded-lg">4. Recuperación</span> <span className="text-gray-300 dark:text-gray-700">→</span> 
                        <span className="text-[var(--primary)] uppercase tracking-widest bg-[var(--primary)]/10 px-5 py-2.5 rounded-lg">5. Aprendizaje</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    <div className="space-y-8">
                        <h4 className="text-2xl font-black theme-text-main">Principios de Actuación</h4>
                        <p className="text-base theme-text-muted leading-relaxed">
                            Debemos distinguir rigurosamente si estamos en una fase de prevención o si estamos reaccionando a una crisis ya desatada.
                        </p>
                        <ul className="space-y-6">
                            <li className="flex gap-5"><span className="font-black text-2xl text-[var(--primary)]">A.</span> <span className="text-base theme-text-main opacity-90 leading-relaxed"><strong>Velocidad:</strong> Actuar con prontitud, escalando dudas al equipo Innova si no existe certeza sobre la estrategia.</span></li>
                            <li className="flex gap-5"><span className="font-black text-2xl text-[var(--primary)]">B.</span> <span className="text-base theme-text-main opacity-90 leading-relaxed"><strong>Empatía:</strong> Mantener un tono institucional, empático y estrictamente profesional en todo momento.</span></li>
                            <li className="flex gap-5"><span className="font-black text-2xl text-[var(--primary)]">C.</span> <span className="text-base theme-text-main opacity-90 leading-relaxed"><strong>Transparencia:</strong> Proveer soluciones concretas y viables ante quejas que estén debidamente fundamentadas.</span></li>
                            <li className="flex gap-5"><span className="font-black text-2xl text-[var(--primary)]">D.</span> <span className="text-base theme-text-main opacity-90 leading-relaxed"><strong>Aislamiento:</strong> Migrar conversaciones complejas a bandejas privadas (DM) para despresurizar el muro público.</span></li>
                        </ul>
                    </div>

                    <div className="space-y-8">
                        <h4 className="text-2xl font-black theme-text-main">Fases Detalladas</h4>
                        <div className="space-y-10 mt-2">
                            <div className="border-l-4 border-[var(--primary)]/50 pl-6">
                                <h5 className="font-bold theme-text-main text-lg flex items-center gap-2 mb-2"><Search className="w-5 h-5 text-[var(--primary)]"/> Detección de Señales</h5>
                                <p className="text-base theme-text-muted leading-relaxed">Escucha social activa constante. Revisión minuciosa de menciones y palabras clave para sofocar riesgos antes de su viralización incontrolable.</p>
                            </div>
                            <div className="border-l-4 border-[var(--primary)]/50 pl-6">
                                <h5 className="font-bold theme-text-main text-lg flex items-center gap-2 mb-2"><MessageSquare className="w-5 h-5 text-[var(--primary)]"/> Respuesta y Reacción</h5>
                                <p className="text-base theme-text-muted leading-relaxed">Aplicar el primer posicionamiento de la marca con transparencia, monitoreando el sentimiento y ajustando la comunicación según la agresividad de la comunidad.</p>
                            </div>
                            <div className="border-l-4 border-[var(--primary)]/50 pl-6">
                                <h5 className="font-bold theme-text-main text-lg flex items-center gap-2 mb-2"><RefreshCw className="w-5 h-5 text-[var(--primary)]"/> Recuperación y Aprendizaje</h5>
                                <p className="text-base theme-text-muted leading-relaxed">Despliegue escalonado de contenido positivo para diluir la crisis, seguido de una reunión forense para actualizar el manual operativo base.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};