# Innova Management

**Plataforma Integral SaaS para la Gestión de Seguridad, Cumplimiento y Control Operativo de Incidencias.**

Innova Management es una herramienta interna tipo SaaS (Software as a Service) diseñada para centralizar la documentación, el monitoreo y la mitigación de crisis digitales. La plataforma divide su operación de manera estratégica para dar soporte técnico al área de IT y control de reputación a los equipos de Community Managers, asegurando un historial inmutable y auditable bajo estrictos protocolos de confidencialidad corporativa.

---

## Requisitos Previos e Instalación

Siga estos pasos para clonar, configurar y ejecutar el proyecto en su entorno de desarrollo local.

### 1. Instalar dependencias
Asegúrese de contar con Node.js instalado en su sistema. Ejecute el siguiente comando en la terminal desde la raíz del proyecto para descargar los módulos necesarios:

```bash
npm install
```

### 2. Configurar variables de entorno
Cree un archivo llamado `.env` en la raíz del proyecto e ingrese las credenciales correspondientes de la API de Firebase:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

### 3. Ejecutar el entorno de desarrollo
Inicie el servidor de desarrollo local de Vite mediante el siguiente comando en la terminal:

```bash
npm run dev
```

---

## Arquitectura Modular y Características Principales

La plataforma ha sido estruturada visual y operativamente en bloques funcionales, centralizados en un panel de control avanzado:

### Panel de Control (Dashboard) y Preferencias
* **Métricas Consolidadas:** Gráficas SVG interactivas que muestran índices de resolución, picos de ataques y análisis de sentimiento en tiempo real.
* **Notificaciones en Tiempo Real:** Campana de alertas inteligente con motor de audio nativo (Web Audio API) y panel de preferencias en la nube para silenciar módulos específicos.
* **Persistencia de Navegación UX:** Integración de estados basados en `localStorage` coordinados entre la aplicación y el Sidebar para evitar redirecciones accidentales al Dashboard al presionar F5 o refrescar la página.

### 1. Seguridad IT y Cumplimiento (Compliance)
* **Log de Auditoría Inmutable:** Registro estricto de todas las acciones del sistema (creación, edición y eliminación de datos) reservado exclusivamente para el Administrador IT.
* **Reporte de Hackeos y Checklist:** Documentación estructurada de vectores de ataque y sala de crisis global con sincronización en tiempo real para tareas de contención.
* **Vigía de Inactividad Global:** Monitoreo en segundo plano que detecta el abandono de la plataforma por 1 minuto, abriendo un modal en cuenta regresiva (5 minutos) antes de destruir la sesión por seguridad.
* **Centro de Respaldos Core Unificado:** Módulo independiente y exclusivo para el Administrador IT que compila un JSON general de todo el ecosistema (Hackeos, RRSS, Comentarios) y ejecuta inyecciones de restauración inteligentes omitiendo duplicaciones.

### 2. Reputación y Crisis RRSS
* **Gestión de Contingencias:** Herramienta enfocada en la detección de picos inusuales de alertas en canales digitales oficiales.
* **Reportes WYSIWYG:** Editor de texto enriquecido integrado para redactar bitácoras oficiales detalladas.

### 3. Interacciones y Comentarios
* **Trazabilidad de Quejas:** Registro de ataques focalizados organizados por campus y tipo de contenido (Orgánico/Pautado), permitiendo evaluar la efectividad de las respuestas de los Community Managers.

---

## Seguridad, Roles y Motor de Exportación

* **Control de Accesos Basado en Roles (RBAC):** Sistema robusto con 4 niveles de jerarquía (Lector, Editor CM, Administrador CM y Administrador IT).
* **Privacidad por Defecto y Registro Protegido:** Los usuarios en Modo Lector poseen acceso restringido. La identidad del personal que reporta se enmascara automáticamente. El módulo de registro de cambios (Changelog) queda blindado únicamente para personal autenticado.
* **Exportación Inteligente Universal:**
  * **CSV Dinámico:** Descarga masiva de historiales filtrables por "Año" o "Año + Mes", optimizados para cruces de datos en Excel.
  * **Documentos Word (.docx):** Generación nativa basada en XML para descargar reportes individuales con texto enriquecido.
  * **Reportes Ejecutivos PDF:** Sistema de impresión limpio y formateado (blanco y negro) directo desde las métricas del Dashboard.

---

## Stack Tecnológico

* **Core:** React 18 + TypeScript
* **Build Tool:** Vite
* **Estilos y UX/UI:** Tailwind CSS (Arquitectura de componentes modulares con Dark/Light Mode)
* **Audio y Gráficos:** Web Audio API nativa + SVG escalable
* **Backend y Base de Datos:** Firebase (Firestore DB y Google Workspace Authentication)

---

&copy; 2026 Tierra de Ideas. Todos los derechos reservados.