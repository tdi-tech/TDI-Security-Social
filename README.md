# Innova Management

**Plataforma Integral SaaS para la Gestión de Seguridad, Cumplimiento y Control Operativo de Incidencias.**

Innova Management es una herramienta interna tipo SaaS (Software as a Service) diseñada para centralizar la documentación, el monitoreo y la mitigación de crisis digitales. La plataforma opera bajo una estricta **arquitectura Zero-Trust (Cero Confianza)**, dividiendo su operación de manera estratégica para dar soporte técnico al área de IT y control de reputación a los equipos de Community Managers, asegurando un historial inmutable y auditable bajo estrictos protocolos de confidencialidad corporativa.

---

## Requisitos Previos e Instalación

Siga estos pasos para clonar, configurar y ejecutar el proyecto en su entorno de desarrollo local.

### 1. Instalar dependencias
Asegúrese de contar con Node.js instalado en su sistema. Ejecute el siguiente comando en la terminal desde la raíz del proyecto para descargar los módulos necesarios:

`npm install`

*(Nota de dependencias críticas: Asegúrese de instalar `dompurify` para la desinfección de código HTML enriquecido usando `npm i dompurify` y `npm i -D @types/dompurify`).*

### 2. Configurar variables de entorno
Cree un archivo llamado `.env` en la raíz del proyecto e ingrese las credenciales correspondientes de la API de Firebase:

`VITE_FIREBASE_API_KEY=`
`VITE_FIREBASE_AUTH_DOMAIN=`
`VITE_FIREBASE_PROJECT_ID=`
`VITE_FIREBASE_STORAGE_BUCKET=`
`VITE_FIREBASE_MESSAGING_SENDER_ID=`
`VITE_FIREBASE_APP_ID=`

### 3. Ejecutar el entorno de desarrollo
Inicie el servidor de desarrollo local de Vite mediante el siguiente comando en la terminal:

`npm run dev`

---

## Arquitectura Modular y Características Principales

La plataforma ha sido estructurada visual y operativamente en bloques funcionales, centralizados en un panel de control avanzado con diseño corporativo Flat-Design:

### Panel de Control (Dashboard) y UX Avanzada
* **Métricas Consolidadas:** Gráficas SVG interactivas que muestran índices de resolución, picos de ataques y análisis de sentimiento en tiempo real.
* **Notificaciones Dinámicas:** Campana de alertas inteligente con motor de audio nativo (Web Audio API) y panel de preferencias en la nube para silenciar módulos específicos.
* **Persistencia de Navegación UX:** Integración de estados basados en `localStorage` coordinados entre la aplicación y el Sidebar para evitar redirecciones accidentales al Dashboard al presionar F5 o refrescar la página.
* **Optimización Lazy Loading y Skeletons:** Los datos de los historiales solo se consultan al servidor cuando el usuario ingresa a la vista explícitamente. La carga se suaviza mediante animaciones vectoriales limpias, eliminando parpadeos bruscos.

### 1. Seguridad IT, Cumplimiento (Compliance) y SIEM
* **Radar de Intrusos (SIEM):** Módulo de ciberseguridad avanzado que detecta y registra silenciosamente accesos denegados (Errores 403), capturando la IP, País de origen y UserAgent del atacante. El registro es inmutable y se autodestruye a los 14 días (Google Cloud TTL).
* **Reporte de Hackeos y Checklist:** Documentación estructurada de vectores de ataque y sala de crisis global con sincronización en tiempo real para tareas de contención.
* **Vigía de Inactividad Global:** Monitoreo en segundo plano que detecta el abandono de la plataforma, ejecutando la destrucción automática de la sesión por seguridad.
* **Centro de Respaldos Cifrados (Core):** Módulo independiente para el Administrador IT que compila un JSON general de todo el ecosistema y lo **encripta mediante criptografía AES-256**. Su motor inverso inyecta inteligentemente registros borrados omitiendo duplicaciones, previa validación de contraseña.

### 2. Reputación y Crisis RRSS
* **Gestión de Contingencias:** Herramienta enfocada en la detección de picos inusuales de alertas en canales digitales oficiales.
* **Reportes WYSIWYG Purificados:** Editor de texto enriquecido integrado, resguardado con la librería DOMPurify para prevenir vulnerabilidades de inyección de código (XSS) al momento de renderizar bitácoras oficiales.

### 3. Interacciones y Comentarios
* **Trazabilidad de Quejas:** Registro de ataques focalizados organizados por campus y tipo de contenido (Orgánico/Pautado), evaluando la respuesta del equipo mediante análisis de sentimiento (Sentiment).

---

## Seguridad Perimetral, Roles y Exportación

* **Arquitectura Zero-Trust (Backend Rules):** Toda validación de roles y permisos se ejecuta en el servidor (Firebase Security Rules). La plataforma restringe operaciones críticas de lectura/escritura a usuarios anónimos o no autorizados, rechazando de raíz cualquier manipulación desde el cliente.
* **Control de Accesos Basado en Roles (RBAC):** Sistema dinámico sin credenciales expuestas. Maneja 4 niveles (Lector, Editor CM, Administrador CM y Administrador IT) con protección automática para superusuarios fundadores y separación de flujos de trabajo (UI).
* **Protocolos Flat Design:** Manuales operativos y matrices de roles estructurados en formato de lectura editorial sin el uso redundante de tarjetas anidadas, incluyendo un *Timeline* fluido para el comité de incidentes.
* **Exportación Inteligente Universal:**
  * **CSV Dinámico:** Descarga masiva filtrable optimizada para Excel, ahora equipada con *feedback* visual (Spinners) de peticiones asíncronas a la base de datos.
  * **Documentos Word (.docx):** Generación nativa basada en XML para descargar reportes con texto enriquecido.
  * **Reportes Ejecutivos PDF:** Sistema de impresión limpio y formateado directo desde el Dashboard.

---

## Stack Tecnológico

* **Core:** React 18 + TypeScript
* **Build Tool:** Vite
* **Seguridad y Limpieza:** `crypto-js` (Cifrado AES-256) y `DOMPurify` (Prevención XSS)
* **Estilos y UX/UI:** Tailwind CSS (Arquitectura corporativa Flat-Design y Dark/Light Mode nativo)
* **Audio y Gráficos:** Web Audio API nativa + SVG escalable
* **Backend y Base de Datos:** Google Firebase (Firestore DB, Security Rules y Workspace Authentication)

---

&copy; 2026 Tierra de Ideas. Todos los derechos reservados.