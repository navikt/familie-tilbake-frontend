import type { FC } from 'react';
import type { ChangeHandler } from 'react-hook-form';

import { Radio, RadioGroup } from '@navikt/ds-react';

type Props = {
    name: string;
    readOnly?: boolean;
    value?: 'send' | 'unntak';
    error?: string;
    onChange?: ChangeHandler;
    onBlur?: ChangeHandler;
};

export const SkalSendeForhåndsvarsel: FC<Props> = ({
    name,
    readOnly,
    value,
    error,
    ...radioProps
}: Props) => (
    <RadioGroup
        name={name}
        legend="Skal det sendes forhåndsvarsel om tilbakekreving?"
        description="Brukeren skal som klar hovedregel varsles før vedtak om tilbakekreving fattes, slik at de får mulighet til å uttale seg."
        size="small"
        readOnly={readOnly}
        className="max-w-xl"
        value={value}
        error={error}
    >
        <Radio value="send" {...radioProps}>
            Ja
        </Radio>
        <Radio value="unntak" {...radioProps}>
            Nei
        </Radio>
    </RadioGroup>
);
