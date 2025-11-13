import type { Behandling } from '../../../typer/behandling';
import type { Fagsak } from '../../../typer/fagsak';

import {
    ClockDashedIcon,
    EnvelopeClosedIcon,
    FolderFileIcon,
    PersonGavelIcon,
} from '@navikt/aksel-icons';
import { ToggleGroup } from '@navikt/ds-react';
import * as React from 'react';
import { useState } from 'react';

import { Menysider, MenySideInnhold } from './Menykontainer';

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
    const [valgt, setValgt] = useState(værtPåFatteVedtakSteget ? 'to-trinn' : 'logg');

    const menyMap: Record<string, Menysider> = {
        'to-trinn': Menysider.Totrinn,
        logg: Menysider.Historikk,
        dokumenter: Menysider.Dokumenter,
        'send-brev': Menysider.SendBrev,
    };
    return (
        <div className="border border-ax-border-neutral-subtle rounded-2xl bg-ax-bg-default h-full flex flex-col min-h-0 p-4 gap-4">
            <ToggleGroup
                defaultValue={værtPåFatteVedtakSteget ? 'to-trinn' : 'logg'}
                onChange={setValgt}
                variant="neutral"
                size="small"
                fill
                className="sticky top-0"
            >
                <ToggleGroup.Item
                    value="logg"
                    icon={<ClockDashedIcon fontSize="1.25rem" aria-label="Historikk" />}
                />
                <ToggleGroup.Item
                    value="dokumenter"
                    icon={<FolderFileIcon fontSize="1.25rem" aria-label="Dokumenter" />}
                />
                {!behandling.erNyModell && (
                    <ToggleGroup.Item
                        value="send-brev"
                        icon={<EnvelopeClosedIcon fontSize="1.25rem" aria-label="Send brev" />}
                    />
                )}
                {værtPåFatteVedtakSteget && (
                    <ToggleGroup.Item
                        value="to-trinn"
                        icon={<PersonGavelIcon fontSize="1.25rem" aria-label="Fatte vedtak" />}
                    />
                )}
            </ToggleGroup>
            <MenySideInnhold
                valgtMenyside={menyMap[valgt]}
                behandling={behandling}
                fagsak={fagsak}
            />
        </div>
    );
};
