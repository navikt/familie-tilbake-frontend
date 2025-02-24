import * as React from 'react';

import { styled } from 'styled-components';

import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ClockIcon,
    FolderIcon,
    PaperplaneIcon,
    PersonGavelIcon,
} from '@navikt/aksel-icons';
import { Button, Tabs } from '@navikt/ds-react';
import { AFontSizeMedium, ASpacing4 } from '@navikt/ds-tokens/dist/tokens';

import Behandlingskort from './Behandlingskort/Behandlingskort';
import Menykontainer, { Menysider } from './Menykontainer';
import { useBehandling } from '../../../context/BehandlingContext';
import { IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';

const StyledContainer = styled.div<{ $værtPåFatteVedtakSteget: boolean }>`
    width: ${({ $værtPåFatteVedtakSteget }) => ($værtPåFatteVedtakSteget ? '28rem' : '22rem')};
`;

const HøyremenyContainer = styled.div`
    padding: 0 10px 0 10px;
    margin-top: ${ASpacing4};
`;

const StyledTabList = styled(Tabs.List)`
    display: flex;
    justify-content: center;
    width: 100%;
`;

const StyledTabs = styled(Tabs.Tab)`
    & span {
        font-size: ${AFontSizeMedium};
    }
`;

interface IToggleVisningHøyremenyProps {
    åpenhøyremeny: boolean;
    harventegrunn: boolean;
}

const ToggleVisningHøyremeny = styled(Button)<IToggleVisningHøyremenyProps>`
    position: absolute;
    margin-left: ${(props: IToggleVisningHøyremenyProps) =>
        !props.åpenhøyremeny ? '-20px' : '-17px'};
    top: ${(props: IToggleVisningHøyremenyProps) => (props.harventegrunn ? '440px' : '378px')};
    width: 34px;
    min-width: 34px;
    height: 34px;
    padding: 5px 0 0 0;
    border-radius: 50%;
    filter: drop-shadow(0px 4px 4px rgba(0, 0, 0, 0.25));
    z-index: 100;
`;

interface IProps {
    fagsak: IFagsak;
    behandling: IBehandling;
}

const Høyremeny: React.FC<IProps> = ({ fagsak, behandling }) => {
    const { harVærtPåFatteVedtakSteget, åpenHøyremeny, settÅpenHøyremeny, ventegrunn } =
        useBehandling();
    const værtPåFatteVedtakSteget = harVærtPåFatteVedtakSteget();

    const harVentegrunn = ventegrunn !== undefined;

    return (
        <>
            <ToggleVisningHøyremeny
                forwardedAs={Button}
                variant="secondary"
                onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                onClick={() => {
                    settÅpenHøyremeny(!åpenHøyremeny);
                }}
                size="small"
                åpenhøyremeny={åpenHøyremeny ? 1 : 0}
                harventegrunn={harVentegrunn ? 1 : 0}
                title={åpenHøyremeny ? 'Skjul høyremeny' : 'Vis høyremeny'}
            >
                {åpenHøyremeny ? (
                    <ChevronRightIcon aria-label="Skjul høyremeny" fontSize="1.5rem" />
                ) : (
                    <ChevronLeftIcon aria-label="Vis høyremeny" fontSize="1.5rem" />
                )}
            </ToggleVisningHøyremeny>
            {åpenHøyremeny && (
                <StyledContainer $værtPåFatteVedtakSteget={værtPåFatteVedtakSteget}>
                    <Behandlingskort fagsak={fagsak} behandling={behandling} />
                    <div>
                        <Tabs
                            defaultValue={værtPåFatteVedtakSteget ? 'to-trinn' : 'logg'}
                            iconPosition="top"
                        >
                            <StyledTabList>
                                {værtPåFatteVedtakSteget && (
                                    <StyledTabs
                                        value="to-trinn"
                                        label="Fatte vedtak"
                                        icon={
                                            <PersonGavelIcon
                                                fontSize="1.5rem"
                                                aria-label="Ikon fatte vedtak"
                                            />
                                        }
                                    />
                                )}
                                <StyledTabs
                                    value="logg"
                                    label="Historikk"
                                    icon={
                                        <ClockIcon fontSize="1.5rem" aria-label="Ikon historikk" />
                                    }
                                />
                                <StyledTabs
                                    value="dokumenter"
                                    label="Dokumenter"
                                    icon={
                                        <FolderIcon
                                            fontSize="1.5rem"
                                            aria-label="Ikon dokumenter"
                                        />
                                    }
                                />
                                <StyledTabs
                                    value="send-brev"
                                    label="Send brev"
                                    icon={
                                        <PaperplaneIcon
                                            fontSize="1.5rem"
                                            aria-label="Ikon send brev"
                                        />
                                    }
                                />
                            </StyledTabList>
                            <HøyremenyContainer>
                                {værtPåFatteVedtakSteget && (
                                    <Tabs.Panel value="to-trinn">
                                        <Menykontainer
                                            valgtMenyside={Menysider.TOTRINN}
                                            behandling={behandling}
                                            fagsak={fagsak}
                                        />
                                    </Tabs.Panel>
                                )}
                                <Tabs.Panel value="logg">
                                    <Menykontainer
                                        valgtMenyside={Menysider.HISTORIKK}
                                        behandling={behandling}
                                        fagsak={fagsak}
                                    />
                                </Tabs.Panel>
                                <Tabs.Panel value="dokumenter">
                                    <Menykontainer
                                        valgtMenyside={Menysider.DOKUMENTER}
                                        behandling={behandling}
                                        fagsak={fagsak}
                                    />
                                </Tabs.Panel>
                                <Tabs.Panel value="send-brev">
                                    <Menykontainer
                                        valgtMenyside={Menysider.SEND_BREV}
                                        behandling={behandling}
                                        fagsak={fagsak}
                                    />
                                </Tabs.Panel>
                            </HøyremenyContainer>
                        </Tabs>
                    </div>
                </StyledContainer>
            )}
        </>
    );
};

export default Høyremeny;
