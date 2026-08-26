import type { FC, ReactNode } from 'react';

import { useSidebarErÅpen } from '@/stores/sidebarStore';

/** Headeren er 48px høy, og resten av viewporten disponeres av behandlingsvisningen. */
export const BEHANDLING_HØYDE = 'h-[calc(100vh-48px)]';
export const BEHANDLING_MINSTEBREDDE = 'min-w-[26rem]';

type Props = {
    children: ReactNode;
};

export const BehandlingGrid: FC<Props> = ({ children }: Props) => {
    const erÅpen = useSidebarErÅpen();

    return (
        <div
            className={`mx-auto w-full max-w-[1600px] ${BEHANDLING_MINSTEBREDDE} grid grid-cols-[1fr_auto] gap-4 p-4 flex-1 min-h-0 ${
                erÅpen ? 'ax-lg:grid-cols-[2fr_1fr]' : ''
            }`}
        >
            {children}
        </div>
    );
};
