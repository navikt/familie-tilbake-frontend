import * as React from 'react';

import { ExternalLinkIcon } from '@navikt/aksel-icons';
import {
    BodyLong,
    Box,
    Heading,
    HGrid,
    HStack,
    Link,
    Radio,
    RadioGroup,
    ReadMore,
    Textarea,
    VStack,
} from '@navikt/ds-react';
import { Valideringsstatus } from '@navikt/familie-skjema';

import {
    Foreldelsevurdering,
    foreldelsevurderinger,
    foreldelseVurderingTyper,
} from '../../../../kodeverk';
import { IBehandling } from '../../../../typer/behandling';
import { FTButton, Navigering, Spacer20, Spacer8 } from '../../../Felleskomponenter/Flytelementer';
import PeriodeOppsummering from '../../../Felleskomponenter/Periodeinformasjon/PeriodeOppsummering';
import PeriodeController from '../../../Felleskomponenter/TilbakeTidslinje/PeriodeController/PeriodeController';
import { useFeilutbetalingForeldelse } from '../FeilutbetalingForeldelseContext';
import { ForeldelsePeriodeSkjemeData } from '../typer/feilutbetalingForeldelse';
import { useForeldelsePeriodeSkjema } from './ForeldelsePeriodeSkjemaContext';
import SplittPeriode from './SplittPeriode/SplittPeriode';
import { isoStringTilDate } from '../../../../utils/dato';
import Datovelger from '../../../Felleskomponenter/Datovelger/Datovelger';
import { styled } from 'styled-components';

const StyledVStack = styled(VStack)<{ $maxWidth: string }>`
    max-width: ${props => props.$maxWidth};
    width: 100%;
`;

const StyledBox = styled(Box)`
    min-width: 38rem;
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
        skjema.felter.foreldelsesfrist.onChange(
            periode?.foreldelsesfrist ? isoStringTilDate(periode.foreldelsesfrist) : undefined
        );
        skjema.felter.oppdagelsesdato.onChange(
            periode?.oppdagelsesdato ? isoStringTilDate(periode.oppdagelsesdato) : undefined
        );
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
                        fastsettelse av frist. Se rutine for&nbsp;
                        <Link
                            href="https://navno.sharepoint.com/sites/TeamFamiliekopi/Shared%20Documents/Forms/AllItems.aspx?FolderCTID=0x012000AFBC2229208A6546861937F2075F148E&id=%2Fsites%2FTeamFamiliekopi%2FShared%20Documents%2FBarnetrygd%20%2D%20feilutbetaling%20og%20tilbakekreving%2FRutiner%20for%20tilbakekreving%2FForeldelse%20av%20tilbakebetalingskrav%2Epdf&parent=%2Fsites%2FTeamFamiliekopi%2FShared%20Documents%2FBarnetrygd%20%2D%20feilutbetaling%20og%20tilbakekreving%2FRutiner%20for%20tilbakekreving"
                            target="_blank"
                        >
                            foreldelse av tilbakebetalingskrav
                            <ExternalLinkIcon aria-label="Gå til rutine for foreldelse" />
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
                        Sett foreldelesfristen minimum 6 uker frem i tid. Se rutine for&nbsp;
                        <Link
                            href="https://navno.sharepoint.com/sites/TeamFamiliekopi/Shared%20Documents/Forms/AllItems.aspx?FolderCTID=0x012000AFBC2229208A6546861937F2075F148E&id=%2Fsites%2FTeamFamiliekopi%2FShared%20Documents%2FBarnetrygd%20%2D%20feilutbetaling%20og%20tilbakekreving%2FRutiner%20for%20tilbakekreving%2FForeldelse%20av%20tilbakebetalingskrav%2Epdf&parent=%2Fsites%2FTeamFamiliekopi%2FShared%20Documents%2FBarnetrygd%20%2D%20feilutbetaling%20og%20tilbakekreving%2FRutiner%20for%20tilbakekreving"
                            target="_blank"
                        >
                            foreldelse av tilbakebetalingskrav
                            <ExternalLinkIcon aria-label="Gå til rutine for foreldelse" />
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
        <StyledBox padding="4" borderColor="border-strong" borderWidth="1">
            <HStack justify="space-between">
                <StyledVStack $maxWidth={'30rem'}>
                    <HStack justify="space-between" align="center">
                        <Heading size="small" level="2">
                            Detaljer for valgt periode
                        </Heading>

                        {!erLesevisning && (
                            <SplittPeriode
                                behandling={behandling}
                                periode={periode}
                                onBekreft={onSplitPeriode}
                            />
                        )}
                    </HStack>
                    <PeriodeOppsummering
                        fom={periode.periode.fom}
                        tom={periode.periode.tom}
                        beløp={periode.feilutbetaltBeløp}
                    />
                </StyledVStack>
                <PeriodeController
                    nestePeriode={() => nestePeriode(periode)}
                    forrigePeriode={() => forrigePeriode(periode)}
                />
            </HStack>
            <Spacer20 />
            <StyledVStack $maxWidth={'50rem'}>
                <Textarea
                    {...skjema.felter.begrunnelse.hentNavInputProps(skjema.visFeilmeldinger)}
                    id={'begrunnelse'}
                    name="begrunnelse"
                    label={'Vurdering'}
                    maxLength={3000}
                    readOnly={erLesevisning}
                    value={skjema.felter.begrunnelse.verdi}
                    onChange={event =>
                        skjema.felter.begrunnelse.validerOgSettFelt(event.target.value)
                    }
                />
                <HGrid columns={2} gap="8">
                    <RadioGroup
                        id="foreldet"
                        readOnly={erLesevisning}
                        legend="Vurder om perioden er foreldet"
                        value={skjema.felter.foreldelsesvurderingstype.verdi}
                        error={
                            ugyldigVurderingValgt
                                ? skjema.felter.foreldelsesvurderingstype.feilmelding?.toString()
                                : ''
                        }
                        onChange={(val: Foreldelsevurdering) =>
                            skjema.felter.foreldelsesvurderingstype.validerOgSettFelt(val)
                        }
                    >
                        {foreldelseVurderingTyper.map(type => (
                            <Radio key={type} name="foreldet" value={type}>
                                {foreldelsevurderinger[type]}
                            </Radio>
                        ))}
                    </RadioGroup>
                    <VStack>
                        {erMedTilleggsfrist && (
                            <>
                                <Datovelger
                                    felt={skjema.felter.oppdagelsesdato}
                                    label="Dato for når feilutbetaling ble oppdaget"
                                    description="Datoen kommer i vedtaksbrevet"
                                    visFeilmeldinger={ugyldigOppdagelsesdatoValgt}
                                    readOnly={erLesevisning}
                                    kanKunVelgeFortid
                                />
                                <Spacer20 />
                            </>
                        )}
                        {(erForeldet || erMedTilleggsfrist) && (
                            <>
                                <Datovelger
                                    felt={skjema.felter.foreldelsesfrist}
                                    label="Foreldelsesfrist"
                                    description={
                                        !erMedTilleggsfrist && 'Datoen kommer i vedtaksbrevet'
                                    }
                                    visFeilmeldinger={ugyldigForeldelsesfristValgt}
                                    readOnly={erLesevisning}
                                />
                                <Spacer8 />
                                {!erLesevisning && (
                                    <ReadMore header="Hvordan sette foreldelsesfrist">
                                        {lagForeldelsesfristHjelpetekst()}
                                    </ReadMore>
                                )}
                            </>
                        )}
                    </VStack>
                </HGrid>

                <Spacer20 />
                {!erLesevisning && (
                    <Navigering>
                        <FTButton variant="primary" onClick={() => onBekreft(periode)}>
                            Bekreft
                        </FTButton>
                        <FTButton variant="secondary" onClick={lukkValgtPeriode}>
                            Lukk
                        </FTButton>
                    </Navigering>
                )}
            </StyledVStack>
        </StyledBox>
    );
};

export default FeilutbetalingForeldelsePeriodeSkjema;
