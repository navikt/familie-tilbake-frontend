import type { Behandling } from '../../../../typer/behandling';
import type { ForeldelsePeriodeSkjemeData } from '../typer/foreldelse';
import type { ReactNode } from 'react';

import { ExternalLinkIcon } from '@navikt/aksel-icons';
import {
    BodyLong,
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
import { differenceInMonths, parseISO } from 'date-fns';
import * as React from 'react';
import { styled } from 'styled-components';

import { useForeldelsePeriodeSkjema } from './ForeldelsePeriodeSkjemaContext';
import SplittPeriode from './SplittPeriode/SplittPeriode';
import { useBehandling } from '../../../../context/BehandlingContext';
import { Valideringsstatus } from '../../../../hooks/skjema/typer';
import {
    Foreldelsevurdering,
    foreldelsevurderinger,
    foreldelseVurderingTyper,
} from '../../../../kodeverk';
import { isoStringTilDate } from '../../../../utils/dato';
import Datovelger from '../../../Felleskomponenter/Datovelger/Datovelger';
import PeriodeOppsummering from '../../../Felleskomponenter/Periodeinformasjon/PeriodeOppsummering';
import { useForeldelse } from '../ForeldelseContext';

const StyledVStack = styled(VStack)`
    max-width: 50rem;
    width: 100%;
`;
const StyledStack = styled(Stack)`
    max-width: 30rem;
    width: 100%;
`;

type Props = {
    behandling: Behandling;
    periode: ForeldelsePeriodeSkjemeData;
    erLesevisning: boolean;
};

const ForeldelsePeriodeSkjema: React.FC<Props> = ({ behandling, periode, erLesevisning }) => {
    const { oppdaterPeriode, onSplitPeriode } = useForeldelse();
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
        skjema.felter.foreldelsesvurderingstype.verdi === Foreldelsevurdering.Foreldet;
    const erMedTilleggsfrist =
        skjema.felter.foreldelsesvurderingstype.verdi === Foreldelsevurdering.Tilleggsfrist;

    const ugyldigVurderingValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.foreldelsesvurderingstype.valideringsstatus === Valideringsstatus.Feil;

    const ugyldigForeldelsesfristValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.foreldelsesfrist.valideringsstatus === Valideringsstatus.Feil;

    const ugyldigOppdagelsesdatoValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.oppdagelsesdato.valideringsstatus === Valideringsstatus.Feil;

    const lagForeldelsesfristHjelpetekst = (): ReactNode => {
        if (skjema.felter.foreldelsesvurderingstype.verdi === Foreldelsevurdering.Tilleggsfrist) {
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
        } else if (skjema.felter.foreldelsesvurderingstype.verdi === Foreldelsevurdering.Foreldet) {
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

    const kanSplittePeriode = (periode: ForeldelsePeriodeSkjemeData): boolean => {
        const fom = parseISO(periode.periode.fom);
        const tom = parseISO(periode.periode.tom);
        return differenceInMonths(tom, fom) >= 1;
    };

    return (
        <div className="p-4 bg-white">
            <StyledStack
                justify="space-between"
                align={{ md: 'start', lg: 'center' }}
                direction={{ md: 'column', lg: 'row' }}
            >
                <Heading size="small" level="2">
                    Detaljer for valgt periode
                </Heading>

                {!erLesevisning && kanSplittePeriode(periode) && (
                    <SplittPeriode
                        behandling={behandling}
                        periode={periode}
                        onBekreft={onSplitPeriode}
                    />
                )}
            </StyledStack>
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
                    <div className="flex justify-end">
                        <Button className="w-40" onClick={() => onBekreft(periode)}>
                            Bekreft periode
                        </Button>
                    </div>
                )}
            </StyledVStack>
        </div>
    );
};

export default ForeldelsePeriodeSkjema;
