import type { Behandling } from '../../../typer/behandling';
import type { Fagsak } from '../../../typer/fagsak';
import type { Person } from '../../../typer/person';

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

// import Behandlingskort from './Behandlingskort/Behandlingskort';
import { BrukerBoks } from './Informasjonsbokser/BrukerBoks';
import { Faktaboks } from './Informasjonsbokser/Faktaboks';
import Menykontainer, { Menysider } from './Menykontainer';
import { useBehandling } from '../../../context/BehandlingContext';
import { Kjønn } from '../../../typer/person';

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
    const bruker: Person = {
        navn: 'Fredrik Garseg Mørk',
        fødselsdato: '1995-01-01',
        dødsdato: undefined,
        kjønn: Kjønn.Mann,
        personIdent: '12312312312',
    };
    const insitusjon = {
        navn: 'Institusjon AS',
        organisasjonsnummer: '123456789',
    };

    return (
        <div className="bg-gray-50 min-h-screen">
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
                onClick={() => settÅpenHøyremeny(!åpenHøyremeny)}
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
                <div
                    className={classNames('w-[22rem] gap-4 flex flex-col', {
                        'w-[28rem]': værtPåFatteVedtakSteget,
                    })}
                >
                    <Faktaboks tittel="Faktaboks tittel" />
                    <BrukerBoks bruker={bruker} insitusjon={insitusjon} />
                    {/* <Behandlingskort fagsak={fagsak} behandling={behandling} /> */}
                    <div className="border border-border-divider rounded-2xl bg-white">
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
                </div>
            )}
        </div>
    );
};

export default Høyremeny;
