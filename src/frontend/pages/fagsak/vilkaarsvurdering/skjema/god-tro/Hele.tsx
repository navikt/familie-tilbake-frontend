import type { FC } from 'react';

import { Checkbox, CheckboxGroup, Radio, RadioGroup, Textarea, TextField } from '@navikt/ds-react';
import { useState } from 'react';

import { SimulertBeløp } from '../SimulertBeløp';

type KrevesTilbake = 'ja' | 'nei';

export const Hele: FC = () => {
    const [krevesTilbake, setKrevesTilbake] = useState<KrevesTilbake>();

    return (
        <>
            <Textarea
                label="Begrunn hvorfor hele beløpet er i behold"
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
            />
            <RadioGroup
                legend="Skal hele beløpet som er i behold kreves tilbake?"
                size="small"
                className="max-w-xl"
                value={krevesTilbake ?? ''}
                onChange={(value: KrevesTilbake): void => setKrevesTilbake(value)}
            >
                <Radio value="ja">Ja</Radio>
                <Radio value="nei">Nei</Radio>
            </RadioGroup>

            {krevesTilbake === 'ja' && (
                <>
                    <CheckboxGroup
                        legend="Hva er årsaken(e) til at hele beløpet skal kreves tilbake?"
                        description="Kryss av for det som er avgjørende i vurderingen din"
                        size="small"
                        className="max-w-xl"
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
                    <Textarea
                        label="Begrunn hvorfor du vurderer at hele beløpet skal kreves tilbake"
                        size="small"
                        className="max-w-xl"
                        minRows={3}
                        resize
                        maxLength={3000}
                    />
                    <TextField
                        label="Hvor mange kroner skal kreves tilbake?"
                        size="small"
                        style={{ width: '100px' }}
                        className="max-w-xl"
                    />
                    <SimulertBeløp beløp={10000} />
                </>
            )}

            {krevesTilbake === 'nei' && (
                <>
                    <CheckboxGroup
                        legend="Hva er årsaken(e) til at hele beløpet ikke skal kreves tilbake?"
                        description="Kryss av for det som er avgjørende i vurderingen din"
                        size="small"
                        className="max-w-xl"
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
                    <Textarea
                        label="Begrunn hvorfor du vurderer at hele beløpet ikke skal kreves tilbake"
                        size="small"
                        className="max-w-xl"
                        minRows={3}
                        resize
                        maxLength={3000}
                    />
                    <SimulertBeløp beløp={0} />
                </>
            )}
        </>
    );
};
