import type { FC, ReactNode } from 'react';

import { useSidebarVisning } from '@/komponenter/sidebar/useSidebarVisning';

type Props = {
    children: ReactNode;
    className?: string;
    'aria-label'?: string;
};

export const BehandlingInnhold: FC<Props> = ({
    children,
    className = '',
    'aria-label': ariaLabel,
}: Props) => {
    const { tarOverSkjermen } = useSidebarVisning();

    return (
        <section
            aria-label={ariaLabel}
            hidden={tarOverSkjermen}
            className={`${tarOverSkjermen ? '' : 'flex'} ${className}`}
        >
            {children}
        </section>
    );
};
