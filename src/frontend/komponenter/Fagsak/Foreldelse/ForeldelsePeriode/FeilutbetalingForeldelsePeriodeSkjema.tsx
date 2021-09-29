import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import { Column, Row } from 'nav-frontend-grid';
import { Knapp } from 'nav-frontend-knapper';
import { Radio } from 'nav-frontend-skjema';
import { Undertittel } from 'nav-frontend-typografi';

import { FamilieRadioGruppe } from '@navikt/familie-form-elements';
import { Valideringsstatus } from '@navikt/familie-skjema';

import {
    Foreldelsevurdering,
    foreldelsevurderinger,
    foreldelseVurderingTyper,
} from '../../../../kodeverk';
import { IBehandling } from '../../../../typer/behandling';
import { datoformatNorsk } from '../../../../utils';
import { Navigering, Spacer20, Spacer8 } from '../../../Felleskomponenter/Flytelementer';
import PeriodeOppsummering from '../../../Felleskomponenter/Periodeinformasjon/PeriodeOppsummering';
import {
    FamilieTilbakeTextArea,
    FamilieTilbakeDatovelger,
} from '../../../Felleskomponenter/Skjemaelementer';
import PeriodeController from '../../../Felleskomponenter/TilbakeTidslinje/PeriodeController/PeriodeController';
import { useFeilutbetalingForeldelse } from '../FeilutbetalingForeldelseContext';
import { ForeldelsePeriodeSkjemeData } from '../typer/feilutbetalingForeldelse';
import { useForeldelsePeriodeSkjema } from './ForeldelsePeriodeSkjemaContext';
import SplittPeriode from './SplittPeriode/SplittPeriode';

const StyledContainer = styled.div`
    border: 1px solid ${navFarger.navGra60};
    padding: 10px;
`;

interface IProps {
    behandling: IBehandling;
    periode: ForeldelsePeriodeSkjemeData;
    erLesevisning: boolean;
}

const FeilutbetalingForeldelsePeriodeSkjema: React.FC<IProps> = ({
    behandling,
    periode,
    erLesevisning,
}) => {
    const { oppdaterPeriode, onSplitPeriode, lukkValgtPeriode, nestePeriode, forrigePeriode } =
        useFeilutbetalingForeldelse();
    const { skjema, onBekreft } = useForeldelsePeriodeSkjema(
        (oppdatertPeriode: ForeldelsePeriodeSkjemeData) => oppdaterPeriode(oppdatertPeriode)
    );

    React.useEffect(() => {
        skjema.felter.begrunnelse.onChange(periode?.begrunnelse || '');
        skjema.felter.foreldelsesvurderingstype.onChange(periode?.foreldelsesvurderingstype || '');
        skjema.felter.foreldelsesfrist.onChange(periode?.foreldelsesfrist || '');
        skjema.felter.oppdagelsesdato.onChange(periode?.oppdagelsesdato || '');
    }, [periode]);

    const erForeldet =
        skjema.felter.foreldelsesvurderingstype.verdi === Foreldelsevurdering.FORELDET;
    const erMedTilleggsfrist =
        skjema.felter.foreldelsesvurderingstype.verdi === Foreldelsevurdering.TILLEGGSFRIST;

    const ugyldigVurderingValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.foreldelsesvurderingstype.valideringsstatus === Valideringsstatus.FEIL;

    const ugyldigForeldelsesfristValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.foreldelsesfrist.valideringsstatus === Valideringsstatus.FEIL;

    const ugyldigOppdagelsesdatoValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.oppdagelsesdato.valideringsstatus === Valideringsstatus.FEIL;

    return (
        <StyledContainer>
            <Row>
                <Column lg="4" md="7" sm="12">
                    <Undertittel>Detaljer for valgt periode</Undertittel>
                </Column>
                <Column lg="2" md="2" sm="6">
                    {!erLesevisning && (
                        <SplittPeriode
                            behandling={behandling}
                            periode={periode}
                            onBekreft={onSplitPeriode}
                        />
                    )}
                </Column>
                <Column lg="6" md="3" sm="6">
                    <PeriodeController
                        nestePeriode={() => nestePeriode(periode)}
                        forrigePeriode={() => forrigePeriode(periode)}
                    />
                </Column>
            </Row>
            <Row>
                <Column lg="6" md="9" sm="12">
                    <PeriodeOppsummering
                        fom={periode.periode.fom}
                        tom={periode.periode.tom}
                        beløp={periode.feilutbetaltBeløp}
                    />
                </Column>
            </Row>
            <Spacer20 />
            <Row>
                <Column md="8">
                    <FamilieTilbakeTextArea
                        {...skjema.felter.begrunnelse.hentNavInputProps(skjema.visFeilmeldinger)}
                        id={'begrunnelse'}
                        name="begrunnelse"
                        label={'Vurdering'}
                        maxLength={1500}
                        erLesevisning={erLesevisning}
                        value={skjema.felter.begrunnelse.verdi}
                        onChange={event =>
                            skjema.felter.begrunnelse.validerOgSettFelt(event.target.value)
                        }
                    />
                </Column>
            </Row>
            <Spacer20 />
            <Row>
                <Column md="5">
                    <FamilieRadioGruppe
                        id="foreldet"
                        erLesevisning={erLesevisning}
                        legend="Vurder om perioden er foreldet"
                        verdi={
                            periode.foreldelsesvurderingstype
                                ? foreldelsevurderinger[periode.foreldelsesvurderingstype]
                                : ''
                        }
                        feil={
                            ugyldigVurderingValgt
                                ? skjema.felter.foreldelsesvurderingstype.feilmelding?.toString()
                                : ''
                        }
                    >
                        {foreldelseVurderingTyper.map(type => (
                            <Radio
                                key={type}
                                name="foreldet"
                                label={foreldelsevurderinger[type]}
                                value={type}
                                checked={skjema.felter.foreldelsesvurderingstype.verdi === type}
                                onChange={() =>
                                    skjema.felter.foreldelsesvurderingstype.validerOgSettFelt(type)
                                }
                            />
                        ))}
                    </FamilieRadioGruppe>
                </Column>
                <Column md="7">
                    {(erForeldet || erMedTilleggsfrist) && (
                        <FamilieTilbakeDatovelger
                            id="foreldelsesfrist"
                            label={'Foreldelsesfrist'}
                            erLesesvisning={erLesevisning}
                            onChange={(nyDato?: string) => {
                                skjema.felter.foreldelsesfrist.validerOgSettFelt(
                                    nyDato ? nyDato : ''
                                );
                            }}
                            valgtDato={skjema.felter.foreldelsesfrist.verdi}
                            placeholder={datoformatNorsk.DATO}
                            harFeil={ugyldigForeldelsesfristValgt}
                            feilmelding={
                                ugyldigForeldelsesfristValgt
                                    ? skjema.felter.foreldelsesfrist.feilmelding?.toString()
                                    : ''
                            }
                        />
                    )}
                    {erMedTilleggsfrist && (
                        <>
                            <Spacer8 />
                            <FamilieTilbakeDatovelger
                                id="oppdagelsesDato"
                                label={'Dato for når feilutbetaling ble oppdaget'}
                                erLesesvisning={erLesevisning}
                                onChange={(nyDato?: string) => {
                                    skjema.felter.oppdagelsesdato.validerOgSettFelt(
                                        nyDato ? nyDato : ''
                                    );
                                }}
                                valgtDato={skjema.felter.oppdagelsesdato.verdi}
                                limitations={{
                                    maxDate: new Date().toISOString(),
                                }}
                                placeholder={datoformatNorsk.DATO}
                                harFeil={ugyldigOppdagelsesdatoValgt}
                                feilmelding={
                                    ugyldigOppdagelsesdatoValgt
                                        ? skjema.felter.oppdagelsesdato.feilmelding?.toString()
                                        : ''
                                }
                            />
                        </>
                    )}
                </Column>
            </Row>
            <Spacer20 />
            {!erLesevisning && (
                <>
                    <Row>
                        <Column md="8">
                            <Navigering>
                                <div>
                                    <Knapp
                                        type={'hoved'}
                                        mini={true}
                                        onClick={() => onBekreft(periode)}
                                    >
                                        Bekreft
                                    </Knapp>
                                </div>
                                <div>
                                    <Knapp mini={true} onClick={lukkValgtPeriode}>
                                        Lukk
                                    </Knapp>
                                </div>
                            </Navigering>
                        </Column>
                    </Row>
                </>
            )}
        </StyledContainer>
    );
};

export default FeilutbetalingForeldelsePeriodeSkjema;
