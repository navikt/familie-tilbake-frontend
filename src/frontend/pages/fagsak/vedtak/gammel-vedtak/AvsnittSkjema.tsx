import type { AvsnittSkjemaData, UnderavsnittSkjemaData } from './typer/vedtak';

import { BodyLong, ExpansionCard, Heading, VStack } from '@navikt/ds-react';
import classNames from 'classnames';
import { useState, type FC } from 'react';

import { useBehandlingState } from '~/context/BehandlingStateContext';
import { Avsnittstype, Underavsnittstype } from '~/kodeverk';

import { VedtakFritekstSkjema } from './VedtakFritekstSkjema';

const skalVisesÅpen = (avsnitt: AvsnittSkjemaData): boolean => {
    if (avsnitt.avsnittstype === Avsnittstype.Oppsummering) {
        return avsnitt.underavsnittsliste.some(
            underavsnitt =>
                underavsnitt.fritekstPåkrevet && (!underavsnitt.fritekst || underavsnitt.harFeil)
        );
    }
    if (
        avsnitt.avsnittstype === Avsnittstype.Periode ||
        avsnitt.avsnittstype === Avsnittstype.SammenslåttPeriode
    ) {
        return avsnitt.underavsnittsliste
            .filter(
                underavsnitt =>
                    underavsnitt.underavsnittstype === Underavsnittstype.Fakta ||
                    underavsnitt.underavsnittstype === Underavsnittstype.SærligegrunnerAnnet
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

type Props = {
    avsnitt: AvsnittSkjemaData;
    erRevurderingBortfaltBeløp: boolean;
};

export const AvsnittSkjema: FC<Props> = ({ avsnitt, erRevurderingBortfaltBeløp }) => {
    const harPåkrevetFritekstMenIkkeUtfylt = skalVisesÅpen(avsnitt);
    const [erEkspandert, settErEkspandert] = useState(harPåkrevetFritekstMenIkkeUtfylt);
    const { behandlingILesemodus } = useBehandlingState();

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
        <ExpansionCard
            open={erEkspandert}
            onToggle={() => settErEkspandert(prevState => !prevState)}
            aria-label={avsnitt.overskrift ?? 'ekspanderbart panel'}
            size="small"
        >
            <ExpansionCard.Header
                className={
                    !behandlingILesemodus && harPåkrevetFritekstMenIkkeUtfylt
                        ? 'border-l-4 border-ax-border-danger'
                        : ''
                }
            >
                <ExpansionCard.Title size="small">{avsnitt.overskrift ?? ''}</ExpansionCard.Title>
            </ExpansionCard.Header>

            <ExpansionCard.Content
                className={classNames(
                    !behandlingILesemodus && harPåkrevetFritekstMenIkkeUtfylt
                        ? 'border-l-4 border-ax-border-danger'
                        : ''
                )}
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
                        <VStack
                            gap="space-8"
                            className="pb-3"
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
                                    maximumLength={erRevurderingBortfaltBeløp ? 10000 : undefined}
                                />
                            )}
                        </VStack>
                    );
                })}
            </ExpansionCard.Content>
        </ExpansionCard>
    );
};
