import type { FC } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import type { UttalelseFormData } from '~/pages/fagsak/forhåndsvarsel/schema';

import { RadioGroup, Radio, Textarea } from '@navikt/ds-react';
import { useCallback } from 'react';
import { get, useFormContext, useWatch } from 'react-hook-form';

import { useBehandlingState } from '~/context/BehandlingStateContext';
import { ToggleName } from '~/context/toggles';
import { useToggles } from '~/context/TogglesContext';
import { HarUttaltSeg, HarUttaltSegEtterUtsattFrist } from '~/pages/fagsak/forhåndsvarsel/schema';

import { UtsettFristSkjema } from './UtsettFristSkjema';
import { UttalelseDetaljerListe } from './UttalelseDetaljerSkjema';
import { UttalelseEtterUtsattFristSkjema } from './UttalelseEtterUtsattFristSkjema';

type Props = {
    fristErUtsatt?: boolean;
    handleUttalelseSubmit: SubmitHandler<UttalelseFormData>;
};

export const UttalelseEtterVarsel: FC<Props> = ({
    handleUttalelseSubmit,
    fristErUtsatt = false,
}) => {
    const { toggles } = useToggles();
    const methods = useFormContext<UttalelseFormData>();
    const { behandlingILesemodus } = useBehandlingState();
    const harUttaltSeg = useWatch({
        control: methods.control,
        name: 'harUttaltSeg',
    });

    const { name, ...radioProps } = methods.register('harUttaltSeg');
    const errors = methods.formState.errors;

    const skalViseUtsettFristValg = toggles[ToggleName.Forhåndsvarselsteg];

    const { defaultValues } = methods.formState;

    const resetUttalelseEtterUtsattFrist = useCallback(() => {
        methods.setValue(
            'harUttaltSegEtterUtsattFrist',
            defaultValues?.harUttaltSegEtterUtsattFrist ?? HarUttaltSegEtterUtsattFrist.IkkeValgt
        );
        methods.setValue(
            'uttalelsesDetaljerEtterUtsattFrist',
            defaultValues?.uttalelsesDetaljerEtterUtsattFrist
        );
        methods.setValue('kommentarEtterUtsattFrist', defaultValues?.kommentarEtterUtsattFrist);
    }, [methods, defaultValues]);

    const resetUtsettFrist = useCallback(() => {
        methods.setValue(
            'utsettUttalelseFrist',
            defaultValues?.utsettUttalelseFrist ?? { nyFrist: '', begrunnelse: '' }
        );
    }, [methods, defaultValues]);

    return (
        <form
            id="uttalelseForm"
            onSubmit={methods.handleSubmit(handleUttalelseSubmit)}
            className="flex flex-col gap-6"
        >
            <RadioGroup
                name={name}
                size="small"
                readOnly={behandlingILesemodus}
                legend="Har brukeren uttalt seg etter forhåndsvarselet ble sendt?"
                error={errors.harUttaltSeg?.message}
            >
                <Radio value={HarUttaltSeg.Ja} {...radioProps}>
                    Ja
                </Radio>
                <Radio value={HarUttaltSeg.Nei} {...radioProps}>
                    Nei
                </Radio>
                {skalViseUtsettFristValg && (
                    <Radio value={HarUttaltSeg.UtsettFrist} {...radioProps}>
                        Utsett frist for å uttale seg
                    </Radio>
                )}
            </RadioGroup>

            {harUttaltSeg === HarUttaltSeg.Ja && <UttalelseDetaljerListe />}

            {harUttaltSeg === HarUttaltSeg.Nei && (
                <Textarea
                    {...methods.register('kommentar')}
                    size="small"
                    readOnly={behandlingILesemodus}
                    label="Kommentar til valget over"
                    maxLength={4000}
                    minRows={3}
                    resize
                    className="max-w-xl"
                    error={get(errors, 'kommentar.message')}
                />
            )}

            {harUttaltSeg === HarUttaltSeg.UtsettFrist && (
                <UtsettFristSkjema onChange={resetUttalelseEtterUtsattFrist} />
            )}

            {fristErUtsatt && harUttaltSeg === HarUttaltSeg.UtsettFrist && (
                <UttalelseEtterUtsattFristSkjema onChange={resetUtsettFrist} />
            )}
        </form>
    );
};
