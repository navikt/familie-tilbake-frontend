import type { FC } from 'react';

import { BagdeIcon, Buildings3Icon, CalendarIcon, CandleIcon } from '@navikt/aksel-icons';
import { CopyButton, ExpansionCard, Skeleton } from '@navikt/ds-react';
import classNames from 'classnames';

import { ICON_PROPS } from './utils';

export const SidebarSkeleton: FC = () => {
    return (
        <aside
            aria-label="Laster informasjon om tilbakekrevingen og bruker"
            className={classNames(
                'flex-col gap-4 bg-ax-neutral-100 hidden ax-lg:flex max-h-[calc(100vh-80px)]'
            )}
        >
            <ExpansionCard
                defaultOpen
                size="small"
                aria-label="Laster informasjon om tilbakekrevingen"
                className="border rounded-xl border-ax-border-neutral-subtle flex flex-col gap-4 bg-ax-bg-default"
            >
                <ExpansionCard.Header>
                    <ExpansionCard.Title
                        as="h2"
                        size="small"
                        className="text-lg flex flex-row gap-2"
                    >
                        <span>Tilbakekreving av</span>
                        <Skeleton
                            variant="rounded"
                            width={104}
                            height={24}
                            className="flex items-center"
                        />
                    </ExpansionCard.Title>
                </ExpansionCard.Header>

                <ExpansionCard.Content>
                    <dl className="grid grid-cols-[136px_1fr] ax-xl:grid-cols-[152px_1fr] gap-y-2 gap-x-4">
                        <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                            <Skeleton
                                variant="circle"
                                width={16}
                                height={16}
                                className="flex items-center"
                            />
                            Status
                        </dt>
                        <dd className="text-ax-medium items-center flex">
                            <Skeleton
                                variant="rounded"
                                width={154}
                                height={24}
                                className="flex items-center"
                            />
                        </dd>

                        <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                            <CalendarIcon {...ICON_PROPS} />
                            Opprettet
                        </dt>
                        <dd className="text-ax-medium items-center flex">
                            <Skeleton
                                variant="rounded"
                                width={154}
                                height={24}
                                className="flex items-center"
                            />
                        </dd>

                        <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                            <Buildings3Icon {...ICON_PROPS} />
                            Enhet
                        </dt>
                        <dd className="text-ax-medium items-center flex">
                            <Skeleton
                                variant="rounded"
                                width={154}
                                height={24}
                                className="flex items-center"
                            />
                        </dd>
                    </dl>
                </ExpansionCard.Content>
            </ExpansionCard>

            <ExpansionCard
                defaultOpen
                size="small"
                aria-label="Laster informasjon om bruker"
                className="border rounded-xl border-ax-border-neutral-subtle flex flex-col gap-4 bg-ax-bg-default"
            >
                <ExpansionCard.Header>
                    <ExpansionCard.Title as="h2" size="small" className="text-lg">
                        Informasjon om bruker
                    </ExpansionCard.Title>
                </ExpansionCard.Header>

                <ExpansionCard.Content>
                    <dl className="grid grid-cols-[136px_1fr] ax-xl:grid-cols-[152px_1fr] gap-y-2 gap-x-4">
                        <dt className="text-ax-medium font-ax-bold flex flex-row gap-3 items-center">
                            <Skeleton
                                variant="circle"
                                width={16}
                                height={16}
                                className="flex items-center"
                            />
                            Navn
                        </dt>
                        <dd className="text-ax-medium">
                            <Skeleton
                                variant="rounded"
                                width={154}
                                height={24}
                                className="flex items-center"
                            />
                        </dd>

                        <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                            <CandleIcon {...ICON_PROPS} />
                            Alder
                        </dt>
                        <dd className="text-ax-medium flex flex-row gap-2 items-center">
                            <Skeleton
                                variant="rounded"
                                width={30}
                                height={24}
                                className="flex items-center"
                            />
                            år
                        </dd>

                        <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                            <BagdeIcon {...ICON_PROPS} />
                            <Skeleton
                                variant="rounded"
                                width={100}
                                height={24}
                                className="flex items-center"
                            />
                        </dt>
                        <dd className="text-ax-medium flex flex-row gap-2 items-center">
                            <Skeleton
                                variant="rounded"
                                width={100}
                                height={24}
                                className="flex items-center"
                            />
                            <CopyButton copyText="" className="p-0" />
                        </dd>
                    </dl>
                </ExpansionCard.Content>
            </ExpansionCard>
            <div className="border border-ax-border-neutral-subtle rounded-2xl bg-ax-bg-default h-full flex flex-col min-h-0 p-4 gap-4"></div>
        </aside>
    );
};
