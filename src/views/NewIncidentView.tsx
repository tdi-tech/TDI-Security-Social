import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
// IMPORTAMOS EL ÍCONO
import { AlertTriangle } from 'lucide-react'; 

export const NewIncidentView = ({ isAdmin, user, showToast, navigate }: any) => {
    const [vector, setVector] = useState('Desconocido');
    const [otroVector, setOtroVector] = useState('');

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (!isAdmin || !user) return showToast('Modo de Solo Lectura / Sin conexión', true);

        const formData = new FormData(e.target);
        const finalVector = vector === 'Otro' ? otroVector || 'Otro' : vector;
        
        // Capturar el nombre del usuario de Google para la trazabilidad
        const autorNombre = user.displayName || user.email || 'Administrador';

        const newIncident = {
            id: Date.now().toString(),
            fecha: new Date().toISOString(),
            autor: autorNombre, // Guardamos al autor silenciosamente
            plataforma: formData.get('plataforma'),
            vector: finalVector,
            descripcion: formData.get('descripcion'),
            // Convertir a Número (Number) para que la BD no explote al graficar
            vistas: Number(formData.get('vistas')) || 0,
            interacciones: Number(formData.get('interacciones')) || 0,
            impacto: formData.get('impacto'),
            contencion: formData.get('contencion'),
            erradicacion: formData.get('erradicacion'),
            lecciones: formData.get('lecciones'),
            estado: 'Abierto'
        };

        try {
            await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'incidents', newIncident.id), newIncident);
            showToast('Incidente guardado en la nube');
            navigate('historial');
        } catch (err: any) {
            showToast('Error al guardar: ' + err.message, true);
        }
    };

    return (
        <div className="fade-in max-w-3xl mx-auto pb-10">
            {/* REEMPLAZO DE EMOJI POR ÍCONO AQUÍ */}
            <h2 className="text-2xl font-bold theme-text-main mb-6 flex items-center gap-3">
                <AlertTriangle className="w-7 h-7 text-[var(--error)]" />
                Registrar Nuevo Incidente
            </h2>
            
            <form onSubmit={handleSubmit} className="theme-bg-container theme-border border rounded-xl p-8 space-y-6 shadow-sm">
                <div>
                    <h3 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider mb-4 border-b theme-border pb-2">1. Datos Básicos</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium theme-text-main mb-2">Plataforma(s) Afectada(s)</label>
                            <input type="text" name="plataforma" required className="theme-input w-full rounded-lg px-4 py-3" placeholder="Ej: Instagram, Facebook" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium theme-text-main mb-2">Vector de Ataque</label>
                            <select value={vector} onChange={(e) => setVector(e.target.value)} className="theme-input w-full rounded-lg px-4 py-3 appearance-none">
                                <option value="Desconocido">Desconocido</option>
                                <option value="Phishing">Phishing</option>
                                <option value="Malware/Troyano">Malware/Troyano</option>
                                <option value="Contraseña Débil">Contraseña Débil</option>
                                <option value="App Tercera">App de Terceros</option>
                                <option value="Torrents/P2P">Descargas P2P/Torrents</option>
                                <option value="Otro">Otro (Especificar)</option>
                            </select>
                            {vector === 'Otro' && (
                                <input type="text" value={otroVector} onChange={(e) => setOtroVector(e.target.value)} required className="theme-input mt-3 w-full rounded-lg px-4 py-3 fade-in" placeholder="Especifica el vector..." />
                            )}
                        </div>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium theme-text-main mb-2">Descripción del Incidente</label>
                        <textarea name="descripcion" required rows={3} className="theme-input w-full rounded-lg px-4 py-3" placeholder="¿Qué sucedió? ¿Qué se publicó?"></textarea>
                    </div>
                </div>
                <div className="pt-2">
                    <h3 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider mb-4 border-b theme-border pb-2">2. Impacto y Alcance</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-medium theme-text-main mb-2">Vistas Estimadas</label>
                            <input type="number" name="vistas" className="theme-input w-full rounded-lg px-4 py-3" placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium theme-text-main mb-2">Interacciones</label>
                            <input type="number" name="interacciones" className="theme-input w-full rounded-lg px-4 py-3" placeholder="0" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium theme-text-main mb-2">Nivel de Impacto</label>
                            <select name="impacto" className="theme-input w-full rounded-lg px-4 py-3 appearance-none">
                                <option value="Bajo">🟢 Bajo</option>
                                <option value="Medio">🟡 Medio</option>
                                <option value="Alto">🔴 Alto</option>
                                <option value="Crítico">🟣 Crítico</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div className="pt-2">
                    <h3 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider mb-4 border-b theme-border pb-2">3. Acciones Tomadas</h3>
                    <div>
                        <label className="block text-sm font-medium theme-text-main mb-2">Contención Inmediata</label>
                        <textarea name="contencion" rows={2} className="theme-input w-full rounded-lg px-4 py-3" placeholder="Ej: Cambio de contraseña, cierre de sesiones..."></textarea>
                    </div>
                    <div className="mt-4">
                        <label className="block text-sm font-medium theme-text-main mb-2">Erradicación / Limpieza</label>
                        <textarea name="erradicacion" rows={2} className="theme-input w-full rounded-lg px-4 py-3" placeholder="Ej: Formateo, escaneo antivirus..."></textarea>
                    </div>
                </div>
                <div className="pt-2">
                    <h3 className="text-sm font-bold text-[var(--primary)] uppercase tracking-wider mb-4 border-b theme-border pb-2">4. Cierre</h3>
                    <div>
                        <label className="block text-sm font-medium theme-text-main mb-2">Lecciones Aprendidas</label>
                        <textarea name="lecciones" rows={2} className="theme-input w-full rounded-lg px-4 py-3" placeholder="¿Qué podríamos mejorar?"></textarea>
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t theme-border">
                    <button type="button" onClick={() => navigate('dashboard')} className="px-6 py-3 rounded-lg theme-text-muted hover:theme-text-main theme-bg-low transition-all">Cancelar</button>
                    <button type="submit" className="px-8 py-3 bg-[var(--primary)] hover:brightness-110 text-white font-bold rounded-lg shadow-sm transition-all transform hover:-translate-y-0.5">Guardar Incidente</button>
                </div>
            </form>
        </div>
    );
};