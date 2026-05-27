import React from 'react';
import { ShieldAlert, Eye, FileText } from 'lucide-react';

export const AyudaView = ({ isAdmin }: any) => {
    const currentYear = new Date().getFullYear();

    return (
        <div className="fade-in max-w-3xl mx-auto pb-10">
            <div className="text-center mb-10 mt-6">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mb-4">
                    <ShieldAlert className="w-10 h-10 text-[var(--primary)]" />
                </div>
                <h2 className="text-2xl font-bold theme-text-main">TDI Security</h2>
                <p className="text-sm theme-text-muted mt-2">Plataforma de Protocolos de Seguridad desarrollada por el área de IT de Tierra de Ideas.</p>
            </div>

            {isAdmin && (
                <div className="space-y-6">
                    <h3 className="text-lg font-bold theme-text-main border-b theme-border pb-2">Manual Rápido de Operación</h3>
                    
                    <div className="theme-bg-container theme-border border p-5 rounded-xl flex gap-4 shadow-sm">
                        <div className="mt-1"><Eye className="w-5 h-5 text-slate-400" /></div>
                        <div>
                            <h4 className="font-bold theme-text-main text-sm">Modo Lector</h4>
                            <p className="text-sm theme-text-muted mt-1">Cualquier persona con acceso a la plataforma puede consultar los protocolos y revisar el historial de incidentes. Por políticas de privacidad, la identidad de quienes reportan se mantiene oculta en este modo.</p>
                        </div>
                    </div>

                    <div className="theme-bg-container theme-border border p-5 rounded-xl flex gap-4 shadow-sm">
                        <div className="mt-1"><ShieldAlert className="w-5 h-5 text-blue-500" /></div>
                        <div>
                            <h4 className="font-bold theme-text-main text-sm">Modo Administrador</h4>
                            <p className="text-sm theme-text-muted mt-1">Requiere inicio de sesión corporativo. Permite documentar fallas, abrir "Nuevos Incidentes" y operar el "Checklist Rápido". Asegúrate de pegar los enlaces de Google Drive en el checklist para centralizar la evidencia.</p>
                        </div>
                    </div>

                    <div className="theme-bg-container theme-border border p-5 rounded-xl flex gap-4 shadow-sm">
                        <div className="mt-1"><FileText className="w-5 h-5 text-emerald-500" /></div>
                        <div>
                            <h4 className="font-bold theme-text-main text-sm">Exportación y Reportes</h4>
                            <p className="text-sm theme-text-muted mt-1">En el Historial, puedes usar el botón de "Exportar CSV" para bajar una sábana de datos para Excel. Al abrir un incidente, puedes usar el botón de "Imprimir" para generar un PDF individual oficial.</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-16 text-center border-t theme-border pt-6">
                <p className="text-xs font-bold theme-text-muted uppercase tracking-widest">&copy; {currentYear} Tierra de Ideas.</p>
                <p className="text-xs theme-text-muted mt-1">Todos los derechos reservados.</p>
            </div>
        </div>
    );
};