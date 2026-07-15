import type { FC } from 'react';
import type { UnnlatelseNavnPrefix, VilkårsvurderingSkjemaFelter } from './schema';

import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons';
import { HStack, InfoCard, Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import { useFormContext, useWatch } from 'react-hook-form';

import { SimulertBeløp } from './SimulertBeløp';
import { SærligeGrunner } from './SærligeGrunner';

type Props = {
    navnPrefix: UnnlatelseNavnPrefix;
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
    const { register, control, setValue } = useFormContext<VilkårsvurderingSkjemaFelter>();
    const unnlatelse = useWatch({ name: `${navnPrefix}.unnlatelse`, control });
    const unnlatelseVerdi =
        unnlatelse === 'skalUnnlates'
            ? 'skalUnnlates'
            : unnlatelse === 'skalIkkeUnnlates'
              ? 'skalIkkeUnnlates'
              : '';
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
                value={unnlatelseVerdi}
                onChange={(value: string): void =>
                    setValue(
                        `${navnPrefix}.unnlatelse`,
                        value === 'skalUnnlates' ? 'skalUnnlates' : 'skalIkkeUnnlates'
                    )
                }
            >
                <HStack gap="space-16">
                    <Radio value="skalUnnlates">Ja</Radio>
                    <Radio value="skalIkkeUnnlates">Nei</Radio>
                </HStack>
            </RadioGroup>

            {unnlatelseVerdi === 'skalUnnlates' && (
                <>
                    <Textarea
                        label="Begrunn hvorfor du vurderer at Nav skal la være å kreve beløpet tilbake"
                        size="small"
                        className="max-w-xl"
                        minRows={3}
                        resize
                        maxLength={3000}
                        {...register(`${navnPrefix}.skalUnnlates.begrunnelse`)}
                    />
                    <SimulertBeløp simulertBeløp={simulertBeløp} />
                </>
            )}

            {unnlatelseVerdi === 'skalIkkeUnnlates' && (
                <>
                    <Textarea
                        label="Begrunn hvorfor du vurderer at tilbakekrevingen ikke skal unnlates"
                        size="small"
                        className="max-w-xl"
                        minRows={3}
                        resize
                        maxLength={3000}
                        {...register(`${navnPrefix}.skalIkkeUnnlates.begrunnelse`)}
                    />
                    <SærligeGrunner
                        navnPrefix={`${navnPrefix}.skalIkkeUnnlates.erDetSærligeGrunner`}
                        reduksjon={reduksjon}
                        renter={renter}
                        simulertBeløp={simulertBeløp}
                    />
                </>
            )}
        </>
    );
};
