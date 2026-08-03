// Utilidad para exportar datos de Comentarios y RRSS a formato CSV
// compatible con el dashboard de reportes (mismas columnas que el HTML de referencia)

export interface ReportRow {
    fechaInicio: string;
    fechaFin: string;
    contenido: string;
    redSocial: string;
    campus: string;
    sentiment: string;
    usuario: string;
    comentario: string;
    posteoOriginal: string;
    evidencias: string;
}

const escapeCSV = (text: string): string => `"${(text || '').toString().replace(/"/g, '""')}"`;

// Normaliza los comentarios (que pueden venir en formato desglosado o simple)
export const normalizeComments = (com: any): ReportRow[] => {
    if (com.comentariosList && com.comentariosList.length > 0) {
        return com.comentariosList.map((c: any) => ({
            fechaInicio: com.fechaInicio || '',
            fechaFin: com.fechaFin || '',
            contenido: com.contenido || 'Orgánico',
            redSocial: c.redSocial || 'Facebook comentario',
            campus: c.campus || 'Sin especificar',
            sentiment: c.sentiment || 'Sin clasificar',
            usuario: c.usuario || 'Anónimo',
            comentario: c.comentario || '',
            posteoOriginal: c.posteoTipo === 'url' ? c.posteoUrl : c.posteoTexto,
            evidencias: com.evidencia || ''
        }));
    }
    return [{
        fechaInicio: com.fechaInicio || '',
        fechaFin: com.fechaFin || '',
        contenido: com.contenido || 'Orgánico',
        redSocial: com.redSocial || 'Facebook comentario',
        campus: com.campus || 'Sin especificar',
        sentiment: com.sentiment || 'Sin clasificar',
        usuario: com.usuario || 'Anónimo',
        comentario: com.descripcion || com.comentario || '',
        posteoOriginal: com.posteoTipo === 'url' ? com.posteoUrl : com.posteoTexto,
        evidencias: com.evidencia || ''
    }];
};

// Normaliza los incidentes RRSS
export const normalizeRRSS = (inc: any): ReportRow[] => {
    return [{
        fechaInicio: inc.fecha || '',
        fechaFin: inc.fecha || '',
        contenido: inc.tipo || inc.categoria || 'Incidencia RRSS',
        redSocial: inc.plataforma || inc.redSocial || 'Sin especificar',
        campus: inc.campus || 'Sin especificar',
        sentiment: 'Negativo',
        usuario: inc.autor || inc.usuario || 'Anónimo',
        comentario: inc.descripcion || inc.comentario || '',
        posteoOriginal: inc.url || inc.posteoUrl || '',
        evidencias: inc.evidencia || ''
    }];
};

// Genera el CSV a partir de filas normalizadas
export const generateCSV = (rows: ReportRow[]): string => {
    const headers = ['Fecha Inicio,Fecha Fin,Contenido Global,Red Social,Campus,Sentiment,Usuario,Comentario,Posteo Original,Evidencias'];
    const body = rows.map(r => [
        escapeCSV(r.fechaInicio), escapeCSV(r.fechaFin), escapeCSV(r.contenido),
        escapeCSV(r.redSocial), escapeCSV(r.campus), escapeCSV(r.sentiment),
        escapeCSV(r.usuario), escapeCSV(r.comentario), escapeCSV(r.posteoOriginal),
        escapeCSV(r.evidencias)
    ].join(','));
    return '\uFEFF' + [...headers, ...body].join('\n');
};

// Descarga el CSV generado
export const downloadCSV = (csv: string, filename: string) => {
    const link = document.createElement('a');
    link.href = encodeURI('data:text/csv;charset=utf-8,' + csv);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};