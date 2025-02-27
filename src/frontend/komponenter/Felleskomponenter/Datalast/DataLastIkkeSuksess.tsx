import { Alert } from '@navikt/ds-react';
import * as React from 'react';

import HenterData from './HenterData';
import { type Ressurs, RessursStatus } from '../../../typer/ressurs';

interface IProps {
    ressurser: (Ressurs<unknown> | undefined)[];
    henteBeskrivelse?: string;
    spinnerStørrelse?: '2xlarge' | 'large';
}

const DataLastIkkeSuksess: React.FC<IProps> = ({
    ressurser,
    spinnerStørrelse,
    henteBeskrivelse,
}) => {
    const filtrerteRessurser = ressurser.filter(r => r !== undefined);
    const ingenTilgangRessurs = filtrerteRessurser.find(
        r => r.status === RessursStatus.IkkeTilgang
    );
    if (ingenTilgangRessurs) {
        return <Alert variant="warning">Ingen tilgang</Alert>;
    }
    const feiletRessurs = filtrerteRessurser.find(
        r => r.status === RessursStatus.Feilet || r.status === RessursStatus.FunksjonellFeil
    );
    if (feiletRessurs) {
        return <Alert variant="error">{feiletRessurs.frontendFeilmelding}</Alert>;
    }
    const henterRessurs = filtrerteRessurser.find(r => r.status === RessursStatus.Henter);
    if (henterRessurs) {
        return (
            <HenterData
                beskrivelse={henteBeskrivelse || 'Henter data om feilutbetalingen...'}
                størrelse={spinnerStørrelse}
            />
        );
    }
    return null;
};

export default DataLastIkkeSuksess;
