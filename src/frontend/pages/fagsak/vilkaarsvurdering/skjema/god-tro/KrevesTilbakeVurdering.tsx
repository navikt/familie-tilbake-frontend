import type { FC } from 'react';

import {
    Checkbox,
    CheckboxGroup,
    HStack,
    Radio,
    RadioGroup,
    Textarea,
    TextField,
} from '@navikt/ds-react';
import { useState } from 'react';

import { useVilkårsvurderingLesedata } from '../../VilkårsvurderingLesedataContext';
import { SimulertBeløp } from '../SimulertBeløp';

type KrevesTilbake = 'ja' | 'nei';

type Props = {
    /** Feltsti-prefiks for skjemafeltene, f.eks. "godTro.hele". Forbereder RHF-registrering. */
    navnPrefix: string;
    simulertBeløp: number | null;
    beløpsbeskrivelse: 'hele beløpet' | 'hele beløpet som er i behold';
};

export const KrevesTilbakeVurdering: FC<Props> = ({
    navnPrefix,
    simulertBeløp,
    beløpsbeskrivelse,
}: Props) => {
    const [krevesTilbake, setKrevesTilbake] = useState<KrevesTilbake>();
    const [årsakerSkalKreves, setÅrsakerSkalKreves] = useState<string[]>([]);
    const [årsakerSkalIkkeKreves, setÅrsakerSkalIkkeKreves] = useState<string[]>([]);
    const { momenterReduksjonGodTro } = useVilkårsvurderingLesedata();

    return (
        <>
            <RadioGroup
                legend={`Skal ${beløpsbeskrivelse} kreves tilbake?`}
                name={`${navnPrefix}.krevesTilbake`}
                size="small"
                className="max-w-xl"
                value={krevesTilbake ?? ''}
                onChange={(value: KrevesTilbake): void => setKrevesTilbake(value)}
            >
                <HStack gap="space-16">
                    <Radio value="ja">Ja</Radio>
                    <Radio value="nei">Nei</Radio>
                </HStack>
            </RadioGroup>

            {krevesTilbake === 'ja' && (
                <>
                    <CheckboxGroup
                        legend={`Hva er årsaken(e) til at ${beløpsbeskrivelse} skal kreves tilbake?`}
                        description="Kryss av for det som er avgjørende i vurderingen din"
                        name={`${navnPrefix}.årsakerSkalKreves`}
                        size="small"
                        className="max-w-xl"
                        value={årsakerSkalKreves}
                        onChange={setÅrsakerSkalKreves}
                    >
                        {momenterReduksjonGodTro.map(({ moment, beskrivelse }) => (
                            <Checkbox key={moment} value={moment}>
                                {beskrivelse}
                            </Checkbox>
                        ))}
                    </CheckboxGroup>
                    {årsakerSkalKreves.includes('ANNET') && (
                        <TextField
                            label="Beskriv kort hva du legger i alternativet “Annet”"
                            name={`${navnPrefix}.årsakerSkalKrevesAnnet`}
                            size="small"
                            className="max-w-xl"
                        />
                    )}
                    <Textarea
                        label={`Begrunn hvorfor du vurderer at ${beløpsbeskrivelse} skal kreves tilbake`}
                        name={`${navnPrefix}.begrunnelseSkalKreves`}
                        size="small"
                        className="max-w-xl"
                        minRows={3}
                        resize
                        maxLength={3000}
                    />
                    <SimulertBeløp simulertBeløp={simulertBeløp} />
                </>
            )}

            {krevesTilbake === 'nei' && (
                <>
                    <CheckboxGroup
                        legend={`Hva er årsaken(e) til at ${beløpsbeskrivelse} ikke skal kreves tilbake?`}
                        description="Kryss av for det som er avgjørende i vurderingen din"
                        name={`${navnPrefix}.årsakerSkalIkkeKreves`}
                        size="small"
                        className="max-w-xl"
                        value={årsakerSkalIkkeKreves}
                        onChange={setÅrsakerSkalIkkeKreves}
                    >
                        {momenterReduksjonGodTro.map(({ moment, beskrivelse }) => (
                            <Checkbox key={moment} value={moment}>
                                {beskrivelse}
                            </Checkbox>
                        ))}
                    </CheckboxGroup>
                    {årsakerSkalIkkeKreves.includes('ANNET') && (
                        <TextField
                            label="Beskriv kort hva du legger i alternativet “Annet”"
                            name={`${navnPrefix}.årsakerSkalIkkeKrevesAnnet`}
                            size="small"
                            className="max-w-xl"
                        />
                    )}
                    <Textarea
                        label={`Begrunn hvorfor du vurderer at ${beløpsbeskrivelse} ikke skal kreves tilbake`}
                        name={`${navnPrefix}.begrunnelseSkalIkkeKreves`}
                        size="small"
                        className="max-w-xl"
                        minRows={3}
                        resize
                        maxLength={3000}
                    />
                    <TextField
                        label="Hvor mange kroner skal kreves tilbake?"
                        name={`${navnPrefix}.beløpSomKrevesTilbake`}
                        size="small"
                        style={{ width: '100px' }}
                        className="max-w-xl"
                        type="number"
                        min={1}
                    />
                    <SimulertBeløp simulertBeløp={simulertBeløp} />
                </>
            )}
        </>
    );
};
