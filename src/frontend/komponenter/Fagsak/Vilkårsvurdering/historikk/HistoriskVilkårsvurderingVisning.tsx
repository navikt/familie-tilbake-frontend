import type { VilkårsvurderingPeriodeSkjemaData } from '../typer/feilutbetalingVilkårsvurdering';

import { BodyShort, Box, Heading, HGrid, List, VStack } from '@navikt/ds-react';
import * as React from 'react';

import {
    aktsomheter,
    forstodBurdeForståttAktsomheter,
    særligegrunner,
    Vilkårsresultat,
    vilkårsresultater,
} from '../../../../kodeverk';
import { formatCurrencyNoKr, formatterDatostring } from '../../../../utils';
import TilbakekrevingAktivitetTabell from '../VilkårsvurderingPeriode/TilbakekrevingAktivitetTabell';

interface IProps {
    perioder: VilkårsvurderingPeriodeSkjemaData[];
}

const HistoriskVilkårsvurderingVisning: React.FC<IProps> = ({ perioder }) => {
    return (
        <VStack gap="10">
            {perioder.map(skjema => {
                const erForstodBurdeForstått =
                    skjema.vilkårsvurderingsresultatInfo?.vilkårsvurderingsresultat ===
                    Vilkårsresultat.ForstoBurdeForstått;

                const aktsomhet = skjema.vilkårsvurderingsresultatInfo?.aktsomhet;
                const godTro = skjema.vilkårsvurderingsresultatInfo?.godTro;
                const begrunnelseAktsomhetGodTro = aktsomhet?.begrunnelse || godTro?.begrunnelse;
                const særligeGrunner = aktsomhet?.særligeGrunner;
                return (
                    <Box
                        key={skjema.index}
                        borderColor="border-default"
                        padding="4"
                        borderWidth="1"
                        borderRadius="small"
                        shadow="xsmall"
                    >
                        <HGrid columns={{ lg: 2, md: 1 }} gap="8">
                            <VStack gap="4">
                                <Box>
                                    <LabelVerdiVisning
                                        label="Fra"
                                        verdi={formatterDatostring(skjema.periode.fom)}
                                    />
                                    <LabelVerdiVisning
                                        label="Til"
                                        verdi={formatterDatostring(skjema.periode.tom)}
                                    />
                                    <LabelVerdiVisning
                                        label="Feilutbetalt beløp"
                                        verdi={formatCurrencyNoKr(skjema.feilutbetaltBeløp)}
                                    />
                                    <TilbakekrevingAktivitetTabell ytelser={skjema.aktiviteter} />
                                </Box>

                                <VStack>
                                    <LabelVerdiVisning
                                        label="Begrunnelse"
                                        verdi={skjema.begrunnelse}
                                    />
                                    <LabelVerdiVisning
                                        label="Vilkår oppfylt"
                                        verdi={
                                            skjema.vilkårsvurderingsresultatInfo
                                                ?.vilkårsvurderingsresultat
                                                ? vilkårsresultater[
                                                      skjema.vilkårsvurderingsresultatInfo
                                                          ?.vilkårsvurderingsresultat
                                                  ]
                                                : 'Mangler vurdering'
                                        }
                                    />
                                </VStack>
                            </VStack>
                            {(godTro || aktsomhet) && (
                                <VStack gap="1">
                                    <Heading size="small" level="2">
                                        {godTro && 'Beløpet mottatt i god tro'}
                                        {aktsomhet && 'Aktsomhet'}
                                    </Heading>
                                    <LabelVerdiVisning
                                        label={
                                            aktsomhet
                                                ? 'Aktsomhetsvurdering'
                                                : godTro
                                                  ? 'God tro vurdering'
                                                  : 'Vurdering'
                                        }
                                        verdi={begrunnelseAktsomhetGodTro}
                                    />

                                    {godTro && (
                                        <>
                                            <LabelVerdiVisning
                                                label="Er beløpet i behold"
                                                verdi={godTro.beløpErIBehold ? 'Ja' : 'Nei'}
                                            />
                                            <LabelVerdiVisning
                                                label="Tilbakekrevd beløp"
                                                verdi={
                                                    godTro.beløpErIBehold
                                                        ? formatCurrencyNoKr(
                                                              godTro.beløpTilbakekreves
                                                          )
                                                        : 'Ingen tilbakekreving'
                                                }
                                            />
                                        </>
                                    )}
                                    {aktsomhet && (
                                        <>
                                            <LabelVerdiVisning
                                                label="Aktsomhetsvalg"
                                                verdi={
                                                    aktsomhet.aktsomhet
                                                        ? erForstodBurdeForstått
                                                            ? forstodBurdeForståttAktsomheter[
                                                                  aktsomhet.aktsomhet
                                                              ]
                                                            : aktsomheter[aktsomhet.aktsomhet]
                                                        : ''
                                                }
                                            />

                                            {særligeGrunner && særligeGrunner?.length > 0 && (
                                                <List
                                                    title="Særlige grunner"
                                                    description={
                                                        aktsomhet.særligeGrunnerBegrunnelse
                                                    }
                                                >
                                                    {særligeGrunner?.map(grunn => {
                                                        return (
                                                            <List.Item key={grunn.særligGrunn}>
                                                                {særligegrunner[grunn.særligGrunn]}{' '}
                                                                {grunn.begrunnelse
                                                                    ? `- (${grunn.begrunnelse})`
                                                                    : ''}
                                                            </List.Item>
                                                        );
                                                    })}
                                                </List>
                                            )}

                                            <LabelVerdiVisning
                                                label="Reduksjon"
                                                verdi={
                                                    aktsomhet.særligeGrunnerTilReduksjon
                                                        ? 'Særlig grunn til reduksjon'
                                                        : aktsomhet.særligeGrunnerTilReduksjon ===
                                                            false
                                                          ? 'Ikke særlig grunn til reduksjon'
                                                          : ''
                                                }
                                            />

                                            {aktsomhet.andelTilbakekreves && (
                                                <LabelVerdiVisning
                                                    label="Andel tilbakekreves"
                                                    verdi={`${aktsomhet.andelTilbakekreves}%`}
                                                />
                                            )}
                                            {aktsomhet.beløpTilbakekreves && (
                                                <LabelVerdiVisning
                                                    label="Beløp tilbakekreves"
                                                    verdi={formatCurrencyNoKr(
                                                        aktsomhet.beløpTilbakekreves
                                                    )}
                                                />
                                            )}
                                            {aktsomhet.tilbakekrevSmåbeløp === false && (
                                                <BodyShort>
                                                    Ikke tilbakekrev beløp (under 4 rettsgebyr)
                                                </BodyShort>
                                            )}
                                            {aktsomhet.ileggRenter === true && (
                                                <BodyShort>Skal ilegges renter</BodyShort>
                                            )}
                                        </>
                                    )}
                                </VStack>
                            )}
                        </HGrid>
                    </Box>
                );
            })}
        </VStack>
    );
};

const LabelVerdiVisning: React.FC<{ label: string; verdi: string | number | undefined }> = ({
    label,
    verdi,
}) => {
    return (
        <BodyShort>
            <b>{label}: </b>
            {verdi}
        </BodyShort>
    );
};

export default HistoriskVilkårsvurderingVisning;
