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

        test('Hele beløpet i behold - Kreves tilbake', () => {
            //Går Ja pathen til spørsmål om beløpet kreves tilbake, årsaken til at det kreves tilbake, og begrunnelse boks. Beløp som skal tilbakekreves er mer enn 0.
        });

        test('Hele beløpet i behold - Kreves ikke tilbake', () => {
            //Viser Nei pathen til spørsmål om beløpet kreves tilbake, årsaken til at det ikke kreves tilbake, og begrunnelse boks. Beløp som skal tilbakekreves er 0.
        });

        test('Deler av beløpet i behold - Kreves tilbake', () => {
            //v
        });
        test('Deler av beløpet i behold - Kreves ikke tilbake', () => {
            //v
        });
    });
});
