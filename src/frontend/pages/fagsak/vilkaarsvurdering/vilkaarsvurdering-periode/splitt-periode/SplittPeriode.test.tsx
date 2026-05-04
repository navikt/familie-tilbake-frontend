import type { UserEvent } from '@testing-library/user-event';

import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import { HttpProvider } from '~/api/http/HttpProvider';
import { TestBehandlingProvider } from '~/testdata/behandlingContextFactory';
import { lagBehandling } from '~/testdata/behandlingFactory';
import { lagVilkårsvurderingPeriodeSkjemaData } from '~/testdata/vilkårsvurderingFactory';

import { SplittPeriode } from './SplittPeriode';

describe('SplittPeriode - Vilkårsvurdering', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    test('Åpning av modal', async () => {
        const behandling = lagBehandling();
        const { getByLabelText, getByRole, queryAllByText, queryByText } = render(
            <HttpProvider>
                <TestBehandlingProvider behandling={behandling}>
                    <SplittPeriode
                        periode={lagVilkårsvurderingPeriodeSkjemaData()}
                        onBekreft={vi.fn()}
                    />
                </TestBehandlingProvider>
            </HttpProvider>
        );

        expect(getByRole('button', { name: 'Del opp perioden' })).toBeInTheDocument();
        expect(queryByText('01.01.2021 - 30.04.2021')).not.toBeInTheDocument();

        await user.click(getByRole('button', { name: 'Del opp perioden' }));

        expect(queryAllByText('Del opp perioden')).toHaveLength(2);
        expect(queryByText('01.01.2021 - 30.04.2021')).toBeInTheDocument();
        expect(getByRole('heading', { name: 'Del opp perioden' })).toBeInTheDocument();
        expect(getByLabelText('Angi t.o.m. måned for første periode')).toBeInTheDocument();
        expect(getByLabelText('Angi t.o.m. måned for første periode')).toHaveValue('januar 2021');
    });
});
