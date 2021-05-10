import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Flatknapp } from 'nav-frontend-knapper';

import { useBehandling } from '../../../context/BehandlingContext';
import { Behandlingssteg, IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import { Spacer20, Spacer8 } from '../../Felleskomponenter/Flytelementer';
import ClockIkon from '../../Felleskomponenter/Ikoner/ClockIkon';
import FatteVedtakIkon from '../../Felleskomponenter/Ikoner/FatteVedtakIkon';
import FolderIkon from '../../Felleskomponenter/Ikoner/FolderIkon';
import SendBrevIkon from '../../Felleskomponenter/Ikoner/SendBrevIkon';
import Behandlingskort from '../Behandlingskort/Behandlingskort';
import Undermeny, { Menysider } from './Undermeny';

const StyledContainer = styled.div`
    width: 25rem;
    height: calc(100vh - 8rem);
`;

const UndermenyContainer = styled.div`
    padding: 0 10px 0 10px;
`;

const StyledUndermenyContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    font-size: 12px;
    color: ${navFarger.navBla};
`;

const StyledFlatknapp = styled(Flatknapp)`
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
    const [valgtMenyside, settValgtMenyside] = React.useState<Menysider>(Menysider.HISTORIKK);
    const [værtPåFatteVedtakSteget, settVærtPåFatteVedtakSteget] = React.useState<boolean>(false);
    const { aktivtSteg, harVærtPåFatteVedtakSteget } = useBehandling();

    React.useEffect(() => {
        if (harVærtPåFatteVedtakSteget()) {
            settVærtPåFatteVedtakSteget(true);
            settValgtMenyside(Menysider.TOTRINN);
        }
    }, [behandling]);

    const disableSendMelding =
        aktivtSteg?.behandlingssteg === Behandlingssteg.FATTE_VEDTAK ||
        aktivtSteg?.behandlingssteg === Behandlingssteg.IVERKSETT_VEDTAK;

    return (
        <StyledContainer>
            <Behandlingskort fagsak={fagsak} behandling={behandling} />
            <Spacer20 />
            <UndermenyContainer>
                <StyledUndermenyContainer>
                    {værtPåFatteVedtakSteget && (
                        <StyledFlatknapp
                            className={valgtMenyside === Menysider.TOTRINN ? 'valgt' : ''}
                            onMouseDown={e => e.preventDefault()}
                            onClick={() => settValgtMenyside(Menysider.TOTRINN)}
                        >
                            <FatteVedtakIkon />
                            Fatte vedtak
                        </StyledFlatknapp>
                    )}
                    <StyledFlatknapp
                        className={valgtMenyside === Menysider.HISTORIKK ? 'valgt' : ''}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => settValgtMenyside(Menysider.HISTORIKK)}
                    >
                        <ClockIkon />
                        Historikk
                    </StyledFlatknapp>
                    <StyledFlatknapp
                        className={valgtMenyside === Menysider.SEND_BREV ? 'valgt' : ''}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => settValgtMenyside(Menysider.SEND_BREV)}
                        disabled={disableSendMelding}
                    >
                        <SendBrevIkon />
                        Send brev
                    </StyledFlatknapp>
                    <StyledFlatknapp
                        className={valgtMenyside === Menysider.DOKUMENTER ? 'valgt' : ''}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => settValgtMenyside(Menysider.DOKUMENTER)}
                    >
                        <FolderIkon />
                        Dokumenter
                    </StyledFlatknapp>
                </StyledUndermenyContainer>
                <Spacer8 />
                <Undermeny valgtMenyside={valgtMenyside} behandling={behandling} fagsak={fagsak} />
            </UndermenyContainer>
        </StyledContainer>
    );
};

export default Høyremeny;
