import type { VilkårsvurderingPeriodeSkjemaData } from '../typer/vilkårsvurdering';

import { BodyShort, Box, Heading, HGrid, List, VStack } from '@navikt/ds-react';
import * as React from 'react';

import {
    aktsomheter,
    forstodBurdeForståttAktsomheter,
    særligegrunner,
    Vilkårsresultat,
} from '../../../../kodeverk';
import { formatCurrencyNoKr, formatterDatostring } from '../../../../utils';
import { TilbakekrevingAktivitetTabell } from '../VilkårsvurderingPeriode/TilbakekrevingAktivitetTabell';

const vilkårsresultaterTekster: Record<Vilkårsresultat, string> = {
    [Vilkårsresultat.ForstoBurdeForstått]:
        'Mottaker forsto eller burde forstått at utbetalingen skyldtes en feil',
    [Vilkårsresultat.FeilOpplysningerFraBruker]:
        'Mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt feilaktige opplysninger',
    [Vilkårsresultat.MangelfulleOpplysningerFraBruker]:
        'Mottaker har forårsaket feilutbetalingen ved forsett eller uaktsomt gitt mangelfulle opplysninger',
    [Vilkårsresultat.GodTro]: 'Mottaker har mottatt beløpet i aktsom god tro',
    [Vilkårsresultat.Udefinert]: 'Udefinert',
};

type Props = {
    perioder: VilkårsvurderingPeriodeSkjemaData[];
};

export const HistoriskVilkårsvurderingVisning: React.FC<Props> = ({ perioder }) => {
    return (
        <VStack gap="space-40">
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
                        padding="space-16"
                        borderWidth="1"
                        className="rounded-sm"
                    >
                        <HGrid columns={{ lg: 2, md: 1 }} gap="space-32">
                            <VStack gap="space-16">
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
                                                ? vilkårsresultaterTekster[
                                                      skjema.vilkårsvurderingsresultatInfo
                                                          ?.vilkårsvurderingsresultat
                                                  ]
                                                : 'Mangler vurdering'
                                        }
                                    />
                                </VStack>
                            </VStack>
                            {(godTro || aktsomhet) && (
                                <VStack gap="space-4">
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
                                                <div>
                                                    <Heading as="h3" size="small">
                                                        Særlige grunner
                                                    </Heading>
                                                    <BodyShort>
                                                        {aktsomhet.særligeGrunnerBegrunnelse}
                                                    </BodyShort>
                                                    <Box marginBlock="space-16" asChild>
                                                        <List data-aksel-migrated-v8>
                                                            {særligeGrunner?.map(grunn => {
                                                                return (
                                                                    <List.Item
                                                                        key={grunn.særligGrunn}
                                                                    >
                                                                        {
                                                                            særligegrunner[
                                                                                grunn.særligGrunn
                                                                            ]
                                                                        }{' '}
                                                                        {grunn.begrunnelse
                                                                            ? `- (${grunn.begrunnelse})`
                                                                            : ''}
                                                                    </List.Item>
                                                                );
                                                            })}
                                                        </List>
                                                    </Box>
                                                </div>
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

const LabelVerdiVisning: React.FC<{ label: string; verdi: number | string | undefined }> = ({
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
