import { BagdeIcon, Buildings3Icon, CalendarIcon, CandleIcon } from '@navikt/aksel-icons';
import { Box, CopyButton, Heading, Skeleton } from '@navikt/ds-react';
import classNames from 'classnames';
import React from 'react';

export const HøyremenySkeleton: React.FC = () => {
    return (
        <aside
            aria-label="Laster informasjon om tilbakekrevingen og bruker"
            className={classNames(
                'flex-col gap-4 bg-gray-50 hidden lg:flex max-h-[calc(100vh-80px)]'
            )}
        >
            <div className="gap-4 flex flex-col flex-1 min-h-0">
                <Box
                    padding="4"
                    className="border-1 rounded-xl border-border-divider flex flex-col gap-4 bg-white"
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

                    <dl className="grid grid-cols-[136px_1fr] xl:grid-cols-[152px_1fr] gap-y-2 gap-x-4">
                        <dt className="text-medium font-bold flex flex-row gap-2 items-center">
                            <Skeleton
                                variant="circle"
                                width={16}
                                height={16}
                                className="flex items-center"
                            />
                            Status
                        </dt>
                        <dd className="text-medium items-center flex">
                            <Skeleton
                                variant="rectangle"
                                width={154}
                                height={24}
                                className="flex items-center"
                            />
                        </dd>

                        <dt className="text-medium font-bold flex flex-row gap-2 items-center">
                            <CalendarIcon
                                aria-hidden
                                fontSize="1rem"
                                className="text-icon-subtle"
                            />
                            Opprettet
                        </dt>
                        <dd className="text-medium items-center flex">
                            <Skeleton
                                variant="rectangle"
                                width={154}
                                height={24}
                                className="flex items-center"
                            />
                        </dd>

                        <dt className="text-medium font-bold flex flex-row gap-2 items-center">
                            <Buildings3Icon
                                aria-hidden
                                fontSize="1rem"
                                className="text-icon-subtle"
                            />
                            Enhet
                        </dt>
                        <dd className="text-medium items-center flex">
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
                    padding="4"
                    className="border-1 rounded-xl border-border-divider flex flex-col gap-4 bg-white"
                >
                    <Heading size="xsmall" level="2">
                        Bruker
                    </Heading>

                    <dl className="grid grid-cols-[136px_1fr] xl:grid-cols-[152px_1fr] gap-y-2 gap-x-4">
                        <dt className="text-medium font-bold flex flex-row gap-2 items-center">
                            <Skeleton
                                variant="circle"
                                width={16}
                                height={16}
                                className="flex items-center"
                            />
                            Navn
                        </dt>
                        <dd className="text-medium">
                            <Skeleton
                                variant="rectangle"
                                width={154}
                                height={24}
                                className="flex items-center"
                            />
                        </dd>

                        <dt className="text-medium font-bold flex flex-row gap-2 items-center">
                            <CandleIcon aria-hidden fontSize="1rem" className="text-icon-subtle" />
                            Alder
                        </dt>
                        <dd className="text-medium flex flex-row gap-2 items-center">
                            <Skeleton
                                variant="rectangle"
                                width={100}
                                height={24}
                                className="flex items-center"
                            />
                            år
                        </dd>

                        <dt className="text-medium font-bold flex flex-row gap-2 items-center">
                            <BagdeIcon aria-hidden fontSize="1rem" className="text-icon-subtle" />
                            <Skeleton
                                variant="rectangle"
                                width={100}
                                height={24}
                                className="flex items-center"
                            />
                        </dt>
                        <dd className="text-medium flex flex-row gap-2 items-center">
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
