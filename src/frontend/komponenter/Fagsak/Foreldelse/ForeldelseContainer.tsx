import * as React from 'react';

import styled from 'styled-components';

import AlertStripe from 'nav-frontend-alertstriper';
import { Column, Row } from 'nav-frontend-grid';
import { Knapp } from 'nav-frontend-knapper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Normaltekst, Undertittel } from 'nav-frontend-typografi';

import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import { IBehandling } from '../../../typer/behandling';
import { finnDatoRelativtTilNå } from '../../../utils';
import { Navigering, Spacer20, Spacer8 } from '../../Felleskomponenter/Flytelementer';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';
import { useFeilutbetalingForeldelse } from './FeilutbetalingForeldelseContext';
import FeilutbetalingForeldelsePerioder from './ForeldelsePeriode/FeilutbetalingForeldelsePerioder';

export const getDate = (): string => {
    return finnDatoRelativtTilNå({ months: -30 });
};

const StyledForeldelse = styled.div`
    padding: 10px;
`;

const HenterContainer = styled(StyledForeldelse)`
    text-align: center;
`;

interface IProps {
    behandling: IBehandling;
}

const ForeldelseContainer: React.FC<IProps> = ({ behandling }) => {
    const {
        feilutbetalingForeldelse,
        skjemaData,
        stegErBehandlet,
        erAutoutført,
        gåTilNeste,
        gåTilForrige,
    } = useFeilutbetalingForeldelse();
    const { behandlingILesemodus } = useBehandling();
    const erLesevisning = !!behandlingILesemodus || !!erAutoutført;

    if (erAutoutført) {
        return (
            <StyledForeldelse>
                <Undertittel>Foreldelse</Undertittel>
                <Spacer20 />
                <Normaltekst>Foreldelsesloven §§ 2 og 3</Normaltekst>
                <Spacer8 />
                <Normaltekst>Automatisk vurdert</Normaltekst>
                <Spacer20 />
                <Row>
                    <Column xs="10" md="4">
                        <Navigering>
                            <div>
                                <Knapp type={'hoved'} onClick={gåTilNeste} mini={true}>
                                    Neste
                                </Knapp>
                            </div>
                            <div>
                                <Knapp onClick={gåTilForrige} mini={true}>
                                    Forrige
                                </Knapp>
                            </div>
                        </Navigering>
                    </Column>
                </Row>
            </StyledForeldelse>
        );
    }

    switch (feilutbetalingForeldelse?.status) {
        case RessursStatus.SUKSESS:
            return (
                <StyledForeldelse>
                    <Undertittel>Foreldelse</Undertittel>
                    <Spacer20 />
                    {(!erLesevisning || stegErBehandlet) && (
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
                            {skjemaData.length > 0 && (
                                <FeilutbetalingForeldelsePerioder
                                    behandling={behandling}
                                    perioder={skjemaData}
                                    erLesevisning={erLesevisning}
                                />
                            )}
                        </Column>
                    </Row>
                </StyledForeldelse>
            );
        case RessursStatus.HENTER:
            return (
                <HenterContainer>
                    <Normaltekst>Henting av feilutbetalingen tar litt tid.</Normaltekst>
                    <NavFrontendSpinner type="XXL" />
                </HenterContainer>
            );
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
            return (
                <AlertStripe children={feilutbetalingForeldelse.frontendFeilmelding} type="feil" />
            );
        default:
            return <div />;
    }
};

export default ForeldelseContainer;
