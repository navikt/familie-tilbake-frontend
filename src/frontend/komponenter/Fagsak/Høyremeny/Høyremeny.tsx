import type { Behandling } from '../../../typer/behandling';
import type { Fagsak } from '../../../typer/fagsak';

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
import classNames from 'classnames';
import * as React from 'react';
import { styled } from 'styled-components';

import Behandlingskort from './Behandlingskort/Behandlingskort';
import Menykontainer, { Menysider } from './Menykontainer';
import { useBehandling } from '../../../context/BehandlingContext';

const StyledContainer = styled.div<{ $værtPåFatteVedtakSteget: boolean }>`
    width: ${({ $værtPåFatteVedtakSteget }): string =>
        $værtPåFatteVedtakSteget ? '28rem' : '22rem'};
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

type Props = {
    fagsak: Fagsak;
    behandling: Behandling;
};

const Høyremeny: React.FC<Props> = ({ fagsak, behandling }) => {
    const { harVærtPåFatteVedtakSteget, åpenHøyremeny, settÅpenHøyremeny, ventegrunn } =
        useBehandling();
    const værtPåFatteVedtakSteget = harVærtPåFatteVedtakSteget();

    const harVentegrunn = ventegrunn !== undefined;

    return (
        <>
            <Button
                className={classNames(
                    'absolute w-[34px] min-w-[34px] h-[34px] rounded-full z-[100] flex items-center justify-center not-active:not-hover:bg-white ',
                    'drop-shadow-[0px_4px_4px_rgba(0,0,0,0.25)]',
                    {
                        'ml-[-20px]': !åpenHøyremeny,
                        'ml-[-17px]': åpenHøyremeny,
                        'top-[378px]': !harVentegrunn,
                        'top-[440px]': harVentegrunn,
                    }
                )}
                variant="secondary"
                onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                onClick={() => {
                    settÅpenHøyremeny(!åpenHøyremeny);
                }}
                size="small"
                title={åpenHøyremeny ? 'Skjul høyremeny' : 'Vis høyremeny'}
            >
                {åpenHøyremeny ? (
                    <ChevronRightIcon aria-label="Skjul høyremeny" fontSize="1.5rem" />
                ) : (
                    <ChevronLeftIcon aria-label="Vis høyremeny" fontSize="1.5rem" />
                )}
            </Button>
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
                                {/* TODO: Rydde opp etter feature toggle */}
                                {!behandling.erNyModell && (
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
                                )}
                                {/* .. */}
                            </StyledTabList>
                            <HøyremenyContainer>
                                {værtPåFatteVedtakSteget && (
                                    <Tabs.Panel value="to-trinn">
                                        <Menykontainer
                                            valgtMenyside={Menysider.Totrinn}
                                            behandling={behandling}
                                            fagsak={fagsak}
                                        />
                                    </Tabs.Panel>
                                )}
                                <Tabs.Panel value="logg">
                                    <Menykontainer
                                        valgtMenyside={Menysider.Historikk}
                                        behandling={behandling}
                                        fagsak={fagsak}
                                    />
                                </Tabs.Panel>
                                <Tabs.Panel value="dokumenter">
                                    <Menykontainer
                                        valgtMenyside={Menysider.Dokumenter}
                                        behandling={behandling}
                                        fagsak={fagsak}
                                    />
                                </Tabs.Panel>
                                <Tabs.Panel value="send-brev">
                                    <Menykontainer
                                        valgtMenyside={Menysider.SendBrev}
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
