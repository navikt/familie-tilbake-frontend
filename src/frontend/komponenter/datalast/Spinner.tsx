import { Loader } from '@navikt/ds-react';
import React from 'react';

type Props = {
    type: string;
};

export const Spinner: React.FC<Props> = ({ type }) => {
    return (
        <div className="min-h-screen bg-surface-subtle flex items-center justify-center">
            <div className="text-center">
                <Loader size="3xlarge" title={`Laster ${type}...`} />
                <p className="mt-4 text-text-subtle">Henter {type}...</p>
            </div>
        </div>
    );
};
