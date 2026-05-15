import type { FC, Ref } from 'react';
import type { ChangeHandler } from 'react-hook-form';

import { Radio, RadioGroup } from '@navikt/ds-react';

type Props = {
    name: string;
    readOnly?: boolean;
    value?: 'send' | 'unntak';
    error?: string;
    radioRef?: Ref<HTMLInputElement>;
    onChange?: ChangeHandler;
    onBlur?: ChangeHandler;
};

export const SkalSendeForhåndsvarsel: FC<Props> = ({
    name,
    readOnly,
    value,
    error,
    radioRef,
    onChange,
    onBlur,
}) => (
    <RadioGroup
        name={name}
        legend="Skal det sendes forhåndsvarsel om tilbakekreving?"
        description="Brukeren skal som klar hovedregel varsles før vedtak om tilbakekreving fattes, slik at de får mulighet til å uttale seg."
        size="small"
        readOnly={readOnly}
        className="max-w-xl"
        value={value ?? ''}
        error={error}
    >
        <Radio value="send" ref={radioRef} onChange={onChange} onBlur={onBlur}>
            Ja
        </Radio>
        <Radio value="unntak" onChange={onChange} onBlur={onBlur}>
            Nei
        </Radio>
    </RadioGroup>
);
