import * as React from 'react';

import styled from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';
import { Radio } from 'nav-frontend-skjema';

import { ExternalLink } from '@navikt/ds-icons';
import { BodyLong, Heading, HelpText, Link } from '@navikt/ds-react';
import { FamilieRadioGruppe, FlexDiv } from '@navikt/familie-form-elements';
import { Valideringsstatus } from '@navikt/familie-skjema';

import {
    Foreldelsevurdering,
    foreldelsevurderinger,
    foreldelseVurderingTyper,
} from '../../../../kodeverk';
import { IBehandling } from '../../../../typer/behandling';
import { datoformatNorsk } from '../../../../utils';
import { FTButton, Navigering, Spacer20 } from '../../../Felleskomponenter/Flytelementer';
import PeriodeOppsummering from '../../../Felleskomponenter/Periodeinformasjon/PeriodeOppsummering';
import { FamilieTilbakeTextArea, FTDatovelger } from '../../../Felleskomponenter/Skjemaelementer';
import PeriodeController from '../../../Felleskomponenter/TilbakeTidslinje/PeriodeController/PeriodeController';
import { useFeilutbetalingForeldelse } from '../FeilutbetalingForeldelseContext';
import { ForeldelsePeriodeSkjemeData } from '../typer/feilutbetalingForeldelse';
import { useForeldelsePeriodeSkjema } from './ForeldelsePeriodeSkjemaContext';
import SplittPeriode from './SplittPeriode/SplittPeriode';

const StyledContainer = styled.div`
    border: 1px solid var(--navds-semantic-color-border);
    padding: 10px;
`;

const StyledHelpText = styled(HelpText)`
    margin-left: 1rem;
`;

const StyledHelpTextContainer = styled.div`
    max-width: 26rem;
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

    const lagForeldelsesfristHjelpetekst = () => {
        if (skjema.felter.foreldelsesvurderingstype.verdi === Foreldelsevurdering.TILLEGGSFRIST) {
            return (
                <>
                    <BodyLong size="small" spacing>
                        NAVI trenger tid for fristavbrytende tiltak. Husk å legge til nok tid ved
                        fastsettelse av frist. Se rutine for
                        <Link
                            href="https://navno.sharepoint.com/sites/TeamFamiliekopi/Shared%20Documents/Forms/AllItems.aspx?FolderCTID=0x012000AFBC2229208A6546861937F2075F148E&id=%2Fsites%2FTeamFamiliekopi%2FShared%20Documents%2FBarnetrygd%20%2D%20feilutbetaling%20og%20tilbakekreving%2FRutiner%20for%20tilbakekreving%2FForeldelse%20av%20tilbakebetalingskrav%2Epdf&parent=%2Fsites%2FTeamFamiliekopi%2FShared%20Documents%2FBarnetrygd%20%2D%20feilutbetaling%20og%20tilbakekreving%2FRutiner%20for%20tilbakekreving"
                            target="_blank"
                        >
                            foreldelse av tilbakebetalingskrav
                            <ExternalLink aria-label="Gå til rutine for foreldelse" />
                        </Link>
                    </BodyLong>
                    <BodyLong size="small">
                        Dette er kun en intern frist, og vil ikke komme i vedtaksbrevet.
                    </BodyLong>
                </>
            );
        } else if (skjema.felter.foreldelsesvurderingstype.verdi === Foreldelsevurdering.FORELDET) {
            return (
                <>
                    <BodyLong size="small" spacing>
                        NAVI trenger tid for fristavbrytende tiltak. Husk å legge til nok tid ved
                        fastsettelse av frist.
                    </BodyLong>
                    <BodyLong size="small" spacing>
                        Sett foreldelesfristen minimum 6 uker frem i tid. Se rutine for
                        <Link
                            href="https://navno.sharepoint.com/sites/TeamFamiliekopi/Shared%20Documents/Forms/AllItems.aspx?FolderCTID=0x012000AFBC2229208A6546861937F2075F148E&id=%2Fsites%2FTeamFamiliekopi%2FShared%20Documents%2FBarnetrygd%20%2D%20feilutbetaling%20og%20tilbakekreving%2FRutiner%20for%20tilbakekreving%2FForeldelse%20av%20tilbakebetalingskrav%2Epdf&parent=%2Fsites%2FTeamFamiliekopi%2FShared%20Documents%2FBarnetrygd%20%2D%20feilutbetaling%20og%20tilbakekreving%2FRutiner%20for%20tilbakekreving"
                            target="_blank"
                        >
                            foreldelse av tilbakebetalingskrav
                            <ExternalLink aria-label="Gå til rutine for foreldelse" />
                        </Link>
                    </BodyLong>
                    <BodyLong size="small">Denne fristen kommer i vedtaksbrevet.</BodyLong>
                </>
            );
        } else {
            return null;
        }
    };

    return (
        <StyledContainer>
            <Row>
                <Column lg="4" md="7" sm="12">
                    <Heading size="small" level="2">
                        Detaljer for valgt periode
                    </Heading>
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
                        maxLength={3000}
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
                    {erMedTilleggsfrist && (
                        <>
                            <FTDatovelger
                                id="oppdagelsesDato"
                                label={'Dato for når feilutbetaling ble oppdaget'}
                                description={'Datoen kommer i vedtaksbrevet'}
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
                                feil={
                                    ugyldigOppdagelsesdatoValgt
                                        ? skjema.felter.oppdagelsesdato.feilmelding?.toString()
                                        : ''
                                }
                            />
                            <Spacer20 />
                        </>
                    )}
                    {(erForeldet || erMedTilleggsfrist) && (
                        <FTDatovelger
                            id="foreldelsesfrist"
                            label={
                                erLesevisning ? (
                                    <>Foreldelsesfrist</>
                                ) : (
                                    <FlexDiv>
                                        Foreldelsesfrist
                                        <StyledHelpText
                                            placement="right"
                                            aria-label="Hjelpetekst foreldelsesfrist"
                                        >
                                            <StyledHelpTextContainer>
                                                {lagForeldelsesfristHjelpetekst()}
                                            </StyledHelpTextContainer>
                                        </StyledHelpText>
                                    </FlexDiv>
                                )
                            }
                            description={
                                !erMedTilleggsfrist ? 'Datoen kommer i vedtaksbrevet' : undefined
                            }
                            erLesesvisning={erLesevisning}
                            onChange={(nyDato?: string) => {
                                skjema.felter.foreldelsesfrist.validerOgSettFelt(
                                    nyDato ? nyDato : ''
                                );
                            }}
                            valgtDato={skjema.felter.foreldelsesfrist.verdi}
                            placeholder={datoformatNorsk.DATO}
                            feil={
                                ugyldigForeldelsesfristValgt
                                    ? skjema.felter.foreldelsesfrist.feilmelding?.toString()
                                    : ''
                            }
                        />
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
                                    <FTButton variant="primary" onClick={() => onBekreft(periode)}>
                                        Bekreft
                                    </FTButton>
                                </div>
                                <div>
                                    <FTButton variant="secondary" onClick={lukkValgtPeriode}>
                                        Lukk
                                    </FTButton>
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
