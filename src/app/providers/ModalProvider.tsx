import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ConfirmModal, PreviewModal } from '../../shared/components/Modals';
import type { ConfirmModalState, PreviewModalState } from '../../shared/types/models';

interface ModalContextType {
    openConfirmModal: (title: string, msg: string, onConfirm: () => void) => void;
    openPreviewModal: (type: 'rrss' | 'comment', data: any) => void;
    closePreviewModal: () => void;
    onNavigateRef: React.MutableRefObject<(path: string) => void>; // Hack elegante para no pasar navigate por props infinitas
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [confirm, setConfirm] = useState<ConfirmModalState>({ isOpen: false, title: '', msg: '', onConfirm: () => {} });
    const [preview, setPreview] = useState<PreviewModalState>({ isOpen: false, type: '', data: null });
    const onNavigateRef = React.useRef<(path: string) => void>(() => {});

    const openConfirmModal = (title: string, msg: string, onConfirm: () => void) => {
        setConfirm({ isOpen: true, title, msg, onConfirm });
    };

    return (
        <ModalContext.Provider value={{ 
            openConfirmModal, 
            openPreviewModal: (type, data) => setPreview({ isOpen: true, type, data }),
            closePreviewModal: () => setPreview({ isOpen: false, type: '', data: null }),
            onNavigateRef
        }}>
            {children}
            <ConfirmModal 
                isOpen={confirm.isOpen} 
                title={confirm.title} 
                msg={confirm.msg} 
                onClose={() => setConfirm({ ...confirm, isOpen: false })} 
                onConfirm={() => { confirm.onConfirm(); setConfirm({ ...confirm, isOpen: false }); }} 
            />
            <PreviewModal 
                state={preview}
                onClose={() => setPreview({ isOpen: false, type: '', data: null })}
                onNavigate={(path) => onNavigateRef.current(path)}
            />
        </ModalContext.Provider>
    );
};

export const useModals = () => {
    const context = useContext(ModalContext);
    if (!context) throw new Error('useModals debe usarse dentro de un ModalProvider');
    return context;
};