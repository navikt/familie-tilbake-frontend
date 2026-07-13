import {
    Checkbox,
    CheckboxGroup,
    HStack,
    Radio,
    RadioGroup,
    Textarea,
    TextField,
} from '@navikt/ds-react';
import { type ChangeEvent, type FC, useState } from 'react';

import { useVilkårsvurderingLesedata } from '../VilkårsvurderingLesedataContext';
import { SimulertBeløp } from './SimulertBeløp';

type SærligeGrunnerValg = 'ja' | 'nei';

type Props = {
    simulertBeløp: number | null;
    renter?: boolean;
    reduksjon?: boolean;
    standardValg?: SærligeGrunnerValg;
};

export const SærligeGrunner: FC<Props> = ({
    simulertBeløp,
    renter = false,
    reduksjon = false,
    standardValg,
}: Props) => {
    const [særligeGrunner, setSærligeGrunner] = useState<SærligeGrunnerValg | undefined>(
        standardValg
    );
    const [særligeGrunnerFor, setSærligeGrunnerFor] = useState<string[]>([]);
    const [særligeGrunnerMot, setSærligeGrunnerMot] = useState<string[]>([]);
    const [reduksjonsprosent, setReduksjonsprosent] = useState<number | undefined>(undefined);
    const { momenterSærligeGrunner } = useVilkårsvurderingLesedata();

    const reduksjonsprops = reduksjon
        ? { reduksjon: true as const, reduksjonsprosent: reduksjonsprosent ?? 0 }
        : { reduksjon: false as const };
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
                    {/* TODO Valider senere at man ikke kan skrive utenfor 1–100 */}
                    <TextField
                        label="Hvor mange prosent skal beløpet reduseres med?"
                        size="small"
                        className="max-w-xl"
                        value={reduksjonsprosent}
                        style={{ width: '100px' }}
                        onChange={(e: ChangeEvent<HTMLInputElement, Element>): void =>
                            setReduksjonsprosent(Number(e.target.value))
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
                        onChange={(value: string[]): void => setSærligeGrunnerMot(value)}
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
                    <SimulertBeløp renter={renter} simulertBeløp={simulertBeløp} />
                </>
            )}
        </>
    );
};
