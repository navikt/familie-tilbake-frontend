import type { FC } from 'react';
import type { Toast as TToast } from './typer';

import { LocalAlert } from '@navikt/ds-react';
import { useEffect, useRef } from 'react';

import { useApp } from '@/context/AppContext';

type Props = {
    toastId: string;
    toast: TToast;
};

export const Toast: FC<Props> = ({ toastId, toast }: Props) => {
    const { toasts, setToasts } = useApp();
    const toastRef = useRef<HTMLDivElement>(null);

    // biome-ignore lint/correctness/useExhaustiveDependencies: Se på om dette er en bug eller tiltenkt funksjonalitet. Vurder useEffectEvent senere.
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
                const { [toastId]: fjernetToast, ...resterendeToast } = toasts;
                setToasts(resterendeToast);
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
                <LocalAlert.Header>
                    <LocalAlert.Title>{toast.tekst}</LocalAlert.Title>
                </LocalAlert.Header>
            </LocalAlert>
        </div>
    );
};
