import type { UserEvent } from '@testing-library/user-event';

import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { TestBehandlingProvider } from '~/testdata/behandlingContextFactory';
import { lagForeldelsePeriodeSkjemaData } from '~/testdata/foreldelseFactory';

import { SplittPeriode } from './SplittPeriode';

describe('SplittPeriode - Foreldelse', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
    });

    test('Åpning av modal', async () => {
        render(
            <TestBehandlingProvider>
                <SplittPeriode periode={lagForeldelsePeriodeSkjemaData()} onBekreft={vi.fn()} />
            </TestBehandlingProvider>
        );

        expect(screen.getByRole('button', { name: 'Del opp perioden' })).toBeInTheDocument();
        expect(screen.getAllByText('Del opp perioden')).toHaveLength(1);
        expect(screen.queryByText('01.01.2021 - 30.04.2021')).not.toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Del opp perioden' }));

        expect(screen.getAllByText('Del opp perioden')).toHaveLength(2);
        expect(screen.getByText('01.01.2021 - 30.04.2021')).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Del opp perioden' })).toBeInTheDocument();
        expect(screen.getByLabelText('Angi t.o.m. måned for første periode')).toBeInTheDocument();
        expect(screen.getByLabelText('Angi t.o.m. måned for første periode')).toHaveValue(
            'januar 2021'
        );
    });
});
