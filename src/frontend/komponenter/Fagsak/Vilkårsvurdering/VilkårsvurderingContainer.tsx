import * as React from 'react';

import { styled } from 'styled-components';

import { Alert, BodyLong, Heading, VStack } from '@navikt/ds-react';
import { ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import { RessursStatus } from '@navikt/familie-typer';

import {
    erTotalbeløpUnder4Rettsgebyr,
    useFeilutbetalingVilkårsvurdering,
} from './FeilutbetalingVilkårsvurderingContext';
import VilkårsvurderingPerioder from './VilkårsvurderingPerioder';
import { useBehandling } from '../../../context/BehandlingContext';
import {
    Ytelsetype,
    vilkårsvurderingStegInfotekst,
    vilkårsvurderingStegInfotekstKontantstøtte,
    vilkårsvurderingStegInfotekstBarnetrygd,
} from '../../../kodeverk';
import { IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';
import HenterData from '../../Felleskomponenter/HenterData/HenterData';

const StyledVilkårsvurdering = styled.div`
    padding: ${ASpacing3};
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
                    <VStack gap="5">
                        {erAutoutført && (
                            <BodyLong size="small">
                                Automatisk vurdert. Alle perioder er foreldet.
                            </BodyLong>
                        )}
                        {!erAutoutført && (!erLesevisning || stegErBehandlet) && (
                            <Steginformasjon
                                behandletSteg={stegErBehandlet}
                                infotekst={stegInfotekst}
                            />
                        )}
                        {skjemaData && skjemaData.length > 0 && (
                            <VilkårsvurderingPerioder
                                behandling={behandling}
                                perioder={skjemaData}
                                erTotalbeløpUnder4Rettsgebyr={totalbeløpErUnder4Rettsgebyr}
                                erLesevisning={erLesevisning}
                                fagsak={fagsak}
                            />
                        )}
                    </VStack>
                </StyledVilkårsvurdering>
            );
        }
        case RessursStatus.HENTER:
            return <HenterData beskrivelse="Henting av feilutbetalingen tar litt tid." />;
        case RessursStatus.FEILET:
        case RessursStatus.FUNKSJONELL_FEIL:
            return (
                <Alert variant="error">{feilutbetalingVilkårsvurdering.frontendFeilmelding}</Alert>
            );
        default:
            return <Alert variant="warning">Kunne ikke hente data om vilkårsvurdering</Alert>;
    }
};

export default VilkårsvurderingContainer;
