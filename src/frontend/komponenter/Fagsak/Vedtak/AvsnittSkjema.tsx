import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import { Element, Normaltekst } from 'nav-frontend-typografi';

import { Avsnittstype, Underavsnittstype } from '../../../kodeverk';
import { Spacer8 } from '../../Felleskomponenter/Flytelementer';
import { AvsnittSkjemaData } from './typer/feilutbetalingVedtak';
import VedtakFritekstSkjema from './VedtakFritekstSkjema';

const StyledEkspanderbartpanel = styled(Ekspanderbartpanel)`
    &.panel {
        border: 1px solid black;
        padding: 1px 1px 1px 1px;
    }

    &.panelMedGulmarkering {
        border: 1px solid black;
        border-left-color: ${navFarger.navOransjeLighten20};
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
                                <Element>{underavsnitt.overskrift}</Element>
                            )}
                            {underavsnitt.brødtekst && (
                                <Normaltekst>{underavsnitt.brødtekst}</Normaltekst>
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
