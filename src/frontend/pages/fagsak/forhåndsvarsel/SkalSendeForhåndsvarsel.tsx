import type { FC } from 'react';
import type { ChangeHandler } from 'react-hook-form';

import { Radio, RadioGroup } from '@navikt/ds-react';

import { useBehandling } from '@/context/BehandlingContext';

type Props = {
    name: string;
    readOnly?: boolean;
    value?: 'send' | 'unntak';
    error?: string;
    erNyttForhåndsvarsel?: boolean;
    onChange?: ChangeHandler;
    onBlur?: ChangeHandler;
};

export const SkalSendeForhåndsvarsel: FC<Props> = ({
    name,
    readOnly,
    value,
    error,
    erNyttForhåndsvarsel,
    ...radioProps
}: Props) => {
    const { tilbakekrevingRevurdering } = useBehandling();

    const spørsmålOmTilbakekreving = erNyttForhåndsvarsel
        ? 'Skal det sendes et nytt forhåndsvarsel om tilbakekreving?'
        : 'Skal det sendes forhåndsvarsel om tilbakekreving?';
    const spørsmålOmForhåndsvarsel = tilbakekrevingRevurdering
        ? 'Skal det sendes forhåndsvarsel om revurdering av tilbakekreving?'
        : spørsmålOmTilbakekreving;

    return (
        <RadioGroup
            name={name}
            legend={spørsmålOmForhåndsvarsel}
            description="Mottakeren skal som klar hovedregel varsles før vedtak om tilbakekreving fattes, slik at de får mulighet til å uttale seg."
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
};
