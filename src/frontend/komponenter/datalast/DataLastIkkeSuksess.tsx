import type { FC } from 'react';

import { LocalAlert } from '@navikt/ds-react';

import { Serverfeil } from '~/pages/feilsider/serverfeil';
import { type Ressurs, RessursStatus } from '~/typer/ressurs';

import { HenterData } from './HenterData';

type Props = {
    ressurser: (Ressurs<unknown> | undefined)[];
    henteBeskrivelse?: string;
    visFeilSide?: boolean;
    spinnerStørrelse?: '2xlarge' | 'large';
};

export const DataLastIkkeSuksess: FC<Props> = ({
    ressurser,
    spinnerStørrelse,
    henteBeskrivelse,
    visFeilSide,
}) => {
    const filtrerteRessurser = ressurser.filter(ressurs => ressurs !== undefined);
    const ingenTilgangRessurs = filtrerteRessurser.find(
        ressurs => ressurs.status === RessursStatus.IkkeTilgang
    );
    const serverFeil = filtrerteRessurser.find(
        ressurs => ressurs.status === RessursStatus.ServerFeil
    );

    if (ingenTilgangRessurs) {
        return (
            <LocalAlert status="warning">
                <LocalAlert.Content>Ingen tilgang</LocalAlert.Content>
            </LocalAlert>
        );
    }
    const feiletRessurs = filtrerteRessurser.find(
        ressurs =>
            ressurs.status === RessursStatus.Feilet ||
            ressurs.status === RessursStatus.FunksjonellFeil
    );
    if (serverFeil && visFeilSide) {
        return <Serverfeil />;
    }
    if (feiletRessurs) {
        return (
            <LocalAlert status="error">
                <LocalAlert.Content>{feiletRessurs.frontendFeilmelding}</LocalAlert.Content>
            </LocalAlert>
        );
    }

    if (serverFeil) {
        return (
            <LocalAlert status="error">
                <LocalAlert.Content>{serverFeil.frontendFeilmelding}</LocalAlert.Content>
            </LocalAlert>
        );
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
