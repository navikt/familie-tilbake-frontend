import { Alert } from '@navikt/ds-react';
import * as React from 'react';

import HenterData from './HenterData';
import { ServerFeil } from '../../../pages/feilsider/Feilside';
import { type Ressurs, RessursStatus } from '../../../typer/ressurs';

interface IProps {
    ressurser: (Ressurs<unknown> | undefined)[];
    eksternFagsakId?: string;
    behandlingId?: string;
    henteBeskrivelse?: string;
    visFeilSide?: boolean;
    spinnerStørrelse?: '2xlarge' | 'large';
}

const DataLastIkkeSuksess: React.FC<IProps> = ({
    ressurser,
    spinnerStørrelse,
    henteBeskrivelse,
    visFeilSide,
    eksternFagsakId,
    behandlingId,
}) => {
    const filtrerteRessurser = ressurser.filter(ressurs => ressurs !== undefined);
    const ingenTilgangRessurs = filtrerteRessurser.find(
        ressurs => ressurs.status === RessursStatus.IkkeTilgang
    );
    const serverFeil = filtrerteRessurser.find(
        ressurs => ressurs.status === RessursStatus.ServerFeil
    );

    if (ingenTilgangRessurs) {
        return <Alert variant="warning">Ingen tilgang</Alert>;
    }
    const feiletRessurs = filtrerteRessurser.find(
        ressurs =>
            ressurs.status === RessursStatus.Feilet ||
            ressurs.status === RessursStatus.FunksjonellFeil
    );
    if (serverFeil && visFeilSide) {
        return <ServerFeil eksternFagsakId={eksternFagsakId} behandlingId={behandlingId} />;
    }
    if (feiletRessurs) {
        return <Alert variant="error">{feiletRessurs.frontendFeilmelding}</Alert>;
    }

    if (serverFeil) {
        return <Alert variant="error">{serverFeil.frontendFeilmelding}</Alert>;
    }

    const henterRessurs = filtrerteRessurser.find(
        ressurs => ressurs.status === RessursStatus.Henter
    );
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
