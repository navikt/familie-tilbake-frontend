import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';

import { BrevmottakerFormModal } from './BrevmottakerFormModal';
import { Fagsystem, Ytelsetype } from '../../../kodeverk';
import { MottakerType } from '../../../typer/Brevmottaker';
import { Målform } from '../../../typer/fagsak';
import { Kjønn } from '../../../typer/person';
import { RessursStatus } from '../../../typer/ressurs';

jest.mock('../../../hooks/useBrevmottakerApi', () => ({
    useBrevmottakerApi: jest.fn(() => ({
        lagreBrevmottaker: jest.fn().mockResolvedValue({
            status: RessursStatus.Suksess,
            data: 'success',
        }),
    })),
}));

jest.mock('../../../context/FagsakContext', () => ({
    useFagsak: jest.fn(() => ({
        fagsak: {
            status: RessursStatus.Suksess,
            data: {
                fagsystem: Fagsystem.EF,
                eksternFagsakId: 'test-fagsak-id',
                ytelsestype: Ytelsetype.Barnetilsyn,
                språkkode: Målform.Nb,
                bruker: {
                    navn: 'Test Bruker',
                    personIdent: '12345678901',
                    fødselsdato: '1990-01-01',
                    kjønn: Kjønn.Mann,
                },
                behandlinger: [],
            },
        },
    })),
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

        test('leggTil modus har ingen default valgt - bruker må velge', () => {
            const { getByLabelText } = renderBrevmottakerFormModal({ mode: 'leggTil' });

            const select = getByLabelText('Mottaker') as HTMLSelectElement;

            // Select elementet skal ha tom verdi (placeholder er valgt)
            expect(select.value).toBe('');

            // Ingen felter skal være synlige før valg
            expect(screen.queryByLabelText(/navn/i)).not.toBeInTheDocument();
            expect(screen.queryByLabelText(/velg land for brevmottaker/i)).not.toBeInTheDocument();
        });

        test('endre modus har ingen default valgt - bruker må velge', () => {
            const { getByLabelText } = renderBrevmottakerFormModal({ mode: 'endre' });

            const select = getByLabelText('Mottaker') as HTMLSelectElement;

            // Select elementet skal ha tom verdi (placeholder er valgt)
            expect(select.value).toBe('');

            // Ingen felter skal være synlige før valg
            expect(screen.queryByLabelText(/navn/i)).not.toBeInTheDocument();
            expect(screen.queryByLabelText(/velg land for brevmottaker/i)).not.toBeInTheDocument();
        });

        test('viser kun "Velg" placeholder før bruker velger mottakertype', () => {
            renderBrevmottakerFormModal({ mode: 'leggTil' });

            // Ingen spesifikke felter skal være synlige før valg av mottakertype
            expect(screen.queryByLabelText(/navn/i)).not.toBeInTheDocument();
            expect(screen.queryByLabelText(/velg land/i)).not.toBeInTheDocument();
            expect(screen.queryByLabelText(/fødselsnummer/i)).not.toBeInTheDocument();
            // Sjekk at radiogrupper for fullmektig/verge ikke vises
            expect(screen.queryByLabelText('Manuell registrering')).not.toBeInTheDocument();
            expect(screen.queryByLabelText('Oppslag i personregister')).not.toBeInTheDocument();
        });
    });

    const testManuellRegistreringFelter = async (user: UserEvent): Promise<void> => {
        const manuellRadio = await screen.findByLabelText('Manuell registrering');
        await user.click(manuellRadio);

        await waitFor(() => {
            expect(screen.getByLabelText(/navn/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/velg land/i)).toBeInTheDocument();
        });
    };

    const testManuellRegistreringMedUtenlandskAdresse = async (user: UserEvent): Promise<void> => {
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

    const testManuellRegistreringMedNorsk = async (user: UserEvent): Promise<void> => {
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

    const testLandvelgerMedNorge = async (user: UserEvent): Promise<void> => {
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

    const expectNavnfeltReadonly = async (): Promise<void> => {
        await waitFor(() => {
            const navnFelt = screen.getByLabelText(/navn/i);
            expect(navnFelt).toBeInTheDocument();
            expect(navnFelt).toHaveAttribute('readonly');
            expect(navnFelt).toHaveValue('Test Bruker');
        });
    };

    const expectLandvalgUtenNorge = async (): Promise<void> => {
        await waitFor(() => {
            const landSelect = screen.getByLabelText(/velg land for brevmottaker/i);
            expect(landSelect).toBeInTheDocument();

            const options = landSelect.querySelectorAll('option');
            const norgeOption = Array.from(options).find(option =>
                option.textContent?.toLowerCase().includes('norge')
            );
            expect(norgeOption).toBeUndefined();
        });
    };

    const expectAdresseFelterEtterLandvalg = async (user: UserEvent): Promise<void> => {
        const landSelect = await screen.findByLabelText(/velg land for brevmottaker/i);
        await user.type(landSelect, 'Sverige');
        await user.keyboard('[ArrowDown][Enter]');

        await waitFor(() => {
            expect(screen.getByLabelText(/adresselinje 1/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/adresselinje 2/i)).toBeInTheDocument();
        });
    };

    const selectMottakerAndWaitForRender = async (
        user: UserEvent,
        mottakerType: MottakerType
    ): Promise<void> => {
        const select = screen.getByLabelText('Mottaker');
        await user.selectOptions(select, mottakerType);

        await waitFor(() => {
            if (mottakerType === MottakerType.BrukerMedUtenlandskAdresse) {
                expect(screen.getByLabelText(/navn/i)).toBeInTheDocument();
            } else if (
                mottakerType === MottakerType.Fullmektig ||
                mottakerType === MottakerType.Verge
            ) {
                expect(screen.getByRole('group', { name: /adresse|verge/i })).toBeInTheDocument();
            } else if (mottakerType === MottakerType.Dødsbo) {
                expect(screen.getByLabelText(/navn/i)).toBeInTheDocument();
            }
        });
    };

    const expectFullmektigRadiogruppe = async (): Promise<void> => {
        await waitFor(() => {
            expect(screen.getByRole('group', { name: /adresse/i })).toBeInTheDocument();
            expect(screen.getByText('Manuell registrering')).toBeInTheDocument();
            expect(screen.getByText('Oppslag i personregister')).toBeInTheDocument();
            expect(screen.getByText('Oppslag i organisasjonsregister')).toBeInTheDocument();
        });
    };

    const expectOrganisasjonsregisterFelter = async (user: UserEvent): Promise<void> => {
        const orgRegisterRadio = await screen.findByLabelText('Oppslag i organisasjonsregister');
        await user.click(orgRegisterRadio);

        await waitFor(() => {
            expect(screen.getByLabelText(/organisasjonsnummer/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/kontaktperson i organisasjonen/i)).toBeInTheDocument();
        });
    };

    const expectVergeRadiogruppe = async (): Promise<void> => {
        await waitFor(() => {
            expect(screen.getByRole('group', { name: /verge/i })).toBeInTheDocument();
            expect(screen.getByText('Manuell registrering')).toBeInTheDocument();
            expect(screen.getByText('Oppslag i personregister')).toBeInTheDocument();
            expect(screen.queryByText('Oppslag i organisasjonsregister')).not.toBeInTheDocument();
        });
    };

    const expectDødsboNavnfelt = async (): Promise<void> => {
        await waitFor(() => {
            const navnFelt = screen.getByLabelText(/navn/i);
            expect(navnFelt).toBeInTheDocument();
            expect(navnFelt).toHaveAttribute('readonly');
            expect(navnFelt).toHaveValue('Test Bruker v/dødsbo');
        });
    };

    const expectLandFelt = async (): Promise<void> => {
        await waitFor(() => {
            expect(screen.getByLabelText(/velg land/i)).toBeInTheDocument();
        });
    };

    describe.each([
        { mode: 'endre' as const, modeDisplayName: 'Redigere brevmottaker' },
        { mode: 'leggTil' as const, modeDisplayName: 'Opprette brevmottaker' },
    ])('$modeDisplayName (mode: $mode)', ({ mode }) => {
        beforeEach(() => {
            renderBrevmottakerFormModal({ mode });
        });

        describe('Bruker med utenlandsk adresse', () => {
            beforeEach(async () => {
                await selectMottakerAndWaitForRender(user, MottakerType.BrukerMedUtenlandskAdresse);
            });

            test('Navnefelt skal være readonly og fyllt med brukerens navn', async () => {
                await expectNavnfeltReadonly();
            });

            test('skal vise Landevelger og Norge skal ikke være i listen', async () => {
                await expectLandvalgUtenNorge();
            });

            test('når Land er valgt skal det finnes adresselinje felter', async () => {
                await expectAdresseFelterEtterLandvalg(user);
            });
        });

        describe('Fullmektig', () => {
            beforeEach(async () => {
                await selectMottakerAndWaitForRender(user, MottakerType.Fullmektig);
            });

            test('skal vise radiogruppe med korrekte valg', async () => {
                await expectFullmektigRadiogruppe();
            });

            test('manuell registrering skal vise navn og land felter', async () => {
                await testManuellRegistreringFelter(user);
            });

            test('manuell registrering med utenlandsk adresse viser adressefelter', async () => {
                await testManuellRegistreringMedUtenlandskAdresse(user);
            });

            test('manuell registrering med Norge viser alle felter', async () => {
                await testManuellRegistreringMedNorsk(user);
            });

            test('oppslag i personregister skal vise fødselsnummer felt', async () => {
                await testOppslagIPersonregister(user);
            });

            test('oppslag i organisasjonsregister viser org.nr og kontaktperson', async () => {
                await expectOrganisasjonsregisterFelter(user);
            });
        });

        describe('Verge', () => {
            beforeEach(async () => {
                await selectMottakerAndWaitForRender(user, MottakerType.Verge);
            });

            test('skal vise radiogruppe uten organisasjonsregister valg', async () => {
                await expectVergeRadiogruppe();
            });

            test('manuell registrering skal vise navn og land felter', async () => {
                await testManuellRegistreringFelter(user);
            });

            test('manuell registrering med utenlandsk adresse viser adressefelter', async () => {
                await testManuellRegistreringMedUtenlandskAdresse(user);
            });

            test('manuell registrering med Norge viser alle felter', async () => {
                await testManuellRegistreringMedNorsk(user);
            });

            test('oppslag i personregister skal vise fødselsnummer felt', async () => {
                await testOppslagIPersonregister(user);
            });
        });

        describe('Dødsbo', () => {
            beforeEach(async () => {
                await selectMottakerAndWaitForRender(user, MottakerType.Dødsbo);
            });

            test('navn felt er disabled med brukerens navn v/dødsbo', async () => {
                await expectDødsboNavnfelt();
            });

            test('skal vise land felt', async () => {
                await expectLandFelt();
            });

            test('valg av Norge viser alle adressefelter', async () => {
                await testLandvelgerMedNorge(user);
            });
        });
    });
});
