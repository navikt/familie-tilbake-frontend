import * as React from 'react';

import { styled } from 'styled-components';

import { Alert, BodyLong, Heading, Loader, Select, VStack } from '@navikt/ds-react';
import { ASpacing3 } from '@navikt/ds-tokens/dist/tokens';
import { RessursStatus } from '@navikt/familie-typer';

import { useHistoriskVilkårsvurdering } from './HistoriskVilkårsvurderingContext';
import HistoriskVilkårsvurderingVisning from './HistoriskVilkårsvurderingVisning';
import { IBehandling } from '../../../../typer/behandling';
import { IFagsak } from '../../../../typer/fagsak';
import { formatterDatoOgTidstring } from '../../../../utils';

const StyledVilkårsvurdering = styled.div`
    padding: ${ASpacing3};
`;

const HenterContainer = styled(StyledVilkårsvurdering)`
    text-align: center;
`;

interface IProps {
    fagsak: IFagsak;
    behandling: IBehandling;
}

const HistoriskVilkårsvurderingContainer: React.FC<IProps> = () => {
    const {
        feilutbetalingInaktiveVilkårsvurderinger,
        skjemaData,
        settFeilutbetalingInaktivVilkårsvurdering,
    } = useHistoriskVilkårsvurdering();

    switch (feilutbetalingInaktiveVilkårsvurderinger?.status) {
        case RessursStatus.SUKSESS: {
            return (
                <StyledVilkårsvurdering>
                    <VStack gap="5">
                        <Heading level="2" size="small">
                            Tidligere vilkårsvurderinger på denne behandlingen
                        </Heading>
                        <Select
                            onChange={e => {
                                const valgtVurdering =
                                    feilutbetalingInaktiveVilkårsvurderinger.data.find(
                                        vurdering => vurdering.opprettetTid === e.target.value
                                    );
                                settFeilutbetalingInaktivVilkårsvurdering(valgtVurdering);
                            }}
                            label={'Velg versjon'}
                        >
                            <option>Velg</option>
                            {feilutbetalingInaktiveVilkårsvurderinger.data
                                .reverse()
                                .map((vurdering, index) => {
                                    return (
                                        vurdering.opprettetTid && (
                                            <option value={vurdering.opprettetTid} key={index}>
                                                Endret{' '}
                                                {formatterDatoOgTidstring(vurdering.opprettetTid)}
                                            </option>
                                        )
                                    );
                                })}
                        </Select>
                        {skjemaData && skjemaData.length > 0 && (
                            <HistoriskVilkårsvurderingVisning perioder={skjemaData} />
                        )}
                    </VStack>
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
                    children={feilutbetalingInaktiveVilkårsvurderinger.frontendFeilmelding}
                    variant="error"
                />
            );
    }
};

export default HistoriskVilkårsvurderingContainer;
