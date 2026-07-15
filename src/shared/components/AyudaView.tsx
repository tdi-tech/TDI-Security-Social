import React from 'react';
import { 
    HelpCircle, ShieldAlert, Database, Users, FileText, 
    AlertTriangle, MessageSquareWarning, Info, Lock, Settings
} from 'lucide-react';

const helpTopics = [
    {
        id: 'intro',
        title: 'Introducción al Sistema',
        icon: <Info className="w-6 h-6 text-blue-500" />,
        badge: 'General',
        badgeColor: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
        content: (
            <div className="space-y-3 theme-text-main text-sm leading-relaxed">
                <p>
                    <strong>Innova Management</strong> es una plataforma de gestión de crisis y seguridad diseñada bajo una arquitectura <em>Zero-Trust</em> (Cero Confianza). 
                </p>
                <p className="theme-text-muted">
                    El sistema está dividido en tres módulos operativos principales (Hackeos, Crisis en RRSS y Comentarios) y módulos administrativos para el control total de la información.
                </p>
            </div>
        )
    },
    {
        id: 'roles',
        title: 'Roles y Permisos (RBAC)',
        icon: <Users className="w-6 h-6 text-purple-500" />,
        badge: 'Administración',
        badgeColor: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
        content: (
            <ul className="space-y-3 theme-text-main text-sm leading-relaxed">
                <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></span>
                    <p><strong className="theme-text-main">ADMIN_IT:</strong> Control absoluto. Gestión de Backups, Auditoría Avanzada y administración total de usuarios.</p>
                </li>
                <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></span>
                    <p><strong className="theme-text-main">ADMIN_CM:</strong> Control operativo. Acceso total a incidentes. Permite pre-registrar y deshabilitar usuarios (sin modificar roles IT).</p>
                </li>
                <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.6)]"></span>
                    <p><strong className="theme-text-main">EDITOR_CM:</strong> Nivel básico operativo. Capacidad de crear y editar incidentes sin acceso al panel de usuarios.</p>
                </li>
                <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                    <p><strong className="theme-text-main">Lector:</strong> Visualización de Dashboard y protocolos. Sin permisos de escritura.</p>
                </li>
            </ul>
        )
    },
    {
        id: 'modulos',
        title: 'Gestión de Reportes',
        icon: <FileText className="w-6 h-6 text-emerald-500" />,
        badge: 'Operativo',
        badgeColor: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        content: (
            <div className="space-y-4 theme-text-main text-sm leading-relaxed">
                <div className="flex gap-3 items-start group/item">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                    <div>
                        <p className="font-bold text-xs uppercase tracking-wider mb-0.5 theme-text-main">Hackeos</p>
                        <p className="theme-text-muted text-xs">Vulnerabilidades, malware y robo de cuentas oficiales. Incluye checklist de contención técnica inmediata.</p>
                    </div>
                </div>
                <div className="flex gap-3 items-start group/item">
                    <ShieldAlert className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                    <div>
                        <p className="font-bold text-xs uppercase tracking-wider mb-0.5 theme-text-main">Incidencias RRSS</p>
                        <p className="theme-text-muted text-xs">Registro y gestión de quejas críticas o crisis reputacionales originadas en cualquier red social oficial.</p>
                    </div>
                </div>
                <div className="flex gap-3 items-start group/item">
                    <MessageSquareWarning className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform" />
                    <div>
                        <p className="font-bold text-xs uppercase tracking-wider mb-0.5 theme-text-main">Comentarios</p>
                        <p className="theme-text-muted text-xs">Reportes unificados de interacción comunitaria y trazabilidad de quejas.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'configuracion',
        title: 'Panel de Configuración',
        icon: <Settings className="w-6 h-6 text-slate-500" />,
        badge: 'Sistema',
        badgeColor: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
        content: (
            <ul className="space-y-3 theme-text-main text-sm leading-relaxed">
                <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 flex-shrink-0"></span>
                    <p><strong className="theme-text-main">ADMIN_IT:</strong> Acceso a preferencias de notificación, purga de rastros del servidor y liberación de memoria caché.</p>
                </li>
                <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 flex-shrink-0"></span>
                    <p><strong className="theme-text-main">Equipo CM:</strong> Control sobre tema visual y personalización de alertas sonoras por módulo operativo.</p>
                </li>
                <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 flex-shrink-0"></span>
                    <p><strong className="theme-text-main">Lectores:</strong> Acceso exclusivo al cambio de Tema (Claro/Oscuro).</p>
                </li>
            </ul>
        )
    },
    {
        id: 'backups',
        title: 'Gestión de Backups',
        icon: <Database className="w-6 h-6 text-teal-500" />,
        badge: 'Exclusivo IT',
        badgeColor: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
        requireAdmin: true,
        content: (
            <div className="space-y-3 theme-text-main text-sm leading-relaxed">
                <p className="theme-text-muted">
                    Herramienta de prevención de desastres para copias de seguridad de la base de datos operativa.
                </p>
                <div className="p-3 bg-teal-500/5 border border-teal-500/20 rounded-xl mt-2">
                    <p className="font-bold text-teal-700 dark:text-teal-400 text-xs flex items-center gap-1.5 mb-1">
                        <Lock className="w-3.5 h-3.5" /> Cifrado AES-256
                    </p>
                    <p className="text-xs text-teal-600 dark:text-teal-500 leading-tight">
                        Los respaldos generados requieren contraseña para ser inyectados. La restauración previene documentos duplicados verificando identificadores únicos.
                    </p>
                </div>
            </div>
        )
    },
    {
        id: 'auditoria',
        title: 'Radar de Intrusos (SIEM)',
        icon: <Lock className="w-6 h-6 text-red-500" />,
        badge: 'Exclusivo IT',
        badgeColor: 'bg-red-500/10 text-red-500 border-red-500/20',
        requireAdmin: true,
        content: (
            <div className="space-y-3 theme-text-main text-sm leading-relaxed">
                <p className="theme-text-muted">
                    Módulo de seguridad forense y auditoría avanzada. Funciona silenciosamente atrapando accesos denegados (Error 403) a nivel de servidor.
                </p>
                <ul className="space-y-2 text-xs mt-3 p-3 theme-bg-low rounded-xl border theme-border">
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div><span className="font-bold theme-text-main">Captura:</span> IP, País, UserAgent y Acción.</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div><span className="font-bold theme-text-main">Retención:</span> Inmutable por 14 días (TTL Cloud).</li>
                    <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div><span className="font-bold theme-text-main">Exportación:</span> Descarga forense a formato CSV.</li>
                </ul>
            </div>
        )
    }
];

export const AyudaView = ({ isAdmin }: { isAdmin: boolean }) => {
    return (
        <div className="max-w-6xl mx-auto space-y-6 fade-in pb-10">
            {/* Header Hero */}
            <div className="theme-bg-container p-6 sm:p-8 rounded-2xl border theme-border shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none group-hover:scale-105 group-hover:rotate-3 transition-transform duration-700">
                    <HelpCircle className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" /> Centro de Soporte
                    </p>
                    <h2 className="text-3xl font-black theme-text-main mb-2">Manual Operativo</h2>
                    <p className="theme-text-muted text-sm max-w-xl">
                        Consulta los lineamientos técnicos, las matrices de permisos y el funcionamiento general de la arquitectura del sistema.
                    </p>
                </div>
            </div>

            {/* Grid de Tarjetas con Hover Sobrio y Elegante */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
                {helpTopics.map((topic) => {
                    if (topic.requireAdmin && !isAdmin) return null;

                    return (
                        <div 
                            key={topic.id} 
                            className="theme-bg-container border theme-border rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col h-full fade-in group relative"
                        >
                            <div className="flex items-start justify-between mb-5 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 theme-bg-low rounded-xl border theme-border shadow-sm transition-transform duration-300 group-hover:scale-105">
                                        {topic.icon}
                                    </div>
                                    <h3 className="text-base font-bold theme-text-main leading-tight">
                                        {topic.title}
                                    </h3>
                                </div>
                                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${topic.badgeColor} whitespace-nowrap ml-2`}>
                                    {topic.badge}
                                </span>
                            </div>
                            
                            <div className="flex-1 relative z-10">
                                {topic.content}
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="text-center pt-8 pb-4 fade-in">
                <p className="text-xs font-bold theme-text-muted uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors cursor-default">
                    <ShieldAlert className="w-3.5 h-3.5" /> ¿Necesitas escalamiento técnico? Contacta a Soporte IT.
                </p>
            </div>
        </div>
    );
};