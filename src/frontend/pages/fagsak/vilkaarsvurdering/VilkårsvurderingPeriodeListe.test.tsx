import type { Vilkårsperiode } from './typer';

import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import { VilkårsvurderingPeriodeListe } from './VilkårsvurderingPeriodeListe';

const lagPeriode = (overstyr: Partial<Vilkårsperiode> = {}): Vilkårsperiode => ({
    id: 'periode-1',
    fom: '01.01.2024',
    tom: '31.01.2024',
    feilutbetalt: 1000,
    vurdering: 'IKKE_VURDERT',
    resultat: null,
    rettsligGrunnlag: [],
    ...overstyr,
});

const renderListe = (
    perioder: Vilkårsperiode[],
    valgtPeriodeId: Vilkårsperiode['id'] | undefined = undefined,
    setValgtPeriodeId: (periodeId: Vilkårsperiode['id'] | undefined) => void = vi.fn()
): void => {
    render(
        <VilkårsvurderingPeriodeListe
            perioder={perioder}
            valgtPeriodeId={valgtPeriodeId}
            setValgtPeriodeId={setValgtPeriodeId}
        />
    );
};

describe('VilkårsvurderingPeriodeListe', () => {
    test('burde rendre én knapp per periode', () => {
        renderListe([
            lagPeriode({ id: 'mars' }),
            lagPeriode({ id: 'april' }),
            lagPeriode({ id: 'mai' }),
        ]);

        expect(screen.getAllByRole('button')).toHaveLength(3);
    });

    test('burde vise overskriften "Periode" når det er én periode', () => {
        renderListe([lagPeriode()]);

        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Periode');
    });

    test('burde vise overskriften "Perioder" når det er flere perioder', () => {
        renderListe([lagPeriode({ id: 'a' }), lagPeriode({ id: 'b' })]);

        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('Perioder');
    });

    test('burde telle antall vurderte perioder', () => {
        renderListe([
            lagPeriode({ id: 'a', vurdering: 'GOD_TRO' }),
            lagPeriode({ id: 'b', vurdering: 'IKKE_VURDERT' }),
            lagPeriode({ id: 'c', vurdering: 'FORSETT' }),
        ]);

        expect(screen.getByRole('heading', { level: 2 }).parentElement).toHaveTextContent(
            '2 av 3 vurdert'
        );
    });

    test('burde vise vurderingsetiketten for perioden', () => {
        renderListe([lagPeriode({ vurdering: 'GOD_TRO' })]);

        expect(screen.getByText('God tro')).toBeInTheDocument();
    });

    test('burde vise resultatetiketten når perioden har et resultat', () => {
        renderListe([lagPeriode({ vurdering: 'FORSETT', resultat: 'FULL_TILBAKEKREVING' })]);

        expect(screen.getByText('Full tilbakekreving')).toBeInTheDocument();
    });

    test('burde ikke vise resultatetikett når perioden mangler resultat', () => {
        renderListe([lagPeriode({ resultat: null })]);

        expect(screen.queryByText('Full tilbakekreving')).not.toBeInTheDocument();
        expect(screen.queryByText('Delvis tilbakekreving')).not.toBeInTheDocument();
        expect(screen.queryByText('Ingen tilbakekreving')).not.toBeInTheDocument();
    });

    test('burde markere den valgte perioden med aria-pressed', () => {
        renderListe(
            [lagPeriode({ id: 'mars' }), lagPeriode({ id: 'april' })],
            lagPeriode({ id: 'april' }).id
        );

        const valgtKnapp = screen.getByRole('button', { name: /Valgt\./ });
        expect(valgtKnapp).toHaveAttribute('aria-pressed', 'true');
        expect(screen.getAllByRole('button', { pressed: false })).toHaveLength(1);
    });

    test('burde inkludere vurdering og resultat i knappens tilgjengelige navn', () => {
        renderListe([lagPeriode({ vurdering: 'GOD_TRO', resultat: 'INGEN_TILBAKEKREVING' })]);

        const knapp = screen.getByRole('button');
        expect(knapp).toHaveAccessibleName(/Vurdering: God tro\./);
        expect(knapp).toHaveAccessibleName(/Resultat: Ingen tilbakekreving\./);
    });

    test('burde kalle setValgtPeriodeId med periodens id ved klikk', async () => {
        const setValgtPeriodeId = vi.fn();
        renderListe(
            [lagPeriode({ id: 'mars' }), lagPeriode({ id: 'april' })],
            undefined,
            setValgtPeriodeId
        );

        await userEvent.click(screen.getAllByRole('button')[1]);

        expect(setValgtPeriodeId).toHaveBeenCalledExactlyOnceWith('april');
    });

    test('burde vise rettslig grunnlag når det finnes', () => {
        renderListe([lagPeriode({ rettsligGrunnlag: ['§ 22-15', '§ 4-5'] })]);

        const knapp = screen.getByRole('button');
        expect(within(knapp).getByText('§ 22-15, § 4-5')).toBeInTheDocument();
    });
});
