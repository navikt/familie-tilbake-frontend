import type { ChangeEvent, FC } from 'react';
import type { ReduksjonNavnPrefix, VilkårsvurderingSkjemaFelter } from '../schema';

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

import { useVilkårsvurderingLesedata } from '../../VilkårsvurderingLesedataContext';
import { SimulertBeløp } from '../SimulertBeløp';

type Props = {
    navnPrefix: ReduksjonNavnPrefix;
};

export const Reduksjon: FC<Props> = ({ navnPrefix }: Props) => {
    const { register, setValue, control, getFieldState, formState } =
        useFormContext<VilkårsvurderingSkjemaFelter>();
    const { momenterReduksjonGodTro } = useVilkårsvurderingLesedata();

    const feil = (navn: Parameters<typeof getFieldState>[0]): string | undefined =>
        getFieldState(navn, formState).error?.message;
    const setValueOptions = { shouldDirty: true, shouldValidate: formState.isSubmitted };

    const erDetReduksjonÅrsaker = useWatch({
        name: `${navnPrefix}.erDetReduksjonÅrsaker`,
        control,
    });
    const relevansNeiGodTro = useWatch({
        name: `${navnPrefix}.neiGodTro.relevans`,
        control,
    });
    const relevansJaGodTro = useWatch({
        name: `${navnPrefix}.jaGodTro.relevans`,
        control,
    });
    const prosentReduksjon = useWatch({
        name: `${navnPrefix}.jaGodTro.prosentReduksjon`,
        control,
    });

    const { name: reduksjonName, ...reduksjonProps } = register(
        `${navnPrefix}.erDetReduksjonÅrsaker`
    );

    return (
        <>
            <RadioGroup
                legend="Skal beløpet reduseres?"
                name={reduksjonName}
                size="small"
                className="max-w-xl"
                value={erDetReduksjonÅrsaker}
                error={feil(`${navnPrefix}.erDetReduksjonÅrsaker`)}
            >
                <HStack gap="space-16">
                    <Radio value="jaGodTro" {...reduksjonProps}>
                        Ja
                    </Radio>
                    <Radio value="neiGodTro" {...reduksjonProps}>
                        Nei
                    </Radio>
                </HStack>
            </RadioGroup>

            {erDetReduksjonÅrsaker === 'jaGodTro' && (
                <>
                    <CheckboxGroup
                        legend="Hva er årsaken(e) til at beløpet skal reduseres?"
                        description="Kryss av for det som er avgjørende i vurderingen din"
                        size="small"
                        className="max-w-xl"
                        value={relevansJaGodTro}
                        error={feil(`${navnPrefix}.jaGodTro.relevans`)}
                        onChange={(value: string[]): void =>
                            setValue(`${navnPrefix}.jaGodTro.relevans`, value, setValueOptions)
                        }
                    >
                        {momenterReduksjonGodTro.map(({ moment, beskrivelse }) => (
                            <Checkbox key={moment} value={moment}>
                                {beskrivelse}
                            </Checkbox>
                        ))}
                    </CheckboxGroup>
                    {relevansJaGodTro.includes('ANNET') && (
                        <TextField
                            label="Beskriv kort hva du legger i alternativet “Annet”"
                            {...register(`${navnPrefix}.jaGodTro.annetBegrunnelse`)}
                            error={feil(`${navnPrefix}.jaGodTro.annetBegrunnelse`)}
                            size="small"
                            className="max-w-xl"
                        />
                    )}
                    <Textarea
                        label="Begrunn hvorfor du vurderer at beløpet skal reduseres"
                        {...register(`${navnPrefix}.jaGodTro.begrunnelse`)}
                        error={feil(`${navnPrefix}.jaGodTro.begrunnelse`)}
                        size="small"
                        className="max-w-xl"
                        minRows={3}
                        resize
                        maxLength={3000}
                    />
                    <TextField
                        label="Hvor mange prosent skal beløpet reduseres med?"
                        value={prosentReduksjon ?? ''}
                        error={feil(`${navnPrefix}.jaGodTro.prosentReduksjon`)}
                        onChange={(e: ChangeEvent<HTMLInputElement, Element>): void =>
                            setValue(
                                `${navnPrefix}.jaGodTro.prosentReduksjon`,
                                e.target.value === '' ? null : Number(e.target.value),
                                setValueOptions
                            )
                        }
                        size="small"
                        style={{ width: '100px' }}
                        className="max-w-xl"
                        type="number"
                        min={0}
                        max={100}
                    />
                    <SimulertBeløp reduksjon reduksjonsprosent={prosentReduksjon ?? 0} />
                </>
            )}

            {erDetReduksjonÅrsaker === 'neiGodTro' && (
                <>
                    <CheckboxGroup
                        legend="Hva er årsaken(e) til at beløpet ikke skal reduseres?"
                        description="Kryss av for det som er avgjørende i vurderingen din"
                        size="small"
                        className="max-w-xl"
                        value={relevansNeiGodTro}
                        error={feil(`${navnPrefix}.neiGodTro.relevans`)}
                        onChange={(value: string[]): void =>
                            setValue(`${navnPrefix}.neiGodTro.relevans`, value, setValueOptions)
                        }
                    >
                        {momenterReduksjonGodTro.map(({ moment, beskrivelse }) => (
                            <Checkbox key={moment} value={moment}>
                                {beskrivelse}
                            </Checkbox>
                        ))}
                    </CheckboxGroup>
                    {relevansNeiGodTro.includes('ANNET') && (
                        <TextField
                            label="Beskriv kort hva du legger i alternativet “Annet”"
                            {...register(`${navnPrefix}.neiGodTro.annetBegrunnelse`)}
                            error={feil(`${navnPrefix}.neiGodTro.annetBegrunnelse`)}
                            size="small"
                            className="max-w-xl"
                        />
                    )}
                    <Textarea
                        label="Begrunn hvorfor du vurderer at beløpet ikke skal reduseres"
                        {...register(`${navnPrefix}.neiGodTro.begrunnelse`)}
                        error={feil(`${navnPrefix}.neiGodTro.begrunnelse`)}
                        size="small"
                        className="max-w-xl"
                        minRows={3}
                        resize
                        maxLength={3000}
                    />
                    <SimulertBeløp />
                </>
            )}
        </>
    );
};
