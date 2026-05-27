# 🛡️ TDI Secure Social

**Plataforma Integral de Respuesta a Incidentes de Seguridad en Redes Sociales.**

TDI Secure Social es una herramienta interna tipo SaaS (Software as a Service) diseñada para gestionar, documentar y mitigar crisis de seguridad digital. Permite al equipo actuar de forma coordinada bajo protocolos estrictos, manteniendo un historial auditable y protegiendo la confidencialidad de los operadores.

---

## ✨ Características Principales

* **📊 Dashboard Analítico:** Visualización rápida de métricas clave, nivel de riesgo actual e impacto (vistas e interacciones afectadas).
* **✅ Checklist de Crisis en Tiempo Real:** Sala de crisis global. Un sistema de tareas paso a paso para la contención de amenazas, con integración para centralizar carpetas de evidencia en Google Drive.
* **🔒 Privacidad por Defecto:** Sistema de roles inteligente. Los usuarios "Lectores" pueden consultar el sistema completo, pero la identidad del autor de los reportes se enmascara como "Anónimo" en pantalla y en exportaciones.
* **📄 Generación de Reportes:** * Descarga masiva del historial en formato **CSV** para análisis en Excel.
  * Botones dedicados de **Impresión (PDF)** con diseño optimizado para evitar cortes de página.
  * Exportación de la base de datos completa en formato **JSON** (Solo Admins).
* **🔐 Autenticación Corporativa:** Acceso restringido (Single Sign-On) exclusivo mediante cuentas de Google Workspace de la agencia.
* **🌙 UI/UX Moderna:** Interfaz responsiva con soporte nativo para Modo Oscuro/Claro y diseño basado en componentes modulares.

---

## 🛠️ Stack Tecnológico

El proyecto está construido bajo una arquitectura moderna y escalable:

* **Core:** React 18 + TypeScript
* **Build Tool:** Vite
* **Estilos:** Tailwind CSS
* **Iconografía:** Lucide React
* **Backend & BaaS:** Firebase (Firestore DB & Google Authentication)

---