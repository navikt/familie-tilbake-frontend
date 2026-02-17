import React from 'react';

import { Toast } from './Toast';
import { useApp } from '../../context/AppContext';

export const Toasts: React.FC = () => {
    const { toasts } = useApp();

    return (
        <div className="fixed right-8 float-right bottom-0 z-9999">
            {Object.entries(toasts).map(([toastId, toast]) => (
                <Toast key={toastId} toastId={toastId} toast={toast} />
            ))}
        </div>
    );
};
