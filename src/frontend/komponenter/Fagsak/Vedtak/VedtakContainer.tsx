import * as React from 'react';

import styled from 'styled-components';

import { Normaltekst, UndertekstBold, Undertittel } from 'nav-frontend-typografi';

import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import { vedtaksresultater } from '../../../kodeverk';
import { IBehandling } from '../../../typer/behandling';
import { IBeregningsresultat, VedtaksbrevAvsnitt } from '../../../typer/vedtakTyper';
import { Spacer20 } from '../../Felleskomponenter/Flytelementer';
import VedtakPerioder from './VedtakPerioder';
import VedtakSkjema from './VedtakSkjema';

const StyledVedtak = styled.div`
    padding: 10px;
`;

interface IProps {
    behandling: IBehandling;
}

const VedtakContainer: React.FC<IProps> = ({ behandling }) => {
    const [beregningsresultat, settBeregningsresultat] = React.useState<IBeregningsresultat>();
    const [avsnittsliste, settAvsnittliste] = React.useState<VedtaksbrevAvsnitt[]>();
    const { behandlingILesemodus, hentBeregningsresultat, hentVedtaksbrev } = useBehandling();
    const erLesevisning = !!behandlingILesemodus;

    React.useEffect(() => {
        if (behandling) {
            const beregningsResultat = hentBeregningsresultat(behandling.behandlingId);
            if (beregningsResultat?.status === RessursStatus.SUKSESS) {
                settBeregningsresultat(beregningsResultat.data);
            }

            const vedtaksbrev = hentVedtaksbrev(behandling.behandlingId);
            if (vedtaksbrev.status === RessursStatus.SUKSESS) {
                settAvsnittliste(vedtaksbrev.data.avsnittsliste);
            }
        }
    }, [behandling]);

    return behandling && beregningsresultat && avsnittsliste ? (
        <StyledVedtak>
            <Undertittel>Vedtak</Undertittel>
            <Spacer20 />
            <UndertekstBold>Resultat</UndertekstBold>
            <Normaltekst>{vedtaksresultater[beregningsresultat.vedtaksresultat]}</Normaltekst>
            <Spacer20 />
            <VedtakPerioder perioder={beregningsresultat.perioder} />
            <Spacer20 />
            <VedtakSkjema avsnitter={avsnittsliste} erLesevisning={erLesevisning} />
        </StyledVedtak>
    ) : null;
};

export default VedtakContainer;
