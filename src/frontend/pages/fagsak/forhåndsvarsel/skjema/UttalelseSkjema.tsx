import type { FC } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import type { UttalelseFormData } from '~/pages/fagsak/forhåndsvarsel/schema';

import { RadioGroup, Radio, Textarea } from '@navikt/ds-react';
import { get, useFormContext, useWatch } from 'react-hook-form';

import { useBehandlingState } from '~/context/BehandlingStateContext';
import { ToggleName } from '~/context/toggles';
import { useToggles } from '~/context/TogglesContext';
import { HarUttaltSeg } from '~/pages/fagsak/forhåndsvarsel/schema';

import { UtsettFristSkjema } from './UtsettFristSkjema';
import { UttalelseDetaljerListe } from './UttalelseDetaljerSkjema';
import { UttalelseEtterUtsattFristSkjema } from './UttalelseEtterUtsattFristSkjema';

type Props = {
    handleUttalelseSubmit: SubmitHandler<UttalelseFormData>;
    kanUtsetteFrist?: boolean;
    varselErSendt: boolean;
    fristErUtsatt?: boolean;
};

export const Uttalelse: FC<Props> = ({
    handleUttalelseSubmit,
    kanUtsetteFrist = false,
    varselErSendt,
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

    const getLegendTekst = (): string => {
        if (varselErSendt) {
            return 'Har brukeren uttalt seg etter forhåndsvarselet ble sendt?';
        }
        return 'Har brukeren uttalt seg?';
    };

    const skalViseUtsettFristValg = toggles[ToggleName.Forhåndsvarselsteg] && kanUtsetteFrist;

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
                legend={getLegendTekst()}
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

            {harUttaltSeg === HarUttaltSeg.UtsettFrist && <UtsettFristSkjema />}

            {fristErUtsatt && harUttaltSeg === HarUttaltSeg.UtsettFrist && (
                <UttalelseEtterUtsattFristSkjema />
            )}
        </form>
    );
};
