import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import Lenke from 'nav-frontend-lenker';
import { Element, Normaltekst, Undertekst } from 'nav-frontend-typografi';

import { ExternalLink } from '@navikt/ds-icons';

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
    line-height: 1.5rem;
`;

const Tidslinje = styled.div`
    width: 3.5rem;
    min-width: 3.5rem;
    text-align: center;
    background-image: radial-gradient(
        1px 1px at center,
        ${navFarger.navGra40} 1px,
        transparent 1px,
        transparent 4px
    );
    background-size: 100% 5px;
`;

const Innhold = styled.div`
    margin-bottom: 1.5rem;
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
                <Lenke
                    href="#"
                    onMouseDown={e => e.preventDefault()}
                    // @ts-ignore
                    onClick={() => navigerTilSide(side)}
                >
                    {innslag.tittel}
                </Lenke>
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
                    <Normaltekst>{årsak}</Normaltekst>
                    <Normaltekst>
                        Begrunnelse: <em>{begrunnelse}</em>
                    </Normaltekst>
                </>
            );
        }
        return <Normaltekst>{innslag.tekst}</Normaltekst>;
    };

    const lagBrevLink = () => {
        return (
            <span>
                <Lenke
                    href={'#'}
                    onClick={e => {
                        e.preventDefault();
                        settVisDokument(true);
                    }}
                >
                    <span>{innslag.tekst}</span>
                    <ExternalLink color={navFarger.navBla} />
                </Lenke>
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
                <Element>{lagTittel()}</Element>
                <Undertekst>
                    {formatterDatoOgTidstring(innslag.opprettetTid)} |{' '}
                    {innslag.aktør === Aktør.VEDTAKSLØSNING
                        ? applikasjoner[innslag.applikasjon]
                        : `${innslag.aktørIdent.toLocaleLowerCase()} (${aktører[
                              innslag.aktør
                          ].toLocaleLowerCase()})`}
                </Undertekst>
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
