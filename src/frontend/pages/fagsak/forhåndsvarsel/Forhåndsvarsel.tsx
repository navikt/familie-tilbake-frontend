import type { FC } from 'react';

import { Heading } from '@navikt/ds-react';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useBehandling } from '~/context/BehandlingContext';
import { behandlingForhandsvarselOptions } from '~/generated-new/@tanstack/react-query.gen';

import { IkkeVurdert } from './IkkeVurdert';
import { SendtVarsel } from './SendtVarsel';
import { Unntak } from './Unntak';

export const Forhåndsvarsel: FC = () => {
    const { behandlingId } = useBehandling();

    const { data: response } = useSuspenseQuery(
        behandlingForhandsvarselOptions({
            path: { behandlingId },
        })
    );

    const { forhaandsvarselSteg, brukeruttalelse } = response;

    return (
        <div className="flex flex-col gap-4">
            <Heading size="medium">Forhåndsvarsel</Heading>
            {forhaandsvarselSteg.type === 'ikke_vurdert' && <IkkeVurdert />}
            {forhaandsvarselSteg.type === 'sendt' && (
                <SendtVarsel {...forhaandsvarselSteg} brukeruttalelse={brukeruttalelse} />
            )}
            {forhaandsvarselSteg.type === 'unntak' && (
                <Unntak {...forhaandsvarselSteg} brukeruttalelse={brukeruttalelse} />
            )}
        </div>
    );
};
