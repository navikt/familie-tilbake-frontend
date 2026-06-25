import { render, screen, within } from '@testing-library/react';
import { type UserEvent, userEvent } from '@testing-library/user-event';

import { VilkårsvurderingDetaljer } from './VilkårsvurderingDetaljer';

type Beløpsbeskrivelse = 'hele beløpet' | 'deler av beløpet';

const renderVilkårsDetaljer = (): void => {
    render(<VilkårsvurderingDetaljer fom="01.01.2023" tom="31.12.2023" />);
};

const begrunnelseGodTro = async (): Promise<HTMLElement> =>
    await screen.findByRole('textbox', {
        name: 'Begrunn hvorfor du vurderer at mottaker har mottatt beløpet i aktsom god tro',
    });

const begrunnelseIngenting = async (): Promise<HTMLElement> =>
    await screen.findByRole('textbox', {
        name: 'Begrunn hvorfor ingenting av beløpet er i behold',
    });

const vilkårRadioGroup = (): HTMLElement =>
    screen.getByRole('radiogroup', {
        name: 'Hvilket vilkår etter folketrygdloven §22-15 gjelder for perioden?',
    });
const godTroRadio = (): HTMLElement =>
    within(vilkårRadioGroup()).getByRole('radio', {
        name: 'Mottaker har mottatt beløpet i aktsom god tro',
    });

const beløpIBeholdRadioGroup = (): HTMLElement =>
    screen.getByRole('radiogroup', {
        name: 'Hvor mye av det feilutbetalte beløpet er i behold?',
    });
const ingentingIBeholdRadio = (): HTMLElement =>
    within(beløpIBeholdRadioGroup()).getByRole('radio', {
        name: 'Ingenting av beløpet',
    });
const heleIBeholdRadio = (): HTMLElement =>
    within(beløpIBeholdRadioGroup()).getByRole('radio', {
        name: 'Hele beløpet',
    });
const delerIBeholdRadio = (): HTMLElement =>
    within(beløpIBeholdRadioGroup()).getByRole('radio', {
        name: 'Deler av beløpet',
    });

const krevesTilbakeRadioGroup = async (
    beløpsbeskrivelse: Beløpsbeskrivelse
): Promise<HTMLElement> =>
    await screen.findByRole('radiogroup', {
        name: `Skal ${beløpsbeskrivelse} som er i behold kreves tilbake?`,
    });
const krevesTilbakeJaRadio = async (beløpsbeskrivelse: Beløpsbeskrivelse): Promise<HTMLElement> =>
    within(await krevesTilbakeRadioGroup(beløpsbeskrivelse)).getByRole('radio', { name: 'Ja' });
const krevesTilbakeNeiRadio = async (beløpsbeskrivelse: Beløpsbeskrivelse): Promise<HTMLElement> =>
    within(await krevesTilbakeRadioGroup(beløpsbeskrivelse)).getByRole('radio', { name: 'Nei' });

const beløpTilbakekreves = (): HTMLElement =>
    screen.getByRole('textbox', {
        name: 'Hvor mange kroner skal kreves tilbake?',
    });
const beløpIBehold = (): HTMLElement =>
    screen.getByRole('textbox', {
        name: 'Hvor mange kroner er i behold?',
    });

const begrunnelseIBehold = async (beløpsbeskrivelse: Beløpsbeskrivelse): Promise<HTMLElement> =>
    await screen.findByRole('textbox', {
        name: `Begrunn hvorfor ${beløpsbeskrivelse} er i behold`,
    });
const årsakKrevesTilbakeCheckboxGroup = async (
    beløpsbeskrivelse: Beløpsbeskrivelse
): Promise<HTMLElement> =>
    await screen.findByRole('group', {
        name: new RegExp(
            `Hva er årsaken\\(e\\) til at ${beløpsbeskrivelse} skal kreves tilbake\\?`
        ),
    });
const årsakKrevesIkkeTilbakeCheckboxGroup = async (
    beløpsbeskrivelse: Beløpsbeskrivelse
): Promise<HTMLElement> =>
    await screen.findByRole('group', {
        name: new RegExp(
            `Hva er årsaken\\(e\\) til at ${beløpsbeskrivelse} ikke skal kreves tilbake\\?`
        ),
    });
const begrunnelseKreves = (beløpsbeskrivelse: Beløpsbeskrivelse): HTMLElement =>
    screen.getByRole('textbox', {
        name: `Begrunn hvorfor du vurderer at ${beløpsbeskrivelse} skal kreves tilbake`,
    });
const begrunnelseKrevesIkke = (beløpsbeskrivelse: Beløpsbeskrivelse): HTMLElement =>
    screen.getByRole('textbox', {
        name: `Begrunn hvorfor du vurderer at ${beløpsbeskrivelse} ikke skal kreves tilbake`,
    });

const annetCheckbox = (gruppe: HTMLElement): HTMLElement =>
    within(gruppe).getByRole('checkbox', { name: 'Annet' });
const beskrivAnnetFinnes = async (): Promise<HTMLElement> =>
    await screen.findByRole('textbox', {
        name: 'Beskriv kort hva du legger i alternativet “Annet”',
    });
const beskrivAnnetQuery = (): HTMLElement | null =>
    screen.queryByRole('textbox', {
        name: 'Beskriv kort hva du legger i alternativet “Annet”',
    });

describe('VilkårsvurderingDetaljer', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
    });

    describe('God tro', () => {
        test('Ingenting i behold', async () => {
            renderVilkårsDetaljer();

            user.click(godTroRadio());
            expect(await begrunnelseGodTro()).toBeInTheDocument();

            user.click(ingentingIBeholdRadio());
            expect(await begrunnelseIngenting()).toBeInTheDocument();
            expect(screen.getByText('Beløp som skal tilbakekreves')).toBeInTheDocument();
            expect(screen.getByText('0 kroner')).toBeInTheDocument();
        });

        test('Hele beløpet i behold - Kreves tilbake', async () => {
            renderVilkårsDetaljer();

            user.click(godTroRadio());
            expect(await begrunnelseGodTro()).toBeInTheDocument();

            user.click(heleIBeholdRadio());
            expect(await begrunnelseIBehold('hele beløpet')).toBeInTheDocument();

            user.click(await krevesTilbakeJaRadio('hele beløpet'));
            expect(await årsakKrevesTilbakeCheckboxGroup('hele beløpet')).toBeInTheDocument();
            expect(begrunnelseKreves('hele beløpet')).toBeInTheDocument();
            expect(screen.getByText('Beløp som skal tilbakekreves')).toBeInTheDocument();
            expect(screen.getByText('10000 kroner')).toBeInTheDocument();
        });

        test('Hele beløpet i behold - Kreves ikke tilbake', async () => {
            renderVilkårsDetaljer();

            user.click(godTroRadio());
            expect(await begrunnelseGodTro()).toBeInTheDocument();

            user.click(heleIBeholdRadio());
            expect(await begrunnelseIBehold('hele beløpet')).toBeInTheDocument();

            user.click(await krevesTilbakeNeiRadio('hele beløpet'));
            expect(await årsakKrevesIkkeTilbakeCheckboxGroup('hele beløpet')).toBeInTheDocument();
            expect(begrunnelseKrevesIkke('hele beløpet')).toBeInTheDocument();
            expect(beløpTilbakekreves()).toBeInTheDocument();
            expect(screen.getByText('Beløp som skal tilbakekreves')).toBeInTheDocument();
            expect(screen.getByText('0 kroner')).toBeInTheDocument();
        });

        test('Deler av beløpet i behold - Kreves tilbake', async () => {
            renderVilkårsDetaljer();

            user.click(godTroRadio());
            expect(await begrunnelseGodTro()).toBeInTheDocument();

            user.click(delerIBeholdRadio());
            expect(await begrunnelseIBehold('deler av beløpet')).toBeInTheDocument();
            expect(beløpIBehold()).toBeInTheDocument();

            user.click(await krevesTilbakeJaRadio('deler av beløpet'));
            expect(await årsakKrevesTilbakeCheckboxGroup('deler av beløpet')).toBeInTheDocument();
            expect(begrunnelseKreves('deler av beløpet')).toBeInTheDocument();
            expect(screen.getByText('Beløp som skal tilbakekreves')).toBeInTheDocument();
            expect(screen.getByText('10000 kroner')).toBeInTheDocument();
        });

        test('Deler av beløpet i behold - Kreves ikke tilbake', async () => {
            renderVilkårsDetaljer();

            user.click(godTroRadio());
            expect(await begrunnelseGodTro()).toBeInTheDocument();

            user.click(delerIBeholdRadio());
            expect(await begrunnelseIBehold('deler av beløpet')).toBeInTheDocument();
            expect(beløpIBehold()).toBeInTheDocument();

            user.click(await krevesTilbakeNeiRadio('deler av beløpet'));
            expect(
                await årsakKrevesIkkeTilbakeCheckboxGroup('deler av beløpet')
            ).toBeInTheDocument();
            expect(begrunnelseKrevesIkke('deler av beløpet')).toBeInTheDocument();
            expect(beløpTilbakekreves()).toBeInTheDocument();
            expect(screen.getByText('Beløp som skal tilbakekreves')).toBeInTheDocument();
            expect(screen.getByText('0 kroner')).toBeInTheDocument();
        });

        test('Annet-alternativ viser fritekstfelt', async () => {
            renderVilkårsDetaljer();

            user.click(godTroRadio());
            expect(await begrunnelseGodTro()).toBeInTheDocument();

            user.click(heleIBeholdRadio());
            user.click(await krevesTilbakeJaRadio('hele beløpet'));

            const gruppe = await årsakKrevesTilbakeCheckboxGroup('hele beløpet');
            expect(beskrivAnnetQuery()).not.toBeInTheDocument();

            user.click(annetCheckbox(gruppe));
            expect(await beskrivAnnetFinnes()).toBeInTheDocument();
        });
    });
});
