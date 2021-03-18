import * as React from 'react';

import styled from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';
import { Normaltekst, Undertittel } from 'nav-frontend-typografi';

import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import { Behandlingssteg, Behandlingsstegstatus, IBehandling } from '../../../typer/behandling';
import { IFeilutbetalingForeldelse } from '../../../typer/feilutbetalingtyper';
import { finnDatoRelativtTilNå } from '../../../utils';
import { Spacer20, Spacer8 } from '../../Felleskomponenter/Flytelementer';
import ForeldelsePerioder from './ForeldelsePeriode/FeilutbetalingForeldelsePerioder';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';

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
    const [stegErBehandlet, settStegErBehandlet] = React.useState<boolean>(false);
    const [erAutoutført, settErAutoutført] = React.useState<boolean>();
    const {
        aktivtSteg,
        erStegBehandlet,
        behandlingILesemodus,
        hentFeilutbetalingForeldelse,
    } = useBehandling();
    const erLesevisning = !!behandlingILesemodus;

    React.useEffect(() => {
        const foreldelseSteg = behandling.behandlingsstegsinfo?.find(
            stegInfo => stegInfo.behandlingssteg === Behandlingssteg.FORELDELSE
        );
        const autoutført =
            foreldelseSteg?.behandlingsstegstatus === Behandlingsstegstatus.AUTOUTFØRT;
        settErAutoutført(autoutført);

        if (!autoutført) {
            settStegErBehandlet(erStegBehandlet(Behandlingssteg.FORELDELSE));
            const foreldelse = hentFeilutbetalingForeldelse(behandling.behandlingId);
            if (foreldelse.status === RessursStatus.SUKSESS) {
                settFeilutbetalingForeldelse(foreldelse.data);
            }
        }
    }, [behandling]);

    return (
        <StyledForeldelse>
            <Undertittel>Foreldelse</Undertittel>
            <Spacer20 />
            {erAutoutført && (
                <div>
                    <Normaltekst>Foreldelsesloven §§ 2 og 3</Normaltekst>
                    <Spacer8 />
                    <Normaltekst>Automatisk vurdert</Normaltekst>
                </div>
            )}
            {feilutbetalingForeldelse && (
                <>
                    {aktivtSteg && (
                        <>
                            <Steginformasjon
                                behandletSteg={stegErBehandlet}
                                infotekst={`Perioden før ${getDate()} kan være foreldet. Del opp perioden ved behov og
                            fastsett foreldelse`}
                            />
                            <Spacer20 />
                        </>
                    )}
                    <Row>
                        <Column xs="12">
                            <ForeldelsePerioder
                                perioder={feilutbetalingForeldelse.perioder}
                                erLesevisning={erLesevisning}
                            />
                        </Column>
                    </Row>
                </>
            )}
        </StyledForeldelse>
    );
};

export default ForeldelseContainer;
