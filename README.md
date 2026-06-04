# Innova Social

**Plataforma Integral de Gestión de Seguridad y Control Operativo de Incidencias.**

Innova Social es una herramienta interna tipo SaaS (Software as a Service) diseñada para centralizar la documentación, el monitoreo y la mitigación de crisis digitales. La plataforma divide su operación de manera estratégica para dar soporte técnico al área de IT y control de reputación a los equipos de Community Managers, asegurando un historial auditable bajo protocolos estrictos de confidencialidad corporativa.

---

## Requisitos Previos e Instalación

Siga estos pasos para clonar, configurar y ejecutar el proyecto en su entorno de desarrollo local.

### 1. Instalar dependencias de Node
Asegúrese de contar con Node.js instalado en su sistema. Ejecute el siguiente comando en la terminal desde la raíz del proyecto para descargar los módulos necesarios:

npm install

### 2. Configurar variables de entorno
Cree un archivo llamado .env en la raíz del proyecto e ingrese las credenciales correspondientes de la API de Firebase:

VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

### 3. Ejecutar el entorno de desarrollo
Inicie el servidor de desarrollo local de Vite mediante el siguiente comando en la terminal:

npm run dev

---

## Características Principales y Arquitectura Modular

La plataforma ha sido reestructurada visual y operativamente en tres grandes bloques funcionales, centralizados en un panel de control avanzado:

### Panel de Control (Dashboard)
* Visualización de Métricas Consolidadas: Gráficas e indicadores analíticos que muestran el total de registros, casos abiertos, soluciones aplicadas e incidentes de impacto crítico en tiempo real.
* Segmentación de Datos: División explícita de la actividad reciente del sistema para un desglose ordenado de eventos de seguridad, reputación en redes y quejas individuales.

### 1. Seguridad y Accesos (Área de IT)
* Reporte de Hackeos: Formulario estructurado para documentar vectores de ataque, alcance estimado de interacciones y descripción técnica de accesos no autorizados.
* Checklist de Respuesta Rápida: Sala de crisis global con sincronización en tiempo real para la verificación de tareas de contención. Incluye vinculación directa a carpetas de evidencias en Google Drive.
* Glosario y Protocolos: Repositorio técnico especializado para unificar la terminología de ciberseguridad dentro de la organización.

### 2. Reputación y Crisis RRSS (Community Managers)
* Gestión de Contingencias: Herramienta enfocada en la detección y seguimiento de picos inusuales de alertas o crisis reputacionales en canales digitales oficiales.
* Matriz de Riesgo: Evaluación formal del nivel de riesgo (Bajo, Medio, Alto) acoplada a las directrices de escalamiento del protocolo institucional de redes sociales.

### 3. Interacciones y Comentarios Negativos (Community Managers)
* Trazabilidad de Quejas: Registro de ataques focalizados o quejas individuales organizadas por campus, permitiendo medir la efectividad e impacto de las respuestas emitidas en posteos orgánicos o pautados.

---

## Seguridad, Privacidad y Reportes

* Privacidad por Defecto (Sistema de Roles): Los usuarios en Modo Lector poseen acceso restringido para auditar el historial y consultar protocolos generales. La identidad del personal que reporta se enmascara de forma automática como "Anónimo" en pantalla y en la sábana de datos exportada.
* Control de Acceso de Administrador: La manipulación de listas de verificación, la edición de registros y la creación de nuevos reportes requiere autenticación corporativa obligatoria mediante Google Workspace.
* Exportación y Salidas Oficiales:
  * Generación de descargas masivas en formato CSV optimizadas para auditorías en Excel.
  * Sistema de impresión formateada a PDF para la entrega física de reportes oficiales sin cortes de página o desbordamiento de contenedores.

---

## Stack Tecnológico

* Core: React 18 + TypeScript
* Build Tool: Vite
* Estilos y UX/UI: Tailwind CSS (Arquitectura basada en componentes modulares con soporte nativo para Modo Claro y Modo Oscuro)
* Iconografía: Lucide React
* Backend y Base de Datos: Firebase (Firestore DB y Google Authentication)

---

&copy; 2026 Tierra de Ideas. Todos los derechos reservados.