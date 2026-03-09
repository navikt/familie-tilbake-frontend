import type { FC } from 'react';
import type { UttalelseFormData } from '~/pages/fagsak/forhåndsvarsel/schema';

import { Radio, RadioGroup, Textarea } from '@navikt/ds-react';
import { get, useFormContext, useWatch } from 'react-hook-form';

import { useBehandlingState } from '~/context/BehandlingStateContext';
import { HarUttaltSegEtterUtsattFrist } from '~/pages/fagsak/forhåndsvarsel/schema';

import { UttalelseDetaljerListe } from './UttalelseDetaljerSkjema';

export const UttalelseEtterUtsattFristSkjema: FC = () => {
    const methods = useFormContext<UttalelseFormData>();
    const { behandlingILesemodus } = useBehandlingState();
    const errors = methods.formState.errors;

    const { name, ...radioProps } = methods.register('harUttaltSegEtterUtsattFrist');

    const harUttaltSegEtterUtsattFrist = useWatch({
        control: methods.control,
        name: 'harUttaltSegEtterUtsattFrist',
    });

    return (
        <>
            <RadioGroup
                name={name}
                size="small"
                readOnly={behandlingILesemodus}
                legend="Har brukeren uttalt seg etter utsatt frist?"
                error={get(errors, 'harUttaltSegEtterUtsattFrist.message')}
            >
                <Radio value={HarUttaltSegEtterUtsattFrist.Ja} {...radioProps}>
                    Ja
                </Radio>
                <Radio value={HarUttaltSegEtterUtsattFrist.Nei} {...radioProps}>
                    Nei
                </Radio>
            </RadioGroup>

            {harUttaltSegEtterUtsattFrist === HarUttaltSegEtterUtsattFrist.Ja && (
                <UttalelseDetaljerListe fieldName="uttalelsesDetaljerEtterUtsattFrist" />
            )}

            {harUttaltSegEtterUtsattFrist === HarUttaltSegEtterUtsattFrist.Nei && (
                <Textarea
                    {...methods.register('kommentarEtterUtsattFrist')}
                    size="small"
                    readOnly={behandlingILesemodus}
                    label="Kommentar til valget over"
                    maxLength={4000}
                    minRows={3}
                    resize
                    className="max-w-xl"
                    error={get(errors, 'kommentarEtterUtsattFrist.message')}
                />
            )}
        </>
    );
};
