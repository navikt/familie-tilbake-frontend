import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { FagsakContext } from '~/context/FagsakContext';
import { Ytelsetype } from '~/kodeverk';
import { TestBehandlingProvider } from '~/testdata/behandlingContextFactory';
import { lagBehandling } from '~/testdata/behandlingFactory';
import { lagFagsak } from '~/testdata/fagsakFactory';
import { MottakerType } from '~/typer/Brevmottaker';

import { BrevmottakerFormModal } from './BrevmottakerFormModal';

const mockLagreBrevmottaker = vi.fn().mockResolvedValue({ success: true });

vi.mock('~/hooks/useBrevmottakerApi', () => ({
    useBrevmottakerApi: vi.fn(() => ({
        lagreBrevmottaker: mockLagreBrevmottaker,
    })),
}));

const renderBrevmottakerFormModal = async (
    props: {
        mode?: 'endre' | 'leggTil';
        visBrevmottakerModal?: boolean;
    } = {}
): Promise<RenderResult> => {
    const defaultProps = {
        visBrevmottakerModal: true,
        settVisBrevmottakerModal: vi.fn(),
        settBrevmottakerIdTilEndring: vi.fn(),
        mode: 'leggTil' as const,
        ...props,
    };

    return await waitFor(() =>
        render(
            <FagsakContext value={lagFagsak({ ytelsestype: Ytelsetype.Barnetilsyn })}>
                <TestBehandlingProvider behandling={lagBehandling()}>
                    <BrevmottakerFormModal {...defaultProps} />
                </TestBehandlingProvider>
            </FagsakContext>
        )
    );
};

describe('BrevmottakerFormModal', () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    describe('Grunnleggende rendering', () => {
        test('Viser modal med riktig tittel for legg til modus', () => {
            renderBrevmottakerFormModal({ mode: 'leggTil' });
            expect(screen.getByText('Legg til brevmottaker')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Legg til' })).toBeInTheDocument();
        });

        test('Viser modal med riktig tittel for endre modus', () => {
            renderBrevmottakerFormModal({ mode: 'endre' });
            expect(screen.getByText('Endre brevmottaker')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Lagre endringer' })).toBeInTheDocument();
        });

        test('Viser ikke modal når visBrevmottakerModal er false', () => {
            renderBrevmottakerFormModal({ visBrevmottakerModal: false });
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        test('leggTil modus har ingen default valgt - bruker må velge', async () => {
            const { getByLabelText } = await renderBrevmottakerFormModal({ mode: 'leggTil' });

            const select = getByLabelText('Mottaker') as HTMLSelectElement;

            expect(select.value).toBe('');

            expect(screen.queryByLabelText(/navn/i)).not.toBeInTheDocument();
            expect(screen.queryByLabelText(/velg land for brevmottaker/i)).not.toBeInTheDocument();
        });
    });

    const testManuellRegistreringFelter = async (user: UserEvent): Promise<void> => {
        const manuellRadio = await screen.findByLabelText('Manuell registrering');
        await user.click(manuellRadio);

        expect(screen.getByLabelText(/navn/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/velg land/i)).toBeInTheDocument();
    };

    const testManuellRegistreringMedUtenlandskAdresse = async (user: UserEvent): Promise<void> => {
        const manuellRadio = await screen.findByLabelText('Manuell registrering');
        await user.click(manuellRadio);

        const landSelect = await screen.findByLabelText(/velg land/i);
        await user.type(landSelect, 'Sverige');
        await user.keyboard('[ArrowDown][Enter]');

        expect(screen.getByLabelText(/adresselinje 1/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/adresselinje 2/i)).toBeInTheDocument();
    };

    const testManuellRegistreringMedNorsk = async (user: UserEvent): Promise<void> => {
        const manuellRadio = await screen.findByLabelText('Manuell registrering');
        await user.click(manuellRadio);

        const landSelect = await screen.findByLabelText(/velg land/i);
        await user.type(landSelect, 'Norge');
        await user.keyboard('[ArrowDown][Enter]');

        expect(screen.getByLabelText(/adresselinje 1/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/adresselinje 2/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/postnummer/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/poststed/i)).toBeInTheDocument();
    };

    const testOppslagIPersonregister = async (user: UserEvent): Promise<void> => {
        const personregisterRadio = await screen.findByLabelText('Oppslag i personregister');
        await user.click(personregisterRadio);

        expect(screen.getByLabelText(/fødselsnummer/i)).toBeInTheDocument();
    };

    const testLandvelgerMedNorge = async (user: UserEvent): Promise<void> => {
        const landSelect = await screen.findByLabelText(/velg land/i);
        await user.type(landSelect, 'Norge');
        await user.keyboard('[ArrowDown][Enter]');

        expect(screen.getByLabelText(/adresselinje 1/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/adresselinje 2/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/postnummer/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/poststed/i)).toBeInTheDocument();
    };

    const expectNavnfeltReadonly = (): void => {
        const navnFelt = screen.getByLabelText(/navn/i);
        expect(navnFelt).toBeInTheDocument();
        expect(navnFelt).toHaveAttribute('readonly');
        expect(navnFelt).toHaveValue('Test Bruker');
    };

    const expectLandvalgUtenNorge = (): void => {
        const landSelect = screen.getByLabelText(/velg land for brevmottaker/i);
        expect(landSelect).toBeInTheDocument();

        const options = landSelect.querySelectorAll('option');
        const norgeOption = Array.from(options).find(option =>
            option.textContent?.toLowerCase().includes('norge')
        );
        expect(norgeOption).toBeUndefined();
    };

    const expectAdresseFelterEtterLandvalg = async (user: UserEvent): Promise<void> => {
        const landSelect = await screen.findByLabelText(/velg land for brevmottaker/i);
        await user.type(landSelect, 'Sverige');
        await user.keyboard('[ArrowDown][Enter]');

        expect(screen.getByLabelText(/adresselinje 1/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/adresselinje 2/i)).toBeInTheDocument();
    };

    const selectMottakerAndWaitForRender = async (
        user: UserEvent,
        mottakerType: MottakerType
    ): Promise<void> => {
        const select = screen.getByLabelText('Mottaker');
        await user.selectOptions(select, mottakerType);

        if (mottakerType === MottakerType.BrukerMedUtenlandskAdresse) {
            expect(screen.getByLabelText(/navn/i)).toBeInTheDocument();
        } else if (
            mottakerType === MottakerType.Fullmektig ||
            mottakerType === MottakerType.Verge
        ) {
            expect(screen.getByRole('radiogroup', { name: /adresse|verge/i })).toBeInTheDocument();
        } else if (mottakerType === MottakerType.Dødsbo) {
            expect(screen.getByLabelText(/navn/i)).toBeInTheDocument();
        }
    };

    const expectFullmektigRadiogruppe = (): void => {
        expect(screen.getByRole('radiogroup', { name: /adresse/i })).toBeInTheDocument();
        expect(screen.getByText('Manuell registrering')).toBeInTheDocument();
        expect(screen.getByText('Oppslag i personregister')).toBeInTheDocument();
        expect(screen.getByText('Oppslag i organisasjonsregister')).toBeInTheDocument();
    };

    const expectOrganisasjonsregisterFelter = async (user: UserEvent): Promise<void> => {
        const orgRegisterRadio = await screen.findByLabelText('Oppslag i organisasjonsregister');
        await user.click(orgRegisterRadio);

        expect(screen.getByLabelText(/organisasjonsnummer/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/kontaktperson i organisasjonen/i)).toBeInTheDocument();
    };

    const expectVergeRadiogruppe = (): void => {
        expect(screen.getByRole('radiogroup', { name: /adresse/i })).toBeInTheDocument();
        expect(screen.getByText('Manuell registrering')).toBeInTheDocument();
        expect(screen.getByText('Oppslag i personregister')).toBeInTheDocument();
        expect(screen.queryByText('Oppslag i organisasjonsregister')).not.toBeInTheDocument();
    };

    const testRadioValidering = async (
        user: UserEvent,
        mode: 'endre' | 'leggTil'
    ): Promise<void> => {
        const submitButton = screen.getByRole('button', {
            name: mode === 'leggTil' ? 'Legg til' : 'Lagre endringer',
        });
        await user.click(submitButton);

        expect(screen.getByText('Du må velge en adressetype')).toBeInTheDocument();
    };

    const testManuellRegistreringUtenLand = async (
        user: UserEvent,
        mode: 'endre' | 'leggTil',
        navn = 'Test Navn'
    ): Promise<void> => {
        const manuellRadio = await screen.findByLabelText('Manuell registrering');
        await user.click(manuellRadio);

        const navnInput = await screen.findByLabelText(/navn/i);
        await user.type(navnInput, navn);

        const submitButton = screen.getByRole('button', {
            name: mode === 'leggTil' ? 'Legg til' : 'Lagre endringer',
        });
        await user.click(submitButton);

        expect(screen.getByText('Land er påkrevd')).toBeInTheDocument();
    };

    const testPostnummerValidering = async (
        user: UserEvent,
        mode: 'endre' | 'leggTil'
    ): Promise<void> => {
        const manuellRadio = await screen.findByLabelText('Manuell registrering');
        await user.click(manuellRadio);

        const navnInput = await screen.findByLabelText(/navn/i);
        await user.type(navnInput, 'Test Navn');

        const landSelect = await screen.findByLabelText(/velg land/i);
        await user.type(landSelect, 'Norge');
        await user.keyboard('[ArrowDown][Enter]');

        const adresseInput = await screen.findByLabelText(/adresselinje 1/i);
        await user.type(adresseInput, 'Test Adresse 123');

        const postnummerInput = await screen.findByLabelText(/postnummer/i);
        await user.type(postnummerInput, 'abc123');

        const poststedInput = await screen.findByLabelText(/poststed/i);
        await user.type(poststedInput, 'Oslo');

        const submitButton = screen.getByRole('button', {
            name: mode === 'leggTil' ? 'Legg til' : 'Lagre endringer',
        });
        await user.click(submitButton);

        expect(screen.getByText('Postnummer må være 4 siffer')).toBeInTheDocument();
    };

    const testFødselsnummerValidering = async (
        user: UserEvent,
        mode: 'endre' | 'leggTil'
    ): Promise<void> => {
        const personregisterRadio = await screen.findByLabelText('Oppslag i personregister');
        await user.click(personregisterRadio);

        const fødselsnummerInput = await screen.findByLabelText(/fødselsnummer/i);
        await user.type(fødselsnummerInput, '1234567890');

        const submitButton = screen.getByRole('button', {
            name: mode === 'leggTil' ? 'Legg til' : 'Lagre endringer',
        });
        await user.click(submitButton);

        expect(
            screen.getByText('Fødselsnummer må være 11 sammenhengende siffer')
        ).toBeInTheDocument();
    };

    const testDødsboLandValidering = async (
        user: UserEvent,
        mode: 'endre' | 'leggTil'
    ): Promise<void> => {
        const navnInput = await screen.findByLabelText(/navn/i);
        await user.type(navnInput, 'Test Dødsbo');

        const submitButton = screen.getByRole('button', {
            name: mode === 'leggTil' ? 'Legg til' : 'Lagre endringer',
        });
        await user.click(submitButton);

        expect(screen.getByText('Land er påkrevd')).toBeInTheDocument();
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

            test('Skal vise Landevelger og Norge skal ikke være i listen', async () => {
                await expectLandvalgUtenNorge();
            });

            test('Når Land er valgt skal det finnes adresselinje felter', async () => {
                await expectAdresseFelterEtterLandvalg(user);
            });
        });

        describe('Fullmektig', () => {
            beforeEach(async () => {
                await selectMottakerAndWaitForRender(user, MottakerType.Fullmektig);
            });

            test('Skal vise radiogruppe med korrekte valg', async () => {
                await expectFullmektigRadiogruppe();
            });

            test('Manuell registrering skal vise navn og land felter', async () => {
                await testManuellRegistreringFelter(user);
            });

            test('Manuell registrering med utenlandsk adresse viser adressefelter', async () => {
                await testManuellRegistreringMedUtenlandskAdresse(user);
            });

            test('Manuell registrering med Norge viser alle felter', async () => {
                await testManuellRegistreringMedNorsk(user);
            });

            test('Oppslag i personregister skal vise fødselsnummer felt', async () => {
                await testOppslagIPersonregister(user);
            });

            test('Oppslag i organisasjonsregister viser org.nr og kontaktperson', async () => {
                await expectOrganisasjonsregisterFelter(user);
            });

            test('Trykker på submit uten å ha valgt radio, skal vise feilmelding', async () => {
                await testRadioValidering(user, mode);
            });

            test('Manuell registrering uten land skal vise feilmelding', async () => {
                await testManuellRegistreringUtenLand(user, mode);
            });

            test('Manuell registrering Norge skal validere postnummer', async () => {
                await testPostnummerValidering(user, mode);
            });

            test('Oppslag personregister med ugyldig nummer skal vise feilmelding', async () => {
                await testFødselsnummerValidering(user, mode);
            });

            test.todo('Oppslag personregister skal trimme mellomrom fra organisasjonsnummer');
        });

        describe('Verge', () => {
            beforeEach(async () => {
                await selectMottakerAndWaitForRender(user, MottakerType.Verge);
            });

            test('Skal vise radiogruppe uten organisasjonsregister valg', async () => {
                await expectVergeRadiogruppe();
            });

            test('Manuell registrering skal vise navn og land felter', async () => {
                await testManuellRegistreringFelter(user);
            });

            test('Manuell registrering med utenlandsk adresse viser adressefelter', async () => {
                await testManuellRegistreringMedUtenlandskAdresse(user);
            });

            test('Manuell registrering med Norge viser alle felter', async () => {
                await testManuellRegistreringMedNorsk(user);
            });

            test('Oppslag i personregister skal vise fødselsnummer felt', async () => {
                await testOppslagIPersonregister(user);
            });

            test('Ingen validering på radio-valg når man trykker submit', async () => {
                await testRadioValidering(user, mode);
            });

            test('Ved tomt land skal vise feilmelding', async () => {
                await testManuellRegistreringUtenLand(user, mode, 'Test Verge');
            });
        });

        describe('Dødsbo', () => {
            beforeEach(async () => {
                await selectMottakerAndWaitForRender(user, MottakerType.Dødsbo);
            });

            test('Navn felt er disabled med brukerens navn v/dødsbo', () => {
                const navnFelt = screen.getByLabelText(/navn/i);
                expect(navnFelt).toBeInTheDocument();
                expect(navnFelt).toHaveAttribute('readonly');
                expect(navnFelt).toHaveValue('Test Bruker v/dødsbo');
            });

            test('Skal vise land felt', () => {
                expect(screen.getByLabelText(/velg land/i)).toBeInTheDocument();
            });

            test('Valg av Norge viser alle adressefelter', async () => {
                await testLandvelgerMedNorge(user);
            });

            test('Ved tomt land skal vise feilmelding', async () => {
                await testDødsboLandValidering(user, mode);
            });
        });
    });

    describe('Innsending av Dødsbo med norsk adresse', () => {
        beforeEach(async () => {
            mockLagreBrevmottaker.mockResolvedValue({ success: true });
            await renderBrevmottakerFormModal({ mode: 'leggTil' });
        });

        test('Sender postnummer og poststed i payload', async () => {
            const select = screen.getByLabelText('Mottaker');
            await user.selectOptions(select, MottakerType.Dødsbo);

            expect(screen.getByLabelText(/navn/i)).toBeInTheDocument();

            const landSelect = await screen.findByLabelText(/velg land/i);
            await user.type(landSelect, 'Norge');
            await user.keyboard('[ArrowDown][Enter]');

            const adresseInput = await screen.findByLabelText(/adresselinje 1/i);
            await user.type(adresseInput, 'Testveien 1');

            const postnummerInput = await screen.findByLabelText(/postnummer/i);
            await user.type(postnummerInput, '0123');

            const poststedInput = await screen.findByLabelText(/poststed/i);
            await user.type(poststedInput, 'Oslo');

            const submitButton = screen.getByRole('button', { name: 'Legg til' });
            await user.click(submitButton);

            expect(mockLagreBrevmottaker).toHaveBeenCalledWith(
                expect.objectContaining({
                    type: 'DØDSBO',
                    manuellAdresseInfo: expect.objectContaining({
                        postnummer: '0123',
                        poststed: 'Oslo',
                        landkode: 'NO',
                        adresselinje1: 'Testveien 1',
                    }),
                }),
                undefined
            );
        });
    });
});
