import * as React from 'react';

import { BodyLong, ExpansionCard, Heading } from '@navikt/ds-react';

import { Avsnittstype, Underavsnittstype } from '../../../kodeverk';
import { Spacer8 } from '../../Felleskomponenter/Flytelementer';
import { AvsnittSkjemaData } from './typer/feilutbetalingVedtak';
import VedtakFritekstSkjema from './VedtakFritekstSkjema';
import { styled } from 'styled-components';

const StyledExpansionCard = styled(ExpansionCard)<{ $påkrevdFritekstIkkeOppfylt: boolean }>`
    margin-bottom: 1rem;
`;
const skalVisesÅpen = (avsnitt: AvsnittSkjemaData) => {
    if (avsnitt.avsnittstype === Avsnittstype.OPPSUMMERING) {
        return avsnitt.underavsnittsliste.some(
            underavsnitt =>
                underavsnitt.fritekstPåkrevet && (!underavsnitt.fritekst || underavsnitt.harFeil)
        );
    }
    if (avsnitt.avsnittstype === Avsnittstype.PERIODE) {
        return avsnitt.underavsnittsliste
            .filter(
                underavsnitt =>
                    underavsnitt.underavsnittstype === Underavsnittstype.FAKTA ||
                    underavsnitt.underavsnittstype === Underavsnittstype.SÆRLIGEGRUNNER_ANNET
            )
            .some(
                underavsnitt =>
                    underavsnitt.fritekstPåkrevet &&
                    (!underavsnitt.fritekst || underavsnitt.harFeil)
            );
    }

    return false;
};

export const avsnittKey = (avsnitt: AvsnittSkjemaData): string =>
    `${avsnitt.avsnittstype}_${avsnitt.fom}`;

interface IProps {
    avsnitt: AvsnittSkjemaData;
    erLesevisning: boolean;
    erRevurderingBortfaltBeløp: boolean;
}

const AvsnittSkjema: React.FC<IProps> = ({
    avsnitt,
    erLesevisning,
    erRevurderingBortfaltBeløp,
}) => {
    const [åpen, settÅpen] = React.useState<boolean>(false);

    const harPåkrevetFritekstMenIkkeUtfylt = skalVisesÅpen(avsnitt);

    React.useEffect(() => {
        settÅpen(åpen || harPåkrevetFritekstMenIkkeUtfylt);
    }, [avsnitt]);

    return (
        <StyledExpansionCard
            open={!erLesevisning && åpen}
            onToggle={() => settÅpen(!åpen)}
            aria-label={avsnitt.overskrift ?? 'ekspanderbart panel'}
            size="small"
        >
            <ExpansionCard.Header>
                <ExpansionCard.Title size="small">{avsnitt.overskrift ?? ''}</ExpansionCard.Title>
            </ExpansionCard.Header>
            <ExpansionCard.Content>
                {avsnitt.underavsnittsliste.map(underavsnitt => {
                    return (
                        <React.Fragment
                            key={
                                '' +
                                underavsnitt.underavsnittstype +
                                underavsnitt.overskrift +
                                underavsnitt.brødtekst
                            }
                        >
                            {underavsnitt.overskrift && (
                                <Heading level="3" size="xsmall">
                                    {underavsnitt.overskrift}
                                </Heading>
                            )}
                            {underavsnitt.brødtekst && (
                                <BodyLong size="small">{underavsnitt.brødtekst}</BodyLong>
                            )}
                            {underavsnitt.fritekstTillatt && (
                                <VedtakFritekstSkjema
                                    avsnittIndex={avsnitt.index}
                                    underavsnitt={underavsnitt}
                                    erLesevisning={erLesevisning}
                                    maximumLength={erRevurderingBortfaltBeløp ? 10000 : undefined}
                                />
                            )}
                            <Spacer8 />
                        </React.Fragment>
                    );
                })}
            </ExpansionCard.Content>
        </StyledExpansionCard>
    );
};

export default AvsnittSkjema;
