import React from 'react';
import { StaticProtocoloView, RolesView, GlosarioView, ProtocoloRRSSView } from '../shared/components/StaticViews';
import { AyudaView } from '../shared/components/AyudaView';
import { ChangelogView } from '../shared/components/ChangelogView';
import { DashboardView } from '../features/dashboard/components/DashboardView'; 
import { ConfigView } from '../features/settings/components/ConfigView';
import { HistorialView, ChecklistView, NewIncidentView } from '../features/incidents/components/HackViews';
import { NewRRSSIncidentView, HistorialRRSSView } from '../features/rrss/components/RRSSViews';
import { NewCommentView, HistorialCommentView } from '../features/comments/components/CommentViews';
import { UserManagementView } from '../features/users/components/UserViews';
import { BackupView } from '../features/backups/components/BackupView';
import { AuditViews } from '../features/audit/components/AuditViews';
// Agrega la importación en la parte superior:
import { SolicitudTicketsView, GestionTicketsView } from '../features/tickets/components/TicketViews';

type AccessLevel = 'PUBLIC' | 'LOGGED_IN' | 'ADMIN_IT' | 'ADMIN_CM_IT';






interface RouteConfig {
    component: React.FC<any>;
    access: AccessLevel;
}

export const ROUTES: Record<string, RouteConfig> = {
    'dashboard': { component: DashboardView, access: 'PUBLIC' },
    'protocolo': { component: StaticProtocoloView, access: 'PUBLIC' },
    'historial': { component: HistorialView, access: 'PUBLIC' },
    'glosario': { component: GlosarioView, access: 'PUBLIC' },
    'roles': { component: RolesView, access: 'PUBLIC' },
    'ayuda': { component: AyudaView, access: 'PUBLIC' },
    'config': { component: ConfigView, access: 'PUBLIC' },
    'protocolo-rss': { component: ProtocoloRRSSView, access: 'PUBLIC' },
    'historial-rss': { component: HistorialRRSSView, access: 'PUBLIC' },
    'historial-comentario': { component: HistorialCommentView, access: 'PUBLIC' },
    
    'changelog': { component: ChangelogView, access: 'LOGGED_IN' },
    'nuevo': { component: NewIncidentView, access: 'LOGGED_IN' },
    'checklist': { component: ChecklistView, access: 'LOGGED_IN' },
    'nuevo-rss': { component: NewRRSSIncidentView, access: 'LOGGED_IN' },
    'nuevo-comentario': { component: NewCommentView, access: 'LOGGED_IN' },
    
    'gestion-usuarios': { component: UserManagementView, access: 'ADMIN_CM_IT' },
    
    'backups': { component: BackupView, access: 'ADMIN_IT' },
    'auditoria': { component: AuditViews, access: 'ADMIN_IT' },
    // Agrega dentro del objeto ROUTES:
    'solicitud-tickets': { component: SolicitudTicketsView, access: 'PUBLIC' },
    'gestion-tickets': { component: GestionTicketsView, access: 'LOGGED_IN' },
};

export const AppRouter = ({ currentView, props }: { currentView: string, props: any }) => {
    const route = ROUTES[currentView] || ROUTES['dashboard'];
    const Component = route.component;
    return <Component {...props} />;
};