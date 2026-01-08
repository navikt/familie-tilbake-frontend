import { Loader } from '@navikt/ds-react';
import React from 'react';

export const FagsakLoadingSkeleton: React.FC = () => {
    return (
        <div className="min-h-screen bg-surface-subtle flex items-center justify-center">
            <div className="text-center">
                <Loader size="3xlarge" title="Laster fagsak..." />
                <p className="mt-4 text-text-subtle">Henter fagsaksinformasjon...</p>
            </div>
        </div>
    );
};
