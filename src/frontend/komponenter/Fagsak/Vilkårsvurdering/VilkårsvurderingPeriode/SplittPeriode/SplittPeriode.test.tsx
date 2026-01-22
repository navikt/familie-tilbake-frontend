import type { UserEvent } from '@testing-library/user-event';

import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';
import { vi } from 'vitest';

import SplittPeriode from './SplittPeriode';
import { HttpProvider } from '../../../../../api/http/HttpProvider';
import { TestBehandlingProvider } from '../../../../../testdata/behandlingContextFactory';
import { lagBehandling } from '../../../../../testdata/behandlingFactory';
import { lagVilkårsvurderingPeriodeSkjemaData } from '../../../../../testdata/vilkårsvurderingFactory';

describe('SplittPeriode - Vilkårsvurdering', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    test('Åpning av modal', async () => {
        const behandling = lagBehandling();
        const {
            getByAltText,
            getByLabelText,
            getByText,
            queryAllByText,
            queryByAltText,
            queryByText,
        } = render(
            <HttpProvider>
                <TestBehandlingProvider behandling={behandling}>
                    <SplittPeriode
                        periode={lagVilkårsvurderingPeriodeSkjemaData()}
                        onBekreft={vi.fn()}
                    />
                </TestBehandlingProvider>
            </HttpProvider>
        );

        expect(queryByAltText('Del opp perioden')).toBeInTheDocument();
        expect(queryAllByText('Del opp perioden')).toHaveLength(1);
        expect(queryByText('01.01.2021 - 30.04.2021')).not.toBeInTheDocument();

        await user.click(getByAltText('Del opp perioden'));

        expect(queryAllByText('Del opp perioden')).toHaveLength(2);
        expect(queryByText('01.01.2021 - 30.04.2021')).toBeInTheDocument();
        expect(
            getByText('Del opp perioden', {
                selector: 'p',
            })
        ).toBeInTheDocument();
        expect(getByLabelText('Angi t.o.m. måned for første periode')).toBeInTheDocument();
        expect(getByLabelText('Angi t.o.m. måned for første periode')).toHaveValue('januar 2021');
    });
});
