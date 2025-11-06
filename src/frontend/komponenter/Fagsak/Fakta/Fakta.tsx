import type { Datoperiode, FaktaFeilutbetalingDto } from '../../../generated';
import type { Tilbakekrevingsvalg } from '../../../typer/tilbakekrevingstyper';

import { BodyShort, Heading, Select, Switch, Tag } from '@navikt/ds-react';
import * as React from 'react';
import { useState } from 'react';

import {
    HarBrukerUttaltSegEnum,
    HendelsestypeEnum,
    HendelsesundertypeEnum,
    TilbakekrevingsvalgEnum,
} from '../../../generated';
import { tilbakekrevingsvalg } from '../../../typer/tilbakekrevingstyper';
import { formatterDatostring } from '../../../utils';

export const Fakta: React.FC = () => {
    const bestemmelser: HendelsestypeEnum[] = [HendelsestypeEnum.ANNET];
    const alleGrunnlag: HendelsesundertypeEnum[] = [HendelsesundertypeEnum.ANNET_FRITEKST];
    const [håndterSamlet, setHåndterSamlet] = useState(false);
    const tidligereVarsletBeløp = 13800;
    const erNyModell = false;
    const fakta: FaktaFeilutbetalingDto = {
        begrunnelse: '',
        feilutbetaltePerioder: [
            {
                periode: {
                    fom: '1969-04-20',
                    tom: '1969-04-30',
                } as Datoperiode,
                feilutbetaltBeløp: 6900,
            },
            {
                periode: {
                    fom: '1969-05-01',
                    tom: '1969-05-31',
                } as Datoperiode,
                feilutbetaltBeløp: 6900,
            },
        ],
        gjelderDødsfall: false,
        kravgrunnlagReferanse: '',
        revurderingsvedtaksdato: '2025-01-31',
        totalFeilutbetaltPeriode: {
            fom: '1969-04-20',
            tom: '1969-05-31',
        } as Datoperiode,
        totaltFeilutbetaltBeløp: 13800,
        vurderingAvBrukersUttalelse: {
            harBrukerUttaltSeg: HarBrukerUttaltSegEnum.NEI,
            beskrivelse: undefined,
        },
        faktainfo: {
            konsekvensForYtelser: ['Feilutbetaling', 'Revurdering av ytelsen'],
            revurderingsresultat: 'Innvilget',
            revurderingsårsak: 'Nye opplysninger',
            tilbakekrevingsvalg: TilbakekrevingsvalgEnum.OPPRETT_TILBAKEKREVING_MED_VARSEL,
        },
    };
    const tilbakekrevingsvalgText =
        tilbakekrevingsvalg[fakta.faktainfo.tilbakekrevingsvalg as unknown as Tilbakekrevingsvalg];
    return (
        <div className="flex flex-col gap-8" aria-label="Fakta om feilutbetaling">
            <Heading level="1" size="medium">
                Fakta om feilutbetalingen
            </Heading>
            <section
                className="flex md:flex-row flex-col flex-col-3 w-full gap-6"
                aria-label="Feilutbetaling og revurdering"
            >
                <div className="flex flex-col flex-1 gap-4 p-4 bg-ax-bg-brand-blue-soft border rounded-xl border-ax-border-neutral-subtle">
                    <Heading level="2" size="small">
                        Feilutbetaling
                    </Heading>
                    <dl className="flex flex-col gap-4">
                        <div>
                            <dt className="font-ax-bold text-ax-medium">Periode</dt>
                            <dd>
                                {formatterDatostring(fakta.totalFeilutbetaltPeriode.fom)}–
                                {formatterDatostring(fakta.totalFeilutbetaltPeriode.tom)}
                            </dd>
                        </div>
                        <div>
                            <dt className="font-ax-bold text-ax-medium">Feilutbetalt beløp</dt>
                            <dd className="text-ax-text-danger-subtle">
                                {fakta.totaltFeilutbetaltBeløp}
                            </dd>
                        </div>
                        {tidligereVarsletBeløp && (
                            <div>
                                <dt className="font-ax-bold text-ax-medium">
                                    Tidligere varslet beløp
                                </dt>
                                <dd>{tidligereVarsletBeløp}</dd>
                            </div>
                        )}
                    </dl>
                </div>
                <div className="flex flex-col flex-2 gap-4 p-4 border rounded-xl border-ax-border-neutral-subtle">
                    <Heading level="2" size="small">
                        Revurdering
                    </Heading>
                    <dl className="grid grid-cols-2 gap-4">
                        <div>
                            <dt className="font-ax-bold text-ax-medium">Årsak til revurdering</dt>
                            <dd>
                                <Tag
                                    key={fakta.faktainfo.revurderingsårsak}
                                    variant="neutral-moderate"
                                    size="small"
                                >
                                    {fakta.faktainfo.revurderingsårsak}
                                </Tag>
                            </dd>
                        </div>
                        <div>
                            <dt className="font-ax-bold text-ax-medium">
                                Dato for revurderingsvedtak
                            </dt>
                            <dd>{formatterDatostring(fakta.revurderingsvedtaksdato)}</dd>
                        </div>
                        <div>
                            <dt className="font-ax-bold text-ax-medium">Resultat</dt>
                            <dd>{fakta.faktainfo.revurderingsresultat}</dd>
                        </div>
                        {!erNyModell && (
                            <div>
                                <dt className="font-ax-bold text-ax-medium">Konsekvens</dt>
                                <dd className="inline-flex gap-1">
                                    {fakta.faktainfo.konsekvensForYtelser.map(konsekvens => (
                                        <Tag
                                            key={konsekvens}
                                            variant="neutral-moderate"
                                            size="small"
                                        >
                                            {konsekvens}
                                        </Tag>
                                    ))}
                                </dd>
                            </div>
                        )}
                        <div className="col-span-2">
                            <dt className="font-ax-bold text-ax-medium">Tilbakekrevingsvalg</dt>
                            <dd>
                                <Tag
                                    key={tilbakekrevingsvalgText}
                                    variant="neutral-moderate"
                                    size="small"
                                >
                                    {tilbakekrevingsvalgText}
                                </Tag>
                            </dd>
                        </div>
                    </dl>
                </div>
            </section>
            <section className="flex flex-col gap-6" aria-label="Rettslig grunnlag innhold">
                <Heading level="2" size="small">
                    Rettslig grunnlag
                </Heading>
                {!erNyModell && (
                    <div className="p-4 border rounded-xl border-ax-border-neutral-subtle">
                        <div className="flex justify-between items-center">
                            <BodyShort aria-hidden size="small">
                                Bruk samme bestemmelse og grunnlag for alle periodene
                            </BodyShort>
                            <Switch
                                size="small"
                                hideLabel
                                onChange={e => setHåndterSamlet(e.target.checked)}
                            >
                                Bruk samme bestemmelse og grunnlag for alle periodene
                            </Switch>
                        </div>
                        {håndterSamlet && (
                            <div className="flex flex-row flex-2 gap-4">
                                <Select
                                    label="Velg bestemmelse"
                                    size="small"
                                    value="default"
                                    className="flex-1"
                                >
                                    <option value="default" disabled>
                                        Velg bestemmelse
                                    </option>
                                    {bestemmelser.map(bestemmelse => (
                                        <option key={bestemmelse} value={bestemmelse}>
                                            {bestemmelse}
                                        </option>
                                    ))}
                                </Select>
                                <Select
                                    label="Velg grunnlag"
                                    size="small"
                                    value="default"
                                    className="flex-1"
                                >
                                    <option value="default" disabled>
                                        Velg grunnlag
                                    </option>
                                    {alleGrunnlag.map(grunnlag => (
                                        <option key={grunnlag} value={grunnlag}>
                                            {grunnlag}
                                        </option>
                                    ))}
                                </Select>
                            </div>
                        )}
                    </div>
                )}
                <div className="border rounded-xl border-ax-border-neutral-subtle">hei</div>
            </section>
        </div>
    );
};
