import * as React from 'react';

import { css, styled } from 'styled-components';

import { BodyLong, ExpansionCard, Heading } from '@navikt/ds-react';
import { ABorderWarning, ASpacing2 } from '@navikt/ds-tokens/dist/tokens';

import { AvsnittSkjemaData, UnderavsnittSkjemaData } from './typer/feilutbetalingVedtak';
import VedtakFritekstSkjema from './VedtakFritekstSkjema';
import { Avsnittstype, Underavsnittstype } from '../../../kodeverk';
import { Spacer8 } from '../../Felleskomponenter/Flytelementer';

const StyledExpansionCard = styled(ExpansionCard)`
    margin-bottom: ${ASpacing2};
`;

const stylingWarningKantlinje = css`
    border-left-color: ${ABorderWarning};
    border-left-width: 5px;
`;
const StyledExpansionHeader = styled(ExpansionCard.Header)<{
    $visWarningKantlinje: boolean;
}>`
    ${props => {
        if (props.$visWarningKantlinje) {
            return stylingWarningKantlinje;
        }
    }}
`;

const StyledExpansionContent = styled(ExpansionCard.Content)<{
    $visWarningKantlinje: boolean;
}>`
    ${props => {
        if (props.$visWarningKantlinje) {
            return stylingWarningKantlinje;
        }
    }}
`;
const skalVisesÅpen = (avsnitt: AvsnittSkjemaData) => {
    if (avsnitt.avsnittstype === Avsnittstype.OPPSUMMERING) {
        return avsnitt.underavsnittsliste.some(
            underavsnitt =>
                underavsnitt.fritekstPåkrevet && (!underavsnitt.fritekst || underavsnitt.harFeil)
        );
    }
    if (avsnitt.avsnittstype === Avsnittstype.PERIODE) {
        return avsnitt.underavsnittsliste
            .filter(
                underavsnitt =>
                    underavsnitt.underavsnittstype === Underavsnittstype.FAKTA ||
                    underavsnitt.underavsnittstype === Underavsnittstype.SÆRLIGEGRUNNER_ANNET
            )
            .some(
                underavsnitt =>
                    underavsnitt.fritekstPåkrevet &&
                    (!underavsnitt.fritekst || underavsnitt.harFeil)
            );
    }

    return false;
};

export const avsnittKey = (avsnitt: AvsnittSkjemaData): string =>
    `${avsnitt.avsnittstype}_${avsnitt.fom}`;

interface IProps {
    avsnitt: AvsnittSkjemaData;
    erLesevisning: boolean;
    erRevurderingBortfaltBeløp: boolean;
}

const AvsnittSkjema: React.FC<IProps> = ({
    avsnitt,
    erLesevisning,
    erRevurderingBortfaltBeløp,
}) => {
    const [erEkspandert, settErEkspandert] = React.useState<boolean>(false);

    const harPåkrevetFritekstMenIkkeUtfylt = skalVisesÅpen(avsnitt);

    React.useEffect(() => {
        settErEkspandert(erEkspandert || harPåkrevetFritekstMenIkkeUtfylt);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [avsnitt]);

    const finnBulletpointsFraListe = (
        underavsnittsliste: UnderavsnittSkjemaData[]
    ): UnderavsnittSkjemaData[] => {
        const bulletpoints: UnderavsnittSkjemaData[] = [];
        let erBulletpoints = false;

        for (const underavsnitt of underavsnittsliste) {
            if (erBulletpoints) {
                bulletpoints.push(underavsnitt);
            }
            if (underavsnitt.brødtekst?.startsWith('*-')) {
                erBulletpoints = true;
            }
            if (underavsnitt.brødtekst?.endsWith('-*')) {
                erBulletpoints = false;
                break;
            }
        }

        return bulletpoints;
    };

    const bulletpoints = finnBulletpointsFraListe(avsnitt.underavsnittsliste);
    const underavsnittUtenBulletpoints = avsnitt.underavsnittsliste
        .filter(ul => !bulletpoints?.includes(ul))
        .filter(ul => !ul.brødtekst?.includes('*-'));

    return (
        <StyledExpansionCard
            open={erEkspandert}
            onToggle={() => settErEkspandert(prevState => !prevState)}
            aria-label={avsnitt.overskrift ?? 'ekspanderbart panel'}
            size="small"
        >
            <StyledExpansionHeader
                $visWarningKantlinje={!erLesevisning && harPåkrevetFritekstMenIkkeUtfylt}
            >
                <ExpansionCard.Title size="small">{avsnitt.overskrift ?? ''}</ExpansionCard.Title>
            </StyledExpansionHeader>
            <StyledExpansionContent
                $visWarningKantlinje={!erLesevisning && harPåkrevetFritekstMenIkkeUtfylt}
            >
                {bulletpoints.length > 0 && (
                    <ul>
                        {bulletpoints.map(bulletpoint => {
                            return (
                                <li key={bulletpoint.index}>
                                    {bulletpoint?.brødtekst?.replace('-*', '')}
                                </li>
                            );
                        })}
                    </ul>
                )}
                {underavsnittUtenBulletpoints.map(underavsnitt => {
                    return (
                        <React.Fragment
                            key={
                                '' +
                                underavsnitt.underavsnittstype +
                                underavsnitt.overskrift +
                                underavsnitt.brødtekst
                            }
                        >
                            {underavsnitt.overskrift && (
                                <Heading level="3" size="xsmall">
                                    {underavsnitt.overskrift}
                                </Heading>
                            )}
                            {underavsnitt.brødtekst && (
                                <BodyLong size="small">{underavsnitt.brødtekst}</BodyLong>
                            )}
                            {underavsnitt.fritekstTillatt && (
                                <VedtakFritekstSkjema
                                    avsnittIndex={avsnitt.index}
                                    underavsnitt={underavsnitt}
                                    erLesevisning={erLesevisning}
                                    maximumLength={erRevurderingBortfaltBeløp ? 10000 : undefined}
                                />
                            )}
                            <Spacer8 />
                        </React.Fragment>
                    );
                })}
            </StyledExpansionContent>
        </StyledExpansionCard>
    );
};

export default AvsnittSkjema;
