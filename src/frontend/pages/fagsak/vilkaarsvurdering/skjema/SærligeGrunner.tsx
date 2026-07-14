import type { ChangeEvent, FC } from 'react';
import type { SærligeGrunnerNavnPrefix, VilkårsvurderingSkjemaFelter } from './skjemaTyper';

import {
    Checkbox,
    CheckboxGroup,
    HStack,
    Radio,
    RadioGroup,
    Textarea,
    TextField,
} from '@navikt/ds-react';
import { useFormContext } from 'react-hook-form';

import { useVilkårsvurderingLesedata } from '../VilkårsvurderingLesedataContext';
import { SimulertBeløp } from './SimulertBeløp';

type Props = {
    navnPrefix: SærligeGrunnerNavnPrefix;
    simulertBeløp: number | null;
    renter?: boolean;
    reduksjon?: boolean;
};

export const SærligeGrunner: FC<Props> = ({
    navnPrefix,
    simulertBeløp,
    renter = false,
    reduksjon = false,
}: Props) => {
    const { register, watch, setValue } = useFormContext<VilkårsvurderingSkjemaFelter>();
    const { momenterSærligeGrunner } = useVilkårsvurderingLesedata();

    const særligeGrunner = watch(`${navnPrefix}.erDetSærligeGrunner`);
    const særligeGrunnerFor = watch(`${navnPrefix}.særligeGrunnerFor`);
    const særligeGrunnerMot = watch(`${navnPrefix}.særligeGrunnerMot`);
    const prosentReduksjon = watch(`${navnPrefix}.prosentReduksjon`);

    const { name: erDetSærligeGrunnerName, ...erDetSærligeGrunnerProps } = register(
        `${navnPrefix}.erDetSærligeGrunner`
    );

    const reduksjonsprops = reduksjon
        ? { reduksjon: true as const, reduksjonsprosent: prosentReduksjon ?? 0 }
        : { reduksjon: false as const };
    return (
        <>
            <RadioGroup
                name={erDetSærligeGrunnerName}
                legend="Er det særlige grunner til å redusere beløpet?"
                size="small"
                className="max-w-xl"
                value={særligeGrunner}
            >
                <HStack gap="space-16">
                    <Radio value="ja" {...erDetSærligeGrunnerProps}>
                        Ja
                    </Radio>
                    <Radio value="nei" {...erDetSærligeGrunnerProps}>
                        Nei
                    </Radio>
                </HStack>
            </RadioGroup>

            {særligeGrunner === 'ja' && (
                <>
                    <CheckboxGroup
                        legend="Hvilke særlige grunner taler for å redusere beløpet?"
                        size="small"
                        className="max-w-xl"
                        value={særligeGrunnerFor}
                        onChange={(value: string[]): void =>
                            setValue(`${navnPrefix}.særligeGrunnerFor`, value, {
                                shouldDirty: true,
                            })
                        }
                    >
                        {momenterSærligeGrunner.map(({ moment, beskrivelse }) => (
                            <Checkbox key={moment} value={moment}>
                                {beskrivelse}
                            </Checkbox>
                        ))}
                    </CheckboxGroup>
                    {særligeGrunnerFor.includes('ANNET') && (
                        <TextField
                            label="Beskriv kort hva du legger i alternativet “Annet”"
                            size="small"
                            className="max-w-xl"
                            {...register(`${navnPrefix}.annetBegrunnelse`)}
                        />
                    )}
                    <Textarea
                        label="Begrunn hvorfor du vurderer at det er særlige grunner til å redusere beløpet"
                        size="small"
                        className="max-w-xl"
                        minRows={3}
                        resize
                        maxLength={3000}
                        {...register(`${navnPrefix}.begrunnelse`)}
                    />
                    {/* TODO Valider senere at man ikke kan skrive utenfor 1–100 */}
                    <TextField
                        label="Hvor mange prosent skal beløpet reduseres med?"
                        size="small"
                        className="max-w-xl"
                        value={prosentReduksjon ?? ''}
                        style={{ width: '100px' }}
                        onChange={(e: ChangeEvent<HTMLInputElement, Element>): void =>
                            setValue(
                                `${navnPrefix}.prosentReduksjon`,
                                e.target.value === '' ? null : Number(e.target.value),
                                { shouldDirty: true }
                            )
                        }
                        type="number"
                        min={1}
                        max={100}
                    />
                    <SimulertBeløp
                        simulertBeløp={simulertBeløp}
                        renter={renter}
                        {...reduksjonsprops}
                    />
                </>
            )}

            {særligeGrunner === 'nei' && (
                <>
                    <CheckboxGroup
                        legend="Hvilke særlige grunner taler mot å redusere beløpet?"
                        size="small"
                        className="max-w-xl"
                        value={særligeGrunnerMot}
                        onChange={(value: string[]): void =>
                            setValue(`${navnPrefix}.særligeGrunnerMot`, value, {
                                shouldDirty: true,
                            })
                        }
                    >
                        {momenterSærligeGrunner.map(({ moment, beskrivelse }) => (
                            <Checkbox key={moment} value={moment}>
                                {beskrivelse}
                            </Checkbox>
                        ))}
                    </CheckboxGroup>

                    {særligeGrunnerMot.includes('ANNET') && (
                        <TextField
                            label="Beskriv kort hva du legger i alternativet “Annet”"
                            size="small"
                            className="max-w-xl"
                            {...register(`${navnPrefix}.annetBegrunnelse`)}
                        />
                    )}
                    <Textarea
                        label="Begrunn hvorfor du vurderer at det ikke er særlige grunner til å redusere beløpet"
                        size="small"
                        className="max-w-xl"
                        minRows={3}
                        resize
                        maxLength={3000}
                        {...register(`${navnPrefix}.begrunnelse`)}
                    />
                    <SimulertBeløp renter={renter} simulertBeløp={simulertBeløp} />
                </>
            )}
        </>
    );
};
