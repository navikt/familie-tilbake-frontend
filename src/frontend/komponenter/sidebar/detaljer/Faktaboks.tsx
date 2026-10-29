import type { AkselColor } from '@navikt/ds-react/types/theme';
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
            <Heading level="2" size="xsmall" className="hyphens-auto wrap-break-word">
                {`Tilbakekreving av ${ytelsestype.toLocaleLowerCase()}`}
            </Heading>
            <dl className="flex flex-col gap-y-4 text-ax-medium">
                <div className="grid grid-cols-2">
                    <StatusTag status={behandling.status} />
                    {behandling.resultatstype && (
                        <ResultatTag resultat={behandling.resultatstype} />
                    )}
                </div>
                <div className="grid grid-cols-2">
                    <div className="flex flex-col gap-y-1">
                        <dt className="text-ax-text-neutral-subtle">Opprettet</dt>
                        <dd>{formatterDatostring(behandling.opprettetDato)}</dd>
                    </div>

                    {behandling.avsluttetDato && (
                        <div className="flex flex-col gap-y-1">
                            <dt className="text-ax-text-neutral-subtle">Avsluttet</dt>
                            <dd>{formatterDatostring(behandling.avsluttetDato)}</dd>
                        </div>
                    )}
                </div>
                <div className="flex flex-col gap-y-1">
                    <dt className="text-ax-text-neutral-subtle">Enhet</dt>
                    <dd className="min-w-0 hyphens-auto wrap-break-word">
                        {behandling.enhetskode} {behandling.enhetsnavn}
                    </dd>
                </div>
            </dl>
        </section>
    );
};

const STATUS_COLOR: Record<BehandlingstatusEnum, AkselColor> = {
    OPPRETTET: 'neutral',
    UTREDES: 'info',
    FATTER_VEDTAK: 'brand-beige',
    IVERKSETTER_VEDTAK: 'meta-lime',
    JOURNALFØR_VEDTAK: 'neutral',
    DISTRIUBER_VEDTAK: 'neutral',
    AVSLUTTET: 'success',
} satisfies Record<BehandlingstatusEnum, AkselColor>;

type StatusProps = {
    status: BehandlingstatusEnum;
};

const StatusTag: FC<StatusProps> = ({ status }: StatusProps) => {
    const dataColor = STATUS_COLOR[status];
    return (
        <div className="flex flex-col gap-y-1">
            <dt className="text-ax-text-neutral-subtle">Status</dt>
            <dd>
                <Tag size="small" data-color={dataColor} variant="moderate">
                    {behandlingsstatuser[status]}
                </Tag>
            </dd>
        </div>
    );
};

const RESULTAT_META: Record<BehandlingsresultatstypeEnum, AkselColor> = {
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
            <dt className="text-ax-text-neutral-subtle">Resultat</dt>
            <dd>
                <Tag size="small" data-color={dataColor} variant="moderate">
                    {behandlingsresultater[resultat]}
                </Tag>
            </dd>
        </div>
    );
};
