import type { IFagsak } from '../../../typer/fagsak';
import type { Ressurs } from '../../../typer/ressurs';
import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { mock } from 'jest-mock-extended';
import * as React from 'react';

import { BrevmottakerFormModal } from './BrevmottakerFormModal';
import { Fagsystem, Ytelsetype } from '../../../kodeverk';
import { MottakerType } from '../../../typer/Brevmottaker';
import { Målform } from '../../../typer/fagsak';
import { RessursStatus } from '../../../typer/ressurs';

const mockUseBrevmottakerApi = jest.fn();
const mockUseFagsak = jest.fn();

jest.mock('../../../hooks/useBrevmottakerApi', () => ({
    useBrevmottakerApi: (): object => mockUseBrevmottakerApi(),
}));

jest.mock('../../../context/FagsakContext', () => ({
    useFagsak: (): object => mockUseFagsak(),
}));

jest.mock('../../../context/AppContext', () => ({
    AppProvider: ({ children }: { children: React.ReactNode }): React.ReactElement => (
        <div>{children}</div>
    ),
}));

jest.mock('../../../context/BehandlingContext', () => ({
    BehandlingProvider: ({ children }: { children: React.ReactNode }): React.ReactElement => (
        <div>{children}</div>
    ),
}));

const renderBrevmottakerFormModal = (
    props: {
        mode?: 'endre' | 'leggTil';
        visBrevmottakerModal?: boolean;
        initialData?: object;
        mottakerId?: string;
    } = {}
): RenderResult => {
    const defaultProps = {
        behandlingId: 'test-behandling-id',
        visBrevmottakerModal: true,
        settVisBrevmottakerModal: jest.fn(),
        settBrevmottakerIdTilEndring: jest.fn(),
        mode: 'leggTil' as const,
        ...props,
    };

    return render(<BrevmottakerFormModal {...defaultProps} />);
};

describe('BrevmottakerFormModal', () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
        jest.clearAllMocks();

        const mockFagsak = mock<IFagsak>({
            fagsystem: Fagsystem.EF,
            eksternFagsakId: 'test-fagsak-id',
            ytelsestype: Ytelsetype.Barnetilsyn,
            språkkode: Målform.Nb,
            bruker: {
                navn: 'Test Bruker',
                personIdent: '12345678901',
            },
        });

        mockUseFagsak.mockImplementation(() => ({
            fagsak: {
                status: 'SUKSESS',
                data: mockFagsak,
            },
        }));

        mockUseBrevmottakerApi.mockImplementation(() => ({
            lagreBrevmottaker: jest.fn().mockResolvedValue(
                mock<Ressurs<string>>({
                    status: RessursStatus.Suksess,
                    data: 'success',
                })
            ),
        }));
    });

    describe('Grunnleggende rendering', () => {
        test('viser modal med riktig tittel for legg til modus', () => {
            renderBrevmottakerFormModal({ mode: 'leggTil' });
            expect(screen.getByText('Legg til brevmottaker')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Legg til' })).toBeInTheDocument();
        });

        test('viser modal med riktig tittel for endre modus', () => {
            renderBrevmottakerFormModal({ mode: 'endre' });
            expect(screen.getByText('Endre brevmottaker')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Lagre endringer' })).toBeInTheDocument();
        });

        test('viser ikke modal når visBrevmottakerModal er false', () => {
            renderBrevmottakerFormModal({ visBrevmottakerModal: false });
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });
    });

    const testManuellRegistreringFields = async (user: UserEvent): Promise<void> => {
        const manuellRadio = await screen.findByLabelText('Manuell registrering');
        await user.click(manuellRadio);

        await waitFor(() => {
            expect(screen.getByLabelText(/navn/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/velg land/i)).toBeInTheDocument();
        });
    };

    const testManuellRegistreringWithUtenlandskAdresse = async (user: UserEvent): Promise<void> => {
        const manuellRadio = await screen.findByLabelText('Manuell registrering');
        await user.click(manuellRadio);

        const landSelect = await screen.findByLabelText(/velg land/i);
        await user.type(landSelect, 'Sverige');
        await user.keyboard('[ArrowDown][Enter]');

        await waitFor(() => {
            expect(screen.getByLabelText(/adresselinje 1/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/adresselinje 2/i)).toBeInTheDocument();
        });
    };

    const testManuellRegistreringWithNorge = async (user: UserEvent): Promise<void> => {
        const manuellRadio = await screen.findByLabelText('Manuell registrering');
        await user.click(manuellRadio);

        const landSelect = await screen.findByLabelText(/velg land/i);
        await user.type(landSelect, 'Norge');
        await user.keyboard('[ArrowDown][Enter]');

        await waitFor(() => {
            expect(screen.getByLabelText(/adresselinje 1/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/adresselinje 2/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/postnummer/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/poststed/i)).toBeInTheDocument();
        });
    };

    const testOppslagIPersonregister = async (user: UserEvent): Promise<void> => {
        const personregisterRadio = await screen.findByLabelText('Oppslag i personregister');
        await user.click(personregisterRadio);

        await waitFor(() => {
            expect(screen.getByLabelText(/fødselsnummer/i)).toBeInTheDocument();
        });
    };

    const testLandSelectionWithNorge = async (user: UserEvent): Promise<void> => {
        const landSelect = await screen.findByLabelText(/velg land/i);
        await user.type(landSelect, 'Norge');
        await user.keyboard('[ArrowDown][Enter]');

        await waitFor(() => {
            expect(screen.getByLabelText(/adresselinje 1/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/adresselinje 2/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/postnummer/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/poststed/i)).toBeInTheDocument();
        });
    };

    describe('Brevmottakerskjema', () => {
        beforeEach(() => {
            renderBrevmottakerFormModal({ mode: 'endre' });
        });

        describe('Bruker med utenlandsk adresse', () => {
            beforeEach(async () => {
                const select = screen.getByLabelText('Mottaker');
                await user.selectOptions(select, MottakerType.BrukerMedUtenlandskAdresse);
            });

            test('navn-felt skal være disablet og fyllt med brukerens navn', async () => {
                await waitFor(() => {
                    const navnFelt = screen.getByLabelText(/navn/i);
                    expect(navnFelt).toBeInTheDocument();
                    expect(navnFelt).toHaveAttribute('readonly');
                    expect(navnFelt).toHaveValue('Test Bruker');
                });
            });

            test('skal vise Land-select og Norge skal ikke være i listen', async () => {
                await waitFor(() => {
                    const landSelect = screen.getByLabelText(/velg land for brevmottaker/i);
                    expect(landSelect).toBeInTheDocument();

                    const options = landSelect.querySelectorAll('option');
                    const norgeOption = Array.from(options).find(option =>
                        option.textContent?.toLowerCase().includes('norge')
                    );
                    expect(norgeOption).toBeUndefined();
                });
            });

            test('når Land er valgt skal det finnes adresselinje felter', async () => {
                const landSelect = await screen.findByLabelText(/velg land for brevmottaker/i);
                await user.type(landSelect, 'Sverige');

                await user.keyboard('[ArrowDown][Enter]');

                await waitFor(() => {
                    expect(screen.getByLabelText(/adresselinje 1/i)).toBeInTheDocument();
                    expect(screen.getByLabelText(/adresselinje 2/i)).toBeInTheDocument();
                });
            });
        });

        describe('Fullmektig', () => {
            beforeEach(async () => {
                const select = screen.getByLabelText('Mottaker');
                await user.selectOptions(select, MottakerType.Fullmektig);
            });

            test('skal vise radiogruppe med korrekte valg', async () => {
                await waitFor(() => {
                    expect(screen.getByRole('group', { name: /adresse/i })).toBeInTheDocument();
                    expect(screen.getByText('Manuell registrering')).toBeInTheDocument();
                    expect(screen.getByText('Oppslag i personregister')).toBeInTheDocument();
                    expect(screen.getByText('Oppslag i organisasjonsregister')).toBeInTheDocument();
                });
            });

            test('manuell registrering skal vise navn og land felter', async () => {
                await testManuellRegistreringFields(user);
            });

            test('manuell registrering med utenlandsk adresse viser adressefelter', async () => {
                await testManuellRegistreringWithUtenlandskAdresse(user);
            });

            test('manuell registrering med Norge viser alle felter', async () => {
                await testManuellRegistreringWithNorge(user);
            });

            test('oppslag i personregister skal vise fødselsnummer felt', async () => {
                await testOppslagIPersonregister(user);
            });

            test('oppslag i organisasjonsregister viser org.nr og kontaktperson', async () => {
                const orgRegisterRadio = await screen.findByLabelText(
                    'Oppslag i organisasjonsregister'
                );
                await user.click(orgRegisterRadio);

                await waitFor(() => {
                    expect(screen.getByLabelText(/organisasjonsnummer/i)).toBeInTheDocument();
                    expect(
                        screen.getByLabelText(/kontaktperson i organisasjonen/i)
                    ).toBeInTheDocument();
                });
            });
        });

        describe('Verge', () => {
            beforeEach(async () => {
                const select = screen.getByLabelText('Mottaker');
                await user.selectOptions(select, MottakerType.Verge);
            });

            test('skal vise radiogruppe uten organisasjonsregister valg', async () => {
                await waitFor(() => {
                    expect(screen.getByRole('group', { name: /verge/i })).toBeInTheDocument();
                    expect(screen.getByText('Manuell registrering')).toBeInTheDocument();
                    expect(screen.getByText('Oppslag i personregister')).toBeInTheDocument();
                    expect(
                        screen.queryByText('Oppslag i organisasjonsregister')
                    ).not.toBeInTheDocument();
                });
            });

            test('manuell registrering skal vise navn og land felter', async () => {
                await testManuellRegistreringFields(user);
            });

            test('manuell registrering med utenlandsk adresse viser adressefelter', async () => {
                await testManuellRegistreringWithUtenlandskAdresse(user);
            });

            test('manuell registrering med Norge viser alle felter', async () => {
                await testManuellRegistreringWithNorge(user);
            });

            test('oppslag i personregister skal vise fødselsnummer felt', async () => {
                await testOppslagIPersonregister(user);
            });
        });

        describe('Dødsbo', () => {
            beforeEach(async () => {
                const select = screen.getByLabelText('Mottaker');
                await user.selectOptions(select, MottakerType.Dødsbo);
            });

            test('navn felt er disabled med brukerens navn v/dødsbo', async () => {
                await waitFor(() => {
                    const navnFelt = screen.getByLabelText(/navn/i);
                    expect(navnFelt).toBeInTheDocument();
                    expect(navnFelt).toHaveAttribute('readonly');
                    expect(navnFelt).toHaveValue('Test Bruker v/dødsbo');
                });
            });

            test('skal vise land felt', async () => {
                await waitFor(() => {
                    expect(screen.getByLabelText(/velg land/i)).toBeInTheDocument();
                });
            });

            test('valg av Norge viser alle adressefelter', async () => {
                await testLandSelectionWithNorge(user);
            });
        });
    });
});
