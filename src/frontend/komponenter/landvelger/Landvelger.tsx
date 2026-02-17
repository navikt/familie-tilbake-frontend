import { UNSAFE_Combobox } from '@navikt/ds-react';
import { countries } from 'countries-list';
import React, { useMemo } from 'react';

import { norskLandnavn } from '../../utils/land';

export type Land = {
    alpha2: string;
};

type Props = {
    id: string;
    valgtLandkode: Land['alpha2'];
    håndterLandValgt: (land: Land) => void;
    eksluderLandkoder?: string[];
    error?: string;
};

export const Landvelger: React.FC<Props> = ({
    id,
    eksluderLandkoder = [],
    valgtLandkode,
    håndterLandValgt,
    error,
}) => {
    const landListe = useMemo(() => {
        return Object.entries(countries)
            .filter(([alpha2]) => !eksluderLandkoder.includes(alpha2))
            .map(([alpha2]) => ({
                alpha2,
                navn: norskLandnavn(alpha2),
            }))
            .sort((a, b) => a.navn.localeCompare(b.navn, 'nb'));
    }, [eksluderLandkoder]);

    const valgtLand = useMemo(() => {
        const land = landListe.find(({ alpha2 }) => alpha2 === valgtLandkode);
        return land?.navn ?? '';
    }, [landListe, valgtLandkode]);

    return (
        <UNSAFE_Combobox
            id={id}
            label="Land"
            aria-label="Velg land for brevmottaker"
            selectedOptions={valgtLand ? [valgtLand] : []}
            options={landListe.map(({ alpha2, navn }) => ({
                value: alpha2,
                label: navn,
            }))}
            onToggleSelected={(alpha2: Land['alpha2']) => håndterLandValgt({ alpha2 })}
            error={error}
            shouldAutocomplete
        />
    );
};
