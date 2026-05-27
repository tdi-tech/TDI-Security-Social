import React, { useState, useEffect } from 'react';
import { Lock, X, Printer, AlertTriangle, Eye, EyeOff, Pencil, Users, Search, Edit3 } from 'lucide-react';
import { InfoBox } from './UIComponents';

export const LoginModal = ({ isOpen, onClose, onGoogleLogin }: any) => {
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative theme-bg-container theme-border border p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center">
                <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="theme-text-main font-bold text-xl mb-2">Acceso Corporativo</h3>
                <p className="text-sm theme-text-muted mb-6">Inicia sesión con tu cuenta de Workspace de Tierra de Ideas.</p>
                
                <button 
                    type="button"
                    onClick={onGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 px-5 py-3 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-bold text-sm shadow-sm transition-transform hover:-translate-y-0.5 mb-4"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        <path fill="none" d="M1 1h22v22H1z" />
                    </svg>
                    Continuar con Google
                </button>

                <button type="button" onClick={onClose} className="text-sm font-medium theme-text-muted hover:theme-text-main">
                    Cancelar
                </button>
            </div>
        </div>
    );
};

export const DetailModal = ({ isOpen, onClose, incident, isAdmin, onToggleStatus, onEdit, onDelete }: any) => {
    if (!isOpen || !incident) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative theme-bg-container border theme-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b theme-border flex justify-between items-center theme-bg-low rounded-t-2xl">
                    {/* EMOJI REEMPLAZADO POR ÍCONO SEARCH */}
                    <h3 className="text-xl font-bold theme-text-main flex items-center gap-2">
                        <Search className="w-5 h-5 text-[var(--primary)]" /> Detalle <span className="text-sm font-normal theme-text-muted">#{incident.id.substring(incident.id.length - 6)}</span>
                    </h3>
                    <button onClick={onClose} className="theme-text-muted hover:theme-text-main"><X className="w-6 h-6"/></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 space-y-6 print-friendly" id="print-detail-content">
                    
                    {isAdmin && (
                        <div className="bg-[var(--primary)]/10 border border-[var(--primary)]/20 p-3 rounded-lg flex items-center gap-3 animate-fade-in">
                            <Users className="w-5 h-5 text-[var(--primary)]" />
                            <span className="text-sm font-medium theme-text-main">Reportado por: <strong className="text-[var(--primary)]">{incident.autor || 'Administrador'}</strong></span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InfoBox label="Plataforma" value={incident.plataforma} />
                        <InfoBox label="Vector" value={incident.vector} />
                        <InfoBox label="Impacto" value={incident.impacto} />
                        <InfoBox label="Fecha" value={new Date(incident.fecha).toLocaleString()} />
                    </div>
                    <InfoBox block label="Descripción" value={incident.descripcion} />
                    <div className="grid grid-cols-2 gap-4">
                        <InfoBox label="Vistas Estimadas" value={incident.vistas} font="font-mono" />
                        <InfoBox label="Interacciones" value={incident.interacciones} font="font-mono" />
                    </div>
                    <InfoBox block label="Contención" value={incident.contencion || 'N/A'} />
                    <InfoBox block label="Erradicación" value={incident.erradicacion || 'N/A'} />
                    <InfoBox block label="Lecciones Aprendidas" value={incident.lecciones || 'N/A'} />
                </div>
                <div className="p-4 border-t theme-border theme-bg-low rounded-b-2xl flex justify-end gap-3 no-print">
                    {isAdmin && (
                        <>
                            <button onClick={() => onEdit(incident)} className="px-4 py-2 rounded-lg font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1">
                                <Pencil className="w-4 h-4"/> Editar
                            </button>
                            <button onClick={() => onToggleStatus(incident.id)} className={`px-4 py-2 rounded-lg font-bold text-sm text-white transition-colors ${incident.estado === 'Resuelto' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}>
                                {incident.estado === 'Resuelto' ? 'Reabrir' : 'Marcar Resuelto'}
                            </button>
                            <button onClick={() => onDelete(incident.id)} className="px-4 py-2 rounded-lg font-bold text-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 transition-colors">
                                Eliminar
                            </button>
                        </>
                    )}
                    <button onClick={() => window.print()} className="px-4 py-2 rounded-lg font-bold text-sm theme-bg-container theme-border border theme-text-main shadow-sm hover:brightness-95 dark:hover:brightness-110 transition-colors flex items-center gap-2"><Printer className="w-4 h-4"/> Imprimir</button>
                </div>
            </div>
        </div>
    );
};

export const EditIncidentModal = ({ isOpen, onClose, incident, onUpdate }: any) => {
    const [vector, setVector] = useState('Desconocido');
    const [otroVector, setOtroVector] = useState('');

    useEffect(() => {
        if (incident) {
            const vectoresConocidos = ['Desconocido', 'Phishing', 'Malware/Troyano', 'Contraseña Débil', 'App Tercera', 'Torrents/P2P'];
            if (vectoresConocidos.includes(incident.vector)) {
                setVector(incident.vector);
                setOtroVector('');
            } else {
                setVector('Otro');
                setOtroVector(incident.vector);
            }
        }
    }, [incident, isOpen]);

    if (!isOpen || !incident) return null;

    const handleSubmit = (e: any) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const finalVector = vector === 'Otro' ? otroVector || 'Otro' : vector;

        const updatedData = {
            plataforma: formData.get('plataforma'),
            vector: finalVector,
            descripcion: formData.get('descripcion'),
            vistas: Number(formData.get('vistas')) || 0,
            interacciones: Number(formData.get('interacciones')) || 0,
            impacto: formData.get('impacto'),
            contencion: formData.get('contencion'),
            erradicacion: formData.get('erradicacion'),
            lecciones: formData.get('lecciones')
        };

        onUpdate(incident.id, updatedData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative theme-bg-container border theme-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b theme-border flex justify-between items-center theme-bg-low rounded-t-2xl">
                    {/* EMOJI REEMPLAZADO POR ÍCONO EDIT3 */}
                    <h3 className="text-xl font-bold theme-text-main flex items-center gap-2">
                        <Edit3 className="w-5 h-5 text-[var(--primary)]" /> Editar Incidente
                    </h3>
                    <button onClick={onClose} className="theme-text-muted hover:theme-text-main"><X className="w-6 h-6"/></button>
                </div>
                <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium theme-text-main mb-2">Plataforma(s)</label>
                            <input type="text" name="plataforma" required defaultValue={incident.plataforma} className="theme-input w-full rounded-lg px-4 py-2.5" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium theme-text-main mb-2">Vector de Ataque</label>
                            <select value={vector} onChange={(e) => setVector(e.target.value)} className="theme-input w-full rounded-lg px-4 py-2.5 appearance-none">
                                <option value="Desconocido">Desconocido</option>
                                <option value="Phishing">Phishing</option>
                                <option value="Malware/Troyano">Malware/Troyano</option>
                                <option value="Contraseña Débil">Contraseña Débil</option>
                                <option value="App Tercera">App de Terceros</option>
                                <option value="Torrents/P2P">Descargas P2P/Torrents</option>
                                <option value="Otro">Otro (Especificar)</option>
                            </select>
                            {vector === 'Otro' && (
                                <input type="text" value={otroVector} onChange={(e) => setOtroVector(e.target.value)} required className="theme-input mt-3 w-full rounded-lg px-4 py-2.5" placeholder="Especifica..." />
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium theme-text-main mb-2">Descripción</label>
                        <textarea name="descripcion" required rows={3} defaultValue={incident.descripcion} className="theme-input w-full rounded-lg px-4 py-2.5"></textarea>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium theme-text-main mb-2">Vistas</label>
                            <input type="number" name="vistas" defaultValue={incident.vistas} className="theme-input w-full rounded-lg px-4 py-2.5" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium theme-text-main mb-2">Interacciones</label>
                            <input type="number" name="interacciones" defaultValue={incident.interacciones} className="theme-input w-full rounded-lg px-4 py-2.5" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium theme-text-main mb-2">Impacto</label>
                            <select name="impacto" defaultValue={incident.impacto} className="theme-input w-full rounded-lg px-4 py-2.5 appearance-none">
                                <option value="Bajo">🟢 Bajo</option>
                                <option value="Medio">🟡 Medio</option>
                                <option value="Alto">🔴 Alto</option>
                                <option value="Crítico">🟣 Crítico</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium theme-text-main mb-2">Contención</label>
                        <textarea name="contencion" rows={2} defaultValue={incident.contencion} className="theme-input w-full rounded-lg px-4 py-2.5"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium theme-text-main mb-2">Erradicación</label>
                        <textarea name="erradicacion" rows={2} defaultValue={incident.erradicacion} className="theme-input w-full rounded-lg px-4 py-2.5"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium theme-text-main mb-2">Lecciones Aprendidas</label>
                        <textarea name="lecciones" rows={2} defaultValue={incident.lecciones} className="theme-input w-full rounded-lg px-4 py-2.5"></textarea>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t theme-border no-print">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg theme-text-muted hover:theme-text-main theme-bg-low font-medium text-sm transition-colors">Cancelar</button>
                        <button type="submit" className="px-6 py-2.5 bg-blue-600 hover:brightness-110 text-white rounded-lg font-bold text-sm shadow-sm transition-transform hover:-translate-y-0.5">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const ConfirmModal = ({ isOpen, title, msg, onConfirm, onClose }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
            <div className="relative theme-bg-container theme-border border p-8 rounded-2xl w-full max-w-sm shadow-2xl text-center">
                <div className="w-16 h-16 rounded-full bg-[var(--error)]/10 flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle className="w-8 h-8 text-[var(--error)]"/>
                </div>
                <h3 className="theme-text-main font-bold text-xl mb-2">{title}</h3>
                <p className="text-sm theme-text-muted mb-8">{msg}</p>
                <div className="flex justify-center gap-3">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-lg theme-text-muted hover:theme-text-main theme-bg-low font-medium text-sm transition-colors">Cancelar</button>
                    <button onClick={onConfirm} className="px-6 py-2.5 bg-[var(--error)] hover:brightness-110 text-white rounded-lg font-bold text-sm shadow-sm transition-transform hover:-translate-y-0.5">Confirmar</button>
                </div>
            </div>
        </div>
    );
};