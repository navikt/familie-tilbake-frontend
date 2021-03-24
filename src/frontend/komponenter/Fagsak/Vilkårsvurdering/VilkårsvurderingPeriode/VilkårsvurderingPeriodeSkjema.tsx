import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Column, Row } from 'nav-frontend-grid';
import { Radio } from 'nav-frontend-skjema';
import { Normaltekst, Undertekst, UndertekstBold, Undertittel } from 'nav-frontend-typografi';

import { FamilieRadioGruppe, FamilieSelect } from '@navikt/familie-form-elements';

import { useVilkårsvurderingPeriode } from '../../../../context/VilkårsvurderingPeriodeContext';
import {
    Foreldelsevurdering,
    Vilkårsresultat,
    vilkårsresultater,
    vilkårsresultatTyper,
} from '../../../../kodeverk';
import { Spacer20, Spacer8 } from '../../../Felleskomponenter/Flytelementer';
import PeriodeOppsummering from '../../../Felleskomponenter/Periodeinformasjon/PeriodeOppsummering';
import { FamilieTilbakeTextArea } from '../../../Felleskomponenter/Skjemaelementer';
import AktsomhetsvurderingSkjema from './Aktsomhetsvurdering/AktsomhetsvurderingSkjema';
import AktsomhetGodTro from './GodTroSkjema';
import TilbakekrevingAktivitetTabell from './TilbakekrevingAktivitetTabell';

const StyledContainer = styled.div`
    border: 1px solid ${navFarger.navGra60};
    padding: 10px;
`;

interface IProps {
    erTotalbeløpUnder4Rettsgebyr: boolean;
    erLesevisning: boolean;
}

const VilkårsvurderingPeriodeSkjema: React.FC<IProps> = ({
    erTotalbeløpUnder4Rettsgebyr,
    erLesevisning,
}) => {
    const {
        vilkårsvurderingPeriode,
        vilkårsresultat,
        oppdaterVilkårsresultat,
        aktsomhetsvurdering,
        oppdaterAktsomhetsvurdering,
    } = useVilkårsvurderingPeriode();

    const onChangeVilkårsresultat = (type: Vilkårsresultat) => {
        oppdaterVilkårsresultat({ vilkårsresultat: type });
    };

    const onChangeBegrunnelse = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const nyVerdi = e.target.value;
        oppdaterVilkårsresultat({ begrunnelse: nyVerdi });
    };

    const onChangeAktsomhetBegrunnelse = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const nyVerdi = e.target.value;
        oppdaterAktsomhetsvurdering({ begrunnelse: nyVerdi });
    };

    const onChange = () => {
        // TODO
    };

    const erForeldet =
        vilkårsvurderingPeriode?.foreldelse.foreldelseVurderingType ===
        Foreldelsevurdering.FORELDET;

    return vilkårsvurderingPeriode ? (
        <StyledContainer>
            <Row>
                <Column xs="8">
                    <Undertittel>Detaljer for valgt periode</Undertittel>
                    <PeriodeOppsummering
                        fom={vilkårsvurderingPeriode.periode.fom}
                        tom={vilkårsvurderingPeriode.periode.tom}
                        beløp={vilkårsvurderingPeriode.feilutbetaltBeløp}
                        hendelsetype={vilkårsvurderingPeriode.hendelseType}
                    />
                </Column>
            </Row>
            <Spacer20 />
            <TilbakekrevingAktivitetTabell ytelser={vilkårsvurderingPeriode.ytelser} />
            <Spacer20 />
            {!erLesevisning && !erForeldet && (
                <>
                    <Row>
                        <Column md="10">
                            <Undertekst>Kopier vilkårsvurdering fra</Undertekst>
                            <FamilieSelect
                                name="perioderForKopi"
                                onChange={onChange}
                                bredde="m"
                                label=""
                                erLesevisning={erLesevisning}
                            >
                                <option>-</option>
                            </FamilieSelect>
                        </Column>
                    </Row>
                    <Spacer20 />
                </>
            )}
            <Row>
                <Column md={erForeldet ? '12' : '6'}>
                    <Row>
                        {erForeldet ? (
                            <Column md="12">
                                <Row>
                                    <Column md="6">
                                        <UndertekstBold>Varsel</UndertekstBold>
                                        <Spacer8 />
                                        <Normaltekst>
                                            {vilkårsvurderingPeriode.foreldelse?.begrunnelse
                                                ? vilkårsvurderingPeriode.foreldelse.begrunnelse
                                                : ''}
                                        </Normaltekst>
                                    </Column>
                                    <Column md="6">
                                        <UndertekstBold>
                                            Vurder om perioden er foreldet
                                        </UndertekstBold>
                                        <Spacer8 />
                                        <Normaltekst>Perioden er foreldet</Normaltekst>
                                    </Column>
                                </Row>
                            </Column>
                        ) : (
                            <Column md="10">
                                <Undertittel>Vilkårene for tilbakekreving</Undertittel>
                                <Spacer8 />
                                <FamilieTilbakeTextArea
                                    name="begrunnelse"
                                    label={'Vilkårene for tilbakekreving'}
                                    placeholder={
                                        'Hvilke hendelser har ført til feilutbetalingen og vurder valg av hjemmel'
                                    }
                                    erLesevisning={erLesevisning}
                                    value={
                                        vilkårsresultat?.begrunnelse
                                            ? vilkårsresultat.begrunnelse
                                            : ''
                                    }
                                    onChange={event => onChangeBegrunnelse(event)}
                                    maxLength={1500}
                                />
                                <Spacer8 />
                                <FamilieRadioGruppe
                                    id="valgtVilkarResultatType"
                                    erLesevisning={erLesevisning}
                                    legend={'Er vilkårene for tilbakekreving oppfylt?'}
                                    verdi={
                                        vilkårsresultat?.vilkårsresultat
                                            ? vilkårsresultater[vilkårsresultat.vilkårsresultat]
                                            : ''
                                    }
                                >
                                    {vilkårsresultatTyper.map(type => (
                                        <Radio
                                            key={type}
                                            name="valgtVilkarResultatType"
                                            label={vilkårsresultater[type]}
                                            value={type}
                                            checked={vilkårsresultat?.vilkårsresultat === type}
                                            onChange={() => onChangeVilkårsresultat(type)}
                                        />
                                    ))}
                                </FamilieRadioGruppe>
                            </Column>
                        )}
                    </Row>
                </Column>
                <Column xs="12" md="6">
                    <Row>
                        <Column md="10">
                            {vilkårsresultat?.vilkårsresultat && (
                                <>
                                    {vilkårsresultat.vilkårsresultat === Vilkårsresultat.GOD_TRO ? (
                                        <Undertittel>Beløpet mottatt i god tro</Undertittel>
                                    ) : (
                                        <Undertittel>Aktsomhet</Undertittel>
                                    )}
                                    <Spacer8 />
                                    <FamilieTilbakeTextArea
                                        name="vurderingBegrunnelse"
                                        label={
                                            vilkårsresultat.vilkårsresultat ===
                                            Vilkårsresultat.GOD_TRO
                                                ? 'Begrunn hvorfor mottaker er i god tro'
                                                : 'Vurder i hvilken grad mottaker har handlet uaktsomt'
                                        }
                                        erLesevisning={erLesevisning}
                                        value={
                                            aktsomhetsvurdering?.begrunnelse
                                                ? aktsomhetsvurdering.begrunnelse
                                                : ''
                                        }
                                        onChange={event => onChangeAktsomhetBegrunnelse(event)}
                                        maxLength={1500}
                                    />
                                    <Spacer8 />
                                    {vilkårsresultat.vilkårsresultat === Vilkårsresultat.GOD_TRO ? (
                                        <AktsomhetGodTro erLesevisning={erLesevisning} />
                                    ) : (
                                        <AktsomhetsvurderingSkjema
                                            erTotalbeløpUnder4Rettsgebyr={
                                                erTotalbeløpUnder4Rettsgebyr
                                            }
                                            erLesevisning={erLesevisning}
                                        />
                                    )}
                                </>
                            )}
                        </Column>
                    </Row>
                </Column>
            </Row>
        </StyledContainer>
    ) : null;
};

export default VilkårsvurderingPeriodeSkjema;
