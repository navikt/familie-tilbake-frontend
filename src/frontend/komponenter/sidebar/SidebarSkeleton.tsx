import { BagdeIcon, Buildings3Icon, CalendarIcon, CandleIcon } from '@navikt/aksel-icons';
import { Box, CopyButton, Heading, Skeleton } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

import { ICON_PROPS } from './utils';

export const SidebarSkeleton: React.FC = () => {
    return (
        <aside
            aria-label="Laster informasjon om tilbakekrevingen og bruker"
            className={classNames(
                'flex-col gap-4 bg-ax-neutral-100 hidden ax-lg:flex max-h-[calc(100vh-80px)]'
            )}
        >
            <div className="gap-4 flex flex-col flex-1 min-h-0">
                <Box
                    padding="space-16"
                    className="border rounded-xl border-ax-border-neutral-subtle flex flex-col gap-4 bg-ax-bg-default"
                >
                    <Heading size="xsmall" level="2" className="flex flex-row gap-2">
                        Tilbakekreving av
                        <Skeleton
                            variant="rectangle"
                            width={154}
                            height={24}
                            className="flex items-center"
                        />
                    </Heading>

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
                                variant="rectangle"
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
                                variant="rectangle"
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
                                variant="rectangle"
                                width={154}
                                height={24}
                                className="flex items-center"
                            />
                        </dd>
                    </dl>
                </Box>
                <Box
                    padding="space-16"
                    className="border rounded-xl border-ax-border-neutral-subtle flex flex-col gap-4 bg-ax-bg-default"
                >
                    <Heading size="xsmall" level="2">
                        Bruker
                    </Heading>

                    <dl className="grid grid-cols-[136px_1fr] ax-xl:grid-cols-[152px_1fr] gap-y-2 gap-x-4">
                        <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
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
                                variant="rectangle"
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
                                variant="rectangle"
                                width={100}
                                height={24}
                                className="flex items-center"
                            />
                            år
                        </dd>

                        <dt className="text-ax-medium font-ax-bold flex flex-row gap-2 items-center">
                            <BagdeIcon {...ICON_PROPS} />
                            <Skeleton
                                variant="rectangle"
                                width={100}
                                height={24}
                                className="flex items-center"
                            />
                        </dt>
                        <dd className="text-ax-medium flex flex-row gap-2 items-center">
                            <Skeleton
                                variant="rectangle"
                                width={100}
                                height={24}
                                className="flex items-center"
                            />
                            <CopyButton copyText="" className="p-0" />
                        </dd>
                    </dl>
                </Box>
            </div>
        </aside>
    );
};
