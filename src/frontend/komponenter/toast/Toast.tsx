import type { Toast as TToast } from './typer';
import type { FC } from 'react';

import { LocalAlert } from '@navikt/ds-react';
import { useEffect, useRef } from 'react';

import { useApp } from '~/context/AppContext';

export const Toast: FC<{ toastId: string; toast: TToast }> = ({ toastId, toast }) => {
    const { toasts, settToasts } = useApp();
    const toastRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        (toastRef.current as HTMLSpanElement).focus();
    }, [toastRef]);

    /**
     * Vis beskjed i minst 7 sekunder og mer dersom teksten er lang.
     *
     * Basert på lenken under, men forenklet litt.
     * https://ux.stackexchange.com/questions/11203/how-long-should-a-temporary-notification-toast-appear
     */
    useEffect(() => {
        const timer = setTimeout(
            () => {
                // eslint-disable-next-line
                const { [toastId]: fjernetToast, ...resterendeToast } = toasts;
                settToasts(resterendeToast);
            },
            Math.max(...[toast.tekst.length * 50, 7000])
        );
        return (): void => clearTimeout(timer);
    });

    return (
        <div
            ref={toastRef}
            className="col-start-3 w-80 z-9999 mt-auto mr-0 mb-[1.7rem] ml-auto focus:rounded focus:shadow-[0_0_0_3px_#00347d] focus:outline-none"
        >
            <LocalAlert status={toast.alertType}>
                <LocalAlert.Content>{toast.tekst}</LocalAlert.Content>
            </LocalAlert>
        </div>
    );
};
