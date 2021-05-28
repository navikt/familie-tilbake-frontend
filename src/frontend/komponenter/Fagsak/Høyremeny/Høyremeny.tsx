import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Flatknapp } from 'nav-frontend-knapper';

import { Send, Folder, Clock } from '@navikt/ds-icons';

import { useBehandling } from '../../../context/BehandlingContext';
import { Behandlingssteg, Behandlingstatus, IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import { Spacer20, Spacer8 } from '../../Felleskomponenter/Flytelementer';
import FatteVedtakIkon from '../../Felleskomponenter/Ikoner/FatteVedtakIkon';
import Behandlingskort from './Behandlingskort/Behandlingskort';
import Menykontainer, { Menysider } from './Menykontainer';

const StyledContainer = styled.div`
    width: 25rem;
    height: calc(100vh - 8rem);
`;

const HøyremenyContainer = styled.div`
    padding: 0 10px 0 10px;
`;

const Høyremenyvalg = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    font-size: 12px;
    color: ${navFarger.navBla};
`;

const Høyremenyknapp = styled(Flatknapp)`
    flex-direction: column;
    font-weight: normal;
    text-transform: none;
    letter-spacing: inherit;
    padding: 5px 1rem 5px 1rem;

    &.valgt {
        border-bottom: 2px solid ${navFarger.navBla};
        background-color: ${navFarger.navLysGra};
        border-radius: 5px 5px 0px 0px;
    }
    &.knapp--disabled {
        background-color: ${navFarger.navBla};
        opacity: 20%;
        border-color: ${navFarger.navBla};
        border-radius: 5px 5px 0px 0px;
    }
    &:hover {
        border-radius: 5px 5px 0px 0px;

        &.valgt {
            background-color: ${navFarger.navLysGra};
        }
        &.knapp--disabled {
            background-color: ${navFarger.navBla};
            opacity: 20%;
            border-color: ${navFarger.navBla};
        }
    }
`;

interface IProps {
    fagsak: IFagsak;
    behandling: IBehandling;
}

const Høyremeny: React.FC<IProps> = ({ fagsak, behandling }) => {
    const [valgtMenyside, settValgtMenyside] = React.useState<Menysider>();
    const [værtPåFatteVedtakSteget, settVærtPåFatteVedtakSteget] = React.useState<boolean>(false);
    const { aktivtSteg, harVærtPåFatteVedtakSteget } = useBehandling();

    React.useEffect(() => {
        if (harVærtPåFatteVedtakSteget()) {
            settVærtPåFatteVedtakSteget(true);
            settValgtMenyside(Menysider.TOTRINN);
        } else {
            settValgtMenyside(Menysider.HISTORIKK);
        }
    }, [behandling]);

    const disableSendMelding =
        behandling.status === Behandlingstatus.AVSLUTTET ||
        aktivtSteg?.behandlingssteg === Behandlingssteg.FATTE_VEDTAK ||
        aktivtSteg?.behandlingssteg === Behandlingssteg.IVERKSETT_VEDTAK;

    return (
        <StyledContainer>
            <Behandlingskort fagsak={fagsak} behandling={behandling} />
            <Spacer20 />
            <HøyremenyContainer>
                <Høyremenyvalg>
                    {værtPåFatteVedtakSteget && (
                        <Høyremenyknapp
                            className={valgtMenyside === Menysider.TOTRINN ? 'valgt' : ''}
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => settValgtMenyside(Menysider.TOTRINN)}
                        >
                            <FatteVedtakIkon />
                            Fatte vedtak
                        </Høyremenyknapp>
                    )}
                    <Høyremenyknapp
                        className={valgtMenyside === Menysider.HISTORIKK ? 'valgt' : ''}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => settValgtMenyside(Menysider.HISTORIKK)}
                    >
                        <Clock />
                        Historikk
                    </Høyremenyknapp>
                    <Høyremenyknapp
                        className={valgtMenyside === Menysider.DOKUMENTER ? 'valgt' : ''}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => settValgtMenyside(Menysider.DOKUMENTER)}
                    >
                        <Folder />
                        Dokumenter
                    </Høyremenyknapp>
                    <Høyremenyknapp
                        className={valgtMenyside === Menysider.SEND_BREV ? 'valgt' : ''}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => settValgtMenyside(Menysider.SEND_BREV)}
                        disabled={disableSendMelding}
                    >
                        <Send />
                        Send brev
                    </Høyremenyknapp>
                </Høyremenyvalg>
                {valgtMenyside && (
                    <>
                        <Spacer8 />
                        <Menykontainer
                            valgtMenyside={valgtMenyside}
                            behandling={behandling}
                            fagsak={fagsak}
                        />
                    </>
                )}
            </HøyremenyContainer>
        </StyledContainer>
    );
};

export default Høyremeny;
