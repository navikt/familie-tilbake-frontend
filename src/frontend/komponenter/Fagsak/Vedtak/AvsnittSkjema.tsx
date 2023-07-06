import * as React from 'react';

import styled from 'styled-components';

import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';

import { BodyLong, Heading } from '@navikt/ds-react';
import { ABorderWarning } from '@navikt/ds-tokens/dist/tokens';

import { AvsnittSkjemaData } from './typer/feilutbetalingVedtak';
import VedtakFritekstSkjema from './VedtakFritekstSkjema';
import { Avsnittstype, Underavsnittstype } from '../../../kodeverk';
import { Spacer8 } from '../../Felleskomponenter/Flytelementer';

const StyledEkspanderbartpanel = styled(Ekspanderbartpanel)`
    &.panel {
        border: 1px solid black;
        padding: 1px 1px 1px 1px;
    }

    &.panelMedGulmarkering {
        border: 1px solid black;
        border-left-color: ${ABorderWarning};
        border-left-width: 5px;
        padding: 1px 1px 1px 1px;
    }
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
        <>
            <StyledEkspanderbartpanel
                tittel={avsnitt.overskrift ? avsnitt.overskrift : ''}
                apen={!erLesevisning && åpen}
                className={
                    !erLesevisning && harPåkrevetFritekstMenIkkeUtfylt
                        ? 'panelMedGulmarkering'
                        : 'panel'
                }
                onClick={() => settÅpen(!åpen)}
            >
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
            </StyledEkspanderbartpanel>
            <Spacer8 />
        </>
    );
};

export default AvsnittSkjema;
