import type { BehandlingsstegEnum } from '~/generated';
import type { HistorikkInnslag as THistorikkInnslag } from '~/typer/historikk';

import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { BodyLong, BodyShort, Detail, Label, Link } from '@navikt/ds-react';
import * as React from 'react';

import { BeslutterIkon, SaksbehandlerIkon, SystemIkon } from '~/komponenter/ikoner';
import { HentDokument } from '~/komponenter/sidebar/HentDokument';
import { Aktør, aktører, Historikkinnslagstype } from '~/typer/historikk';
import { formatterDatoOgTidstring } from '~/utils';
import { finnSideForSteg } from '~/utils/sider';

import { useHistorikk } from './HistorikkContext';

type Props = {
    innslag: THistorikkInnslag;
};

export const HistorikkInnslag: React.FC<Props> = ({ innslag }) => {
    const { navigerTilSide } = useHistorikk();
    const [visDokument, settVisDokument] = React.useState<boolean>(false);

    const lagTittel = (): React.ReactNode => {
        if (innslag.type === Historikkinnslagstype.Skjermlenke && innslag.steg) {
            const steg = innslag.steg as BehandlingsstegEnum;
            const side = finnSideForSteg(steg);
            return steg && side ? (
                <Link
                    href="#"
                    onMouseDown={(e: React.MouseEvent) => e.preventDefault()}
                    onClick={() => navigerTilSide(side)}
                >
                    {innslag.tittel}
                </Link>
            ) : null;
        }
        return innslag.tittel;
    };

    const tilpassTekst = (): React.ReactNode => {
        // @ts-expect-error har verdi her
        const indexÅrsakMedBegrunnelse = innslag.tekst.indexOf(', Begrunnelse:');
        if (indexÅrsakMedBegrunnelse > -1) {
            const årsak = innslag.tekst?.substring(0, indexÅrsakMedBegrunnelse);
            const begrunnelse = innslag.tekst?.substring(indexÅrsakMedBegrunnelse + 15);
            return (
                <>
                    <BodyShort>{årsak}</BodyShort>
                    <BodyLong size="small">
                        Begrunnelse: <em>{begrunnelse}</em>
                    </BodyLong>
                </>
            );
        }
        return <BodyShort className="whitespace-pre-line">{innslag.tekst}</BodyShort>;
    };

    const lagBrevLink = (): React.ReactNode => {
        return (
            <span>
                <Link
                    href="#"
                    onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        settVisDokument(true);
                    }}
                >
                    {innslag.tekst}
                    <ExternalLinkIcon aria-label={`Åpne ${innslag.tekst}`} />
                </Link>
            </span>
        );
    };

    const typeBrev = innslag.type === Historikkinnslagstype.Brev;

    return (
        <div className="flex flex-row gap-2">
            {innslag.aktør === Aktør.Vedtaksløsning && <SystemIkon />}
            {innslag.aktør === Aktør.Beslutter && <BeslutterIkon />}
            {innslag.aktør === Aktør.Saksbehandler && <SaksbehandlerIkon />}

            <div className="mb-6">
                <Label>{lagTittel()}</Label>
                <Detail>
                    {`${formatterDatoOgTidstring(innslag.opprettetTid)} | `}
                    {innslag.aktør === Aktør.Vedtaksløsning
                        ? 'System'
                        : `${innslag.aktørIdent.toLocaleLowerCase()} (${aktører[
                              innslag.aktør
                          ].toLocaleLowerCase()})`}
                </Detail>
                {innslag.tekst && !typeBrev && tilpassTekst()}
                {typeBrev && lagBrevLink()}
                {visDokument && (
                    <HentDokument
                        journalpostId={innslag.journalpostId}
                        dokumentId={innslag.dokumentId}
                        onClose={() => settVisDokument(false)}
                    />
                )}
            </div>
        </div>
    );
};
