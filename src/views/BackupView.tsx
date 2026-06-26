import React, { useState, useEffect } from 'react';
import { Database, Download, UploadCloud, ShieldAlert, CheckCircle2, AlertCircle, Key, Lock, Eye, EyeOff } from 'lucide-react';
import CryptoJS from 'crypto-js';
import { collection, onSnapshot, setDoc, doc } from 'firebase/firestore';
import { db, appId } from '../firebase/config';
// 🛡️ INTEGRACIÓN DEL RADAR PERIMETRAL DE AUDITORÍA
import { logAuditEvent } from './AuditViews';

export const BackupView = ({ showToast }: any) => {
    const [uploading, setUploading] = useState(false);
    const [backupInfo, setBackupInfo] = useState<any>(null);
    
    const [exportPassword, setExportPassword] = useState('');
    const [showExportPassword, setShowExportPassword] = useState(false);
    
    const [importPassword, setImportPassword] = useState('');
    const [showImportPassword, setShowImportPassword] = useState(false);
    
    const [encryptedFileContent, setEncryptedFileContent] = useState<string | null>(null);

    const [incidents, setIncidents] = useState<any[]>([]);
    const [rrssIncidents, setRrssIncidents] = useState<any[]>([]);
    const [comments, setComments] = useState<any[]>([]);

    useEffect(() => {
        const unsubIncidents = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'incidents'), (snap) => {
            const data: any[] = []; snap.forEach(doc => data.push({ id: doc.id, ...doc.data() })); setIncidents(data);
        });
        const unsubRrss = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'rrss_incidents'), (snap) => {
            const data: any[] = []; snap.forEach(doc => data.push({ id: doc.id, ...doc.data() })); setRrssIncidents(data);
        });
        const unsubComments = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'comments'), (snap) => {
            const data: any[] = []; snap.forEach(doc => data.push({ id: doc.id, ...doc.data() })); setComments(data);
        });
        return () => { unsubIncidents(); unsubRrss(); unsubComments(); };
    }, []);

    const handleExportAll = async () => {
        if (!exportPassword || exportPassword.length < 6) {
            showToast('La contraseña debe tener al menos 6 caracteres.', true);
            return;
        }

        try {
            const backupData = {
                version: "2.1",
                exportDate: new Date().toISOString(),
                modules: {
                    hackeos: incidents || [],
                    rrss: rrssIncidents || [],
                    comentarios: comments || []
                }
            };

            const jsonString = JSON.stringify(backupData);
            const encryptedData = CryptoJS.AES.encrypt(jsonString, exportPassword).toString();
            
            const finalWrapper = {
                protected: true,
                payload: encryptedData
            };

            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(finalWrapper, null, 2));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", `CORE_BACKUP_SECURE_${new Date().toISOString().split('T')[0]}.json`);
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            
            setExportPassword('');
            setShowExportPassword(false);
            showToast('Copia de seguridad encriptada y generada con éxito');
        } catch (error) {
            showToast('Error al compilar y cifrar el respaldo', true);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const parsedData = JSON.parse(event.target?.result as string);
                
                if (parsedData.protected && parsedData.payload) {
                    setEncryptedFileContent(parsedData.payload);
                    setBackupInfo(null);
                    showToast('Archivo protegido cargado. Ingrese la contraseña de descifrado.');
                } else if (parsedData.modules && parsedData.version) {
                    showToast('Advertencia: Está cargando un respaldo obsoleto sin cifrado.', true);
                    setBackupInfo(parsedData);
                    setEncryptedFileContent(null);
                } else {
                    // 🚨 SENSOR CORREGIDO: Mensaje corto
                    await logAuditEvent("Alerta de Integridad: Formato inválido");
                    showToast('El archivo no corresponde a un formato válido de Innova', true);
                }
            } catch (err) {
                // 🚨 SENSOR CORREGIDO: Mensaje corto
                await logAuditEvent("Fallo de Integridad: Archivo corrupto o manipulado");
                showToast('Error al leer el archivo. Estructura corrupta.', true);
            }
        };
        reader.readAsText(file);
    };

    const handleDecrypt = async () => {
        if (!encryptedFileContent || !importPassword) return;
        
        try {
            const bytes = CryptoJS.AES.decrypt(encryptedFileContent, importPassword);
            const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
            
            if (!decryptedString) throw new Error("Contraseña incorrecta");
            
            const parsedData = JSON.parse(decryptedString);
            setBackupInfo(parsedData);
            setEncryptedFileContent(null);
            setImportPassword('');
            setShowImportPassword(false);
            showToast('Archivo descifrado correctamente. Listo para restaurar.');
        } catch (error) {
            // 🚨 SENSOR CORREGIDO: Mensaje corto
            await logAuditEvent("Alerta Criptográfica: Fallo de descifrado");
            showToast('Contraseña incorrecta o archivo corrupto.', true);
        }
    };

    const handleExecuteRestore = async () => {
        if (!backupInfo) return;
        setUploading(true);
        showToast('Iniciando restauración en la nube...');

        try {
            let restoredHackeos = 0; let restoredRrss = 0; let restoredComments = 0;
            const { hackeos, rrss, comentarios } = backupInfo.modules;

            if (hackeos && Array.isArray(hackeos)) {
                for (const item of hackeos) {
                    const exists = incidents.some((i: any) => i.id === item.id);
                    if (!exists) { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'incidents', item.id), item); restoredHackeos++; }
                }
            }

            if (rrss && Array.isArray(rrss)) {
                for (const item of rrss) {
                    const exists = rrssIncidents.some((i: any) => i.id === item.id);
                    if (!exists) { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'rrss_incidents', item.id), item); restoredRrss++; }
                }
            }

            if (comentarios && Array.isArray(comentarios)) {
                for (const item of comentarios) {
                    const exists = comments.some((i: any) => i.id === item.id);
                    if (!exists) { await setDoc(doc(db, 'artifacts', appId, 'public', 'data', 'comments', item.id), item); restoredComments++; }
                }
            }

            showToast(`Restauración exitosa: +${restoredHackeos} Hackeos, +${restoredRrss} RRSS, +${restoredComments} Comentarios`);
            setBackupInfo(null);
            
            setTimeout(() => window.location.reload(), 1500);
        } catch (error) {
            showToast('Error crítico durante la reinyección de datos', true);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6 fade-in pb-10">
            <div>
                <h2 className="text-2xl font-bold theme-text-main flex items-center gap-2">
                    <Database className="w-6 h-6 text-[var(--primary)]" /> Centro de Respaldos Core
                </h2>
                <p className="theme-text-muted text-sm mt-1">Exporta bases de datos consolidadas e inyecta respaldos cifrados para restaurar incidentes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* EXPORTACIÓN CIFRADA */}
                <div className="theme-bg-container border theme-border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl w-10 h-10 flex items-center justify-center"><Download className="w-5 h-5" /></div>
                        <h3 className="text-base font-bold theme-text-main flex items-center gap-2">Respaldo Encriptado <Lock className="w-4 h-4 text-emerald-500"/></h3>
                        <p className="text-xs theme-text-muted leading-relaxed">Descarga el núcleo en formato JSON protegido con cifrado AES-256. El archivo será ilegible si es interceptado.</p>
                    </div>
                    <div className="space-y-3 pt-2">
                        <div className="relative">
                            <Key className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                            <input 
                                type={showExportPassword ? "text" : "password"} 
                                placeholder="Crear contraseña de respaldo..." 
                                value={exportPassword} 
                                onChange={(e) => setExportPassword(e.target.value)} 
                                className="w-full pl-9 pr-11 p-2.5 rounded-xl theme-bg-low border theme-border theme-text-main outline-none focus:border-[var(--primary)] text-sm font-medium" 
                            />
                            <button
                                type="button"
                                onClick={() => setShowExportPassword(!showExportPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:theme-text-main transition-colors rounded-lg"
                                title={showExportPassword ? "Ocultar clave" : "Mostrar clave"}
                            >
                                {showExportPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <button onClick={handleExportAll} disabled={!exportPassword} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white font-bold text-sm rounded-xl hover:brightness-110 shadow-sm transition-all disabled:opacity-50">
                            <Download className="w-4 h-4" /> Exportar Copia Segura
                        </button>
                    </div>
                </div>

                {/* IMPORTACIÓN Y DESCIFRADO */}
                <div className="theme-bg-container border theme-border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                        <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl w-10 h-10 flex items-center justify-center"><UploadCloud className="w-5 h-5" /></div>
                        <h3 className="text-base font-bold theme-text-main">Inyectar Copia</h3>
                        <p className="text-xs theme-text-muted leading-relaxed">Sube el archivo JSON cifrado y proporciona su contraseña para reintroducir datos eliminados al servidor en la nube.</p>
                    </div>

                    {!encryptedFileContent ? (
                        <div className="relative h-[88px]">
                            <input type="file" accept=".json" onChange={handleFileChange} disabled={uploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed z-10" />
                            <div className="absolute inset-0 border border-dashed theme-border rounded-xl p-3 flex flex-col items-center justify-center text-xs theme-text-muted font-medium hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                                <UploadCloud className="w-5 h-5 mb-1 opacity-50" /> Seleccionar archivo .json
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl fade-in">
                            <p className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Archivo cifrado detectado. Ingrese clave:</p>
                            <div className="flex gap-2 relative">
                                <div className="relative flex-1">
                                    <input 
                                        type={showImportPassword ? "text" : "password"} 
                                        placeholder="Contraseña..." 
                                        value={importPassword} 
                                        onChange={(e) => setImportPassword(e.target.value)} 
                                        className="w-full pl-3 pr-11 py-2 rounded-lg bg-white dark:bg-black/20 border border-amber-500/30 theme-text-main outline-none text-sm font-medium" 
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowImportPassword(!showImportPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:theme-text-main transition-colors rounded"
                                        title={showImportPassword ? "Ocultar clave" : "Mostrar clave"}
                                    >
                                        {showImportPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                                <button onClick={handleDecrypt} className="px-4 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors text-sm">Abrir</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CONFIRMACIÓN DE RESTAURACIÓN */}
            {backupInfo && (
                <div className="theme-bg-container border border-emerald-500/30 bg-emerald-500/5 rounded-2xl p-6 shadow-md space-y-4 fade-in">
                    <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <div><h4 className="font-bold theme-text-main text-sm">Respaldo Validado y Descifrado</h4><p className="text-xs theme-text-muted mt-1">Fecha de la copia: <strong className="theme-text-main">{new Date(backupInfo.exportDate).toLocaleString()}</strong></p></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 bg-black/5 dark:bg-white/5 p-4 rounded-xl text-center">
                        <div><span className="block text-lg font-bold theme-text-main">{backupInfo.modules?.hackeos?.length || 0}</span><span className="text-[10px] uppercase font-bold theme-text-muted tracking-wider">Hackeos</span></div>
                        <div><span className="block text-lg font-bold theme-text-main">{backupInfo.modules?.rrss?.length || 0}</span><span className="text-[10px] uppercase font-bold theme-text-muted tracking-wider">Crisis RRSS</span></div>
                        <div><span className="block text-lg font-bold theme-text-main">{backupInfo.modules?.comentarios?.length || 0}</span><span className="text-[10px] uppercase font-bold theme-text-muted tracking-wider">Comentarios</span></div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t theme-border">
                        <p className="text-[11px] theme-text-muted flex items-center gap-1.5 leading-relaxed"><AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" /> Omitiremos registros que ya existan para evitar duplicados.</p>
                        <button onClick={handleExecuteRestore} disabled={uploading} className="w-full sm:w-auto px-6 py-2 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-500 shadow-md transition-all disabled:opacity-50">{uploading ? "Inyectando a la nube..." : "Ejecutar Restauración"}</button>
                    </div>
                </div>
            )}
        </div>
    );
};