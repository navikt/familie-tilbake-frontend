import * as React from 'react';

import styled from 'styled-components';

import { Send, Folder, Clock, Decision, NextFilled, BackFilled } from '@navikt/ds-icons';
import { Button, Tabs } from '@navikt/ds-react';
import { AFontSizeMedium, ASpacing4 } from '@navikt/ds-tokens/dist/tokens';

import { useBehandling } from '../../../context/BehandlingContext';
import { IBehandling } from '../../../typer/behandling';
import { IFagsak } from '../../../typer/fagsak';
import Behandlingskort from './Behandlingskort/Behandlingskort';
import Menykontainer, { Menysider } from './Menykontainer';

const StyledContainer = styled.div`
    width: ${(props: { værtPåFatteVedtakSteget: boolean }) =>
        props.værtPåFatteVedtakSteget ? '28rem' : '22rem'};
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

const ToggleVisningHøyremeny = styled(Button)`
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
                    <NextFilled aria-label="Skjul høyremeny" width={22} height={22} />
                ) : (
                    <BackFilled aria-label="Vis høyremeny" width={22} height={22} />
                )}
            </ToggleVisningHøyremeny>
            {åpenHøyremeny && (
                <StyledContainer værtPåFatteVedtakSteget={værtPåFatteVedtakSteget}>
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
                                            <Decision
                                                height={18}
                                                width={18}
                                                aria-label="Ikon fatte vedtak"
                                            />
                                        }
                                    />
                                )}
                                <StyledTabs
                                    value="logg"
                                    label="Historikk"
                                    icon={
                                        <Clock height={18} width={18} aria-label="Ikon historikk" />
                                    }
                                />
                                <StyledTabs
                                    value="dokumenter"
                                    label="Dokumenter"
                                    icon={
                                        <Folder
                                            height={18}
                                            width={18}
                                            aria-label="Ikon dokumenter"
                                        />
                                    }
                                />
                                <StyledTabs
                                    value="send-brev"
                                    label="Send brev"
                                    icon={
                                        <Send height={18} width={18} aria-label="Ikon send brev" />
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
