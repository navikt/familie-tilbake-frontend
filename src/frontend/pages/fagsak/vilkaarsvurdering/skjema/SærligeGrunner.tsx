import {
    Checkbox,
    CheckboxGroup,
    HStack,
    Radio,
    RadioGroup,
    Textarea,
    TextField,
} from '@navikt/ds-react';
import { type FC, useState } from 'react';

import { SimulertBeløp } from './SimulertBeløp';

type SærligeGrunnerValg = 'ja' | 'nei';

type Props = {
    renter?: boolean;
};

export const SærligeGrunner: FC<Props> = ({ renter = false }: Props) => {
    const [særligeGrunner, setSærligeGrunner] = useState<SærligeGrunnerValg>();
    const [særligeGrunnerFor, setSærligeGrunnerFor] = useState<string[]>([]);
    const [særligeGrunnerMot, setSærligeGrunnerMot] = useState<string[]>([]);
    const [reduksjonsprosent, setReduksjonsprosent] = useState<number>(1);
    return (
        <>
            <RadioGroup
                legend="Er det særlige grunner til å redusere beløpet?"
                size="small"
                className="max-w-xl"
                value={særligeGrunner ?? ''}
                onChange={(value: SærligeGrunnerValg): void => setSærligeGrunner(value)}
            >
                <HStack gap="space-16">
                    <Radio value="ja">Ja</Radio>
                    <Radio value="nei">Nei</Radio>
                </HStack>
            </RadioGroup>

            {særligeGrunner === 'ja' && (
                <>
                    <CheckboxGroup
                        legend="Hvilke særlige grunner taler for å redusere beløpet?"
                        size="small"
                        className="max-w-xl"
                        value={særligeGrunnerFor}
                        onChange={(value: string[]): void => setSærligeGrunnerFor(value)}
                    >
                        <Checkbox value="særligGrunn1">
                            Graden av uaktsomhet hos den som kravet retter seg mot
                        </Checkbox>
                        <Checkbox value="særligGrunn2">
                            Størrelsen på det feilutbetalte beløpet
                        </Checkbox>
                        <Checkbox value="særligGrunn3">
                            Hvor lang tid det har gått siden utbetalingen fant sted
                        </Checkbox>
                        <Checkbox value="særligGrunn4">
                            Om feilen helt eller delvis kan tilskrives Nav
                        </Checkbox>
                        <Checkbox value="særligGrunn5">Annet</Checkbox>
                    </CheckboxGroup>
                    {særligeGrunnerFor.includes('særligGrunn5') && (
                        <TextField
                            label="Beskriv kort hva du legger i alternativet “Annet”"
                            size="small"
                            className="max-w-xl"
                        />
                    )}
                    <Textarea
                        label="Begrunn hvorfor du vurderer at det er særlige grunner til å redusere beløpet"
                        size="small"
                        className="max-w-xl"
                        minRows={3}
                        resize
                        maxLength={3000}
                    />
                    <TextField
                        label="Hvor mange prosent skal beløpet reduseres?"
                        size="small"
                        className="max-w-xl"
                        value={reduksjonsprosent}
                        style={{ width: '100px' }}
                        onChange={(e: React.ChangeEvent<HTMLInputElement, Element>): void =>
                            setReduksjonsprosent(Number(e.target.value))
                        }
                        type="number"
                        min={1}
                        max={100}
                    />
                    <SimulertBeløp
                        renter={renter}
                        reduksjonsprosent={reduksjonsprosent}
                        beløp={10000}
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
                        onChange={(value: string[]): void => setSærligeGrunnerMot(value)}
                    >
                        <Checkbox value="særligGrunn1">
                            Graden av uaktsomhet hos den som kravet retter seg mot
                        </Checkbox>
                        <Checkbox value="særligGrunn2">
                            Størrelsen på det feilutbetalte beløpet
                        </Checkbox>
                        <Checkbox value="særligGrunn3">
                            Hvor lang tid det har gått siden utbetalingen fant sted
                        </Checkbox>
                        <Checkbox value="særligGrunn4">
                            Om feilen helt eller delvis kan tilskrives Nav
                        </Checkbox>
                        <Checkbox value="særligGrunn5">Annet</Checkbox>
                    </CheckboxGroup>

                    {særligeGrunnerMot.includes('særligGrunn5') && (
                        <TextField
                            label="Beskriv kort hva du legger i alternativet “Annet”"
                            size="small"
                            className="max-w-xl"
                        />
                    )}
                    <Textarea
                        label="Begrunn hvorfor du vurderer at det ikke er særlige grunner til å redusere beløpet"
                        size="small"
                        className="max-w-xl"
                        minRows={3}
                        resize
                        maxLength={3000}
                    />
                    <SimulertBeløp renter={renter} beløp={10000} />
                </>
            )}
        </>
    );
};
