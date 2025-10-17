import type { Behandling } from '../../../typer/behandling';
import type { Fagsak } from '../../../typer/fagsak';

import { ClockIcon, FolderIcon, PaperplaneIcon, PersonGavelIcon } from '@navikt/aksel-icons';
import { Tabs } from '@navikt/ds-react';
import * as React from 'react';

import Menykontainer, { Menysider } from './Menykontainer';

type Props = {
    værtPåFatteVedtakSteget: boolean;
    fagsak: Fagsak;
    behandling: Behandling;
};

export const HistorikkOgDokumenter: React.FC<Props> = ({
    værtPåFatteVedtakSteget,
    fagsak,
    behandling,
}) => {
    return (
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
                        icon={<PersonGavelIcon fontSize="1.5rem" aria-label="Ikon fatte vedtak" />}
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
                        icon={<PaperplaneIcon fontSize="1.5rem" aria-label="Ikon send brev" />}
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
    );
};
