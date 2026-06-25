import { render, screen, within } from '@testing-library/react';
import { type UserEvent, userEvent } from '@testing-library/user-event';

import { VilkårsvurderingDetaljer } from './VilkårsvurderingDetaljer';

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

const krevesTilbakeRadioGroup = async (): Promise<HTMLElement> =>
    await screen.findByRole('radiogroup', {
        name: 'Skal hele beløpet som er i behold kreves tilbake?',
    });
const krevesTilbakeJaRadio = async (): Promise<HTMLElement> =>
    within(await krevesTilbakeRadioGroup()).getByRole('radio', { name: 'Ja' });
const krevesTilbakeNeiRadio = async (): Promise<HTMLElement> =>
    within(await krevesTilbakeRadioGroup()).getByRole('radio', { name: 'Nei' });

const årsakKrevesTilbakeCheckboxGroup = async (): Promise<HTMLElement> =>
    await screen.findByRole('group', {
        name: /Hva er årsaken\(e\) til at hele beløpet skal kreves tilbake\?/,
    });
const årsakKrevesIkkeTilbakeCheckboxGroup = async (): Promise<HTMLElement> =>
    await screen.findByRole('group', {
        name: /Hva er årsaken\(e\) til at hele beløpet ikke skal kreves tilbake\?/,
    });

const begrunnelseKreves = (): HTMLElement =>
    screen.getByRole('textbox', {
        name: 'Begrunn hvorfor du vurderer at hele beløpet skal kreves tilbake',
    });
const begrunnelseKrevesIkke = (): HTMLElement =>
    screen.getByRole('textbox', {
        name: 'Begrunn hvorfor du vurderer at hele beløpet ikke skal kreves tilbake',
    });
const begrunnelseHeleIBehold = async (): Promise<HTMLElement> =>
    await screen.findByRole('textbox', {
        name: 'Begrunn hvorfor hele beløpet er i behold',
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
            expect(await begrunnelseHeleIBehold()).toBeInTheDocument();

            user.click(await krevesTilbakeJaRadio());
            expect(await årsakKrevesTilbakeCheckboxGroup()).toBeInTheDocument();
            expect(begrunnelseKreves()).toBeInTheDocument();
            expect(screen.getByText('Beløp som skal tilbakekreves')).toBeInTheDocument();
            expect(screen.getByText('10000 kroner')).toBeInTheDocument();
        });

        test('Hele beløpet i behold - Kreves ikke tilbake', async () => {
            renderVilkårsDetaljer();

            user.click(godTroRadio());
            expect(await begrunnelseGodTro()).toBeInTheDocument();

            user.click(heleIBeholdRadio());

            user.click(await krevesTilbakeNeiRadio());
            expect(await årsakKrevesIkkeTilbakeCheckboxGroup()).toBeInTheDocument();
            expect(begrunnelseKrevesIkke()).toBeInTheDocument();
            expect(screen.getByText('Beløp som skal tilbakekreves')).toBeInTheDocument();
            expect(screen.getByText('0 kroner')).toBeInTheDocument();
        });

        test('Deler av beløpet i behold - Kreves tilbake', () => {
            //v
        });
        test('Deler av beløpet i behold - Kreves ikke tilbake', () => {
            //v
        });
    });
});
