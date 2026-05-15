import type { TagProps } from '@navikt/ds-react';
import type { ComponentType, FC } from 'react';
import type { BehandlingsresultatstypeEnum, BehandlingstatusEnum } from '~/generated';

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

import { useBehandling } from '~/context/BehandlingContext';
import { useFagsak } from '~/context/FagsakContext';
import { behandlingsresultater, behandlingsstatuser, behandlingsårsaker } from '~/typer/behandling';
import { formatterDatostring } from '~/utils';

import { ICON_PROPS } from '../utils';

type Props = {
    open?: boolean;
    onToggle?: (open: boolean) => void;
};

export const Faktaboks: FC<Props> = ({ open, onToggle }) => {
    const behandling = useBehandling();
    const { ytelsestype } = useFagsak();

    const erKontrollert = open !== undefined;

    return (
        <ExpansionCard
            size="small"
            {...(erKontrollert ? { open, onToggle } : { defaultOpen: true })}
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
                                    {behandlingsårsaker[behandling.behandlingsårsakstype]}
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
        icon: FilePlusIcon,
    },
    UTREDES: {
        dataColor: 'info',
        icon: FileLoadingIcon,
    },
    FATTER_VEDTAK: {
        dataColor: 'brand-beige',
        icon: TasklistIcon,
    },
    IVERKSETTER_VEDTAK: {
        dataColor: 'meta-lime',
        icon: TasklistSendIcon,
    },
    JOURNALFØR_VEDTAK: {
        dataColor: 'neutral',
        icon: FilePlusIcon,
    },
    DISTRIUBER_VEDTAK: {
        dataColor: 'neutral',
        icon: FilePlusIcon,
    },
    AVSLUTTET: {
        dataColor: 'success',
        icon: FileCheckmarkIcon,
    },
} satisfies Record<
    BehandlingstatusEnum,
    {
        dataColor: TagProps['data-color'];
        icon: ComponentType;
    }
>;

const StatusTag: FC<{ status: BehandlingstatusEnum }> = ({ status }) => {
    const { dataColor, icon: StatusIkon } = STATUS_META[status];
    return (
        <>
            <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                <StatusIkon {...ICON_PROPS} />
                Status
            </dt>
            <dd className="text-ax-medium items-center flex">
                <Tag size="small" data-color={dataColor} variant="moderate">
                    {behandlingsstatuser[status]}
                </Tag>
            </dd>
        </>
    );
};

export const RESULTAT_META: Record<BehandlingsresultatstypeEnum, TagProps['data-color']> = {
    HENLAGT: 'danger',
    HENLAGT_FEILOPPRETTET: 'danger',
    HENLAGT_FEILOPPRETTET_MED_BREV: 'danger',
    HENLAGT_FEILOPPRETTET_UTEN_BREV: 'danger',
    HENLAGT_KRAVGRUNNLAG_NULLSTILT: 'danger',
    HENLAGT_TEKNISK_VEDLIKEHOLD: 'danger',
    HENLAGT_MANGLENDE_KRAVGRUNNLAG: 'danger',
    IKKE_FASTSATT: 'danger',
    INGEN_TILBAKEBETALING: 'brand-magenta',
    DELVIS_TILBAKEBETALING: 'meta-purple',
    FULL_TILBAKEBETALING: 'info',
};

const ResultatTag: FC<{ resultat: BehandlingsresultatstypeEnum }> = ({ resultat }) => {
    const dataColor = RESULTAT_META[resultat];
    return (
        <>
            <dt className="shrink-0text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                <ClipboardIcon {...ICON_PROPS} />
                Resultat
            </dt>
            <dd className="text-ax-medium items-center flex">
                <Tag size="small" data-color={dataColor} variant="moderate">
                    {behandlingsresultater[resultat]}
                </Tag>
            </dd>
        </>
    );
};
