import type { IBehandling } from '../../../../../typer/behandling';
import type { ForeldelsePeriodeSkjemeData } from '../../typer/feilutbetalingForeldelse';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import SplittPeriode from './SplittPeriode';
import { HttpProvider } from '../../../../../api/http/HttpProvider';

const opprettTestQueryClient = () =>
    new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
                refetchOnWindowFocus: false,
                staleTime: 0,
            },
        },
    });

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    const queryClient = opprettTestQueryClient();

    return (
        <QueryClientProvider client={queryClient}>
            <HttpProvider>{children}</HttpProvider>
        </QueryClientProvider>
    );
};

describe('Tester: SplittPeriode - Foreldelse', () => {
    test('Tester åpning av modal', async () => {
        const user = userEvent.setup();
        const periode: ForeldelsePeriodeSkjemeData = {
            index: 'i1',
            feilutbetaltBeløp: 1333,
            periode: {
                fom: '2021-01-01',
                tom: '2021-04-30',
            },
        };
        const behandling = mock<IBehandling>({});

        const {
            getByAltText,
            getByLabelText,
            getByText,
            queryAllByText,
            queryByAltText,
            queryByText,
        } = render(
            <TestWrapper>
                <SplittPeriode periode={periode} behandling={behandling} onBekreft={jest.fn()} />
            </TestWrapper>
        );

        expect(queryByAltText('Del opp perioden')).toBeTruthy();
        expect(queryAllByText('Del opp perioden')).toHaveLength(1);
        expect(queryByText('01.01.2021 - 30.04.2021')).toBeFalsy();

        await act(() => user.click(getByAltText('Del opp perioden')));

        expect(queryAllByText('Del opp perioden')).toHaveLength(2);
        expect(queryByText('01.01.2021 - 30.04.2021')).toBeTruthy();
        expect(
            getByText('Del opp perioden', {
                selector: 'p',
            })
        ).toBeTruthy();
        expect(getByLabelText('Angi t.o.m. måned for første periode')).toBeTruthy();
        expect(getByLabelText('Angi t.o.m. måned for første periode')).toHaveValue('april 2021');
    });
});
