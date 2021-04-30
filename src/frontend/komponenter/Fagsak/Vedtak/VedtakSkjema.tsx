import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import { Element, Normaltekst, Undertittel } from 'nav-frontend-typografi';

import { Avsnittstype, Underavsnittstype } from '../../../kodeverk';
import { Spacer8 } from '../../Felleskomponenter/Flytelementer';
import { AvsnittSkjemaData } from './typer/feilutbetalingVedtak';
import VedtakFritekstSkjema from './VedtakFritekstSkjema';

const StyledSkjema = styled.div`
    width: 90%;
`;

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

interface IProps {
    avsnitter: AvsnittSkjemaData[];
    erLesevisning: boolean;
}

const skalVisesÅpen = (avsnitt: AvsnittSkjemaData) => {
    if (avsnitt.avsnittstype === Avsnittstype.OPPSUMMERING) {
        return avsnitt.underavsnittsliste.some(
            underavsnitt => underavsnitt.fritekstPåkrevet && !underavsnitt.fritekst
        );
    }
    if (avsnitt.avsnittstype === Avsnittstype.PERIODE) {
        return avsnitt.underavsnittsliste
            .filter(
                underavsnitt =>
                    underavsnitt.underavsnittstype === Underavsnittstype.FAKTA ||
                    underavsnitt.underavsnittstype === Underavsnittstype.SÆRLIGEGRUNNER_ANNET
            )
            .some(underavsnitt => underavsnitt.fritekstPåkrevet && !underavsnitt.fritekst);
    }

    return false;
};

const VedtakSkjema: React.FC<IProps> = ({ avsnitter, erLesevisning }) => {
    return (
        <StyledSkjema>
            <Undertittel>Vedtaksbrev</Undertittel>
            <Spacer8 />
            {avsnitter.map(avsnitt => {
                const harPåkrevetFritekstMenIkkeUtfylt = skalVisesÅpen(avsnitt);
                return (
                    <React.Fragment key={avsnitt.avsnittstype + avsnitt.fom}>
                        <StyledEkspanderbartpanel
                            tittel={avsnitt.overskrift ? avsnitt.overskrift : ''}
                            apen={!erLesevisning && harPåkrevetFritekstMenIkkeUtfylt}
                            className={
                                !erLesevisning && harPåkrevetFritekstMenIkkeUtfylt
                                    ? 'panelMedGulmarkering'
                                    : 'panel'
                            }
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
                                            />
                                        )}
                                        <Spacer8 />
                                    </React.Fragment>
                                );
                            })}
                        </StyledEkspanderbartpanel>
                        <Spacer8 />
                    </React.Fragment>
                );
            })}
        </StyledSkjema>
    );
};

export default VedtakSkjema;
