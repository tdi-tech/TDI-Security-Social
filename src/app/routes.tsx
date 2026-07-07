import React from 'react';

// 📦 Shared Components (Vistas estáticas, informativas y globales)
import { StaticProtocoloView, RolesView, GlosarioView, ProtocoloRRSSView } from '../shared/components/StaticViews';
import { AyudaView } from '../shared/components/AyudaView';
import { ChangelogView } from '../shared/components/ChangelogView';

// 🚀 Features (Módulos de Dominio)
import { DashboardView } from '../features/dashboard/components/DashboardView'; 
import { ConfigView } from '../features/settings/components/ConfigView';
import { HistorialView, ChecklistView, NewIncidentView } from '../features/incidents/components/HackViews';
import { NewRRSSIncidentView, HistorialRRSSView } from '../features/rrss/components/RRSSViews';
import { NewCommentView, HistorialCommentView } from '../features/comments/components/CommentViews';
import { UserManagementView } from '../features/users/components/UserViews';
import { BackupView } from '../features/backups/components/BackupView';
import { AuditViews } from '../features/audit/components/AuditViews';

export const AppRouter = ({ currentView, props }: any) => {
    switch (currentView) {
        case 'dashboard': return <DashboardView {...props} />;
        case 'protocolo': return <StaticProtocoloView />;
        case 'nuevo': return <NewIncidentView {...props} />;
        case 'historial': return <HistorialView {...props} />;
        case 'checklist': return <ChecklistView {...props} />;
        case 'roles': return <RolesView />;
        case 'changelog': return <ChangelogView />;
        case 'glosario': return <GlosarioView />;
        case 'ayuda': return <AyudaView isAdmin={props.isAdmin} />;
        case 'config': return <ConfigView {...props} />;
        case 'gestion-usuarios': return <UserManagementView {...props} />;
        case 'backups': return props.userRole === 'ADMIN_IT' ? <BackupView showToast={props.showToast} /> : null;
        case 'auditoria': return props.userRole === 'ADMIN_IT' ? <AuditViews /> : null;
        case 'protocolo-rss': return <ProtocoloRRSSView />;
        case 'nuevo-rss': return <NewRRSSIncidentView {...props} />;
        case 'historial-rss': return <HistorialRRSSView {...props} />;
        case 'nuevo-comentario': return <NewCommentView {...props} />;
        case 'historial-comentario': return <HistorialCommentView {...props} />;
        default: return <DashboardView {...props} />;
    }
};