import { Radio, RadioGroup } from '@navikt/ds-react';
import { type FC, useState } from 'react';

import { Forsett } from './Forsett';
import { GrovtUaktsom } from './GrovtUaktsom';

export const ForårsaketAvMottakerenFelter: FC = () => {
    const [uaktsomhet, setUaktsomhet] = useState<string>();
    return (
        <>
            <RadioGroup
                legend="Vurder mottakers uaktsomhet i perioden"
                size="small"
                className="max-w-xl"
                value={uaktsomhet ?? ''}
                onChange={(value: string): void => setUaktsomhet(value)}
            >
                <Radio value="uaktsom">Uaktsom</Radio>
                <Radio value="grovt-uaktsom">Grovt uaktsom</Radio>
                <Radio value="forsett">Forsett</Radio>
            </RadioGroup>

            {uaktsomhet === 'grovt-uaktsom' && <GrovtUaktsom />}

            {uaktsomhet === 'forsett' && <Forsett />}
        </>
    );
};
