import type { Behandling } from '../../../typer/behandling';
import type { Fagsak } from '../../../typer/fagsak';
import type { Person } from '../../../typer/person';

import { ClockIcon, FolderIcon, PaperplaneIcon, PersonGavelIcon } from '@navikt/aksel-icons';
import { Tabs } from '@navikt/ds-react';
import classNames from 'classnames';
import * as React from 'react';
import { Suspense } from 'react';

import { BrukerInformasjon } from './Informasjonsbokser/BrukerInformasjon';
import { Faktaboks } from './Informasjonsbokser/Faktaboks';
import Menykontainer, { Menysider } from './Menykontainer';
import { useBehandling } from '../../../context/BehandlingContext';
import { Kjønn } from '../../../typer/person';

type Props = {
    fagsak: Fagsak;
    behandling: Behandling;
};

const Høyremeny: React.FC<Props> = ({ fagsak, behandling }) => {
    const { harVærtPåFatteVedtakSteget, ventegrunn } = useBehandling();
    const værtPåFatteVedtakSteget = harVærtPåFatteVedtakSteget();

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
        <Suspense fallback="Høyremeny laster...">
            {/* Reduserer høyden med header(48)-høyde og padding(16+16)-høyde til fagsakcontainer */}
            <aside
                className={classNames(
                    'flex-col gap-4 bg-gray-50 hidden lg:flex max-h-[calc(100vh-80px)]',
                    { 'max-h-[calc(100vh-142px)]': !!ventegrunn }
                )}
            >
                <div className="gap-4 flex flex-col flex-1 min-h-0">
                    <Faktaboks tittel="Faktaboks tittel" />
                    <BrukerInformasjon bruker={bruker} insitusjon={insitusjon} />
                    <Tabs
                        defaultValue={værtPåFatteVedtakSteget ? 'to-trinn' : 'logg'}
                        iconPosition="top"
                        className="border border-border-divider rounded-2xl bg-white h-full flex flex-col min-h-0"
                    >
                        <div className="flex justify-center">
                            {værtPåFatteVedtakSteget && (
                                <Tabs.Tab
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
                            <Tabs.Tab
                                value="logg"
                                label="Historikk"
                                icon={<ClockIcon fontSize="1.5rem" aria-label="Ikon historikk" />}
                            />
                            <Tabs.Tab
                                value="dokumenter"
                                label="Dokumenter"
                                icon={<FolderIcon fontSize="1.5rem" aria-label="Ikon dokumenter" />}
                            />
                            {/* TODO: Rydde opp etter feature toggle */}
                            {!behandling.erNyModell && (
                                <Tabs.Tab
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
                        </div>
                        <div className="px-2 mt-4 flex-1 min-h-0 overflow-y-auto scrollbar-stable">
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
                        </div>
                    </Tabs>
                </div>
            </aside>
        </Suspense>
    );
};

export default Høyremeny;
