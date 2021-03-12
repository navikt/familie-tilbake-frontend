import * as React from 'react';

import styled from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';
import { Normaltekst, Undertittel } from 'nav-frontend-typografi';

import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import { IBehandling } from '../../../typer/behandling';
import { IFeilutbetalingForeldelse } from '../../../typer/feilutbetalingtyper';
import { finnDatoRelativtTilNå } from '../../../utils';
import { Spacer20 } from '../../Felleskomponenter/Flytelementer';
import ForeldelsePerioder from './ForeldelsePeriode/FeilutbetalingForeldelsePerioder';

export const getDate = (): string => {
    return finnDatoRelativtTilNå({ months: -30 });
};

const StyledForeldelse = styled.div`
    padding: 10px;
`;

interface IProps {
    behandling: IBehandling;
}

const ForeldelseContainer: React.FC<IProps> = ({ behandling }) => {
    const [
        feilutbetalingForeldelse,
        settFeilutbetalingForeldelse,
    ] = React.useState<IFeilutbetalingForeldelse>();
    const { hentFeilutbetalingForeldelse } = useBehandling();
    const erLesevisning = false;

    React.useEffect(() => {
        const foreldelse = hentFeilutbetalingForeldelse(behandling.behandlingId);
        if (foreldelse.status === RessursStatus.SUKSESS) {
            settFeilutbetalingForeldelse(foreldelse.data);
        }
    }, [behandling]);

    return feilutbetalingForeldelse ? (
        <StyledForeldelse>
            <Undertittel>Foreldelse</Undertittel>
            <Spacer20 />
            <Normaltekst>
                Perioden før {getDate()} kan være foreldet. Del opp perioden ved behov og fastsett
                foreldelse
            </Normaltekst>
            <Spacer20 />
            <Row>
                <Column xs="12">
                    <ForeldelsePerioder
                        perioder={feilutbetalingForeldelse.perioder}
                        erLesevisning={erLesevisning}
                    />
                </Column>
            </Row>
        </StyledForeldelse>
    ) : null;
};

export default ForeldelseContainer;
