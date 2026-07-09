import { Radio, RadioGroup } from '@navikt/ds-react';
import { type FC, useState } from 'react';

import { BurdeForstått } from './BurdeForstått';
import { Forsto } from './Forsto';

type Props = {
    erUnder4xRettsgebyr: boolean;
    simulertBeløp: number | null;
};

export const ForstoEllerBurdeForståttFelter: FC<Props> = ({
    erUnder4xRettsgebyr,
    simulertBeløp,
}: Props) => {
    const [forståelse, setForståelse] = useState<string>();
    return (
        <>
            <RadioGroup
                legend="Vurder mottakerens forståelse på utbetalingstidspunktet"
                size="small"
                className="max-w-xl"
                value={forståelse ?? ''}
                onChange={(value: string): void => setForståelse(value)}
            >
                <Radio value="forsto">
                    Mottakeren <span className="font-bold">forsto</span> at utbetalingen skyldtes en
                    feil
                </Radio>
                <Radio value="burde-forstått">
                    Mottakeren <span className="font-bold">burde forstått</span> at utbetalingen
                    skyldtes en feil
                </Radio>
            </RadioGroup>

            {forståelse === 'forsto' && (
                <Forsto erUnder4xRettsgebyr={erUnder4xRettsgebyr} simulertBeløp={simulertBeløp} />
            )}

            {forståelse === 'burde-forstått' && (
                <BurdeForstått
                    erUnder4xRettsgebyr={erUnder4xRettsgebyr}
                    simulertBeløp={simulertBeløp}
                />
            )}
        </>
    );
};
