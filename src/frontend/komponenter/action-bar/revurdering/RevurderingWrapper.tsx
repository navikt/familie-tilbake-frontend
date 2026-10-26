import type { FC } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { behandlingOpprettRevurderingMutation } from '@/generated-new/@tanstack/react-query.gen';

import { OPPRETT_REVURDERING_MUTATION_KEY, Revurdering } from './Revurdering';

export const RevurderingWrapper: FC = () => {
    const queryClient = useQueryClient();

    queryClient.setMutationDefaults(
        OPPRETT_REVURDERING_MUTATION_KEY,
        behandlingOpprettRevurderingMutation()
    );

    return <Revurdering />;
};
