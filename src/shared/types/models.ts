export type UserRole = 'ADMIN_IT' | 'ADMIN_CM' | 'EDITOR_CM' | 'READER' | '';

export interface UserSession {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    isAnonymous: boolean;
}

export interface Incident {
    id: string;
    fecha: string;
    autor: string;
    plataforma: string;
    vector: string;
    descripcion: string;
    vistas: number;
    interacciones: number;
    impacto: 'Bajo' | 'Medio' | 'Alto' | 'Crítico';
    contencion: string;
    erradicacion: string;
    lecciones: string;
    estado: 'Abierto' | 'Resuelto';
}

export interface AuditLog {
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