import type { FC } from 'react';

import { useApp } from '~/context/AppContext';

import { Toast } from './Toast';

export const Toasts: FC = () => {
    const { toasts } = useApp();

    return (
        <div className="fixed right-8 float-right bottom-0 z-9999">
            {Object.entries(toasts).map(([toastId, toast]) => (
                <Toast key={toastId} toastId={toastId} toast={toast} />
            ))}
        </div>
    );
};
