import {
    ClockDashedIcon,
    EnvelopeClosedIcon,
    FolderFileIcon,
    PersonGavelIcon,
} from '@navikt/aksel-icons';
import { ToggleGroup } from '@navikt/ds-react';
import * as React from 'react';
import { useState } from 'react';

import { useBehandling } from '~/context/BehandlingContext';

import { Menysider, MenySideInnhold } from './Menykontainer';

type Props = {
    værtPåFatteVedtakSteget: boolean;
};

export const HistorikkOgDokumenter: React.FC<Props> = ({ værtPåFatteVedtakSteget }) => {
    const { erNyModell } = useBehandling();
    const valgtSideGittModell = !erNyModell ? Menysider.Historikk : Menysider.Dokumenter;
    const [valgtSide, setValgtSide] = useState(
        værtPåFatteVedtakSteget ? Menysider.Totrinn : valgtSideGittModell
    );
    const skalViseToggleGroup = !erNyModell || værtPåFatteVedtakSteget;
    return (
        <div className="border border-ax-border-neutral-subtle rounded-2xl bg-ax-bg-default h-full flex flex-col min-h-0 p-4 gap-4">
            {skalViseToggleGroup && (
                <ToggleGroup
                    data-color="neutral"
                    value={valgtSide}
                    onChange={value => setValgtSide(value as Menysider)}
                    size="small"
                    fill
                    className="sticky top-0"
                >
                    {!erNyModell && (
                        <ToggleGroup.Item
                            value={Menysider.Historikk}
                            icon={<ClockDashedIcon fontSize="1.25rem" aria-label="Historikk" />}
                        />
                    )}
                    <ToggleGroup.Item
                        value={Menysider.Dokumenter}
                        icon={<FolderFileIcon fontSize="1.25rem" aria-label="Dokumenter" />}
                    />
                    {!erNyModell && (
                        <ToggleGroup.Item
                            value={Menysider.SendBrev}
                            icon={<EnvelopeClosedIcon fontSize="1.25rem" aria-label="Send brev" />}
                        />
                    )}
                    {værtPåFatteVedtakSteget && (
                        <ToggleGroup.Item
                            value={Menysider.Totrinn}
                            icon={<PersonGavelIcon fontSize="1.25rem" aria-label="Fatte vedtak" />}
                        />
                    )}
                </ToggleGroup>
            )}
            <MenySideInnhold valgtMenyside={valgtSide} />
        </div>
    );
};
