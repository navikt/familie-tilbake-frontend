import * as React from 'react';

import styled from 'styled-components';

import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import { Normaltekst, Undertittel } from 'nav-frontend-typografi';

import { Spacer8 } from '../../Felleskomponenter/Flytelementer';
import { Avsnittstype, Underavsnittstype } from '../../../kodeverk';
import { VedtaksbrevAvsnitt } from '../../../typer/vedtakTyper';
import VedtakFritekstSkjema from './VedtakFritekstSkjema';

const StyledSkjema = styled.div`
    width: 90%;
`;

const NormaltekstBold = styled(Normaltekst)`
    font-weight: 600;
`;

interface IProps {
    avsnitter: VedtaksbrevAvsnitt[];
    erLesevisning: boolean;
}

const skalVisesÅpen = (avsnitt: VedtaksbrevAvsnitt) => {
    if (avsnitt.avsnittstype === Avsnittstype.OPPSUMMERING) {
        return avsnitt.underavsnittsliste.some(
            underavsnitt => underavsnitt.fritekstPåkrevet && !underavsnitt.fritekst
        );
    }
    if (avsnitt.avsnittstype === Avsnittstype.PERIODE) {
        return avsnitt.underavsnittsliste
            .filter(
                underavsnitt =>
                    underavsnitt.underavsnittstype === Underavsnittstype.FORELDELSE ||
                    underavsnitt.underavsnittstype === Underavsnittstype.SARLIGEGRUNNER_ANNET
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
                return (
                    <React.Fragment key={avsnitt.avsnittstype + avsnitt.fom}>
                        <Ekspanderbartpanel
                            tittel={avsnitt.overskrift ? avsnitt.overskrift : ''}
                            apen={!erLesevisning && skalVisesÅpen(avsnitt)}
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
                                            <NormaltekstBold>
                                                {underavsnitt.overskrift}
                                            </NormaltekstBold>
                                        )}
                                        {underavsnitt.brødtekst && (
                                            <Normaltekst>{underavsnitt.brødtekst}</Normaltekst>
                                        )}
                                        {underavsnitt.fritekstTillatt && (
                                            <VedtakFritekstSkjema
                                                underavsnitt={underavsnitt}
                                                erLesevisning={erLesevisning}
                                            />
                                        )}
                                        <Spacer8 />
                                    </React.Fragment>
                                );
                            })}
                        </Ekspanderbartpanel>
                        <Spacer8 />
                    </React.Fragment>
                );
            })}
        </StyledSkjema>
    );
};

export default VedtakSkjema;
