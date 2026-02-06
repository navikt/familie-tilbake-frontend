import type { FaktaResponse } from '../../../../../typer/tilbakekrevingstyper';
import type { FaktaSkjemaData } from '../../typer/fakta';

import { BodyShort, HGrid, HStack, Table, VStack } from '@navikt/ds-react';
import * as React from 'react';

import { harBrukerUttaltSegValgTilTekst } from '../../../../../typer/tilbakekrevingstyper';
import { formatCurrencyNoKr, formatterDatostring } from '../../../../../utils';
import FaktaRevurdering from '../../FaktaRevurdering';
import { FaktaPeriodeSkjema } from '../FaktaPeriodeSkjema';

type Props = {
    skjemaData: FaktaSkjemaData;
    fakta: FaktaResponse;
};

const HistoriskFaktaVisning: React.FC<Props> = ({ skjemaData, fakta }) => {
    return (
        <HGrid columns={2} gap="space-40">
            <VStack gap="space-24">
                <HStack gap="space-20">
                    <div>
                        <BodyShort size="small" weight="semibold">
                            Periode med feilutbetaling
                        </BodyShort>
                        <BodyShort size="small">
                            {`${formatterDatostring(
                                fakta.totalFeilutbetaltPeriode.fom
                            )} - ${formatterDatostring(fakta.totalFeilutbetaltPeriode.tom)}`}
                        </BodyShort>
                    </div>
                    <div>
                        <BodyShort size="small" weight="semibold">
                            Feilutbetalt beløp totalt
                        </BodyShort>
                        <BodyShort size="small">
                            {`${formatCurrencyNoKr(fakta.totaltFeilutbetaltBeløp)}`}
                        </BodyShort>
                    </div>
                    <div>
                        <BodyShort size="small" weight="semibold">
                            Tidligere varslet beløp
                        </BodyShort>
                        <BodyShort size="small">
                            {fakta.varsletBeløp ? `${formatCurrencyNoKr(fakta.varsletBeløp)}` : ''}
                        </BodyShort>
                    </div>
                </HStack>
                <VStack gap="space-4">
                    <Table>
                        <Table.Header>
                            <Table.HeaderCell textSize="small">Periode</Table.HeaderCell>
                            <Table.HeaderCell textSize="small">Rettslig grunnlag</Table.HeaderCell>
                            <Table.HeaderCell textSize="small">Feilutbetalt beløp</Table.HeaderCell>
                        </Table.Header>
                        <Table.Body>
                            {skjemaData.perioder.map((periode, i) => {
                                return (
                                    <FaktaPeriodeSkjema
                                        key={i}
                                        periode={periode}
                                        hendelseTyper={[]}
                                        erLesevisning={true}
                                        index={i}
                                    />
                                );
                            })}
                        </Table.Body>
                    </Table>
                </VStack>
                <VStack gap="space-4">
                    <BodyShort weight="semibold" size="small">
                        Har bruker uttalt seg om feilutbetalingen?
                    </BodyShort>
                    <BodyShort size="small">
                        {
                            harBrukerUttaltSegValgTilTekst[
                                skjemaData.vurderingAvBrukersUttalelse?.harBrukerUttaltSeg
                            ]
                        }
                    </BodyShort>
                    {skjemaData.vurderingAvBrukersUttalelse?.beskrivelse && (
                        <BodyShort size="small">
                            {skjemaData.vurderingAvBrukersUttalelse?.beskrivelse}
                        </BodyShort>
                    )}
                </VStack>
            </VStack>
            <FaktaRevurdering fakta={fakta} />
        </HGrid>
    );
};
export default HistoriskFaktaVisning;
