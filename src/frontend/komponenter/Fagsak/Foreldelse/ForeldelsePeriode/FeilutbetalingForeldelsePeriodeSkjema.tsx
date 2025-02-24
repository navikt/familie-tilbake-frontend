import * as React from 'react';

import { styled } from 'styled-components';

import { ExternalLinkIcon } from '@navikt/aksel-icons';
import {
    BodyLong,
    Box,
    Button,
    Heading,
    HGrid,
    Link,
    Radio,
    RadioGroup,
    ReadMore,
    Stack,
    Textarea,
    VStack,
} from '@navikt/ds-react';

import { useForeldelsePeriodeSkjema } from './ForeldelsePeriodeSkjemaContext';
import SplittPeriode from './SplittPeriode/SplittPeriode';
import { useBehandling } from '../../../../context/BehandlingContext';
import {
    Foreldelsevurdering,
    foreldelsevurderinger,
    foreldelseVurderingTyper,
} from '../../../../kodeverk';
import { IBehandling } from '../../../../typer/behandling';
import { isoStringTilDate } from '../../../../utils/dato';
import Datovelger from '../../../Felleskomponenter/Datovelger/Datovelger';
import { Navigering } from '../../../Felleskomponenter/Flytelementer';
import PeriodeOppsummering from '../../../Felleskomponenter/Periodeinformasjon/PeriodeOppsummering';
import PeriodeController from '../../../Felleskomponenter/TilbakeTidslinje/PeriodeController/PeriodeController';
import { useFeilutbetalingForeldelse } from '../FeilutbetalingForeldelseContext';
import { ForeldelsePeriodeSkjemeData } from '../typer/feilutbetalingForeldelse';
import { Valideringsstatus } from '../../../../hooks/skjema/typer';

const StyledVStack = styled(VStack)`
    max-width: 50rem;
    width: 100%;
`;
const StyledStack = styled(Stack)`
    max-width: 30rem;
    width: 100%;
`;

const StyledBox = styled(Box)`
    min-width: 20rem;
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
    const { oppdaterPeriode, onSplitPeriode, nestePeriode, forrigePeriode, settValgtPeriode } =
        useFeilutbetalingForeldelse();
    const { skjema, onBekreft } = useForeldelsePeriodeSkjema(
        (oppdatertPeriode: ForeldelsePeriodeSkjemeData) => oppdaterPeriode(oppdatertPeriode)
    );
    const { settIkkePersistertKomponent } = useBehandling();

    React.useEffect(() => {
        skjema.felter.begrunnelse.onChange(periode?.begrunnelse || '');
        skjema.felter.foreldelsesvurderingstype.onChange(periode?.foreldelsesvurderingstype || '');
        skjema.felter.foreldelsesfrist.onChange(
            periode?.foreldelsesfrist ? isoStringTilDate(periode.foreldelsesfrist) : undefined
        );
        skjema.felter.oppdagelsesdato.onChange(
            periode?.oppdagelsesdato ? isoStringTilDate(periode.oppdagelsesdato) : undefined
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
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
            <HGrid columns="1fr 4rem">
                <StyledStack
                    justify="space-between"
                    align={{ md: 'start', lg: 'center' }}
                    direction={{ md: 'column', lg: 'row' }}
                >
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
                </StyledStack>
                <PeriodeController
                    nestePeriode={() => nestePeriode(periode)}
                    forrigePeriode={() => forrigePeriode(periode)}
                />
            </HGrid>
            <StyledVStack gap="4">
                <PeriodeOppsummering
                    fom={periode.periode.fom}
                    tom={periode.periode.tom}
                    beløp={periode.feilutbetaltBeløp}
                />
                <Textarea
                    {...skjema.felter.begrunnelse.hentNavInputProps(skjema.visFeilmeldinger)}
                    id="begrunnelse"
                    name="begrunnelse"
                    label="Vurdering"
                    maxLength={3000}
                    readOnly={erLesevisning}
                    value={skjema.felter.begrunnelse.verdi}
                    onChange={event => {
                        skjema.felter.begrunnelse.validerOgSettFelt(event.target.value);
                        settIkkePersistertKomponent('foreldelse');
                    }}
                />
                <HGrid columns={{ md: 1, lg: 2 }} gap="4">
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
                        onChange={(val: Foreldelsevurdering) => {
                            skjema.felter.foreldelsesvurderingstype.validerOgSettFelt(val);
                            settIkkePersistertKomponent('foreldelse');
                        }}
                    >
                        {foreldelseVurderingTyper.map(type => (
                            <Radio key={type} name="foreldet" value={type}>
                                {foreldelsevurderinger[type]}
                            </Radio>
                        ))}
                    </RadioGroup>
                    <VStack gap="5">
                        {erMedTilleggsfrist && (
                            <Datovelger
                                felt={skjema.felter.oppdagelsesdato}
                                label="Dato for når feilutbetaling ble oppdaget"
                                description="Datoen kommer i vedtaksbrevet"
                                visFeilmeldinger={ugyldigOppdagelsesdatoValgt}
                                readOnly={erLesevisning}
                                kanKunVelgeFortid
                                settIkkePersistertKomponent={() =>
                                    settIkkePersistertKomponent('foreldelse')
                                }
                            />
                        )}
                        {(erForeldet || erMedTilleggsfrist) && (
                            <VStack gap="2">
                                <Datovelger
                                    felt={skjema.felter.foreldelsesfrist}
                                    label="Foreldelsesfrist"
                                    description={
                                        !erMedTilleggsfrist && 'Datoen kommer i vedtaksbrevet'
                                    }
                                    visFeilmeldinger={ugyldigForeldelsesfristValgt}
                                    readOnly={erLesevisning}
                                    settIkkePersistertKomponent={() =>
                                        settIkkePersistertKomponent('foreldelse')
                                    }
                                />
                                {!erLesevisning && (
                                    <ReadMore header="Hvordan sette foreldelsesfrist">
                                        {lagForeldelsesfristHjelpetekst()}
                                    </ReadMore>
                                )}
                            </VStack>
                        )}
                    </VStack>
                </HGrid>

                {!erLesevisning && (
                    <Navigering>
                        <Button variant="primary" onClick={() => onBekreft(periode)}>
                            Bekreft
                        </Button>
                        <Button variant="secondary" onClick={() => settValgtPeriode(undefined)}>
                            Lukk
                        </Button>
                    </Navigering>
                )}
            </StyledVStack>
        </StyledBox>
    );
};

export default FeilutbetalingForeldelsePeriodeSkjema;
