import type { FC } from 'react';
import type { UttalelseFormData } from '~/pages/fagsak/forhåndsvarsel/schema';

import { Alert, Textarea } from '@navikt/ds-react';
import { get, useFormContext, useWatch } from 'react-hook-form';

import { useBehandlingState } from '~/context/BehandlingStateContext';
import { HarUttaltSeg } from '~/pages/fagsak/forhåndsvarsel/schema';

import { UttalelseDetaljerListe } from './UttalelseDetaljerSkjema';

type Props = {
    utsattFristDato?: string;
};

export const UttalelseEtterUtsattFristSkjema: FC<Props> = ({ utsattFristDato }) => {
    const methods = useFormContext<UttalelseFormData>();
    const { behandlingILesemodus } = useBehandlingState();
    const errors = methods.formState.errors;

    const harUttaltSeg = useWatch({
        control: methods.control,
        name: 'harUttaltSeg',
    });

    return (
        <>
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
        </>
    );
};
