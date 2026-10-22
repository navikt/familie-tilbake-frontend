import type { FC, ReactNode } from 'react';

import { ApmErrorBoundary } from '@nais/apm/react';

import { InternServerFeil } from '@/pages/feilsider/InternServerFeil';

type Props = {
    children: ReactNode;
};

export const ErrorBoundary: FC<Props> = ({ children }: Props) => (
    <ApmErrorBoundary fallback={<InternServerFeil />}>{children}</ApmErrorBoundary>
);
