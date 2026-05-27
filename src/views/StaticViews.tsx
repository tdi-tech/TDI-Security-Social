import React from 'react';
import { 
    Printer, Key, Smartphone, Laptop, Archive, Mail, Bot, UserX, UserCog, Target, Scale, Users, BookOpen 
} from 'lucide-react';
import { RoleCard, GlossaryCard } from '../components/UIComponents';

export const StaticProtocoloView = () => (
    <div className="fade-in max-w-4xl mx-auto pb-10 print:pb-0">
        <div className="mb-6 flex justify-between items-center no-print">
            <h2 className="text-2xl font-bold theme-text-main">Protocolo de Respuesta a Incidentes</h2>
            <button onClick={() => window.print()} className="px-4 py-2 bg-[var(--primary)] hover:brightness-110 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                <Printer className="w-4 h-4 inline mr-2"/>Imprimir Protocolo
            </button>
        </div>
        
        {/* Título alternativo que solo sale en impresión */}
        <h1 className="hidden print:block text-3xl font-bold text-black mb-8 border-b pb-4">TDI Secure Social - Protocolo Oficial</h1>

        <div className="theme-bg-container theme-border border shadow-sm rounded-xl p-8 print:p-0 print:border-none print:shadow-none theme-text-main space-y-8 print-friendly">
            <section className="print:break-inside-avoid">
                <h3 className="text-xl font-bold text-[var(--primary)] mb-3 border-b theme-border pb-2">1. Objetivo y Alcance</h3>
                <p className="theme-text-muted leading-relaxed">Establecer los lineamientos para <strong>prevenir, detectar, contener, erradicar y recuperar</strong> cuentas corporativas ante un incidente de seguridad.</p>
            </section>
            
            <section className="print:break-inside-avoid">
                <h3 className="text-xl font-bold text-[var(--primary)] mb-3 border-b theme-border pb-2">2. Principios de Prevención</h3>
                <ul className="space-y-3 theme-text-muted">
                    <li className="flex gap-3 items-start"><Key className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" /> <span><strong>Credenciales únicas:</strong> Mínimo 12 caracteres, no reutilizar.</span></li>
                    <li className="flex gap-3 items-start"><Smartphone className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" /> <span><strong>2FA Obligatorio:</strong> Usar App (Authy/Google), nunca SMS.</span></li>
                    <li className="flex gap-3 items-start"><Laptop className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" /> <span><strong>Equipos Exclusivos:</strong> Prohibido torrents, crack o navegación personal.</span></li>
                    <li className="flex gap-3 items-start"><Archive className="w-5 h-5 text-[var(--success)] flex-shrink-0 mt-0.5" /> <span><strong>Gestor de Contraseñas:</strong> Bitwarden/1Password. Nunca en navegador.</span></li>
                </ul>
            </section>
            
            <section className="print:break-inside-avoid">
                <h3 className="text-xl font-bold text-[var(--primary)] mb-3 border-b theme-border pb-2">3. Fases de Respuesta</h3>
                <div className="space-y-6">
                    <div className="pl-4 border-l-4 border-[var(--warning)] print:break-inside-avoid">
                        <h4 className="font-bold theme-text-main">3.1 Detección (0-10 min)</h4>
                        <ul className="list-disc list-inside mt-2 text-sm theme-text-muted"><li>Preservar evidencia (capturas, URLs).</li><li>Reportar internamente por canal seguro.</li></ul>
                    </div>
                    <div className="pl-4 border-l-4 border-[var(--error)] print:break-inside-avoid">
                        <h4 className="font-bold theme-text-main">3.2 Contención (10-60 min)</h4>
                        <ul className="list-disc list-inside mt-2 text-sm theme-text-muted"><li><strong>Cambiar contraseñas desde dispositivo limpio.</strong></li><li>Cerrar sesiones activas y revocar apps.</li></ul>
                    </div>
                    <div className="pl-4 border-l-4 border-orange-500 print:break-inside-avoid">
                        <h4 className="font-bold theme-text-main">3.3 Erradicación</h4>
                        <ul className="list-disc list-inside mt-2 text-sm theme-text-muted"><li>Escaneo profundo / Formateo de equipo.</li><li>Rotación de tokens y APIs.</li></ul>
                    </div>
                    <div className="pl-4 border-l-4 border-[var(--success)] print:break-inside-avoid">
                        <h4 className="font-bold theme-text-main">3.4 Recuperación</h4>
                        <ul className="list-disc list-inside mt-2 text-sm theme-text-muted"><li>Restaurar contenido y monitoreo intensivo 72h.</li></ul>
                    </div>
                </div>
            </section>
            
            <section className="print:break-inside-avoid">
                <h3 className="text-xl font-bold text-[var(--primary)] mb-3 border-b theme-border pb-2">4. Amenazas con IA</h3>
                <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/30 rounded-lg p-4 print:border-gray-300 print:bg-gray-50">
                    <p className="font-bold text-[var(--primary)] mb-3">Regla de Oro: Verifica siempre por un canal secundario.</p>
                    <ul className="text-sm space-y-3 theme-text-muted">
                        <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-[var(--primary)]" /> Phishing hiper-personalizado.</li>
                        <li className="flex items-center gap-2"><Bot className="w-4 h-4 text-[var(--primary)]" /> Publicaciones "casi perfectas" fuera de contexto.</li>
                        <li className="flex items-center gap-2"><UserX className="w-4 h-4 text-[var(--primary)]" /> Deepfakes para recuperación de cuentas.</li>
                    </ul>
                </div>
            </section>
        </div>
    </div>
);

export const RolesView = () => (
    <div className="fade-in pb-10">
        <h2 className="text-2xl font-bold theme-text-main mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-[var(--primary)]" /> Roles y Responsabilidades
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RoleCard title="Community Manager" desc="Primera Línea de Defensa" icon={<UserCog className="w-8 h-8" />} color="primary" list={["Detección y reporte", "Contención básica", "Documentación", "Comunicación con audiencia"]} />
            <RoleCard title="TI / Soporte Técnico" desc="Análisis y Limpieza" icon={<Laptop className="w-8 h-8" />} color="purple" list={["Análisis forense", "Limpieza profunda", "Monitoreo", "Gestión de accesos"]} />
            <RoleCard title="Marketing / Dirección" desc="Toma de Decisiones" icon={<Target className="w-8 h-8" />} color="warning" list={["Validación de comunicación", "Pausas de campaña", "Asignación de recursos"]} />
            <RoleCard title="Legal / Cumplimiento" desc="Regulación y Evidencia" icon={<Scale className="w-8 h-8" />} color="success" list={["Evaluación de impacto", "Notificaciones a autoridades", "Gestión de evidencias"]} />
        </div>
    </div>
);

export const GlosarioView = () => (
    <div className="fade-in pb-10">
        <h2 className="text-2xl font-bold theme-text-main mb-6 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[var(--primary)]" /> Glosario de Términos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlossaryCard title="2FA (Two-Factor Auth)" desc="Capa extra de seguridad. Código temporal + contraseña." />
            <GlossaryCard title="Keylogger" desc="Malware que registra lo que tecleas para robar credenciales." />
            <GlossaryCard title="Phishing" desc="Suplantación de identidad para engañar a la víctima." />
            <GlossaryCard title="SIM Swapping" desc="Robo de número de teléfono para interceptar SMS." />
            <GlossaryCard title="Deepfake" desc="Audio/Video generado por IA para imitar a una persona real." />
            <GlossaryCard title="Token API" desc="Llave digital que conecta apps externas a tu cuenta." />
        </div>
    </div>
);