import type { FC } from 'react';

import { Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import { useState } from 'react';

import { Hele } from './Hele';
import { Ingenting } from './Ingenting';

type BeløpIBehold = 'ingenting' | 'hele' | 'deler';

export const GodTroFelter: FC = () => {
    const [beløpIBehold, setBeløpIBehold] = useState<BeløpIBehold>();

    return (
        <>
            <Textarea
                label="Begrunn hvorfor du vurderer at mottaker har mottatt beløpet i aktsom god tro"
                size="small"
                className="max-w-xl"
                minRows={3}
                resize
                maxLength={3000}
            />
            <RadioGroup
                legend="Hvor mye av det feilutbetalte beløpet er i behold?"
                size="small"
                className="max-w-xl"
                value={beløpIBehold ?? ''}
                onChange={(value: BeløpIBehold): void => setBeløpIBehold(value)}
            >
                <Radio value="ingenting">Ingenting av beløpet</Radio>
                <Radio value="hele">Hele beløpet</Radio>
                <Radio value="deler">Deler av beløpet</Radio>
            </RadioGroup>

            {beløpIBehold === 'ingenting' && <Ingenting />}

            {beløpIBehold === 'hele' && <Hele />}

            {beløpIBehold === 'deler' && <></>}
        </>
    );
};
