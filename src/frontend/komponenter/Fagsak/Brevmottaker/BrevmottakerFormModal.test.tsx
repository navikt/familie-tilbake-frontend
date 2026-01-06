import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import * as React from 'react';

import { BrevmottakerFormModal } from './BrevmottakerFormModal';
import { FagsakContext } from '../../../context/FagsakContext';
import { Ytelsetype } from '../../../kodeverk';
import { lagFagsak } from '../../../testdata/fagsakFactory';
import { MottakerType } from '../../../typer/Brevmottaker';
import { RessursStatus } from '../../../typer/ressurs';

jest.mock('../../../hooks/useBrevmottakerApi', () => ({
    useBrevmottakerApi: jest.fn(() => ({
        lagreBrevmottaker: jest.fn().mockResolvedValue({
            status: RessursStatus.Suksess,
            data: 'success',
        }),
    })),
}));

const renderBrevmottakerFormModal = async (
    props: {
        mode?: 'endre' | 'leggTil';
        visBrevmottakerModal?: boolean;
    } = {}
): Promise<RenderResult> => {
    const defaultProps = {
        behandlingId: 'test-behandling-id',
        visBrevmottakerModal: true,
        settVisBrevmottakerModal: jest.fn(),
        settBrevmottakerIdTilEndring: jest.fn(),
        mode: 'leggTil' as const,
        ...props,
    };

    return await waitFor(() =>
        render(
            <FagsakContext.Provider value={lagFagsak({ ytelsestype: Ytelsetype.Barnetilsyn })}>
                <BrevmottakerFormModal {...defaultProps} />
            </FagsakContext.Provider>
        )
    );
};

describe('BrevmottakerFormModal', () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
        jest.clearAllMocks();
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
            expect(screen.getByRole('group', { name: /adresse/i })).toBeInTheDocument();
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

    const testRadioValidering = async (
        user: UserEvent,
        mode: 'endre' | 'leggTil'
    ): Promise<void> => {
        const submitButton = screen.getByRole('button', {
            name: mode === 'leggTil' ? 'Legg til' : 'Lagre endringer',
        });
        await user.click(submitButton);

        await waitFor(() => {
            expect(screen.getByText('Du må velge en adressetype')).toBeInTheDocument();
        });
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

        await waitFor(() => {
            expect(screen.getByText('Land er påkrevd')).toBeInTheDocument();
        });
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

        await waitFor(() => {
            expect(screen.getByText('Postnummer må være 4 siffer')).toBeInTheDocument();
        });
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

        await waitFor(() => {
            expect(
                screen.getByText('Fødselsnummer må være 11 sammenhengende siffer')
            ).toBeInTheDocument();
        });
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

        await waitFor(() => {
            expect(screen.getByText('Land er påkrevd')).toBeInTheDocument();
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

            test('Navn felt er disabled med brukerens navn v/dødsbo', async () => {
                await expectDødsboNavnfelt();
            });

            test('Skal vise land felt', async () => {
                await expectLandFelt();
            });

            test('Valg av Norge viser alle adressefelter', async () => {
                await testLandvelgerMedNorge(user);
            });

            test('Ved tomt land skal vise feilmelding', async () => {
                await testDødsboLandValidering(user, mode);
            });
        });
    });
});
