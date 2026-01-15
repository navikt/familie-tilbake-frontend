import type { Toggles } from '../../../../context/toggles';
import type { RenderResult } from '@testing-library/react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent, within } from '@testing-library/react';
import React from 'react';

import { BehandlingContext } from '../../../../context/BehandlingContext';
import { FagsakContext } from '../../../../context/FagsakContext';
import { ToggleName } from '../../../../context/toggles';
import { lagBehandlingContext } from '../../../../testdata/behandlingContextFactory';
import { lagBehandlingDto } from '../../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../../testdata/fagsakFactory';
import {
    lagForhåndsvarselQueries,
    lagForhåndsvarselMutations,
} from '../../../../testdata/forhåndsvarselFactory';
import { Forhåndsvarsel } from '../Forhåndsvarsel';
import { useForhåndsvarselMutations } from '../useForhåndsvarselMutations';
import { useForhåndsvarselQueries } from '../useForhåndsvarselQueries';

const mockUseToggles = vi.fn();

vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: (): ReturnType<typeof vi.fn> => vi.fn(),
    };
});

vi.mock('../../../../context/TogglesContext', () => ({
    useToggles: (): Toggles => mockUseToggles(),
}));

vi.mock('../useForhåndsvarselQueries', () => ({
    useForhåndsvarselQueries: vi.fn(),
}));

vi.mock('../useForhåndsvarselMutations', () => ({
    useForhåndsvarselMutations: vi.fn(),
    mapHarBrukerUttaltSegFraApiDto: vi.fn(),
}));

const setupMock = (): void => {
    mockUseToggles.mockImplementation(() => ({
        toggles: {
            [ToggleName.Forhåndsvarselsteg]: true,
        },
    }));
};

const renderBrukeruttalelse = (): RenderResult => {
    const behandling = lagBehandlingDto({
        varselSendt: true,
    });

    return render(
        <FagsakContext.Provider value={lagFagsak()}>
            <BehandlingContext.Provider value={lagBehandlingContext({ behandling })}>
                <QueryClientProvider client={new QueryClient()}>
                    <Forhåndsvarsel />
                </QueryClientProvider>
            </BehandlingContext.Provider>
        </FagsakContext.Provider>
    );
};

describe('Brukeruttalelse', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupMock();

        vi.mocked(useForhåndsvarselQueries).mockReturnValue(
            lagForhåndsvarselQueries({
                forhåndsvarselInfo: {
                    varselbrevDto: { varselbrevSendtTid: '2023-01-01T10:00:00Z' },
                    utsettUttalelseFrist: [
                        // { nyFrist: '2023-01-15', begrunnelse: 'Trenger mer tid' },
                    ],
                    brukeruttalelse: undefined,
                },
            })
        );

        vi.mocked(useForhåndsvarselMutations).mockReturnValue(lagForhåndsvarselMutations());
    });

    test('Viser Ja og Nei alternativer', () => {
        renderBrukeruttalelse();

        expect(
            screen.getByText('Har brukeren uttalt seg etter forhåndsvarselet?')
        ).toBeInTheDocument();

        const jaOptions = screen.getAllByLabelText('Ja');
        expect(jaOptions).toHaveLength(2);

        const neiOptions = screen.getAllByLabelText('Nei');
        expect(neiOptions).toHaveLength(2);
    });

    test('Viser "Utsett frist" alternativ hvis varsel er sendt', () => {
        renderBrukeruttalelse();

        expect(screen.getByLabelText('Utsett frist for å uttale seg')).toBeInTheDocument();
    });

    test('Viser uttalelsesfelter når Ja er valgt', async () => {
        renderBrukeruttalelse();

        expect(screen.queryByLabelText('Når uttalte brukeren seg?')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Hvordan uttalte brukeren seg?')).not.toBeInTheDocument();
        expect(
            screen.queryByLabelText('Beskriv hva brukeren har uttalt seg om')
        ).not.toBeInTheDocument();

        const brukeruttalelseFieldset = screen.getByRole('group', {
            name: /har brukeren uttalt seg etter forhåndsvarselet/i,
        });
        const jaRadio = within(brukeruttalelseFieldset).getByLabelText('Ja');
        fireEvent.click(jaRadio);

        expect(await screen.findByLabelText('Når uttalte brukeren seg?')).toBeInTheDocument();
        expect(screen.getByLabelText('Hvordan uttalte brukeren seg?')).toBeInTheDocument();
        expect(screen.getByLabelText('Beskriv hva brukeren har uttalt seg om')).toBeInTheDocument();
    });

    test('Viser beskrivelse for "Hvordan uttalte brukeren seg?" feltet', async () => {
        renderBrukeruttalelse();

        const brukeruttalelseFieldset = screen.getByRole('group', {
            name: /har brukeren uttalt seg etter forhåndsvarselet/i,
        });
        const jaRadio = within(brukeruttalelseFieldset).getByLabelText('Ja');
        fireEvent.click(jaRadio);

        expect(
            await screen.findByText('For eksempel via telefon, Gosys, Ditt Nav eller Skriv til oss')
        ).toBeInTheDocument();
    });

    test('Viser kommentarfelt når Nei er valgt', async () => {
        renderBrukeruttalelse();

        expect(screen.queryByLabelText('Kommentar til valget over')).not.toBeInTheDocument();

        const brukeruttalelseFieldset = screen.getByRole('group', {
            name: /har brukeren uttalt seg etter forhåndsvarselet/i,
        });
        const neiRadio = within(brukeruttalelseFieldset).getByLabelText('Nei');
        fireEvent.click(neiRadio);

        expect(await screen.findByLabelText('Kommentar til valget over')).toBeInTheDocument();
    });

    test('Viser utsettelsesfelter når "Utsett frist" er valgt', async () => {
        renderBrukeruttalelse();

        expect(screen.queryByLabelText('Sett ny dato for frist')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Begrunnelse for utsatt frist')).not.toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Utsett frist for å uttale seg'));

        expect(await screen.findByLabelText('Sett ny dato for frist')).toBeInTheDocument();
        expect(screen.getByLabelText('Begrunnelse for utsatt frist')).toBeInTheDocument();
    });

    describe('Validering', () => {
        test('skal vise feilmelding når ingen alternativ er valgt', async () => {
            renderBrukeruttalelse();

            const nesteKnapp = await screen.findByRole('button', { name: 'Neste' });
            fireEvent.click(nesteKnapp);

            const brukeruttalelseFieldset = screen.getByRole('group', {
                name: /har brukeren uttalt seg etter forhåndsvarselet/i,
            });

            expect(
                await within(brukeruttalelseFieldset).findByText(
                    'Du må velge om brukeren har uttalt seg eller om fristen skal utsettes'
                )
            ).toBeInTheDocument();
        });

        describe('Når Ja er valgt', () => {
            test('skal vise dato-feilmelding når Ja er valgt uten fylt dato-felt', async () => {
                renderBrukeruttalelse();

                const brukeruttalelseFieldset = screen.getByRole('group', {
                    name: /har brukeren uttalt seg etter forhåndsvarselet/i,
                });
                const jaRadio = within(brukeruttalelseFieldset).getByLabelText('Ja');
                fireEvent.click(jaRadio);

                const nesteKnapp = await screen.findByRole('button', { name: 'Neste' });
                fireEvent.click(nesteKnapp);

                expect(
                    await screen.findByText('Du må legge inn en gyldig dato')
                ).toBeInTheDocument();
            });

            test('skal vise dato-feilmelding når Ja er valgt uten fylt dato-felt på blur', async () => {
                renderBrukeruttalelse();

                const brukeruttalelseFieldset = screen.getByRole('group', {
                    name: /har brukeren uttalt seg etter forhåndsvarselet/i,
                });
                const jaRadio = within(brukeruttalelseFieldset).getByLabelText('Ja');
                fireEvent.click(jaRadio);

                const datoInput = await screen.findByLabelText('Når uttalte brukeren seg?');
                fireEvent.blur(datoInput);

                expect(
                    await screen.findByText('Du må legge inn en gyldig dato')
                ).toBeInTheDocument();
            });

            test('skal vise riktig hvorUttalteBrukerenSeg og beskrivelse feilmelding ved tomme felt', async () => {
                renderBrukeruttalelse();

                const brukeruttalelseFieldset = screen.getByRole('group', {
                    name: /har brukeren uttalt seg etter forhåndsvarselet/i,
                });
                const jaRadio = within(brukeruttalelseFieldset).getByLabelText('Ja');
                fireEvent.click(jaRadio);

                const nesteKnapp = await screen.findByRole('button', { name: 'Neste' });
                fireEvent.click(nesteKnapp);

                expect(await screen.findAllByText('Du må fylle inn en verdi')).toHaveLength(2);
            });
        });
    });
});
