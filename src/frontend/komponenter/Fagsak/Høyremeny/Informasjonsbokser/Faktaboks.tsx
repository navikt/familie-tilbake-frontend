import type { BehandlingsresultatstypeEnum, BehandlingstatusEnum } from '../../../../generated';
import type { TagProps } from '@navikt/ds-react';

import {
    Buildings3Icon,
    CalendarFillIcon,
    CalendarIcon,
    ClipboardIcon,
    FileCheckmarkIcon,
    FileLoadingIcon,
    FilePlusIcon,
    FileResetIcon,
    TasklistIcon,
    TasklistSendIcon,
} from '@navikt/aksel-icons';
import { ExpansionCard, Tag } from '@navikt/ds-react';
import React from 'react';

import { useBehandling } from '../../../../context/BehandlingContext';
import { useFagsak } from '../../../../context/FagsakContext';
import {
    behandlingsresultater,
    behandlingsstatuser,
    behandlingårsaker,
} from '../../../../typer/behandling';
import { formatterDatostring } from '../../../../utils';
import { ICON_PROPS } from '../utils';

export const Faktaboks: React.FC = () => {
    const behandling = useBehandling();
    const { ytelsestype } = useFagsak();

    return (
        <ExpansionCard
            size="small"
            defaultOpen
            aria-label="Tilbakekrevingsinformasjon"
            className="border-ax-border-neutral-subtle"
        >
            <ExpansionCard.Header>
                <ExpansionCard.Title as="h2" size="small" className="text-lg">
                    {`Tilbakekreving av ${ytelsestype.toLocaleLowerCase()}`}
                </ExpansionCard.Title>
            </ExpansionCard.Header>
            <ExpansionCard.Content>
                <dl className="grid grid-cols-[136px_1fr] ax-xl:grid-cols-[152px_1fr] gap-y-2 gap-x-4 text-ax-text-neutral">
                    {behandling.behandlingsårsakstype && (
                        <>
                            <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                                <FileResetIcon {...ICON_PROPS} />
                                Revurderingsårsak
                            </dt>
                            <dd className="text-ax-medium items-center flex">
                                <Tag data-color="neutral" size="small" variant="moderate">
                                    {behandlingårsaker[behandling.behandlingsårsakstype]}
                                </Tag>
                            </dd>
                        </>
                    )}

                    <StatusTag status={behandling.status} />

                    {behandling.resultatstype && (
                        <ResultatTag resultat={behandling.resultatstype} />
                    )}

                    <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                        <CalendarIcon {...ICON_PROPS} />
                        Opprettet
                    </dt>
                    <dd className="text-ax-medium items-center flex">
                        {formatterDatostring(behandling.opprettetDato)}
                    </dd>

                    {behandling.avsluttetDato && (
                        <>
                            <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                                <CalendarFillIcon {...ICON_PROPS} />
                                Avsluttet
                            </dt>
                            <dd className="text-ax-medium items-center flex">
                                {formatterDatostring(behandling.avsluttetDato)}
                            </dd>
                        </>
                    )}

                    <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                        <Buildings3Icon {...ICON_PROPS} />
                        Enhet
                    </dt>
                    <dd className="text-ax-medium items-center flex">
                        {behandling.enhetskode} {behandling.enhetsnavn}
                    </dd>
                </dl>
            </ExpansionCard.Content>
        </ExpansionCard>
    );
};

const STATUS_META = {
    OPPRETTET: {
        dataColor: 'neutral',
        variant: 'moderate',
        icon: FilePlusIcon,
    },
    UTREDES: {
        dataColor: 'info',
        variant: 'moderate',
        icon: FileLoadingIcon,
    },
    FATTER_VEDTAK: {
        dataColor: 'meta-lime',
        variant: 'moderate',
        icon: TasklistIcon,
    },
    IVERKSETTER_VEDTAK: {
        dataColor: 'info',
        variant: 'moderate',
        icon: TasklistSendIcon,
    },
    AVSLUTTET: {
        dataColor: 'success',
        variant: 'moderate',
        icon: FileCheckmarkIcon,
    },
} satisfies Record<
    BehandlingstatusEnum,
    {
        dataColor: TagProps['data-color'];
        variant: TagProps['variant'];
        icon: React.ComponentType;
    }
>;

const StatusTag: React.FC<{ status: BehandlingstatusEnum }> = ({ status }) => {
    const { dataColor, variant, icon: StatusIkon } = STATUS_META[status];
    return (
        <>
            <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                <StatusIkon {...ICON_PROPS} />
                Status
            </dt>
            <dd className="text-ax-medium items-center flex">
                <Tag size="small" data-color={dataColor} variant={variant}>
                    {behandlingsstatuser[status]}
                </Tag>
            </dd>
        </>
    );
};

const RESULTAT_META: Record<
    BehandlingsresultatstypeEnum,
    { dataColor: TagProps['data-color']; variant: TagProps['variant'] }
> = {
    HENLAGT: { dataColor: 'danger', variant: 'moderate' },
    HENLAGT_FEILOPPRETTET: { dataColor: 'danger', variant: 'moderate' },
    HENLAGT_FEILOPPRETTET_MED_BREV: { dataColor: 'danger', variant: 'moderate' },
    HENLAGT_FEILOPPRETTET_UTEN_BREV: { dataColor: 'danger', variant: 'moderate' },
    HENLAGT_KRAVGRUNNLAG_NULLSTILT: { dataColor: 'danger', variant: 'moderate' },
    HENLAGT_TEKNISK_VEDLIKEHOLD: { dataColor: 'danger', variant: 'moderate' },
    HENLAGT_MANGLENDE_KRAVGRUNNLAG: { dataColor: 'danger', variant: 'moderate' },
    IKKE_FASTSATT: { dataColor: 'danger', variant: 'moderate' },
    INGEN_TILBAKEBETALING: { dataColor: 'warning', variant: 'moderate' },
    DELVIS_TILBAKEBETALING: { dataColor: 'warning', variant: 'moderate' },
    FULL_TILBAKEBETALING: { dataColor: 'info', variant: 'moderate' },
};

const ResultatTag: React.FC<{ resultat: BehandlingsresultatstypeEnum }> = ({ resultat }) => {
    const { dataColor, variant } = RESULTAT_META[resultat];
    return (
        <>
            <dt className="shrink-0text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                <ClipboardIcon {...ICON_PROPS} />
                Resultat
            </dt>
            <dd className="text-ax-medium items-center flex">
                <Tag size="small" data-color={dataColor} variant={variant}>
                    {behandlingsresultater[resultat]}
                </Tag>
            </dd>
        </>
    );
};
