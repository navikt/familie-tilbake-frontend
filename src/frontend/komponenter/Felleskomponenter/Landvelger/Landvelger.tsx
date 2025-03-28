import { UNSAFE_Combobox } from '@navikt/ds-react';
import { countries } from 'countries-list';
import React, { useMemo } from 'react';

import { norskLandnavn } from '../../../utils/land';

export type Land = {
    alpha2: string;
};

interface Props {
    id: string;
    defaultValue: Land['alpha2'];
    håndterLandValgt: (land: Land) => void;
    eksluderLandkoder?: string[];
    error?: string;
}

const Landvelger: React.FC<Props> = ({
    id,
    eksluderLandkoder = [],
    defaultValue,
    håndterLandValgt,
    error,
}) => {
    const landListe = useMemo(() => {
        return Object.entries(countries)
            .filter(([alpha2]) => !eksluderLandkoder.includes(alpha2))
            .map(([alpha2, { name: engelskLandNavn }]) => ({
                alpha2,
                navn: norskLandnavn(alpha2) || engelskLandNavn,
            }))
            .sort((a, b) => a.navn.localeCompare(b.navn, 'nb'));
    }, [eksluderLandkoder]);

    const valgtLand = useMemo(() => {
        const land = landListe.find(({ alpha2 }) => alpha2 === defaultValue);
        return land?.navn ?? '';
    }, [landListe, defaultValue]);

    return (
        <UNSAFE_Combobox
            id={id}
            label="Land"
            defaultValue={valgtLand}
            options={landListe.map(({ alpha2, navn }) => ({
                value: alpha2,
                label: navn,
            }))}
            onToggleSelected={(alpha2: Land['alpha2']) => håndterLandValgt({ alpha2 })}
            error={error}
        />
    );
};

export default Landvelger;
