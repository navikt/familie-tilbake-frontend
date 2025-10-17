import type { Behandling } from '../../../../typer/behandling';
import type { Fagsak } from '../../../../typer/fagsak';
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
import { Box, Heading, Tag } from '@navikt/ds-react';
import React from 'react';

import { ytelsetype } from '../../../../kodeverk';
import {
    behandlingsresultater,
    behandlingsstatuser,
    behandlingårsaker,
    Behandlingstatus,
    Behandlingresultat,
} from '../../../../typer/behandling';
import { formatterDatostring } from '../../../../utils';
import { ICON_PROPS } from '../utils';

type Props = {
    behandling: Behandling;
    ytelsestype: Fagsak['ytelsestype'];
};

export const Faktaboks: React.FC<Props> = ({ behandling, ytelsestype }) => {
    return (
        <Box
            padding="4"
            className="border-1 rounded-xl border-border-divider flex flex-col gap-4 bg-white"
        >
            <Heading size="xsmall" level="2">
                Tilbakekreving av {ytelsetype[ytelsestype]}
            </Heading>

            <dl className="grid grid-cols-[136px_1fr] xl:grid-cols-[152px_1fr] gap-y-2 gap-x-4">
                {behandling.behandlingsårsakstype && (
                    <>
                        <dt className="text-medium font-bold flex flex-row gap-2 items-center">
                            <FileResetIcon {...ICON_PROPS} />
                            Revurderingsårsak
                        </dt>
                        <dd className="text-medium items-center flex">
                            <Tag size="small" variant="neutral-moderate">
                                {behandlingårsaker[behandling.behandlingsårsakstype]}
                            </Tag>
                        </dd>
                    </>
                )}

                <StatusTag status={behandling.status} />

                {behandling.resultatstype && <ResultatTag resultat={behandling.resultatstype} />}

                <dt className="text-medium font-bold flex flex-row gap-2 items-center">
                    <CalendarIcon {...ICON_PROPS} />
                    Opprettet
                </dt>
                <dd className="text-medium items-center flex">
                    {formatterDatostring(behandling.opprettetDato)}
                </dd>

                {behandling.avsluttetDato && (
                    <>
                        <dt className="text-medium font-bold flex flex-row gap-2 items-center">
                            <CalendarFillIcon {...ICON_PROPS} />
                            Avsluttet
                        </dt>
                        <dd className="text-medium items-center flex">
                            {formatterDatostring(behandling.avsluttetDato)}
                        </dd>
                    </>
                )}

                <dt className="text-medium font-bold flex flex-row gap-2 items-center">
                    <Buildings3Icon {...ICON_PROPS} />
                    Enhet
                </dt>
                <dd className="text-medium items-center flex">
                    {behandling.enhetskode} {behandling.enhetsnavn}
                </dd>
            </dl>
        </Box>
    );
};

const STATUS_META = {
    [Behandlingstatus.Opprettet]: {
        variant: 'neutral-moderate',
        icon: FilePlusIcon,
    },
    [Behandlingstatus.Utredes]: {
        variant: 'info-moderate',
        icon: FileLoadingIcon,
    },
    [Behandlingstatus.FatterVedtak]: {
        variant: 'alt2-moderate',
        icon: TasklistIcon,
    },
    [Behandlingstatus.IverksetterVedtak]: {
        variant: 'info-moderate',
        icon: TasklistSendIcon,
    },
    [Behandlingstatus.Avsluttet]: {
        variant: 'success-moderate',
        icon: FileCheckmarkIcon,
    },
} satisfies Record<
    Behandlingstatus,
    {
        variant: TagProps['variant'];
        icon: React.ComponentType;
    }
>;

const StatusTag: React.FC<{ status: Behandlingstatus }> = ({ status }) => {
    const { variant, icon: StatusIkon } = STATUS_META[status];
    return (
        <>
            <dt className="text-medium font-bold flex flex-row gap-2 items-center">
                <StatusIkon {...ICON_PROPS} />
                Status
            </dt>
            <dd className="text-medium items-center flex">
                <Tag size="small" variant={variant}>
                    {behandlingsstatuser[status]}
                </Tag>
            </dd>
        </>
    );
};

const RESULTAT_META = {
    [Behandlingresultat.Henlagt]: { variant: 'error-moderate' },
    [Behandlingresultat.HenlagtFeilopprettet]: { variant: 'error-moderate' },
    [Behandlingresultat.HenlagtFeilopprettetMedBrev]: { variant: 'error-moderate' },
    [Behandlingresultat.HenlagtFeilopprettetUtenBrev]: { variant: 'error-moderate' },
    [Behandlingresultat.IkkeFastsatt]: { variant: 'error-moderate' },
    [Behandlingresultat.IngenTilbakebetaling]: { variant: 'warning-moderate' },
    [Behandlingresultat.DelvisTilbakebetaling]: { variant: 'warning-moderate' },
    [Behandlingresultat.FullTilbakebetaling]: { variant: 'info-moderate' },
} satisfies Record<Behandlingresultat, { variant: TagProps['variant'] }>;

const ResultatTag: React.FC<{ resultat: Behandlingresultat }> = ({ resultat }) => {
    return (
        <>
            <dt className="shrink-0 text-medium font-bold flex flex-row gap-2 items-center">
                <ClipboardIcon {...ICON_PROPS} />
                Resultat
            </dt>
            <dd className="text-medium items-center flex">
                <Tag size="small" variant={RESULTAT_META[resultat].variant}>
                    {behandlingsresultater[resultat]}
                </Tag>
            </dd>
        </>
    );
};
