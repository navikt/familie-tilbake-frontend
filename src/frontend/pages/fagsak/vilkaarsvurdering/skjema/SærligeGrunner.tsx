import type { ChangeEvent, FC } from 'react';
import type { SærligeGrunnerNavnPrefix, VilkårsvurderingSkjemaFelter } from './schema';

import {
    Checkbox,
    CheckboxGroup,
    HStack,
    Radio,
    RadioGroup,
    Textarea,
    TextField,
} from '@navikt/ds-react';
import { useFormContext, useWatch } from 'react-hook-form';

import { useVilkårsvurderingLesedata } from '../VilkårsvurderingLesedataContext';
import { SimulertBeløp } from './SimulertBeløp';

type Props = {
    navnPrefix: SærligeGrunnerNavnPrefix;
    renter?: boolean;
    reduksjon?: boolean;
};

export const SærligeGrunner: FC<Props> = ({
    navnPrefix,
    renter = false,
    reduksjon = false,
}: Props) => {
    const { register, setValue, control, getFieldState, formState } =
        useFormContext<VilkårsvurderingSkjemaFelter>();
    const { momenterSærligeGrunner } = useVilkårsvurderingLesedata();
    const feil = (navn: Parameters<typeof getFieldState>[0]): string | undefined =>
        getFieldState(navn, formState).error?.message;
    const erDetSaerligeGrunner = useWatch({
        name: `${navnPrefix}.erDetSaerligeGrunner`,
        control,
    });
    const særligeGrunnerFor = useWatch({
        name: `${navnPrefix}.jaSærligeGrunner.særligeGrunnerFor`,
        control,
    });
    const særligeGrunnerMot = useWatch({
        name: `${navnPrefix}.neiSærligeGrunner.særligeGrunnerMot`,
        control,
    });
    const prosentReduksjon = useWatch({
        name: `${navnPrefix}.jaSærligeGrunner.prosentReduksjon`,
        control,
    });

    const { name: erDetSærligeGrunnerName, ...erDetSærligeGrunnerProps } = register(
        `${navnPrefix}.erDetSaerligeGrunner`
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
                value={erDetSaerligeGrunner}
                error={feil(`${navnPrefix}.erDetSaerligeGrunner`)}
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

            {erDetSaerligeGrunner === 'ja' && (
                <>
                    <CheckboxGroup
                        legend="Hvilke særlige grunner taler for å redusere beløpet?"
                        size="small"
                        className="max-w-xl"
                        value={særligeGrunnerFor}
                        error={feil(`${navnPrefix}.jaSærligeGrunner.særligeGrunnerFor`)}
                        onChange={(value: string[]): void =>
                            setValue(`${navnPrefix}.jaSærligeGrunner.særligeGrunnerFor`, value, {
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
                            {...register(`${navnPrefix}.jaSærligeGrunner.annetBegrunnelse`)}
                            error={feil(`${navnPrefix}.jaSærligeGrunner.annetBegrunnelse`)}
                        />
                    )}
                    <Textarea
                        label="Begrunn hvorfor du vurderer at det er særlige grunner til å redusere beløpet"
                        size="small"
                        className="max-w-xl"
                        minRows={3}
                        resize
                        maxLength={3000}
                        {...register(`${navnPrefix}.jaSærligeGrunner.begrunnelse`)}
                        error={feil(`${navnPrefix}.jaSærligeGrunner.begrunnelse`)}
                    />
                    {/* TODO Valider senere at man ikke kan skrive utenfor 1–100 */}
                    <TextField
                        label="Hvor mange prosent skal beløpet reduseres med?"
                        size="small"
                        className="max-w-xl"
                        value={prosentReduksjon ?? ''}
                        error={feil(`${navnPrefix}.jaSærligeGrunner.prosentReduksjon`)}
                        style={{ width: '100px' }}
                        onChange={(e: ChangeEvent<HTMLInputElement, Element>): void =>
                            setValue(
                                `${navnPrefix}.jaSærligeGrunner.prosentReduksjon`,
                                e.target.value === '' ? null : Number(e.target.value),
                                { shouldDirty: true }
                            )
                        }
                        type="number"
                        min={1}
                        max={100}
                    />
                    <SimulertBeløp renter={renter} {...reduksjonsprops} />
                </>
            )}

            {erDetSaerligeGrunner === 'nei' && (
                <>
                    <CheckboxGroup
                        legend="Hvilke særlige grunner taler mot å redusere beløpet?"
                        size="small"
                        className="max-w-xl"
                        value={særligeGrunnerMot}
                        error={feil(`${navnPrefix}.neiSærligeGrunner.særligeGrunnerMot`)}
                        onChange={(value: string[]): void =>
                            setValue(`${navnPrefix}.neiSærligeGrunner.særligeGrunnerMot`, value, {
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
                            {...register(`${navnPrefix}.neiSærligeGrunner.annetBegrunnelse`)}
                            error={feil(`${navnPrefix}.neiSærligeGrunner.annetBegrunnelse`)}
                        />
                    )}
                    <Textarea
                        label="Begrunn hvorfor du vurderer at det ikke er særlige grunner til å redusere beløpet"
                        size="small"
                        className="max-w-xl"
                        minRows={3}
                        resize
                        maxLength={3000}
                        {...register(`${navnPrefix}.neiSærligeGrunner.begrunnelse`)}
                        error={feil(`${navnPrefix}.neiSærligeGrunner.begrunnelse`)}
                    />
                    <SimulertBeløp renter={renter} />
                </>
            )}
        </>
    );
};
