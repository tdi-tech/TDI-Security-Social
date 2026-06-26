import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, getDocs, addDoc } from 'firebase/firestore';
import { db, appId, auth, getNetworkContext } from '../firebase/config';
import { 
  ShieldAlert, 
  Download, 
  Activity, 
  Clock, 
  User, 
  Globe, 
  MapPin, 
  ShieldCheck, 
  AlertOctagon,
  Laptop
} from 'lucide-react';

interface AuditLog {
  id?: string;
  ip: string;
  pais: string;
  fecha: Date;
  expireAt: Date;
  uid: string;
  email: string;
  provider: string;
  userAgent: string;
  accion: string;
}

export async function safeFirestoreOperation(operationFn: () => Promise<void>, actionName: string) {
  try {
    await operationFn();
  } catch (error: any) {
    if (error.code === 'permission-denied') {
      const currentUser = auth.currentUser;
      
      // Si el usuario no está autenticado, no podemos cumplir 'request.resource.data.uid == request.auth.uid'
      if (!currentUser) {
        throw error;
      }

      try {
        const net = await getNetworkContext();
        
        const now = new Date();
        // 🛡️ CONTROL DE DESFASE DE RELOJ (Margen Seguro):
        // Calculamos 13 días con 23 horas en lugar de 14 días exactos.
        // Esto previene que Google Cloud rechace el log si tu reloj local está adelantado al de sus servidores.
        const expireDate = new Date(now.getTime() + (13 * 24 * 60 * 60 * 1000) + (23 * 60 * 60 * 1000));

        // 🛡️ ALINEACIÓN TOTAL CON LAS REGLAS DE TIERRADEIDEAS (firestore.rules):
        // El documento se envía con los tipos de datos exactos exigidos por el backend.
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'auditLogs'), {
          ip: net.ip || "127.0.0.1",
          pais: net.country || "Local/Proxy",
          fecha: now,
          expireAt: expireDate,
          uid: currentUser.uid, // Estrictamente idéntico a request.auth.uid exigido por las reglas
          email: currentUser.email || "anonymous-email",
          provider: currentUser.providerData[0]?.providerId || "google.com",
          userAgent: navigator.userAgent || "unknown-agent",
          accion: `Bloqueo Perimetral 403: ${actionName}`
        });
        
        console.log("🛡️ Radar de Intrusos: Bloqueo de seguridad registrado en la nube con éxito.");
      } catch (logError) {
        console.error('Fallo crítico al registrar el log de auditoría en el backend:', logError);
      }
    }
    throw error;
  }
}

export const AuditViews: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const logsRef = collection(db, 'artifacts', appId, 'public', 'data', 'auditLogs');
        const q = query(logsRef, orderBy('fecha', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const logsData = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            fecha: data.fecha?.toDate(),
            expireAt: data.expireAt?.toDate()
          };
        }) as AuditLog[];
        
        setLogs(logsData);
      } catch (error) {
        console.error('Error de lectura en el radar de auditoría:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const exportToCSV = () => {
    if (logs.length === 0) return;

    const headers = ['Fecha y Hora', 'Usuario / Correo', 'UID del Atacante', 'Acción Detectada', 'Dirección IP', 'País Origen', 'Proveedor', 'UserAgent'];
    
    const rows = logs.map(log => [
      log.fecha ? log.fecha.toLocaleString() : 'N/A',
      log.email,
      log.uid,
      `"${log.accion.replace(/"/g, '""')}"`,
      log.ip,
      log.pais,
      log.provider,
      `"${log.userAgent.replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Radar_Intrusos_InnovaManagement_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto space-y-6 fade-in pb-10 mt-6 flex flex-col items-center justify-center py-32">
        <Activity className="w-12 h-12 text-red-500 animate-spin mb-4 opacity-80" />
        <h3 className="text-lg font-bold theme-text-main">Inicializando Radar Perimetral</h3>
        <p className="text-sm theme-text-muted mt-1">Conectando con Google Cloud Security...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 fade-in pb-10 mt-2">
      
      {/* 🛡️ TARJETA HEADER */}
      <div className="theme-bg-container p-6 sm:p-8 rounded-2xl border theme-border shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <ShieldAlert className="w-48 h-48" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-2 flex items-center gap-2">
              <AlertOctagon className="w-4 h-4" /> Centro de Seguridad Zero-Trust
            </p>
            <h2 className="text-3xl font-black theme-text-main mb-2">Radar de Intrusos</h2>
            <p className="theme-text-muted text-sm max-w-xl leading-relaxed">
              Monitoreo inmutable de bloqueos (403) a nivel servidor. Google Cloud destruye automáticamente el rastro a los 14 días mediante políticas de retención (TTL).
            </p>
          </div>
          
          <button 
            onClick={exportToCSV}
            disabled={logs.length === 0}
            className={`flex-shrink-0 flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-xl transition-all shadow-sm ${
              logs.length === 0 
              ? 'bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600 border theme-border cursor-not-allowed' 
              : 'bg-red-500 text-white hover:bg-red-600 hover:-translate-y-0.5 hover:shadow-md'
            }`}
          >
            <Download className="w-4 h-4" /> 
            Exportar CSV
          </button>
        </div>
      </div>

      {/* 📊 CONTENEDOR DE LA TABLA */}
      <div className="theme-bg-container border theme-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-black/5 dark:bg-white/5 border-b theme-border">
              <tr>
                <th className="px-5 py-4 font-bold theme-text-main">
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 opacity-70"/> Fecha y Hora</div>
                </th>
                <th className="px-5 py-4 font-bold theme-text-main">
                  <div className="flex items-center gap-2"><User className="w-4 h-4 opacity-70"/> Identidad / Correo</div>
                </th>
                <th className="px-5 py-4 font-bold theme-text-main">
                  <div className="flex items-center gap-2"><AlertOctagon className="w-4 h-4 opacity-70"/> Evento Bloqueado</div>
                </th>
                <th className="px-5 py-4 font-bold theme-text-main">
                  <div className="flex items-center gap-2"><Globe className="w-4 h-4 opacity-70"/> Origen de Red</div>
                </th>
                <th className="px-5 py-4 font-bold theme-text-main">
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 opacity-70"/> País</div>
                </th>
              </tr>
            </thead>
            
            <tbody className="divide-y theme-divide">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center shadow-inner">
                        <ShieldCheck className="w-10 h-10 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-lg font-bold theme-text-main">Perímetro Asegurado</p>
                        <p className="text-sm theme-text-muted mt-1">No se han registrado intentos de intrusión en las últimas 2 semanas.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors group">
                    <td className="px-5 py-4 theme-text-main font-medium">
                      {log.fecha ? log.fecha.toLocaleString() : 'Fecha no válida'}
                    </td>
                    <td className="px-5 py-4">
                      <p className="theme-text-main font-bold">{log.email}</p>
                      <p className="text-[10px] theme-text-muted font-mono mt-0.5 truncate max-w-[150px]" title={log.uid}>
                        {log.uid}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm">
                        <Laptop className="w-3.5 h-3.5" />
                        {log.accion}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs font-semibold bg-[var(--surface)] border theme-border theme-text-main px-3 py-1.5 rounded-lg shadow-inner">
                        {log.ip}
                      </span>
                    </td>
                    <td className="px-5 py-4 theme-text-main font-medium">
                      {log.pais}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};