import * as React from 'react';

import styled from 'styled-components';

import { WarningFilled } from '@navikt/ds-icons';
import { Accordion, BodyLong, Heading } from '@navikt/ds-react';
import { NavdsSemanticColorFeedbackWarningBorder } from '@navikt/ds-tokens/dist/tokens';

import { Avsnittstype, Underavsnittstype } from '../../../kodeverk';
import { Spacer8 } from '../../Felleskomponenter/Flytelementer';
import { AvsnittSkjemaData } from './typer/feilutbetalingVedtak';
import VedtakFritekstSkjema from './VedtakFritekstSkjema';

const StyledAccordion = styled(Accordion)`
    margin-bottom: var(--navds-spacing-7);

    &.panel {
        border: 1px solid black;
        border-radius: 5px;
    }

    &.panelMedGulmarkering {
        border: 1px solid black;
        border-left-color: ${NavdsSemanticColorFeedbackWarningBorder};
        border-left-width: 5px;
        border-radius: 5px;
    }

    .navds-accordion__content,
    .navds-accordion__header {
        border: none;
    }
    .navds-accordion__header:focus {
        border-radius: 5px 5px;
    }

    .navds-accordion__item--open > .navds-accordion__header {
        background-color: inherit;
    }
    .navds-accordion__item--open .navds-accordion__header:focus {
        border-radius: 5px 5px 0px 0px;
    }

    .navds-accordion__content,
    .navds-accordion__header {
        border: none;
    }
    .navds-accordion__header:focus {
        border-radius: 5px 5px;
    }

    .navds-accordion__item--open > .navds-accordion__header {
        background-color: inherit;
    }
    .navds-accordion__item--open .navds-accordion__header:focus {
        border-radius: 5px 5px 0px 0px;
    }
`;

const StyledWarning = styled(WarningFilled)`
    top: 2px;
    position: relative;
    margin-right: 0.5rem;
    color: var(--navds-semantic-color-feedback-warning-icon);
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
        settÅpen(!erLesevisning && (åpen || harPåkrevetFritekstMenIkkeUtfylt));
    }, [avsnitt]);

    return (
        <StyledAccordion
            className={
                !erLesevisning && harPåkrevetFritekstMenIkkeUtfylt
                    ? 'panelMedGulmarkering'
                    : 'panel'
            }
        >
            <Accordion.Item open={åpen}>
                <Accordion.Header onClick={() => settÅpen(!åpen)}>
                    {harPåkrevetFritekstMenIkkeUtfylt && (
                        <StyledWarning aria-label="Obligatorisk fritekst" />
                    )}
                    {avsnitt.overskrift ? avsnitt.overskrift : ''}
                </Accordion.Header>
                <Accordion.Content>
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
                                        maximumLength={
                                            erRevurderingBortfaltBeløp ? 10000 : undefined
                                        }
                                    />
                                )}
                                <Spacer8 />
                            </React.Fragment>
                        );
                    })}
                </Accordion.Content>
            </Accordion.Item>
        </StyledAccordion>
    );
};

export default AvsnittSkjema;
