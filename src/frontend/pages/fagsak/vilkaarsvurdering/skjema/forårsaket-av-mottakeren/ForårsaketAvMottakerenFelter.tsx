import { Radio, RadioGroup } from '@navikt/ds-react';
import { type FC, useState } from 'react';

import { Forsett } from './Forsett';
import { GrovtUaktsom } from './GrovtUaktsom';
import { Uaktsom } from './Uaktsom';

type Props = {
    erUnder4xRettsgebyr: boolean;
    simulertBeløp: number | null;
};

export const ForårsaketAvMottakerenFelter: FC<Props> = ({
    erUnder4xRettsgebyr,
    simulertBeløp,
}: Props) => {
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

            {uaktsomhet === 'grovt-uaktsom' && <GrovtUaktsom simulertBeløp={simulertBeløp} />}

            {uaktsomhet === 'forsett' && <Forsett simulertBeløp={simulertBeløp} />}

            {uaktsomhet === 'uaktsom' && (
                <Uaktsom erUnder4xRettsgebyr={erUnder4xRettsgebyr} simulertBeløp={simulertBeløp} />
            )}
        </>
    );
};
