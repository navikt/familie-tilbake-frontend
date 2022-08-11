import * as React from 'react';

import styled from 'styled-components';

import { ExternalLink } from '@navikt/ds-icons';
import { BodyLong, BodyShort, Detail, Label, Link } from '@navikt/ds-react';
import { NavdsGlobalColorGray400, NavdsSpacing6 } from '@navikt/ds-tokens/dist/tokens';

import { Behandlingssteg } from '../../../../typer/behandling';
import {
    Aktør,
    aktører,
    applikasjoner,
    Historikkinnslagstype,
    IHistorikkInnslag,
} from '../../../../typer/historikk';
import { formatterDatoOgTidstring } from '../../../../utils';
import { BeslutterIkon, SaksbehandlerIkon, SystemIkon } from '../../../Felleskomponenter/Ikoner/';
import { finnSideForSteg } from '../../../Felleskomponenter/Venstremeny/sider';
import HentDokument from './HentDokument';
import { useHistorikk } from './HistorikkContext';

const Innslag = styled.div`
    display: flex;
    flex-direction: row;
`;

const Tidslinje = styled.div`
    width: 3.5rem;
    min-width: 3.5rem;
    text-align: center;
    background-image: radial-gradient(
        1px 1px at center,
        ${NavdsGlobalColorGray400} 1px,
        transparent 1px,
        transparent 4px
    );
    background-size: 100% 5px;
`;

const Innhold = styled.div`
    margin-bottom: ${NavdsSpacing6};
`;

interface IProps {
    innslag: IHistorikkInnslag;
}

const HistorikkInnslag: React.FC<IProps> = ({ innslag }) => {
    const { navigerTilSide } = useHistorikk();
    const [visDokument, settVisDokument] = React.useState<boolean>(false);

    const lagTittel = () => {
        if (innslag.type === Historikkinnslagstype.SKJERMLENKE && innslag.steg) {
            const steg = Behandlingssteg[innslag.steg as keyof typeof Behandlingssteg];
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

    const tilpassTekst = () => {
        // @ts-ignore
        const indexÅrsakMedBegrunnelse = innslag.tekst.indexOf(', Begrunnelse:');
        if (indexÅrsakMedBegrunnelse > -1) {
            const årsak = innslag.tekst?.substring(0, indexÅrsakMedBegrunnelse);
            const begrunnelse = innslag.tekst?.substring(indexÅrsakMedBegrunnelse + 15);
            return (
                <>
                    <BodyShort size="small">{årsak}</BodyShort>
                    <BodyLong size="small">
                        Begrunnelse: <em>{begrunnelse}</em>
                    </BodyLong>
                </>
            );
        }
        return <BodyShort size="small">{innslag.tekst}</BodyShort>;
    };

    const lagBrevLink = () => {
        return (
            <span>
                <Link
                    href={'#'}
                    onClick={(e: React.MouseEvent) => {
                        e.preventDefault();
                        settVisDokument(true);
                    }}
                >
                    {innslag.tekst}
                    <ExternalLink aria-label={`Åpne ${innslag.tekst}`} />
                </Link>
            </span>
        );
    };

    const typeBrev = innslag.type === Historikkinnslagstype.BREV;

    return (
        <Innslag>
            <Tidslinje>
                {innslag.aktør === Aktør.VEDTAKSLØSNING && <SystemIkon />}
                {innslag.aktør === Aktør.BESLUTTER && <BeslutterIkon />}
                {innslag.aktør === Aktør.SAKSBEHANDLER && <SaksbehandlerIkon />}
            </Tidslinje>
            <Innhold>
                <Label size="small">{lagTittel()}</Label>
                <Detail size="small">
                    {`${formatterDatoOgTidstring(innslag.opprettetTid)} | `}
                    {innslag.aktør === Aktør.VEDTAKSLØSNING
                        ? applikasjoner[innslag.applikasjon]
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
            </Innhold>
        </Innslag>
    );
};

export default HistorikkInnslag;
