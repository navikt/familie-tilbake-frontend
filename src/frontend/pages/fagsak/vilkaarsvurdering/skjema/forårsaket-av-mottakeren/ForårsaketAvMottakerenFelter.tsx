import { Radio, RadioGroup } from '@navikt/ds-react';
import { type FC, useState } from 'react';

import { Forsett } from './Forsett';
import { GrovtUaktsom } from './GrovtUaktsom';
import { Uaktsom } from './Uaktsom';

type Props = {
    erUnder4xRettsgebyr: boolean;
};

export const ForårsaketAvMottakerenFelter: FC<Props> = ({ erUnder4xRettsgebyr }: Props) => {
    const [uaktsomhet, setUaktsomhet] = useState<string>();
    return (
        <>
            <RadioGroup
                legend="Vurder mottakerens uaktsomhet i perioden"
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

            {uaktsomhet === 'uaktsom' && <Uaktsom erUnder4xRettsgebyr={erUnder4xRettsgebyr} />}
        </>
    );
};
