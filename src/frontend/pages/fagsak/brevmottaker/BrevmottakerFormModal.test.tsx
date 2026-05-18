import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';

import { render, screen, waitFor, within } from '@testing-library/react';
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
const adresseRadioGroup = (): HTMLElement => screen.getByRole('radiogroup', { name: /Adresse/i });
const manuellRegistreringRadio = (): HTMLElement =>
    within(adresseRadioGroup()).getByRole('radio', { name: 'Manuell registrering' });
const oppslagIPersonregisterRadio = (): HTMLElement =>
    within(adresseRadioGroup()).getByRole('radio', { name: 'Oppslag i personregister' });
const oppslagIOrganisasjonsregisterRadio = (): HTMLElement =>
    within(adresseRadioGroup()).getByRole('radio', { name: 'Oppslag i organisasjonsregister' });

const velgLandCombobox = (): HTMLElement =>
    screen.getByRole('combobox', { name: /velg land for brevmottaker/i });

const mottakerCombobox = (): HTMLElement => screen.getByRole('combobox', { name: /mottaker/i });

const navnInput = (): HTMLElement => screen.getByRole('textbox', { name: /navn/i });
const adresseInput = (): HTMLElement => screen.getByRole('textbox', { name: /adresselinje 1/i });
const adresse2Input = (): HTMLElement => screen.getByRole('textbox', { name: /adresselinje 2/i });
const postnummerInput = (): HTMLElement => screen.getByRole('textbox', { name: /postnummer/i });
const poststedInput = (): HTMLElement => screen.getByRole('textbox', { name: /poststed/i });
const fødselsnummerInput = (): HTMLElement =>
    screen.getByRole('textbox', { name: /fødselsnummer/i });

const leggTilKnapp = (): HTMLElement => screen.getByRole('button', { name: 'Legg til' });
const lagreEndringerKnapp = (): HTMLElement =>
    screen.getByRole('button', { name: 'Lagre endringer' });

const velgLand = async (user: UserEvent, land: string): Promise<void> => {
    await user.click(velgLandCombobox());
    await user.click(await screen.findByRole('option', { name: land }));
};

const testManuellRegistreringFelter = async (user: UserEvent): Promise<void> => {
    await user.click(manuellRegistreringRadio());
    expect(navnInput()).toBeInTheDocument();
    expect(velgLandCombobox()).toBeInTheDocument();
};

const testManuellRegistreringMedUtenlandskAdresse = async (user: UserEvent): Promise<void> => {
    await user.click(manuellRegistreringRadio());
    await velgLand(user, 'Sverige');

    expect(adresseInput()).toBeInTheDocument();
    expect(adresse2Input()).toBeInTheDocument();
};

const testManuellRegistreringMedNorsk = async (user: UserEvent): Promise<void> => {
    await user.click(manuellRegistreringRadio());
    await velgLand(user, 'Norge');

    expect(adresseInput()).toBeInTheDocument();
    expect(adresse2Input()).toBeInTheDocument();
    expect(postnummerInput()).toBeInTheDocument();
    expect(poststedInput()).toBeInTheDocument();
};

const testOppslagIPersonregister = async (user: UserEvent): Promise<void> => {
    await user.click(oppslagIPersonregisterRadio());
    expect(fødselsnummerInput()).toBeInTheDocument();
};

const selectMottakerAndWaitForRender = async (
    user: UserEvent,
    mottakerType: MottakerType
): Promise<void> => {
    await user.selectOptions(mottakerCombobox(), mottakerType);

    if (
        mottakerType === MottakerType.BrukerMedUtenlandskAdresse ||
        mottakerType === MottakerType.Dødsbo
    ) {
        expect(navnInput()).toBeInTheDocument();
    } else if (mottakerType === MottakerType.Fullmektig || mottakerType === MottakerType.Verge) {
        expect(screen.getByRole('radiogroup', { name: /adresse|verge/i })).toBeInTheDocument();
    }
};

const testRadioValidering = async (user: UserEvent, mode: 'endre' | 'leggTil'): Promise<void> => {
    const submitButton = mode === 'leggTil' ? leggTilKnapp() : lagreEndringerKnapp();
    await user.click(submitButton);

    expect(screen.getByText('Du må velge en adressetype')).toBeInTheDocument();
};

const testManuellRegistreringUtenLand = async (
    user: UserEvent,
    mode: 'endre' | 'leggTil',
    navn = 'Test Navn'
): Promise<void> => {
    await user.click(manuellRegistreringRadio());
    await user.type(navnInput(), navn);
    const submitButton = mode === 'leggTil' ? leggTilKnapp() : lagreEndringerKnapp();
    await user.click(submitButton);

    expect(screen.getByText('Land er påkrevd')).toBeInTheDocument();
};

describe('BrevmottakerFormModal', () => {
    let user: UserEvent;

    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    describe('Grunnleggende rendering', () => {
        test('Viser modal med riktig tittel for legg til modus', async () => {
            await renderBrevmottakerFormModal({ mode: 'leggTil' });
            expect(screen.getByText('Legg til brevmottaker')).toBeInTheDocument();
            expect(leggTilKnapp()).toBeInTheDocument();
        });

        test('Viser modal med riktig tittel for endre modus', async () => {
            await renderBrevmottakerFormModal({ mode: 'endre' });
            expect(screen.getByText('Endre brevmottaker')).toBeInTheDocument();
            expect(lagreEndringerKnapp()).toBeInTheDocument();
        });

        test('Viser ikke modal når visBrevmottakerModal er false', async () => {
            renderBrevmottakerFormModal({ visBrevmottakerModal: false });
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        test('leggTil modus har ingen default valgt - bruker må velge', async () => {
            await renderBrevmottakerFormModal({ mode: 'leggTil' });
            expect(mottakerCombobox()).toHaveValue('');
            expect(screen.queryByRole('textbox', { name: /navn/i })).not.toBeInTheDocument();
            expect(
                screen.queryByRole('combobox', { name: /velg land for brevmottaker/i })
            ).not.toBeInTheDocument();
        });
    });

    describe.each([
        { mode: 'endre' as const, modeDisplayName: 'Redigere brevmottaker' },
        { mode: 'leggTil' as const, modeDisplayName: 'Opprette brevmottaker' },
    ])('$modeDisplayName (mode: $mode)', ({ mode }) => {
        beforeEach(async () => {
            await renderBrevmottakerFormModal({ mode });
        });

        describe('Bruker med utenlandsk adresse', () => {
            beforeEach(async () => {
                await selectMottakerAndWaitForRender(user, MottakerType.BrukerMedUtenlandskAdresse);
            });

            test('Navnefelt skal være readonly og fyllt med brukerens navn', async () => {
                expect(navnInput()).toHaveAttribute('readonly');
                expect(navnInput()).toHaveValue('Test Bruker');
            });

            test('Skal vise Landevelger og Norge skal ikke være i listen', async () => {
                const options = velgLandCombobox().querySelectorAll('option');
                const norgeOption = Array.from(options).find(option =>
                    option.textContent?.toLowerCase().includes('norge')
                );
                expect(norgeOption).toBeUndefined();
            });

            test('Når Land er valgt skal det finnes adresselinje felter', async () => {
                await velgLand(user, 'Sverige');

                expect(adresseInput()).toBeInTheDocument();
                expect(adresse2Input()).toBeInTheDocument();
            });
        });

        describe('Fullmektig', () => {
            beforeEach(async () => {
                await selectMottakerAndWaitForRender(user, MottakerType.Fullmektig);
            });

            test('Skal vise radiogruppe med korrekte valg', async () => {
                expect(manuellRegistreringRadio()).toBeInTheDocument();
                expect(oppslagIPersonregisterRadio()).toBeInTheDocument();
                expect(oppslagIOrganisasjonsregisterRadio()).toBeInTheDocument();
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
                await user.click(oppslagIOrganisasjonsregisterRadio());

                expect(screen.getByLabelText(/organisasjonsnummer/i)).toBeInTheDocument();
                expect(
                    screen.getByLabelText(/kontaktperson i organisasjonen/i)
                ).toBeInTheDocument();
            });

            test('Trykker på submit uten å ha valgt radio, skal vise feilmelding', async () => {
                await testRadioValidering(user, mode);
            });

            test('Manuell registrering uten land skal vise feilmelding', async () => {
                await testManuellRegistreringUtenLand(user, mode);
            });

            test('Manuell registrering Norge skal validere postnummer', async () => {
                await user.click(manuellRegistreringRadio());

                await user.type(navnInput(), 'Test Navn');

                await velgLand(user, 'Norge');

                await user.type(adresseInput(), 'Test Adresse 123');

                await user.type(postnummerInput(), 'abc123');

                await user.type(poststedInput(), 'Oslo');

                const submitButton = mode === 'leggTil' ? leggTilKnapp() : lagreEndringerKnapp();
                await user.click(submitButton);

                expect(screen.getByText('Postnummer må være 4 siffer')).toBeInTheDocument();
            });

            test('Oppslag personregister med ugyldig nummer skal vise feilmelding', async () => {
                await user.click(oppslagIPersonregisterRadio());

                await user.type(fødselsnummerInput(), '1234567890');
                const submitButton = mode === 'leggTil' ? leggTilKnapp() : lagreEndringerKnapp();
                await user.click(submitButton);

                expect(
                    screen.getByText('Fødselsnummer må være 11 sammenhengende siffer')
                ).toBeInTheDocument();
            });

            test.todo('Oppslag personregister skal trimme mellomrom fra organisasjonsnummer');
        });

        describe('Verge', () => {
            beforeEach(async () => {
                await selectMottakerAndWaitForRender(user, MottakerType.Verge);
            });

            test('Skal vise radiogruppe uten organisasjonsregister valg', async () => {
                expect(screen.getByRole('radiogroup', { name: /adresse/i })).toBeInTheDocument();
                expect(manuellRegistreringRadio()).toBeInTheDocument();
                expect(oppslagIPersonregisterRadio()).toBeInTheDocument();
                expect(
                    screen.queryByRole('radio', { name: 'Oppslag i organisasjonsregister' })
                ).not.toBeInTheDocument();
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
                expect(navnInput()).toHaveAttribute('readonly');
                expect(navnInput()).toHaveValue('Test Bruker v/dødsbo');
            });

            test('Skal vise land felt', () => {
                expect(velgLandCombobox()).toBeInTheDocument();
            });

            test('Valg av Norge viser alle adressefelter', async () => {
                await velgLand(user, 'Norge');

                expect(adresseInput()).toBeInTheDocument();
                expect(adresse2Input()).toBeInTheDocument();
                expect(postnummerInput()).toBeInTheDocument();
                expect(poststedInput()).toBeInTheDocument();
            });

            test('Ved tomt land skal vise feilmelding', async () => {
                await user.type(navnInput(), 'Test Dødsbo');

                const submitButton = mode === 'leggTil' ? leggTilKnapp() : lagreEndringerKnapp();
                await user.click(submitButton);

                expect(screen.getByText('Land er påkrevd')).toBeInTheDocument();
            });
        });
    });

    describe('Innsending av Dødsbo med norsk adresse', () => {
        beforeEach(async () => {
            mockLagreBrevmottaker.mockResolvedValue({ success: true });
            await renderBrevmottakerFormModal({ mode: 'leggTil' });
        });

        test('Sender postnummer og poststed i payload', async () => {
            await user.selectOptions(mottakerCombobox(), MottakerType.Dødsbo);

            expect(navnInput()).toBeInTheDocument();

            await velgLand(user, 'Norge');

            await user.type(adresseInput(), 'Testveien 1');
            await user.type(postnummerInput(), '0123');
            await user.type(poststedInput(), 'Oslo');
            await user.click(leggTilKnapp());

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
