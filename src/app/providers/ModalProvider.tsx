import React, { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { ConfirmModal, PreviewModal } from '../../shared/components/Modals';
import type { ConfirmModalState, PreviewModalState } from '../../shared/types/models';

interface ModalContextType {
    openConfirmModal: (title: string, msg: string, onConfirm: () => void) => void;
    openPreviewModal: (type: 'rrss' | 'comment', data: any) => void;
    closePreviewModal: () => void;
    onNavigateRef: React.MutableRefObject<(path: string) => void>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({ children }: { children: ReactNode }) => {
    const [confirm, setConfirm] = useState<ConfirmModalState>({ isOpen: false, title: '', msg: '', onConfirm: () => {} });
    const [preview, setPreview] = useState<PreviewModalState>({ isOpen: false, type: '', data: null });
    const onNavigateRef = React.useRef<(path: string) => void>(() => {});

    // 🚨 FIX REACT DOCTOR: Estabilizamos la función para que no rompa las dependencias del memo
    const openConfirmModal = React.useCallback((title: string, msg: string, onConfirm: () => void) => {
        setConfirm({ isOpen: true, title, msg, onConfirm });
    }, []);

    const openPreviewModal = React.useCallback((type: 'rrss' | 'comment', data: any) => {
        setPreview({ isOpen: true, type, data });
    }, []);

    const closePreviewModal = React.useCallback(() => {
        setPreview({ isOpen: false, type: '', data: null });
    }, []);

    // 🚨 FIX REACT DOCTOR: useMemo para evitar renderizados infinitos en los consumidores
    const contextValue = useMemo(() => ({
        openConfirmModal,
        openPreviewModal,
        closePreviewModal,
        onNavigateRef
    }), [openConfirmModal, openPreviewModal, closePreviewModal]);

    return (
        <ModalContext.Provider value={contextValue}>
            {children}
            <ConfirmModal 
                isOpen={confirm.isOpen} 
                title={confirm.title} 
                msg={confirm.msg} 
                onClose={() => setConfirm(prev => ({ ...prev, isOpen: false }))} 
                onConfirm={() => { confirm.onConfirm(); setConfirm(prev => ({ ...prev, isOpen: false })); }} 
            />
            <PreviewModal 
                state={preview}
                onClose={closePreviewModal}
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