import type { Behandling } from '../../../typer/behandling';
import type { Fagsak } from '../../../typer/fagsak';

import {
    ClockDashedIcon,
    EnvelopeClosedIcon,
    FolderFileIcon,
    PersonEnvelopeIcon,
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
    const [valgtSide, setValgtSide] = useState(
        værtPåFatteVedtakSteget ? Menysider.Totrinn : Menysider.Historikk
    );

    return (
        <div className="border border-ax-border-neutral-subtle rounded-2xl bg-ax-bg-default h-full flex flex-col min-h-0 p-4 gap-4">
            <ToggleGroup
                value={valgtSide}
                onChange={value => setValgtSide(value as Menysider)}
                variant="neutral"
                size="small"
                fill
                className="sticky top-0"
            >
                {værtPåFatteVedtakSteget && (
                    <ToggleGroup.Item
                        value={Menysider.Totrinn}
                        icon={<PersonGavelIcon fontSize="1.25rem" aria-label="Fatte vedtak" />}
                    />
                )}
                <ToggleGroup.Item
                    value={Menysider.Historikk}
                    icon={<ClockDashedIcon fontSize="1.25rem" aria-label="Historikk" />}
                />
                <ToggleGroup.Item
                    value={Menysider.Dokumenter}
                    icon={<FolderFileIcon fontSize="1.25rem" aria-label="Dokumenter" />}
                />
                {behandling.erNyModell ? (
                    <ToggleGroup.Item
                        value={Menysider.Brevmottakere}
                        icon={<PersonEnvelopeIcon fontSize="1.25rem" aria-label="Brevmottakere" />}
                    />
                ) : (
                    <ToggleGroup.Item
                        value={Menysider.SendBrev}
                        icon={<EnvelopeClosedIcon fontSize="1.25rem" aria-label="Send brev" />}
                    />
                )}
            </ToggleGroup>
            <MenySideInnhold valgtMenyside={valgtSide} behandling={behandling} fagsak={fagsak} />
        </div>
    );
};
