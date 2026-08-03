import { useCallback } from 'react';
import type { ReportRow } from '../utils/csvExport';

// Colores para sentimientos
const SENTIMENT_COLORS: Record<string, string> = {
    'Negativo': '#e0485a',
    'Neutral': '#7c8db5',
    'Positivo': '#4fd18b'
};
const FALLBACK_COLOR = '#5b8def';
const RED_COLORS = ['#5b8def', '#e0485a', '#2fd9c4', '#f5a93f', '#4fd18b'];

// Tipos de color como tuplas para spread seguro en jsPDF
type RGB = [number, number, number];
const NAVY: RGB = [10, 17, 32];
const TEXT_DARK: RGB = [26, 36, 58];
const TEXT_GRAY: RGB = [110, 122, 150];
const LINE: RGB = [225, 229, 238];
const CARD_BG: RGB = [244, 247, 251];
const AMBER_BG: RGB = [253, 244, 229];
const AMBER_TEXT: RGB = [158, 108, 10];
const COL = {
    critical: [224, 72, 90] as RGB,
    verify: [38, 170, 153] as RGB,
    alert: [201, 133, 25] as RGB,
    info: [91, 141, 239] as RGB
};

const sentimentColor = (s: string) => SENTIMENT_COLORS[s] || FALLBACK_COLOR;

// Helper para convertir hex a RGB
const hexToRgb = (hex: string): RGB => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)] : [91, 141, 239];
};

// ---- Funciones de agregación (compartidas entre dashboard y PDF) ----
export const countBy = (arr: any[], keyFn: (item: any) => string) => {
    const map: Record<string, number> = {};
    arr.forEach(item => { const k = keyFn(item); map[k] = (map[k] || 0) + 1; });
    return map;
};

export const calcSentiment = (rows: ReportRow[]) => {
    const counts = countBy(rows, r => r.sentiment);
    const labels = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    const data = labels.map(l => counts[l]);
    const colors = labels.map(l => sentimentColor(l));
    return { labels, data, colors };
};

export const calcRedSocial = (rows: ReportRow[]) => {
    const counts = countBy(rows, r => r.redSocial);
    const labels = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    const data = labels.map(l => counts[l]);
    return { labels, data };
};

export const calcOrigen = (rows: ReportRow[]) => {
    const groups: Record<string, { total: number; neg: number }> = {};
    rows.forEach(r => {
        const k = r.contenido;
        if (!groups[k]) groups[k] = { total: 0, neg: 0 };
        groups[k].total++;
        if (r.sentiment === 'Negativo') groups[k].neg++;
    });
    const labels = Object.keys(groups);
    const totals = labels.map(l => groups[l].total);
    const negPct = labels.map(l => groups[l].total ? Math.round(groups[l].neg / groups[l].total * 100) : 0);
    return { labels, totals, negPct };
};

export const calcTrend = (rows: ReportRow[]) => {
    const groups: Record<string, { total: number; neg: number; sortKey: string }> = {};
    rows.forEach(r => {
        const k = (r.fechaInicio && r.fechaFin) ? `${r.fechaInicio} → ${r.fechaFin}` : 'Sin periodo';
        if (!groups[k]) groups[k] = { total: 0, neg: 0, sortKey: r.fechaInicio };
        groups[k].total++;
        if (r.sentiment === 'Negativo') groups[k].neg++;
    });
    const labels = Object.keys(groups).sort((a, b) => (groups[a].sortKey || '').localeCompare(groups[b].sortKey || ''));
    const totals = labels.map(l => groups[l].total);
    const negPct = labels.map(l => groups[l].total ? Math.round(groups[l].neg / groups[l].total * 100) : 0);
    return { labels, totals, negPct };
};

export const calcCampusRanking = (rows: ReportRow[]) => {
    const counts = countBy(rows, r => r.campus);
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
};

export const calcTopUsers = (rows: ReportRow[], minCount = 2, limit = 8) => {
    const counts: Record<string, number> = {};
    const dominant: Record<string, Record<string, number>> = {};
    rows.forEach(r => {
        counts[r.usuario] = (counts[r.usuario] || 0) + 1;
        dominant[r.usuario] = dominant[r.usuario] || {};
        dominant[r.usuario][r.sentiment] = (dominant[r.usuario][r.sentiment] || 0) + 1;
    });
    return Object.entries(counts)
        .filter(([, c]) => c >= minCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([name, count]) => ({
            name, count,
            dominant: Object.entries(dominant[name]).sort((a, b) => b[1] - a[1])[0][0]
        }));
};

const spanishDate = (dstr: string) => {
    const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
    if (!dstr) return '';
    const parts = dstr.split('-').map(Number);
    const y = parts[0], m = parts[1], d = parts[2];
    if (!y || !m || !d) return dstr;
    return `${d} ${months[m - 1]} ${y}`;
};

const nowStamp = () => {
    const d = new Date();
    return d.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) + " " +
        d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
};

const computePeriod = (rows: ReportRow[]) => {
    const withDates = rows.filter(r => r.fechaInicio && r.fechaFin);
    if (!withDates.length) return { start: null, end: null, cycles: 0 };
    const starts = withDates.map(r => r.fechaInicio).sort();
    const ends = withDates.map(r => r.fechaFin).sort();
    const cycles = new Set(withDates.map(r => r.fechaInicio + '|' + r.fechaFin)).size;
    return { start: starts[0], end: ends[ends.length - 1], cycles };
};

const truncateToWidth = (doc: any, text: string, maxWidth: number) => {
    text = (text || '').toString();
    if (!text) return '';
    const lines = doc.splitTextToSize(text, maxWidth);
    if (lines.length <= 1) return lines[0] || '';
    return lines[0].replace(/\s+\S*$/, '') + '…';
};

// ---- Renderiza un gráfico Chart.js fuera de pantalla y devuelve PNG base64 ----
const renderOffscreenChart = async (chartModule: any, config: any, width: number, height: number): Promise<string | null> => {
    try {
        const Chart = chartModule.Chart || chartModule.default?.Chart || chartModule;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.style.position = 'absolute';
        canvas.style.left = '-9999px';
        canvas.style.top = '0';
        document.body.appendChild(canvas);

        config.options = config.options || {};
        config.options.responsive = false;
        config.options.maintainAspectRatio = false;
        config.options.animation = false;
        config.options.devicePixelRatio = 2;

        let dataUrl: string | null = null;
        const chart = new Chart(canvas, config);
        try { dataUrl = canvas.toDataURL('image/png', 1.0); }
        finally { chart.destroy(); document.body.removeChild(canvas); }
        return dataUrl;
    } catch (err) {
        console.error('Error renderizando gráfica offscreen:', err);
        return null;
    }
};

// Interfaz de imágenes para el PDF
export interface ChartImages {
    sentiment?: string | null;
    red?: string | null;
    origen?: string | null;
    trend?: string | null;
}

export const useReportGenerator = () => {

    // Genera el PDF del reporte con gráficas incrustadas
    const generatePDF = useCallback(async (rows: ReportRow[], sourceLabel: string, images?: ChartImages) => {
        if (!rows.length) return;

        const [{ jsPDF: JsPDFClass }, chartModule] = await Promise.all([
            import('jspdf'),
            import('chart.js')
        ]);
        const doc = new JsPDFClass({ unit: 'mm', format: 'a4' });
        const pageW = 210, pageH = 297, margin = 15;
        const contentW = pageW - margin * 2;

        // ---- agregados ----
        const total = rows.length;
        const neg = rows.filter(r => r.sentiment === 'Negativo').length;
        const negPct = total ? Math.round(neg / total * 100) : 0;
        const unclassified = rows.filter(r => r.campus === 'Sin especificar');
        const campusRanking = calcCampusRanking(rows);
        const topCampus = calcCampusRanking(rows.filter(r => r.campus !== 'Sin especificar'))[0];
        const redAgg = calcRedSocial(rows);
        const period = computePeriod(rows);
        const periodText = period.start ? `${spanishDate(period.start)} – ${spanishDate(period.end)}` : 'No disponible';

        // ---- generamos imágenes de gráficas si no vienen dadas ----
        let imgSentiment = images?.sentiment;
        let imgRed = images?.red;
        let imgOrigen = images?.origen;
        let imgTrend = images?.trend;

        if (!imgSentiment || !imgRed || !imgOrigen || !imgTrend) {
            const sentAgg = calcSentiment(rows);
            const redAggData = calcRedSocial(rows);
            const origenAgg = calcOrigen(rows);
            const trendAgg = calcTrend(rows);

            imgSentiment = imgSentiment || await renderOffscreenChart(chartModule, {
                type: 'doughnut',
                data: { labels: sentAgg.labels, datasets: [{ data: sentAgg.data, backgroundColor: sentAgg.colors, borderColor: '#ffffff', borderWidth: 3 }] },
                options: { cutout: '62%', plugins: { legend: { position: 'bottom', labels: { color: '#3a4a68', font: { size: 13 }, boxWidth: 11, boxHeight: 11, padding: 12 } } } }
            }, 480, 480);

            imgRed = imgRed || await renderOffscreenChart(chartModule, {
                type: 'bar',
                data: { labels: redAggData.labels, datasets: [{ data: redAggData.data, backgroundColor: redAggData.labels.map((_, i) => RED_COLORS[i % RED_COLORS.length]), borderRadius: 5 }] },
                options: { plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { grid: { color: '#e4e8f0' }, beginAtZero: true, ticks: { precision: 0 } } } }
            }, 560, 380);

            imgOrigen = imgOrigen || await renderOffscreenChart(chartModule, {
                data: {
                    labels: origenAgg.labels, datasets: [
                        { type: 'bar', label: 'Registros', data: origenAgg.totals, backgroundColor: '#5b8def', borderRadius: 5, yAxisID: 'y' },
                        { type: 'bar', label: '% Negativo', data: origenAgg.negPct, backgroundColor: '#e0485a', borderRadius: 5, yAxisID: 'y1' }
                    ]
                },
                options: {
                    plugins: { legend: { position: 'bottom', labels: { color: '#3a4a68', font: { size: 11 } } } },
                    scales: { x: { grid: { display: false } }, y: { position: 'left', grid: { color: '#e4e8f0' }, beginAtZero: true }, y1: { position: 'right', grid: { display: false }, beginAtZero: true, max: 100, ticks: { callback: (v: any) => v + '%' } } }
                }
            }, 560, 380);

            imgTrend = imgTrend || await renderOffscreenChart(chartModule, {
                data: {
                    labels: trendAgg.labels, datasets: [
                        { type: 'bar', label: 'Comentarios', data: trendAgg.totals, backgroundColor: 'rgba(91,141,239,0.7)', borderRadius: 5, yAxisID: 'y' },
                        { type: 'line', label: '% Negativo', data: trendAgg.negPct, borderColor: '#e0485a', backgroundColor: '#e0485a', tension: 0.3, pointRadius: 4, yAxisID: 'y1' }
                    ]
                },
                options: {
                    plugins: { legend: { position: 'bottom', labels: { color: '#3a4a68', font: { size: 11 } } } },
                    scales: { x: { grid: { display: false } }, y: { position: 'left', grid: { color: '#e4e8f0' }, beginAtZero: true }, y1: { position: 'right', grid: { display: false }, beginAtZero: true, max: 100, ticks: { callback: (v: any) => v + '%' } } }
                }
            }, 900, 380);
        }

        // ---- helpers de maquetación ----
        let page = 1;
        let y = 36;
        const drawHeader = () => {
            doc.setFillColor(NAVY[0], NAVY[1], NAVY[2]); doc.rect(0, 0, pageW, 26, 'F');
            doc.setTextColor(255, 255, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(15);
            doc.text('INNOVA MANAGEMENT', margin, 11);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
            doc.text('Reporte de monitoreo · Comentarios & incidencias', margin, 17.5);
            doc.setFontSize(7.5);
            doc.text('Generado: ' + nowStamp(), pageW - margin, 10, { align: 'right' });
            doc.text('Fuente: ' + sourceLabel, pageW - margin, 15.5, { align: 'right' });
        };
        const drawFooter = (pageNum: number) => {
            doc.setDrawColor(LINE[0], LINE[1], LINE[2]); doc.setLineWidth(0.2); doc.line(margin, pageH - 12, pageW - margin, pageH - 12);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(7.5); doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
            doc.text('Innova Management · Generado localmente en el navegador', margin, pageH - 8);
            doc.text('Página ' + pageNum, pageW - margin, pageH - 8, { align: 'right' });
        };
        const checkPageBreak = (neededHeight: number, redrawFn?: () => void) => {
            if (y + neededHeight > pageH - 18) {
                drawFooter(page);
                doc.addPage(); page++;
                drawHeader();
                y = 34;
                if (redrawFn) redrawFn();
            }
        };
        const sectionTitle = (text: string) => {
            checkPageBreak(14);
            doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]); doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
            doc.text(text.toUpperCase(), margin, y);
            doc.setDrawColor(LINE[0], LINE[1], LINE[2]); doc.setLineWidth(0.3); doc.line(margin, y + 2.5, pageW - margin, y + 2.5);
            y += 9;
        };

        // ---- página 1: portada + KPIs ----
        drawHeader();

        doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]); doc.setFont('helvetica', 'bold'); doc.setFontSize(11.5);
        doc.text('Período analizado: ' + periodText, margin, y);
        y += 6;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
        doc.text(`${total} registros totales  ·  ${period.cycles} ciclo(s) de reporte`, margin, y);
        y += 10;

        const kpiData = [
            { label: 'TOTAL DE REGISTROS', value: String(total), sub: 'Registros analizados', color: COL.info },
            { label: '% SENTIMIENTO NEGATIVO', value: negPct + '%', sub: `${neg} de ${total}`, color: COL.critical },
            { label: 'CAMPUS CRÍTICO', value: topCampus ? String(topCampus[1]) : '—', sub: topCampus ? topCampus[0] : 'Sin datos', color: COL.alert },
            { label: 'RED SOCIAL DOMINANTE', value: redAgg.data[0] !== undefined ? String(redAgg.data[0]) : '—', sub: redAgg.labels[0] || '—', color: COL.verify }
        ];
        const kpiGap = 4, kpiW = (contentW - kpiGap * 3) / 4, kpiH = 25;
        kpiData.forEach((k, i) => {
            const x = margin + i * (kpiW + kpiGap);
            doc.setFillColor(CARD_BG[0], CARD_BG[1], CARD_BG[2]); doc.roundedRect(x, y, kpiW, kpiH, 1.5, 1.5, 'F');
            doc.setFillColor(k.color[0], k.color[1], k.color[2]); doc.rect(x, y, 1.2, kpiH, 'F');
            doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]); doc.setFont('helvetica', 'bold'); doc.setFontSize(6.6);
            doc.text(k.label, x + 4, y + 6, { maxWidth: kpiW - 6 });
            doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]); doc.setFontSize(16);
            doc.text(k.value, x + 4, y + 15.5);
            doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]); doc.setFont('helvetica', 'normal'); doc.setFontSize(6.8);
            doc.text(truncateToWidth(doc, String(k.sub), kpiW - 7), x + 4, y + 21);
        });
        y += kpiH + 8;

        if (unclassified.length) {
            const uSent = calcSentiment(unclassified);
            const uRed = calcRedSocial(unclassified);
            const boxH = 21;
            checkPageBreak(boxH + 4);
            doc.setFillColor(AMBER_BG[0], AMBER_BG[1], AMBER_BG[2]); doc.roundedRect(margin, y, contentW, boxH, 1.5, 1.5, 'F');
            doc.setTextColor(AMBER_TEXT[0], AMBER_TEXT[1], AMBER_TEXT[2]); doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5);
            doc.text(`${unclassified.length} registros (${Math.round(unclassified.length / total * 100)}%) no tienen campus especificado`, margin + 4, y + 6);
            doc.setFont('helvetica', 'normal'); doc.setFontSize(7.3); doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
            doc.text('Ya están incluidos en las métricas generales; requieren clasificación manual para asignarse a un plantel.', margin + 4, y + 11);
            doc.text('Sentimiento — ' + uSent.labels.map((l, i) => `${l}: ${uSent.data[i]}`).join('   ·   '), margin + 4, y + 16);
            doc.text('Red social — ' + uRed.labels.map((l, i) => `${l}: ${uRed.data[i]}`).join('   ·   '), margin + 4, y + 20);
            y += boxH + 10;
        }

        // ---- panorama general (gráficos) ----
        sectionTitle('Panorama general');
        checkPageBreak(62);
        const chartRowY = y;
        if (imgSentiment) {
            const donutW = 52, donutH = 52 * (480 / 480);
            doc.addImage(imgSentiment, 'PNG', margin, chartRowY, donutW, donutH);
            const smallW = (contentW - donutW - 8) / 2;
            const smallH = smallW * (380 / 560);
            if (imgRed) doc.addImage(imgRed, 'PNG', margin + donutW + 8, chartRowY, smallW, smallH);
            if (imgOrigen) doc.addImage(imgOrigen, 'PNG', margin + donutW + 8 + smallW + 6, chartRowY, smallW, smallH);
            y = chartRowY + Math.max(donutH, smallH) + 10;
        }

        // ---- campus ----
        sectionTitle('Incidencias por campus');
        const campusMax = campusRanking.length ? campusRanking[0][1] : 1;
        campusRanking.forEach(([name, count]) => {
            checkPageBreak(7);
            const barMaxW = 68;
            const barW = Math.max(2, (count / campusMax) * barMaxW);
            const isUnspecified = name === 'Sin especificar';
            const barCol: RGB = isUnspecified ? COL.alert : COL.info;
            doc.setFont('helvetica', 'normal'); doc.setFontSize(8.3); doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
            doc.text(truncateToWidth(doc, name, 58), margin, y + 3.6);
            doc.setFillColor(LINE[0], LINE[1], LINE[2]); doc.rect(margin + 62, y, barMaxW, 3, 'F');
            doc.setFillColor(barCol[0], barCol[1], barCol[2]); doc.rect(margin + 62, y, barW, 3, 'F');
            doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
            doc.text(String(count), margin + 62 + barMaxW + 5, y + 3.4);
            y += 6.8;
        });
        y += 5;

        // ---- tendencia ----
        sectionTitle('Tendencia por período');
        if (imgTrend) {
            const trendDispW = contentW, trendDispH = trendDispW * (380 / 900);
            checkPageBreak(trendDispH + 6);
            doc.addImage(imgTrend, 'PNG', margin, y, trendDispW, trendDispH);
            y += trendDispH + 10;
        }

        // ---- usuarios recurrentes ----
        sectionTitle('Usuarios más recurrentes');
        const topUsers = calcTopUsers(rows);
        if (!topUsers.length) {
            doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
            doc.text('Ningún usuario tiene más de un comentario en este período.', margin, y);
            y += 8;
        } else {
            topUsers.forEach(u => {
                checkPageBreak(7);
                const dominantCol: RGB = SENTIMENT_COLORS[u.dominant] ? hexToRgb(SENTIMENT_COLORS[u.dominant]) : COL.info;
                doc.setFont('helvetica', 'normal'); doc.setFontSize(8.3); doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
                doc.text(truncateToWidth(doc, u.name, 100), margin, y + 3.6);
                doc.setTextColor(dominantCol[0], dominantCol[1], dominantCol[2]); doc.setFontSize(7.3);
                doc.text(u.dominant, margin + 105, y + 3.6);
                doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]); doc.setFont('helvetica', 'bold'); doc.setFontSize(8.3);
                doc.text(u.count + '×', pageW - margin, y + 3.6, { align: 'right' });
                y += 6.6;
            });
        }
        y += 4;

        // ---- bitácora completa ----
        sectionTitle('Bitácora de incidencias — listado completo');
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
        doc.text(`${rows.length} registros ordenados por fecha de inicio`, margin, y);
        y += 6;

        const cols = [
            { label: 'Fecha', width: 16 },
            { label: 'Campus', width: 28 },
            { label: 'Red', width: 18 },
            { label: 'Sentimiento', width: 20 },
            { label: 'Usuario', width: 28 },
            { label: 'Comentario', width: 70 }
        ];
        const drawTableHeader = () => {
            doc.setFillColor(CARD_BG[0], CARD_BG[1], CARD_BG[2]); doc.rect(margin, y, contentW, 6, 'F');
            doc.setFont('helvetica', 'bold'); doc.setFontSize(6.6); doc.setTextColor(TEXT_GRAY[0], TEXT_GRAY[1], TEXT_GRAY[2]);
            let cx = margin + 2;
            cols.forEach(c => { doc.text(c.label.toUpperCase(), cx, y + 4); cx += c.width; });
            y += 7.5;
        };
        checkPageBreak(14);
        drawTableHeader();

        const sortedRows = rows.slice().sort((a, b) => (a.fechaInicio || '').localeCompare(b.fechaInicio || ''));
        sortedRows.forEach(r => {
            checkPageBreak(6, drawTableHeader);
            let cx = margin + 2;
            const sentCol: RGB = SENTIMENT_COLORS[r.sentiment] ? hexToRgb(SENTIMENT_COLORS[r.sentiment]) : COL.info;
            doc.setFont('helvetica', 'normal'); doc.setFontSize(7); doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
            doc.text(r.fechaInicio || '-', cx, y + 3.8); cx += cols[0].width;
            doc.text(truncateToWidth(doc, r.campus, cols[1].width - 2), cx, y + 3.8); cx += cols[1].width;
            doc.text(truncateToWidth(doc, r.redSocial, cols[2].width - 2), cx, y + 3.8); cx += cols[2].width;
            doc.setTextColor(sentCol[0], sentCol[1], sentCol[2]);
            doc.text(truncateToWidth(doc, r.sentiment, cols[3].width - 2), cx, y + 3.8);
            doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
            cx += cols[3].width;
            doc.text(truncateToWidth(doc, r.usuario, cols[4].width - 2), cx, y + 3.8); cx += cols[4].width;
            doc.text(truncateToWidth(doc, r.comentario.replace(/\s+/g, ' ').trim(), cols[5].width - 2), cx, y + 3.8);
            doc.setDrawColor(LINE[0], LINE[1], LINE[2]); doc.setLineWidth(0.1);
            doc.line(margin, y + 5.4, pageW - margin, y + 5.4);
            y += 6;
        });

        drawFooter(page);

        const fileDate = new Date().toISOString().slice(0, 10);
        const filename = `Innova-Management-Reporte-${fileDate}.pdf`;

        const blob = doc.output('blob');
        const blobUrl = URL.createObjectURL(blob);
        const newTab = window.open(blobUrl, '_blank');

        if (!newTab) {
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
    }, []);

    return { generatePDF };
};