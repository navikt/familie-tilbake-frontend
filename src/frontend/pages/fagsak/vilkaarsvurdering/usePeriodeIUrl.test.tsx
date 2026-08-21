import type { FC } from 'react';
import type { Vilkårsperiode } from './typer';

import { Button } from '@navikt/ds-react';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { describe, expect, test } from 'vitest';

import { TestBehandlingProvider } from '@/testdata/behandlingContextFactory';

import { usePeriodeIUrl } from './usePeriodeIUrl';

const lagPeriode = (
    id: string,
    vurdering: Vilkårsperiode['vurdering'] = 'FORSETT'
): Vilkårsperiode => ({
    id,
    fom: '01.01.2023',
    tom: '31.12.2023',
    feilutbetalt: 10000,
    vurdering,
    resultat: 'FULL_TILBAKEKREVING',
    rettsligGrunnlag: [],
});

const Testkomponent: FC<{ perioder: Vilkårsperiode[] }> = ({
    perioder,
}: {
    perioder: Vilkårsperiode[];
}) => {
    const { valgtPeriode, setValgtPeriodeId: settValgtPeriodeId } = usePeriodeIUrl(perioder);

    return (
        <>
            <output>{valgtPeriode?.id ?? 'ingen'}</output>
            {perioder.map(({ id }) => (
                <Button key={id} onClick={(): void => settValgtPeriodeId(id)}>
                    Velg {id}
                </Button>
            ))}
        </>
    );
};

const renderMedUrl = (
    url: string,
    perioder: Vilkårsperiode[],
    harUlagredeData = false
): ReturnType<typeof createMemoryRouter> => {
    const router = createMemoryRouter(
        [
            {
                path: '*',
                element: (
                    <TestBehandlingProvider stateOverrides={{ harUlagredeData }}>
                        <Testkomponent perioder={perioder} />
                    </TestBehandlingProvider>
                ),
            },
        ],
        { initialEntries: [url] }
    );
    render(<RouterProvider router={router} />);

    return router;
};

describe('usePeriodeIUrl', () => {
    test('velger perioden fra URL-en', async () => {
        renderMedUrl('/steg?periode=2', [lagPeriode('1'), lagPeriode('2')]);

        expect(await screen.findByText('2')).toBeInTheDocument();
    });

    test('skriver valgt periode til URL-en når saksbehandleren bytter periode', async () => {
        const bruker = userEvent.setup();
        const router = renderMedUrl('/steg?periode=1', [lagPeriode('1'), lagPeriode('2')]);

        await bruker.click(screen.getByRole('button', { name: 'Velg 2' }));

        expect(router.state.location.search).toBe('?periode=2');
    });

    test('kanoniserer URL-en når periode-IDen er utdatert etter oppdeling eller sammenslåing', async () => {
        const router = renderMedUrl('/steg?periode=slettet', [
            lagPeriode('ny-1'),
            lagPeriode('ny-2'),
        ]);

        expect(await screen.findByText('ny-2')).toBeInTheDocument();
        expect(router.state.location.search).toBe('?periode=ny-2');
    });

    test('erstatter historikken ved kanonisering slik at «tilbake» ikke treffer en slettet periode', async () => {
        const router = renderMedUrl('/steg?periode=slettet', [lagPeriode('ny-1')]);

        await screen.findByText('ny-1');

        expect(router.state.location.search).toBe('?periode=ny-1');
        expect(router.state.historyAction).toBe('REPLACE');
    });

    test('skriver periode til URL-en når parameteren mangler', async () => {
        const router = renderMedUrl('/steg', [lagPeriode('1'), lagPeriode('2')]);

        await screen.findByText('2');

        expect(router.state.location.search).toBe('?periode=2');
    });

    test('beholder andre søkeparametre', async () => {
        const router = renderMedUrl('/steg?annet=verdi', [lagPeriode('1')]);

        await screen.findByText('1');

        expect(router.state.location.search).toContain('annet=verdi');
        expect(router.state.location.search).toContain('periode=1');
    });

    test('utsetter kanonisering ved ulagrede endringer, for ikke å utløse advarselsmodalen', async () => {
        const router = renderMedUrl('/steg?periode=slettet', [lagPeriode('ny-1')], true);

        await screen.findByText('ny-1');

        expect(router.state.location.search).toBe('?periode=slettet');
    });
});
