import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { ToastState } from '../../shared/types/models';

interface ToastContextType {
    showToast: (msg: string, isError?: boolean) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
    const [toast, setToast] = useState<ToastState | null>(null);

    const showToast = (msg: string, isError = false) => {
        setToast({ msg, isError });
        setTimeout(() => setToast(null), 4000);
    };

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 no-print">
                {toast && (
                    <div className={`p-4 rounded-xl shadow-lg flex items-center gap-3 transition-all fade-in ${toast.isError ? 'bg-[var(--error)] text-white' : 'theme-bg-container theme-border border theme-text-main'}`}>
                        {toast.isError ? <XCircle className="w-5 h-5"/> : <CheckCircle2 className={`w-5 h-5 text-[var(--success)]`}/>}
                        <p className="text-sm font-medium">{toast.msg}</p>
                    </div>
                )}
            </div>
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error('useToast debe usarse dentro de un ToastProvider');
    return context;
};