import * as React from 'react';

import styled from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';

import { Alert, BodyLong, Heading, Loader } from '@navikt/ds-react';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import {
    Ytelsetype,
    vilkårsvurderingStegInfotekst,
    vilkårsvurderingStegInfotekstKontantstøtte,
    vilkårsvurderingStegInfotekstBarnetrygd,
} from '../../../kodeverk';
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

    const stegInfotekst = {
        [Ytelsetype.BARNETRYGD]: vilkårsvurderingStegInfotekstBarnetrygd,
        [Ytelsetype.KONTANTSTØTTE]: vilkårsvurderingStegInfotekstKontantstøtte,
        [Ytelsetype.BARNETILSYN]: vilkårsvurderingStegInfotekst,
        [Ytelsetype.OVERGANGSSTØNAD]: vilkårsvurderingStegInfotekst,
        [Ytelsetype.SKOLEPENGER]: vilkårsvurderingStegInfotekst,
    }[fagsak.ytelsestype];

    switch (feilutbetalingVilkårsvurdering?.status) {
        case RessursStatus.SUKSESS: {
            const totalbeløpErUnder4Rettsgebyr = erTotalbeløpUnder4Rettsgebyr(
                feilutbetalingVilkårsvurdering.data
            );

            return (
                <StyledVilkårsvurdering>
                    <Heading level="2" size="small" spacing>
                        Tilbakekreving
                    </Heading>
                    {erAutoutført && (
                        <>
                            <BodyLong size="small" spacing>
                                Automatisk vurdert. Alle perioder er foreldet.
                            </BodyLong>
                        </>
                    )}
                    {!erAutoutført && (!erLesevisning || stegErBehandlet) && (
                        <>
                            <Steginformasjon
                                behandletSteg={stegErBehandlet}
                                infotekst={stegInfotekst}
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
