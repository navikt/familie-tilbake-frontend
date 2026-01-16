import type { Toggles } from '../../../context/toggles';
import type { BehandlingDto, ForhåndsvarselDto } from '../../../generated';
import type { RenderResult } from '@testing-library/react';

import { QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { Forhåndsvarsel } from './Forhåndsvarsel';
import { useForhåndsvarselMutations } from './useForhåndsvarselMutations';
import { useForhåndsvarselQueries } from './useForhåndsvarselQueries';
import { FagsakContext } from '../../../context/FagsakContext';
import { ToggleName } from '../../../context/toggles';
import { TestBehandlingProvider } from '../../../testdata/behandlingContextFactory';
import { lagBehandlingDto } from '../../../testdata/behandlingFactory';
import { lagFagsak } from '../../../testdata/fagsakFactory';
import {
    lagForhåndsvarselQueries,
    lagForhåndsvarselMutations,
} from '../../../testdata/forhåndsvarselFactory';
import { createTestQueryClient } from '../../../testutils/queryTestUtils';

const mockUseToggles = vi.fn();

vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: (): ReturnType<typeof vi.fn> => vi.fn(),
    };
});

vi.mock('../../../context/TogglesContext', () => ({
    useToggles: (): Toggles => mockUseToggles(),
}));

vi.mock('../../../generated/@tanstack/react-query.gen', () => ({
    bestillBrevMutation: vi.fn().mockReturnValue({
        mutationFn: vi.fn(),
    }),
    forhåndsvisBrevMutation: vi.fn().mockReturnValue({
        mutationFn: vi.fn(),
    }),
}));

vi.mock('./useForhåndsvarselQueries', () => ({
    useForhåndsvarselQueries: vi.fn(),
}));

vi.mock('./useForhåndsvarselMutations', () => ({
    useForhåndsvarselMutations: vi.fn(),
    mapHarBrukerUttaltSegFraApiDto: vi.fn(),
}));

vi.mock('../../../generated', () => ({
    BrevmalkodeEnum: {
        VARSEL: 'VARSEL',
    },
}));

const lagForhåndsvarselInfo = (overrides?: Partial<ForhåndsvarselDto>): ForhåndsvarselDto => ({
    varselbrevDto: { varselbrevSendtTid: undefined },
    utsettUttalelseFrist: [],
    brukeruttalelse: undefined,
    ...overrides,
});

const setupMock = (): void => {
    mockUseToggles.mockImplementation(() => ({
        toggles: {
            [ToggleName.Forhåndsvarselsteg]: true,
        },
    }));
};

const renderForhåndsvarsel = (behandling: BehandlingDto = lagBehandlingDto()): RenderResult => {
    return render(
        <FagsakContext.Provider value={lagFagsak()}>
            <TestBehandlingProvider
                behandling={behandling}
                stateOverrides={{
                    actionBarStegtekst: (): string | undefined => 'Steg 2 av 5',
                }}
            >
                <QueryClientProvider client={createTestQueryClient()}>
                    <Forhåndsvarsel />
                </QueryClientProvider>
            </TestBehandlingProvider>
        </FagsakContext.Provider>
    );
};

describe('Forhåndsvarsel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        setupMock();

        vi.mocked(useForhåndsvarselQueries).mockReturnValue(lagForhåndsvarselQueries());
        vi.mocked(useForhåndsvarselMutations).mockReturnValue(lagForhåndsvarselMutations());
    });

    test('Viser radiogruppe med riktig spørsmål og beskrivelse', () => {
        renderForhåndsvarsel();

        expect(
            screen.getByRole('group', {
                name: /skal det sendes forhåndsvarsel om tilbakekreving/i,
            })
        ).toBeInTheDocument();

        expect(screen.getByText(/Brukeren skal som klar hovedregel varsles/)).toBeInTheDocument();
    });

    test('Viser alle radioknapp-alternativene', () => {
        renderForhåndsvarsel();

        expect(screen.getByLabelText('Ja')).toBeInTheDocument();
        expect(screen.getByLabelText('Nei')).toBeInTheDocument();
    });

    test('Viser skjema for opprettelse når Ja er valgt', async () => {
        renderForhåndsvarsel();

        expect(screen.queryByText(/Opprett forhåndsvarsel/)).not.toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Ja'));

        expect(await screen.findByText(/Opprett forhåndsvarsel/)).toBeInTheDocument();
    });

    test('Viser forhåndsvisning knapp når Ja er valgt og fritekst er fyllt ut', async () => {
        renderForhåndsvarsel();

        fireEvent.click(screen.getByLabelText('Ja'));

        expect(await screen.findByText(/Opprett forhåndsvarsel/)).toBeInTheDocument();
        const fritekstFelt = screen.getByLabelText(/Legg til utdypende tekst/i);
        fireEvent.change(fritekstFelt, { target: { value: 'Dette er en fritekst' } });

        expect(await screen.findByRole('button', { name: 'Forhåndsvis' })).toBeInTheDocument();
    });

    test('Viser skjema for unntak når Nei er valgt', () => {
        renderForhåndsvarsel();

        expect(screen.queryByText(/Velg begrunnelse for unntak/)).not.toBeInTheDocument();

        fireEvent.click(screen.getByLabelText('Nei'));

        expect(
            screen.getByRole('group', {
                name: /Velg begrunnelse for unntak fra forhåndsvarsel/,
            })
        ).toBeInTheDocument();
    });

    test('Viser ActionBar med riktig stegtekst', () => {
        renderForhåndsvarsel();

        expect(screen.getByText('Steg 2 av 5')).toBeInTheDocument();
    });

    test('Viser "Neste" som standard knappetekst', () => {
        renderForhåndsvarsel();

        expect(screen.getByRole('button', { name: 'Neste' })).toBeInTheDocument();
    });

    test('Viser tag med sendt informasjon når forhåndsvarsel er sendt', async () => {
        const mockQueries = vi.mocked(useForhåndsvarselQueries);
        mockQueries.mockReturnValue(
            lagForhåndsvarselQueries({
                forhåndsvarselInfo: lagForhåndsvarselInfo({
                    varselbrevDto: { varselbrevSendtTid: '2023-01-01T10:00:00Z' },
                }),
            })
        );

        renderForhåndsvarsel();

        expect(await screen.findByText(/Sendt/)).toBeInTheDocument();
        expect(screen.getByLabelText(/sendt/i)).toBeInTheDocument();
    });

    test('Låser valg når varsel er sendt', async () => {
        const mockQueries = vi.mocked(useForhåndsvarselQueries);
        mockQueries.mockReturnValue(
            lagForhåndsvarselQueries({
                forhåndsvarselInfo: lagForhåndsvarselInfo({
                    varselbrevDto: { varselbrevSendtTid: '2023-01-01T10:00:00Z' },
                }),
            })
        );

        renderForhåndsvarsel();

        const radioGroup = await screen.findByRole('group', {
            name: /skal det sendes forhåndsvarsel om tilbakekreving/i,
        });
        expect(radioGroup).toHaveClass('navds-fieldset--readonly');
    });

    describe('Viser "nei"-valg og default values når unntak er sendt inn', () => {
        test('IKKE_PRAKTISK_MULIG', async () => {
            const mockQueries = vi.mocked(useForhåndsvarselQueries);
            mockQueries.mockReturnValue(
                lagForhåndsvarselQueries({
                    forhåndsvarselInfo: lagForhåndsvarselInfo({
                        forhåndsvarselUnntak: {
                            begrunnelseForUnntak: 'IKKE_PRAKTISK_MULIG',
                            beskrivelse: 'Dette er en beskrivelse',
                        },
                    }),
                })
            );

            renderForhåndsvarsel();

            expect(await screen.findByRole('radio', { name: 'Nei' })).toBeChecked();
            expect(
                screen.getByRole('radio', {
                    name: /Varsling er ikke praktisk mulig eller vil hindre gjennomføring av vedtaket/,
                })
            ).toBeChecked();
            expect(
                screen.getByLabelText(/Forklar hvorfor forhåndsvarselet ikke skal bli sendt/)
            ).toHaveValue('Dette er en beskrivelse');
        });
    });

    describe('Validering', () => {
        test('Skal vise feilmelding dersom ingen Skalsendeforhåndsvarsel-alternativ er valgt', async () => {
            renderForhåndsvarsel(lagBehandlingDto({ varselSendt: false }));

            fireEvent.click(screen.getByRole('button', { name: 'Neste' }));

            expect(
                await screen.findByText('Du må velge om forhåndsvarselet skal sendes eller ikke')
            ).toBeInTheDocument();
        });

        describe("Når 'Ja' er valgt", () => {
            test('Vises feilmelding dersom fritekstfelt er tomt', async () => {
                renderForhåndsvarsel(lagBehandlingDto({ varselSendt: false }));

                fireEvent.click(screen.getByText('Ja'));
                const visMerKnapp = await screen.findByRole('button', { name: /Vis mer/ });
                fireEvent.click(visMerKnapp);
                fireEvent.click(screen.getByRole('button', { name: 'Send forhåndsvarsel' }));

                expect(await screen.findByText('Du må fylle inn en verdi')).toBeInTheDocument();
            });
        });
    });
});
