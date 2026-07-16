import type { FC } from 'react';
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
    beløpsbeskrivelse: 'hele beløpet' | 'hele beløpet som er i behold';
};

export const Reduksjon: FC<Props> = ({ navnPrefix, beløpsbeskrivelse }: Props) => {
    const { register, setValue, control, getFieldState, formState } =
        useFormContext<VilkårsvurderingSkjemaFelter>();
    const { momenterReduksjonGodTro } = useVilkårsvurderingLesedata();

    const feil = (navn: Parameters<typeof getFieldState>[0]): string | undefined =>
        getFieldState(navn, formState).error?.message;

    const reduksjon = useWatch({
        name: `${navnPrefix}.reduksjon`,
        control,
    });
    const relevansSkalIkkeReduseres = useWatch({
        name: `${navnPrefix}.skalIkkeReduseres.relevans`,
        control,
    });
    const relevansSkalReduseres = useWatch({
        name: `${navnPrefix}.skalReduseres.relevans`,
        control,
    });

    const { name: reduksjonName, ...reduksjonProps } = register(`${navnPrefix}.reduksjon`);

    return (
        <>
            <RadioGroup
                legend={`Skal ${beløpsbeskrivelse} kreves tilbake?`}
                name={reduksjonName}
                size="small"
                className="max-w-xl"
                value={reduksjon}
                error={feil(`${navnPrefix}.reduksjon`)}
            >
                <HStack gap="space-16">
                    <Radio value="skalIkkeReduseres" {...reduksjonProps}>
                        Ja
                    </Radio>
                    <Radio value="skalReduseres" {...reduksjonProps}>
                        Nei
                    </Radio>
                </HStack>
            </RadioGroup>

            {reduksjon === 'skalIkkeReduseres' && (
                <>
                    <CheckboxGroup
                        legend={`Hva er årsaken(e) til at ${beløpsbeskrivelse} skal kreves tilbake?`}
                        description="Kryss av for det som er avgjørende i vurderingen din"
                        size="small"
                        className="max-w-xl"
                        value={relevansSkalIkkeReduseres}
                        error={feil(`${navnPrefix}.skalIkkeReduseres.relevans`)}
                        onChange={(value: string[]): void =>
                            setValue(`${navnPrefix}.skalIkkeReduseres.relevans`, value, {
                                shouldDirty: true,
                            })
                        }
                    >
                        {momenterReduksjonGodTro.map(({ moment, beskrivelse }) => (
                            <Checkbox key={moment} value={moment}>
                                {beskrivelse}
                            </Checkbox>
                        ))}
                    </CheckboxGroup>
                    {relevansSkalIkkeReduseres.includes('ANNET') && (
                        <TextField
                            label="Beskriv kort hva du legger i alternativet “Annet”"
                            {...register(`${navnPrefix}.skalIkkeReduseres.annetBegrunnelse`)}
                            error={feil(`${navnPrefix}.skalIkkeReduseres.annetBegrunnelse`)}
                            size="small"
                            className="max-w-xl"
                        />
                    )}
                    <Textarea
                        label={`Begrunn hvorfor du vurderer at ${beløpsbeskrivelse} skal kreves tilbake`}
                        {...register(`${navnPrefix}.skalIkkeReduseres.begrunnelse`)}
                        error={feil(`${navnPrefix}.skalIkkeReduseres.begrunnelse`)}
                        size="small"
                        className="max-w-xl"
                        minRows={3}
                        resize
                        maxLength={3000}
                    />
                    <SimulertBeløp />
                </>
            )}

            {reduksjon === 'skalReduseres' && (
                <>
                    <CheckboxGroup
                        legend={`Hva er årsaken(e) til at ${beløpsbeskrivelse} ikke skal kreves tilbake?`}
                        description="Kryss av for det som er avgjørende i vurderingen din"
                        size="small"
                        className="max-w-xl"
                        value={relevansSkalReduseres}
                        error={feil(`${navnPrefix}.skalReduseres.relevans`)}
                        onChange={(value: string[]): void =>
                            setValue(`${navnPrefix}.skalReduseres.relevans`, value, {
                                shouldDirty: true,
                            })
                        }
                    >
                        {momenterReduksjonGodTro.map(({ moment, beskrivelse }) => (
                            <Checkbox key={moment} value={moment}>
                                {beskrivelse}
                            </Checkbox>
                        ))}
                    </CheckboxGroup>
                    {relevansSkalReduseres.includes('ANNET') && (
                        <TextField
                            label="Beskriv kort hva du legger i alternativet “Annet”"
                            {...register(`${navnPrefix}.skalReduseres.annetBegrunnelse`)}
                            error={feil(`${navnPrefix}.skalReduseres.annetBegrunnelse`)}
                            size="small"
                            className="max-w-xl"
                        />
                    )}
                    <Textarea
                        label={`Begrunn hvorfor du vurderer at ${beløpsbeskrivelse} ikke skal kreves tilbake`}
                        {...register(`${navnPrefix}.skalReduseres.begrunnelse`)}
                        error={feil(`${navnPrefix}.skalReduseres.begrunnelse`)}
                        size="small"
                        className="max-w-xl"
                        minRows={3}
                        resize
                        maxLength={3000}
                    />
                    <TextField
                        label="Hvor mange kroner skal kreves tilbake?"
                        {...register(`${navnPrefix}.skalReduseres.beløp`, {
                            setValueAs: (value: string): number | null =>
                                value ? Number(value) : null,
                        })}
                        error={feil(`${navnPrefix}.skalReduseres.beløp`)}
                        size="small"
                        style={{ width: '100px' }}
                        className="max-w-xl"
                        type="number"
                        min={1}
                    />
                    <SimulertBeløp />
                </>
            )}
        </>
    );
};
