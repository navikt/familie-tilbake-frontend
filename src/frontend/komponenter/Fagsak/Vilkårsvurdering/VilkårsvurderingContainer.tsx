import * as React from 'react';

import styled from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';
import { Normaltekst, Undertittel } from 'nav-frontend-typografi';

import { Alert, BodyLong, Loader } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import { Ytelsetype } from '../../../kodeverk';
import { IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import { Spacer20 } from '../../Felleskomponenter/Flytelementer';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';
import {
    erTotalbeløpUnder4Rettsgebyr,
    useFeilutbetalingVilkårsvurdering,
} from './FeilutbetalingVilkårsvurderingContext';
import VilkårsvurderingPerioder from './VilkårsvurderingPerioder';

const StyledVilkårsvurdering = styled.div`
    padding: 10px;
`;

const HenterContainer = styled(StyledVilkårsvurdering)`
    text-align: center;
`;

interface IProps {
    fagsak: IFagsak;
    behandling: IBehandling;
}

const VilkårsvurderingContainer: React.FC<IProps> = ({ fagsak, behandling }) => {
    const { feilutbetalingVilkårsvurdering, stegErBehandlet, erAutoutført, skjemaData } =
        useFeilutbetalingVilkårsvurdering();
    const { behandlingILesemodus } = useBehandling();
    const erLesevisning = !!behandlingILesemodus || !!erAutoutført;
    const erBarnetrygd = fagsak.ytelsestype === Ytelsetype.BARNETRYGD;

    switch (feilutbetalingVilkårsvurdering?.status) {
        case RessursStatus.SUKSESS: {
            const totalbeløpErUnder4Rettsgebyr = erTotalbeløpUnder4Rettsgebyr(
                feilutbetalingVilkårsvurdering.data
            );

            return (
                <StyledVilkårsvurdering>
                    <Undertittel>Tilbakekreving</Undertittel>
                    <Spacer20 />
                    {erAutoutført && (
                        <>
                            <Normaltekst>
                                Automatisk vurdert. Alle perioder er foreldet.
                            </Normaltekst>
                            <Spacer20 />
                        </>
                    )}
                    {!erAutoutført && (!erLesevisning || stegErBehandlet) && (
                        <>
                            <Steginformasjon
                                behandletSteg={stegErBehandlet}
                                infotekst={
                                    erBarnetrygd
                                        ? 'Fastsett tilbakekreving etter barnetrygdloven § 13 og folketrygdloven § 22-15. Del opp perioden ved behov for ulik vurdering.'
                                        : 'Fastsett tilbakekreving etter §22-15. Del opp perioden ved behov for ulik vurdering.'
                                }
                            />
                            <Spacer20 />
                        </>
                    )}
                    <Row>
                        <Column xs="12">
                            {skjemaData && skjemaData.length > 0 && (
                                <VilkårsvurderingPerioder
                                    behandling={behandling}
                                    perioder={skjemaData}
                                    erTotalbeløpUnder4Rettsgebyr={totalbeløpErUnder4Rettsgebyr}
                                    erLesevisning={erLesevisning}
                                    fagsak={fagsak}
                                />
                            )}
                        </Column>
                    </Row>
                </StyledVilkårsvurdering>
            );
        }
        case RessursStatus.HENTER:
            return (
                <HenterContainer>
                    <BodyLong spacing>Henting av feilutbetalingen tar litt tid.</BodyLong>
                    <Loader
                        size="2xlarge"
                        title="henter..."
                        transparent={false}
                        variant="neutral"
                    />
                </HenterContainer>
            );
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
            return (
                <Alert
                    children={feilutbetalingVilkårsvurdering.frontendFeilmelding}
                    variant="error"
                />
            );
        default:
            return <div />;
    }
};

export default VilkårsvurderingContainer;
