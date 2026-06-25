import React, { useState } from 'react';
import { History, GitCommit, ChevronDown, ChevronRight, Star, ShieldCheck, Layout, Zap, Sparkles } from 'lucide-react';

// ==========================================
// DATOS DEL CHANGELOG (HISTORIAL DE VERSIONES)
// ==========================================
const changelogData = [
    {
        version: 'v3.3.0',
        date: 'Junio 2026',
        tag: 'Última Versión',
        title: 'Security Core, Zero-Trust & Criptografía',
        changes: [
            { type: 'title', text: 'Arquitectura Cero-Confianza (Zero-Trust)' },
            { type: 'security', text: 'Firebase Security Rules (Backend): Migración total del control de roles (RBAC) al servidor. La validación de privilegios ya no recae en React, haciendo imposible que atacantes fuercen comandos modificando el cliente.' },
            { type: 'security', text: 'Cierre de Brechas de Exposición (Anónimos): Los usuarios no autenticados ahora son bloqueados a nivel servidor para visualizar notificaciones, configuraciones, listas de usuarios y cualquier nodo crítico de la base de datos.' },
            { type: 'security', text: 'Protección Absoluta de Fundadores: Se erradicó el arreglo de correos codificados (hardcodeados) en el frontend. La gestión de jerarquías intocables y rangos IT ahora es dinámica.' },
            { type: 'security', text: 'Vigía de Inactividad Global: Implementación de un doble temporizador en segundo plano que detecta la inactividad del usuario (10 minutos), lanzando un cierre forzado de sesión por seguridad.' },
            { type: 'divider' },
            { type: 'title', text: 'Optimizaciones y Criptografía' },
            { type: 'security', text: 'Backups Cifrados AES-256: El módulo de Copias de Seguridad ahora implementa la librería crypto-js. Los archivos JSON exportados están totalmente encriptados y requieren contraseña de administrador para descifrarse e inyectarse.' },
            { type: 'feature', text: 'Centro de Respaldos Core Inteligente: Nuevo motor capaz de leer backups cifrados y restaurar de emergencia los reportes eliminados (Hackeos, RRSS, Comentarios) sin duplicar datos vivos.' },
            { type: 'feature', text: 'Lazy Loading y Optimización de Ancho de Banda: Refactorización profunda. Los historiales ahora solo solicitan la descarga de datos al backend cuando el usuario ingresa a la vista explícitamente.' },
            { type: 'ui', text: 'Skeletons de Carga UX: Sustitución de pantallas parpadeantes por una animación elegante de "Skeletons" (tarjetas en gris) que mejoran la experiencia durante la consulta en tiempo real a Firebase.' }
        ]
    },
    {
        version: 'v3.2.0',
        date: 'Junio 2026',
        tag: 'Estable',
        title: 'Persistencia de Usuario & Configuración Avanzada',
        changes: [
            { type: 'feature', text: 'Persistencia de Navegación por Recarga: Inyección de estados basados en localStorage para retener la vista actual al presionar F5 o refrescar el navegador, mitigando redirecciones accidentales al Dashboard.' },
            { type: 'security', text: 'Protección de Privacidad de Cambios: El Changelog queda blindado exclusivamente detrás del inicio de sesión (RBAC), impidiendo el acceso a usuarios no identificados o con rol de Lector.' },
            { type: 'security', text: 'Monitor Analítico y Salud DB: Nuevo panel exclusivo para Administrador IT con métricas de consumo de Firebase, estimación de cuota y herramientas de purgado local.' },
            { type: 'feature', text: 'Preferencias de Usuario en la Nube: Panel interactivo para activar/desactivar alertas sonoras y notificaciones por módulo específico (Hackeos, RRSS, Comentarios), sincronizado con Firestore.' },
            { type: 'feature', text: 'Sintetizador de Audio Nativo: Alertas sonoras de notificaciones generadas al vuelo mediante Web Audio API (sin archivos mp3 externos), optimizando el rendimiento.' },
            { type: 'feature', text: 'Modal Inteligente de Exportación CSV: Permite descargar todo el historial, filtrar por Año específico o por "Año + Mes".' },
            { type: 'feature', text: 'Exportación aplanada para Comentarios: Desglose avanzado (1 fila = 1 comentario) para análisis dinámicos en Excel sin anidaciones rotas.' },
            { type: 'feature', text: 'Reporte Ejecutivo en PDF: Exportación nativa y optimizada para impresión directo desde las métricas del Dashboard.' },
            { type: 'ui', text: 'Rediseño de Configuración y UX: Arquitectura en columnas dinámicas para preferencias. Mejora visual en modales de detalle con "Action Cards".' }
        ]
    },
    {
        version: 'v3.1.0',
        date: 'Mayo 2026',
        tag: 'Estable',
        title: 'Dashboard Dinámico, Seguridad & SaaS Plus',
        changes: [
            { type: 'feature', text: 'Dashboard rediseñado con navegación por pestañas (Seguridad, RRSS, Comentarios).' },
            { type: 'feature', text: 'Gráficas SVG nativas y animadas en tiempo real (Donut Chart, Barras Horizontales y Progress Bars).' },
            { type: 'ui', text: 'Historiales avanzados con acordeones anidados colapsables por Año y Mes.' },
            { type: 'feature', text: 'Paginación modular independiente (30 tarjetas por mes) para optimizar el rendimiento.' },
            { type: 'ui', text: 'Super Badges de alto contraste visual para clasificar el Sentiment (Negativo/Neutral) desde la vista general.' },
            { type: 'feature', text: 'Modales de "Vista Rápida" (Preview) inyectados directamente en el Dashboard.' },
            { type: 'feature', text: 'Centro de Notificaciones en tiempo real: Campana interactiva con insignias numéricas, panel filtrable por leídas/no leídas y enlaces directos al incidente.' },
            { type: 'security', text: 'Gestión de Usuarios RBAC: Panel de control dedicado para Administradores, pre-registro manual de cuentas, bloqueo de accesos y asignación de roles jerárquicos.' }
        ]
    },
    {
        version: 'v3.0.0',
        date: 'Mayo 2026',
        tag: 'Estable',
        title: 'Reportes Enriquecidos & Exportación Nativa',
        changes: [
            { type: 'feature', text: 'Integración de Editor WYSIWYG nativo (Texto enriquecido) sin dependencias externas pesadas.' },
            { type: 'feature', text: 'Motor de exportación universal a formato Microsoft Word (.docx) basado en XML estructurado.' },
            { type: 'ui', text: 'Rediseño de los formularios de captura a 2 columnas para optimizar el espacio en pantallas anchas.' },
            { type: 'feature', text: 'Selector de "Sentiment" añadido a los reportes de interacción.' },
            { type: 'ui', text: 'Corrección de renderizado en dropdowns para perfecta compatibilidad con Dark/Light Mode.' }
        ]
    },
    {
        version: 'v2.0.0',
        date: 'Abril 2026',
        tag: 'Estable',
        title: 'Integración Cloud & Nuevos Módulos',
        changes: [
            { type: 'feature', text: 'Conexión completa de la plataforma con la base de datos cloud Firebase Firestore.' },
            { type: 'feature', text: 'Lanzamiento de 2 nuevos módulos operativos: "Crisis RRSS" e "Interacciones y Comentarios".' },
            { type: 'feature', text: 'Modales de administrador para ver Detalles, Editar en tiempo real y Eliminar registros.' },
            { type: 'feature', text: 'Generación y descarga de sábanas de datos en formato CSV para análisis externo.' },
            { type: 'security', text: 'Sistema de protección de rutas y acciones condicionado por el rol del usuario (Admin vs Lector).' }
        ]
    },
    {
        version: 'v1.0.0',
        date: 'Marzo 2026',
        tag: 'Estable',
        title: 'Lanzamiento Base TDI Secure Social',
        changes: [
            { type: 'ui', text: 'Lanzamiento de la plataforma estructurada en React + Tailwind CSS.' },
            { type: 'ui', text: 'Diseño UX/UI Premium corporativo con soporte responsivo y Dark/Light Mode automático.' },
            { type: 'feature', text: 'Módulo principal de "Seguridad e IT" para registro y seguimiento de hackeos.' },
            { type: 'feature', text: 'Checklist de respuesta rápida y contención con barra de progreso global y persistencia de datos.' },
            { type: 'ui', text: 'Navegación lateral tipo App con menús colapsables.' }
        ]
    }
];

const getChangeStyle = (type: string) => {
    switch (type) {
        case 'feature': return { icon: <Zap className="w-4 h-4 text-blue-500" />, bg: 'bg-blue-500/10', text: 'text-blue-500' };
        case 'security': return { icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, bg: 'bg-emerald-500/10', text: 'text-emerald-500' };
        case 'ui': return { icon: <Layout className="w-4 h-4 text-purple-500" />, bg: 'bg-purple-500/10', text: 'text-purple-500' };
        default: return { icon: <GitCommit className="w-4 h-4 text-gray-500" />, bg: 'bg-gray-500/10', text: 'text-gray-500' };
    }
};

export const ChangelogView = () => {
    const [expandedVersions, setExpandedSections] = useState<Record<string, boolean>>({ [changelogData[0].version]: true });

    const toggleVersion = (version: string) => {
        setExpandedSections(prev => ({ ...prev, [version]: !prev[version] }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 fade-in pb-10">
            <div className="theme-bg-container p-6 sm:p-8 rounded-2xl border theme-border shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                    <History className="w-48 h-48" />
                </div>
                <div className="relative z-10">
                    <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <Star className="w-4 h-4" /> Notas de Lanzamiento
                    </p>
                    <h2 className="text-3xl font-black theme-text-main mb-2">Changelog</h2>
                    <p className="theme-text-muted text-sm max-w-xl">
                        Descubre las últimas actualizaciones, mejoras de seguridad y nuevas funcionalidades integradas en la plataforma.
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {changelogData.map((item) => {
                    const isExpanded = !!expandedVersions[item.version];

                    return (
                        <div key={item.version} className="theme-bg-container border theme-border rounded-2xl overflow-hidden shadow-sm transition-all hover:border-gray-500/50">
                            <button 
                                onClick={() => toggleVersion(item.version)}
                                className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-5 sm:p-6 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-left gap-4"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="mt-1">
                                        {isExpanded ? <ChevronDown className="w-5 h-5 theme-text-muted" /> : <ChevronRight className="w-5 h-5 theme-text-muted" />}
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-3 mb-1">
                                            <h3 className="text-xl font-bold theme-text-main">{item.version}</h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.tag === 'Última Versión' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' : 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                {item.tag}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium theme-text-muted">{item.title}</p>
                                    </div>
                                </div>
                                <div className="pl-9 sm:pl-0">
                                    <span className="text-xs font-bold theme-text-muted bg-[var(--surface)] px-3 py-1.5 rounded-lg border theme-border shadow-inner">
                                        {item.date}
                                    </span>
                                </div>
                            </button>

                            {isExpanded && (
                                <div className="p-6 border-t theme-border bg-[var(--background)]">
                                    <ul className="space-y-2">
                                        {item.changes.map((change, idx) => {
                                            if (change.type === 'divider') {
                                                return <div key={idx} className="h-px w-full bg-gray-200 dark:bg-gray-700 my-4"></div>;
                                            }
                                            if (change.type === 'title') {
                                                return (
                                                    <h4 key={idx} className="text-sm font-black text-[var(--primary)] uppercase tracking-wider mt-4 mb-2 flex items-center gap-2">
                                                        <Sparkles className="w-4 h-4" />
                                                        {change.text}
                                                    </h4>
                                                );
                                            }

                                            const style = getChangeStyle(change.type);
                                            return (
                                                <li key={idx} className="flex items-start gap-4 fade-in py-1">
                                                    <div className={`p-2 rounded-lg mt-0.5 flex-shrink-0 shadow-sm ${style.bg}`}>
                                                        {style.icon}
                                                    </div>
                                                    <p className="text-sm theme-text-main leading-relaxed pt-1.5">
                                                        {change.text}
                                                    </p>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="text-center pt-8 pb-4">
                <p className="text-xs font-bold theme-text-muted uppercase tracking-wider">
                    Innova Management &copy; {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
};