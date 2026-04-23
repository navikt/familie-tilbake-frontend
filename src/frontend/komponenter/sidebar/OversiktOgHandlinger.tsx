import type { FC } from 'react';

import {
    ClockDashedIcon,
    EnvelopeClosedIcon,
    FolderFileIcon,
    PersonGavelIcon,
} from '@navikt/aksel-icons';
import { ToggleGroup } from '@navikt/ds-react';
import { useState } from 'react';

import { useBehandling } from '~/context/BehandlingContext';
import { useBehandlingState } from '~/context/BehandlingStateContext';

import { Menysider, OversiktOgHandlingerInnhold } from './OversiktOgHandlingerInnhold';

export const HistorikkOgDokumenter: FC = () => {
    const { erNyModell, status } = useBehandling();
    const { harVærtPåFatteVedtakSteget } = useBehandlingState();

    const skalViseTotrinn = status === 'FATTER_VEDTAK' || harVærtPåFatteVedtakSteget();
    const standardside = erNyModell ? Menysider.Dokumenter : Menysider.Historikk;
    const defaultSide = skalViseTotrinn ? Menysider.Totrinn : standardside;

    const [valgtSide, setValgtSide] = useState<Menysider | null>(null);
    const erGyldigValg = valgtSide !== null && (valgtSide !== Menysider.Totrinn || skalViseTotrinn);
    const aktivSide = erGyldigValg ? valgtSide : defaultSide;

    return (
        <div
            className="border border-ax-border-neutral-subtle rounded-2xl bg-ax-bg-default h-full flex flex-col min-h-0 p-4 gap-4"
            aria-label="Oversikt og handlinger over historikk, dokumenter, sending av brev og fatte vedtak."
        >
            <ToggleGroup
                data-color="neutral"
                value={aktivSide}
                onChange={value => setValgtSide(value as Menysider)}
                size="small"
                fill
                className="sticky top-0"
            >
                <ToggleGroup.Item
                    value={Menysider.Historikk}
                    {...(aktivSide === Menysider.Historikk && { label: 'Historikk' })}
                    icon={<ClockDashedIcon fontSize="1.25rem" aria-hidden />}
                />
                <ToggleGroup.Item
                    value={Menysider.Dokumenter}
                    {...(aktivSide === Menysider.Dokumenter && { label: 'Dokumenter' })}
                    icon={<FolderFileIcon fontSize="1.25rem" aria-hidden />}
                />
                {!erNyModell && (
                    <ToggleGroup.Item
                        value={Menysider.SendBrev}
                        {...(aktivSide === Menysider.SendBrev && { label: 'Send brev' })}
                        icon={<EnvelopeClosedIcon fontSize="1.25rem" aria-hidden />}
                    />
                )}
                {skalViseTotrinn && (
                    <ToggleGroup.Item
                        value={Menysider.Totrinn}
                        {...(aktivSide === Menysider.Totrinn && { label: 'Fatte vedtak' })}
                        icon={<PersonGavelIcon fontSize="1.25rem" aria-hidden />}
                    />
                )}
            </ToggleGroup>
            <OversiktOgHandlingerInnhold valgtMenyside={aktivSide} />
        </div>
    );
};
