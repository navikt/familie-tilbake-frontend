import type { TagProps } from '@navikt/ds-react';
import type { FC } from 'react';
import type { BehandlingsresultatstypeEnum, BehandlingstatusEnum } from '@/generated';

import { Heading, Tag } from '@navikt/ds-react';

import { useBehandling } from '@/context/BehandlingContext';
import { useFagsak } from '@/context/FagsakContext';
import { behandlingsresultater, behandlingsstatuser } from '@/typer/behandling';
import { formatterDatostring } from '@/utils';

export const Faktaboks: FC = () => {
    const behandling = useBehandling();
    const { ytelsestype } = useFagsak();

    return (
        <section
            aria-label="Tilbakekrevingsinformasjon"
            className="flex flex-col gap-2 rounded-xl border border-ax-border-brand-blue-subtle p-4"
        >
            <Heading
                level="2"
                size="xsmall"
                className="text-ax-text-neutral-subtle hyphens-auto wrap-break-word"
            >
                {`Tilbakekreving av ${ytelsestype.toLocaleLowerCase()}`}
            </Heading>
            <dl className="flex flex-col gap-y-4 text-ax-text-neutral">
                {/* {behandling.behandlingsårsakstype && (
                    <div>
                        <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                            <FileResetIcon {...ICON_PROPS} />
                            Revurderingsårsak
                        </dt>
                        <dd className="text-ax-medium items-center flex">
                            <Tag data-color="neutral" size="small" variant="moderate">
                                {behandlingsårsaker[behandling.behandlingsårsakstype]}
                            </Tag>
                        </dd>
                    </div>
                )} */}
                <div className="grid grid-cols-2">
                    <StatusTag status={behandling.status} />
                    {behandling.resultatstype && (
                        <ResultatTag resultat={behandling.resultatstype} />
                    )}
                </div>
                <div className="grid grid-cols-2">
                    <div className="flex flex-col gap-y-1">
                        <dt className="text-ax-medium text-ax-text-neutral-subtle">Opprettet</dt>
                        <dd className="text-ax-medium items-center flex">
                            {formatterDatostring(behandling.opprettetDato)}
                        </dd>
                    </div>

                    {behandling.avsluttetDato && (
                        <div className="flex flex-col gap-y-1">
                            <dt className="text-ax-medium text-ax-text-neutral-subtle">
                                Avsluttet
                            </dt>
                            <dd className="text-ax-medium items-center flex">
                                {formatterDatostring(behandling.avsluttetDato)}
                            </dd>
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-y-1">
                    <dt className="text-ax-medium text-ax-text-neutral-subtle flex flex-row gap-2 items-start">
                        Enhet
                    </dt>
                    <dd className="text-ax-medium min-w-0 hyphens-auto wrap-break-word">
                        {behandling.enhetskode} {behandling.enhetsnavn}
                    </dd>
                </div>
            </dl>
        </section>
    );
};

const STATUS_COLOR: Record<BehandlingstatusEnum, TagProps['data-color']> = {
    OPPRETTET: 'neutral',

    UTREDES: 'info',

    FATTER_VEDTAK: 'brand-beige',
    IVERKSETTER_VEDTAK: 'meta-lime',
    JOURNALFØR_VEDTAK: 'neutral',
    DISTRIUBER_VEDTAK: 'neutral',
    AVSLUTTET: 'success',
} satisfies Record<BehandlingstatusEnum, TagProps['data-color']>;

type StatusProps = {
    status: BehandlingstatusEnum;
};

const StatusTag: FC<StatusProps> = ({ status }: StatusProps) => {
    const dataColor = STATUS_COLOR[status];
    return (
        <div className="flex flex-col gap-y-1">
            <dt className="text-ax-medium text-ax-text-neutral-subtle">Status</dt>
            <dd className="text-ax-medium items-center flex">
                <Tag size="small" data-color={dataColor} variant="moderate">
                    {behandlingsstatuser[status]}
                </Tag>
            </dd>
        </div>
    );
};

const RESULTAT_META: Record<BehandlingsresultatstypeEnum, TagProps['data-color']> = {
    HENLAGT: 'danger',
    HENLAGT_FEILOPPRETTET: 'danger',
    HENLAGT_FEILOPPRETTET_MED_BREV: 'danger',
    HENLAGT_FEILOPPRETTET_UTEN_BREV: 'danger',
    HENLAGT_KRAVGRUNNLAG_NULLSTILT: 'danger',
    HENLAGT_TEKNISK_VEDLIKEHOLD: 'danger',
    HENLAGT_MANGLENDE_KRAVGRUNNLAG: 'danger',
    IKKE_FASTSATT: 'danger',
    INGEN_TILBAKEBETALING: 'success',
    DELVIS_TILBAKEBETALING: 'meta-purple',
    FULL_TILBAKEBETALING: 'brand-magenta',
};

type ResultatProps = {
    resultat: BehandlingsresultatstypeEnum;
};

const ResultatTag: FC<ResultatProps> = ({ resultat }: ResultatProps) => {
    const dataColor = RESULTAT_META[resultat];
    return (
        <div className="flex flex-col gap-y-1">
            <dt className="shrink-0 text-ax-medium text-ax-text-neutral-subtle">Resultat</dt>
            <dd className="text-ax-medium items-center flex">
                <Tag size="small" data-color={dataColor} variant="moderate">
                    {behandlingsresultater[resultat]}
                </Tag>
            </dd>
        </div>
    );
};
