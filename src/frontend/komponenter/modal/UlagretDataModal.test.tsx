import type { FC, ReactNode } from 'react';

import { Button } from '@navikt/ds-react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { createMemoryRouter, Link, Outlet, RouterProvider } from 'react-router';
import { describe, expect, test } from 'vitest';

import { useSynkroniserUlagretSkjema } from '@/hooks/useSynkroniserUlagretSkjema';
import { UlagretDataModal } from '@/komponenter/modal/UlagretDataModal';
import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';

const Vakt: FC = () => {
    useSynkroniserUlagretSkjema('testskjema');
    return null;
};

const Testskjema: FC = () => {
    const methods = useForm<{ begrunnelse: string }>({ defaultValues: { begrunnelse: '' } });

    return (
        <FormProvider {...methods}>
            <Vakt />
            <label htmlFor="begrunnelse">Begrunnelse</label>
            <input id="begrunnelse" {...methods.register('begrunnelse')} />
            <Button onClick={(): void => methods.reset()}>Lagre</Button>
        </FormProvider>
    );
};

const Steg: FC = () => (
    <>
        <Testskjema />
        <Link to="/annet-steg">Annet steg</Link>
        <Link to="/steg?periode=2">Periode 2</Link>
    </>
);

const TestProvider: FC<{ children: ReactNode }> = ({ children }: { children: ReactNode }) => (
    <TestBehandlingProvider>
        {children}
        <UlagretDataModal />
    </TestBehandlingProvider>
);

const renderSteg = (): void => {
    const router = createMemoryRouter(
        [
            {
                element: (
                    <TestProvider>
                        <Outlet />
                    </TestProvider>
                ),
                children: [
                    { path: '/steg', element: <Steg /> },
                    { path: '/annet-steg', element: <h1>Annet steg</h1> },
                ],
            },
        ],
        { initialEntries: ['/steg?periode=1'] }
    );

    render(<RouterProvider router={router} />);
};

const gjørSkjemaetSkittent = async (bruker: ReturnType<typeof userEvent.setup>): Promise<void> => {
    await bruker.type(screen.getByLabelText('Begrunnelse'), 'noe');
};

describe('Advarsel om ulagrede endringer', () => {
    test('advarer ikke når skjemaet er urørt', async () => {
        const bruker = userEvent.setup();
        renderSteg();

        await bruker.click(screen.getByRole('link', { name: 'Annet steg' }));

        expect(screen.queryByText('Du har ulagrede endringer')).not.toBeInTheDocument();
    });

    test('blokkerer navigasjon til et annet steg og forklarer at siden forlates', async () => {
        const bruker = userEvent.setup();
        renderSteg();
        await gjørSkjemaetSkittent(bruker);

        await bruker.click(screen.getByRole('link', { name: 'Annet steg' }));

        expect(await screen.findByText(/Hvis du forlater siden nå/)).toBeInTheDocument();
        expect(screen.getByLabelText('Begrunnelse')).toBeInTheDocument();
    });

    test('blokkerer periodebytte og forklarer at perioden byttes', async () => {
        const bruker = userEvent.setup();
        renderSteg();
        await gjørSkjemaetSkittent(bruker);

        await bruker.click(screen.getByRole('link', { name: 'Periode 2' }));

        expect(await screen.findByText(/Hvis du bytter periode nå/)).toBeInTheDocument();
    });

    test('lar brukeren fortsette uten å lagre', async () => {
        const bruker = userEvent.setup();
        renderSteg();
        await gjørSkjemaetSkittent(bruker);
        await bruker.click(screen.getByRole('link', { name: 'Annet steg' }));
        await screen.findByText(/Hvis du forlater siden nå/);

        await bruker.click(screen.getByRole('button', { name: 'Fortsett uten å lagre' }));

        expect(screen.queryByLabelText('Begrunnelse')).not.toBeInTheDocument();
    });

    test('lar brukeren avbryte og bli værende', async () => {
        const bruker = userEvent.setup();
        renderSteg();
        await gjørSkjemaetSkittent(bruker);
        await bruker.click(screen.getByRole('link', { name: 'Annet steg' }));
        await screen.findByText(/Hvis du forlater siden nå/);

        await bruker.click(screen.getAllByRole('button', { name: 'Lukk' })[0]);

        expect(screen.queryByText(/Hvis du forlater siden nå/)).not.toBeInTheDocument();
        expect(screen.getByLabelText('Begrunnelse')).toHaveValue('noe');
    });

    test('advarer ikke lenger etter at skjemaet er nullstilt ved lagring', async () => {
        const bruker = userEvent.setup();
        renderSteg();
        await gjørSkjemaetSkittent(bruker);

        await bruker.click(screen.getByRole('button', { name: 'Lagre' }));
        await bruker.click(screen.getByRole('link', { name: 'Annet steg' }));

        expect(screen.queryByText(/Hvis du forlater siden nå/)).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Begrunnelse')).not.toBeInTheDocument();
    });

    test('hindrer at nettleseren lukker siden med ulagrede endringer', async () => {
        const bruker = userEvent.setup();
        renderSteg();
        await gjørSkjemaetSkittent(bruker);

        const hendelse = new Event('beforeunload', { cancelable: true });
        window.dispatchEvent(hendelse);

        expect(hendelse.defaultPrevented).toBe(true);
    });
});
