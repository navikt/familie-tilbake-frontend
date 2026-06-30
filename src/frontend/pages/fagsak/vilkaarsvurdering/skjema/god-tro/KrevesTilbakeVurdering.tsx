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

import { SimulertBeløp } from '../SimulertBeløp';

type KrevesTilbake = 'ja' | 'nei';

type Props = {
    /** Feltsti-prefiks for skjemafeltene, f.eks. "godTro.hele". Forbereder RHF-registrering. */
    navnPrefix: string;
    beløpsbeskrivelse: 'hele beløpet' | 'deler av beløpet';
};

export const KrevesTilbakeVurdering: FC<Props> = ({ navnPrefix, beløpsbeskrivelse }: Props) => {
    const [krevesTilbake, setKrevesTilbake] = useState<KrevesTilbake>();
    const [årsakerSkalKreves, setÅrsakerSkalKreves] = useState<string[]>([]);
    const [årsakerSkalIkkeKreves, setÅrsakerSkalIkkeKreves] = useState<string[]>([]);

    return (
        <>
            <RadioGroup
                legend={`Skal ${beløpsbeskrivelse} som er i behold kreves tilbake?`}
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
                        <Checkbox value="årsaken1">Størrelsen på beløpet</Checkbox>
                        <Checkbox value="årsaken2">
                            Hvor lenge siden feilutbetalingen skjedde
                        </Checkbox>
                        <Checkbox value="årsaken3">
                            Om mottakeren har innrettet seg i tillit til utbetalingen
                        </Checkbox>
                        <Checkbox value="årsaken4">Annet</Checkbox>
                    </CheckboxGroup>
                    {årsakerSkalKreves.includes('årsaken4') && (
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
                    <SimulertBeløp beløp={10000} />
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
                        <Checkbox value="årsaken1">Hvor stort beløpet er</Checkbox>
                        <Checkbox value="årsaken2">
                            Hvor lenge siden feilutbetalingen skjedde
                        </Checkbox>
                        <Checkbox value="årsaken3">
                            Om mottakeren har innrettet seg etter utbetalingen
                        </Checkbox>
                        <Checkbox value="årsaken4">Annet</Checkbox>
                    </CheckboxGroup>
                    {årsakerSkalIkkeKreves.includes('årsaken4') && (
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
                    <SimulertBeløp beløp={0} />
                </>
            )}
        </>
    );
};
