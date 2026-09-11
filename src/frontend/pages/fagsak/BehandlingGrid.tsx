import type { FC, ReactNode } from 'react';

import { useSidebarVisning } from '@/komponenter/sidebar/useSidebarVisning';

/** Headeren er 48px høy, og resten av viewporten disponeres av behandlingsvisningen. */
export const BEHANDLING_HØYDE = 'h-[calc(100vh-48px)]';
export const BEHANDLING_MINSTEBREDDE = 'min-w-[20rem]';

type Props = {
    children: ReactNode;
};

export const BehandlingGrid: FC<Props> = ({ children }: Props) => {
    const { visPanel, tarOverSkjermen } = useSidebarVisning();
    const kolonner = tarOverSkjermen
        ? 'grid-cols-1'
        : `grid-cols-[1fr_auto] ${visPanel ? 'ax-lg:grid-cols-[2fr_1fr]' : ''}`;

    return (
        <div
            className={`mx-auto w-full max-w-[1600px] ${BEHANDLING_MINSTEBREDDE} grid ${kolonner} gap-4 p-4 flex-1 min-h-0`}
        >
            {children}
        </div>
    );
};
