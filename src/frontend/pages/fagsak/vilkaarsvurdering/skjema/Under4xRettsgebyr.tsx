import type { FC } from 'react';
import type { SærligeGrunnerNavnPrefix } from './skjemaTyper';

import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';
import { HStack, InfoCard, Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import { useState } from 'react';

import { SimulertBeløp } from './SimulertBeløp';
import { SærligeGrunner } from './SærligeGrunner';

type Props = {
    navnPrefix: SærligeGrunnerNavnPrefix;
    simulertBeløp: number | null;
    renter?: boolean;
    reduksjon?: boolean;
};

export const Under4xRettsgebyr: FC<Props> = ({
    navnPrefix,
    simulertBeløp,
    renter,
    reduksjon,
}: Props) => {
    const [skalIkkeKrevesTilbake, setSkalIkkeKrevesTilbake] = useState<string>();
    return (
        <>
            <InfoCard data-color="warning" className="max-w-xl" size="small">
                <InfoCard.Header icon={<ExclamationmarkTriangleIcon aria-hidden />}>
                    <InfoCard.Title>Beløpet er under fire ganger rettsgebyret</InfoCard.Title>
                </InfoCard.Header>
            </InfoCard>
            <RadioGroup
                legend="Skal Nav la være å kreve beløpet tilbake? (Sjette avsnitt)"
                size="small"
                className="max-w-xl"
                value={skalIkkeKrevesTilbake ?? ''}
                onChange={(value: string): void => setSkalIkkeKrevesTilbake(value)}
            >
                <HStack gap="space-16">
                    <Radio value="ja">Ja</Radio>
                    <Radio value="nei">Nei</Radio>
                </HStack>
            </RadioGroup>

            {skalIkkeKrevesTilbake === 'ja' && (
                <>
                    <Textarea
                        label="Begrunn hvorfor du vurderer at Nav skal la være å kreve beløpet tilbake"
                        size="small"
                        className="max-w-xl"
                        minRows={3}
                        resize
                        maxLength={3000}
                    />
                    <SimulertBeløp simulertBeløp={simulertBeløp} />
                </>
            )}

            {skalIkkeKrevesTilbake === 'nei' && (
                <SærligeGrunner
                    navnPrefix={navnPrefix}
                    reduksjon={reduksjon}
                    renter={renter}
                    simulertBeløp={simulertBeløp}
                />
            )}
        </>
    );
};
