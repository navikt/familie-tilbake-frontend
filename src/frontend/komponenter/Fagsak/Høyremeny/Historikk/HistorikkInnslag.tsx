import type { BehandlingsstegEnum } from '../../../../generated';
import type { HistorikkInnslag } from '../../../../typer/historikk';

import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { BodyLong, BodyShort, Detail, Label, Link } from '@navikt/ds-react';
import * as React from 'react';
import { styled } from 'styled-components';

import HentDokument from './HentDokument';
import { useHistorikk } from './HistorikkContext';
import { Aktør, aktører, Historikkinnslagstype } from '../../../../typer/historikk';
import { formatterDatoOgTidstring } from '../../../../utils';
import { finnSideForSteg } from '../../../../utils/sider';
import { BeslutterIkon, SaksbehandlerIkon, SystemIkon } from '../../../Felleskomponenter/Ikoner/';

const Innslag = styled.div`
    display: flex;
    flex-direction: row;
`;

const StyledBodyShort = styled(BodyShort)`
    white-space: pre-line;
`;

const Tidslinje = styled.div`
    width: 3.5rem;
    min-width: 3.5rem;
    text-align: center;
    background-image: radial-gradient(
        1px 1px at center,
        var(--ax-border-neutral-strong) 1px,
        transparent 1px,
        transparent 4px
    );
    background-size: 100% 5px;
`;

type Props = {
    innslag: HistorikkInnslag;
};

const HistorikkInnslag: React.FC<Props> = ({ innslag }) => {
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
        return <StyledBodyShort>{innslag.tekst}</StyledBodyShort>;
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
        <Innslag>
            <Tidslinje>
                {innslag.aktør === Aktør.Vedtaksløsning && <SystemIkon />}
                {innslag.aktør === Aktør.Beslutter && <BeslutterIkon />}
                {innslag.aktør === Aktør.Saksbehandler && <SaksbehandlerIkon />}
            </Tidslinje>
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
                        innslag={innslag}
                        onClose={() => {
                            settVisDokument(false);
                        }}
                    />
                )}
            </div>
        </Innslag>
    );
};

export default HistorikkInnslag;
