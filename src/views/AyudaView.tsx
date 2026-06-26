import React, { useState } from 'react';
import { 
    HelpCircle, ChevronDown, ChevronRight, ShieldAlert, 
    Database, Users, FileText, AlertTriangle, MessageSquareWarning, 
    Info, Lock
} from 'lucide-react';

const helpTopics = [
    {
        id: 'intro',
        title: 'Introducción al Sistema',
        icon: <Info className="w-5 h-5 text-blue-500" />,
        content: (
            <div className="space-y-3 theme-text-main text-sm leading-relaxed">
                <p>
                    <strong>Innova Management</strong> es una plataforma de gestión de crisis y seguridad diseñada bajo una arquitectura <em>Zero-Trust</em> (Cero Confianza). 
                </p>
                <p>
                    El sistema está dividido en tres módulos operativos principales (Hackeos, Crisis en RRSS y Comentarios) y módulos administrativos para el control total de la información.
                </p>
            </div>
        )
    },
    {
        id: 'modulos',
        title: 'Gestión de Incidentes y Reportes',
        icon: <FileText className="w-5 h-5 text-emerald-500" />,
        content: (
            <div className="space-y-4 theme-text-main text-sm leading-relaxed">
                <div className="flex gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">Módulo de Hackeos</p>
                        <p className="theme-text-muted mt-1">Registra vulnerabilidades técnicas, intrusiones en plataformas o pérdida de cuentas. Utiliza el Checklist para contención inmediata.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <ShieldAlert className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">Incidencias RRSS</p>
                        <p className="theme-text-muted mt-1">Gestión de crisis de reputación online, ataques de bots o campañas de desprestigio en redes sociales.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <MessageSquareWarning className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-bold">Comentarios</p>
                        <p className="theme-text-muted mt-1">Reportes unificados de interacción negativa o quejas recurrentes por parte de la comunidad en canales oficiales.</p>
                    </div>
                </div>
            </div>
        )
    },
    {
        id: 'roles',
        title: 'Roles y Permisos (RBAC)',
        icon: <Users className="w-5 h-5 text-purple-500" />,
        content: (
            <div className="space-y-3 theme-text-main text-sm leading-relaxed">
                <p>El sistema protege la información basándose en el rol asignado a tu cuenta:</p>
                <ul className="list-disc pl-5 space-y-2 mt-2 theme-text-muted">
                    <li><strong className="theme-text-main">ADMIN_IT:</strong> Control total. Acceso a Backups, Auditoría Avanzada y gestión de cualquier usuario.</li>
                    <li><strong className="theme-text-main">ADMIN_CM:</strong> Administrador de comunicación. Puede gestionar usuarios operativos y reportes de RRSS/Comentarios.</li>
                    <li><strong className="theme-text-main">EDITOR_CM:</strong> Nivel operativo. Permite crear y editar incidentes, pero no eliminarlos ni gestionar otros usuarios.</li>
                    <li><strong className="theme-text-main">Lector:</strong> (Usuarios sin rol específico o no autenticados) Solo pueden visualizar protocolos públicos y glosarios.</li>
                </ul>
            </div>
        )
    },
    {
        id: 'backups',
        title: 'Copias de Seguridad (Backups Core)',
        icon: <Database className="w-5 h-5 text-indigo-500" />,
        content: (
            <div className="space-y-3 theme-text-main text-sm leading-relaxed">
                <p>
                    Exclusivo para el rol <strong>ADMIN_IT</strong>. Permite exportar toda la base de datos a un archivo JSON cifrado localmente.
                </p>
                <p>
                    Al restaurar una copia de seguridad, el sistema valida las firmas criptográficas e inyecta únicamente los registros que falten en el servidor, evitando duplicidades. Es fundamental guardar la contraseña de encriptación, ya que sin ella el respaldo es irrecuperable.
                </p>
            </div>
        )
    },
    {
        id: 'auditoria',
        title: 'Radar de Intrusos (Auditoría Avanzada)',
        icon: <Lock className="w-5 h-5 text-red-500" />,
        content: (
            <div className="space-y-3 theme-text-main text-sm leading-relaxed">
                <p>
                    Módulo de seguridad forense exclusivo para <strong>ADMIN_IT</strong>. Funciona como un <em>Firewall Backend</em>.
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-2 theme-text-muted">
                    <li><strong>¿Cómo funciona?</strong> Si un usuario o atacante intenta realizar una acción para la que no tiene permisos (ej. borrar un fundador, escalar privilegios), el servidor bloquea la acción (Error 403) y registra silenciosamente la IP, país y correo del infractor.</li>
                    <li><strong>Retención (TTL):</strong> Los registros son inmutables (no se pueden borrar manualmente). Google Cloud los elimina automáticamente a los 14 días exactos.</li>
                    <li><strong>Exportación:</strong> Permite descargar un reporte CSV detallado para auditorías de ciberseguridad.</li>
                </ul>
            </div>
        )
    }
];

export const AyudaView = ({ isAdmin }: { isAdmin: boolean }) => {
    const [expandedSection, setExpandedSection] = useState<string>('intro');

    const toggleSection = (id: string) => {
        setExpandedSection(prev => prev === id ? '' : id);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 fade-in pb-10">
            {/* Header de la vista */}
            <div className="theme-bg-container p-6 sm:p-8 rounded-2xl border theme-border shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <HelpCircle className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4" /> Centro de Soporte
                    </p>
                    <h2 className="text-3xl font-black theme-text-main mb-2">Ayuda y Documentación</h2>
                    <p className="theme-text-muted text-sm max-w-xl">
                        Encuentra respuestas a preguntas frecuentes y aprende a utilizar los módulos avanzados de Innova Management.
                    </p>
                </div>
            </div>

            {/* Acordeones de Ayuda */}
            <div className="space-y-4">
                {helpTopics.map((topic) => {
                    // Ocultar módulos ultra-sensibles si no es administrador general
                    if ((topic.id === 'backups' || topic.id === 'auditoria') && !isAdmin) return null;

                    const isExpanded = expandedSection === topic.id;

                    return (
                        <div key={topic.id} className="theme-bg-container border theme-border rounded-2xl overflow-hidden shadow-sm transition-all hover:border-gray-500/50">
                            <button 
                                onClick={() => toggleSection(topic.id)}
                                className="w-full flex items-center justify-between p-5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-left gap-4"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="p-2 bg-[var(--surface)] rounded-lg shadow-sm border theme-border">
                                        {topic.icon}
                                    </div>
                                    <h3 className="text-base font-bold theme-text-main">{topic.title}</h3>
                                </div>
                                <div className="flex-shrink-0">
                                    {isExpanded ? (
                                        <ChevronDown className="w-5 h-5 theme-text-muted" />
                                    ) : (
                                        <ChevronRight className="w-5 h-5 theme-text-muted" />
                                    )}
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="p-6 border-t theme-border bg-[var(--background)] fade-in">
                                    {topic.content}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="text-center pt-8 pb-4">
                <p className="text-xs font-bold theme-text-muted uppercase tracking-wider">
                    ¿Necesitas más ayuda? Contacta al Administrador IT.
                </p>
            </div>
        </div>
    );
};