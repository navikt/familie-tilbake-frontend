import type { VilkårsvurderingPeriodeSkjemaData } from '../typer/vilkårsvurdering';
import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import type { BehandlingDto } from '~/generated';
import type { VilkårsvurderingHook } from '~/pages/fagsak/vilkaarsvurdering/gammel-vilkårsvurdering/VilkårsvurderingContext';

import { QueryClientProvider } from '@tanstack/react-query';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';

import { FagsakContext } from '~/context/FagsakContext';
import { Aktsomhet, SærligeGrunner, Vilkårsresultat } from '~/kodeverk';
import { TestBehandlingProvider } from '~/testdata/behandlingContextFactory';
import { lagBehandling } from '~/testdata/behandlingFactory';
import { lagFagsak } from '~/testdata/fagsakFactory';
import { lagVilkårsvurderingPeriodeSkjemaData } from '~/testdata/vilkårsvurderingFactory';
import { createTestQueryClient } from '~/testutils/queryTestUtils';
import { SkalUnnlates } from '~/typer/tilbakekrevingstyper';

import { VilkårsvurderingPeriodeSkjema } from './VilkårsvurderingPeriodeSkjema';

const mockKanIlleggeRenter = vi.hoisted(() => ({ value: true }));

vi.mock('../VilkårsvurderingContext', () => {
    return {
        useVilkårsvurdering: (): Partial<VilkårsvurderingHook> => ({
            kanIlleggeRenter: mockKanIlleggeRenter.value,
            oppdaterPeriode: vi.fn(),
            navigerTilNeste: vi.fn(),
            sendInnSkjemaOgNaviger: vi.fn(),
            sendInnSkjemaMutation: {
                isPending: false,
                isError: false,
                error: null,
                reset: vi.fn(),
            },
        }),
    };
});

const renderVilkårsvurderingPeriodeSkjema = ({
    periode,
    erTotalbeløpUnder4Rettsgebyr,
    behandletPerioder,
    behandling,
}: {
    periode?: VilkårsvurderingPeriodeSkjemaData;
    erTotalbeløpUnder4Rettsgebyr?: boolean;
    behandletPerioder?: VilkårsvurderingPeriodeSkjemaData[];
    behandling?: BehandlingDto;
}): RenderResult => {
    const queryClient = createTestQueryClient();
    return render(
        <QueryClientProvider client={queryClient}>
            <FagsakContext value={lagFagsak()}>
                <TestBehandlingProvider behandling={behandling}>
                    <VilkårsvurderingPeriodeSkjema
                        periode={periode ?? lagVilkårsvurderingPeriodeSkjemaData()}
                        behandletPerioder={behandletPerioder ?? []}
                        erTotalbeløpUnder4Rettsgebyr={erTotalbeløpUnder4Rettsgebyr ?? false}
                        perioder={[periode ?? lagVilkårsvurderingPeriodeSkjemaData()]}
                        pendingPeriode={undefined}
                        settPendingPeriode={vi.fn()}
                    />
                </TestBehandlingProvider>
            </FagsakContext>
        </QueryClientProvider>
    );
};

const vilkårsresultatGruppe = (): HTMLElement =>
    screen.getByRole('radiogroup', {
        name: 'Velg det vilkåret i folketrygdloven §22-15 som gjelder for perioden',
    });

const aktsomhetForstoBurdeForståttGruppe = (): HTMLElement =>
    screen.getByRole('radiogroup', {
        name: 'Vurder mottakers grad av aktsomhet',
    });

const aktsomhetsgradGruppe = (): HTMLElement =>
    screen.getByRole('radiogroup', {
        name: 'I hvilken grad har mottaker handlet uaktsomt?',
    });

const erBeløpetIBeholdGruppe = (): HTMLElement =>
    screen.getByRole('radiogroup', {
        name: 'Er beløpet i behold?',
    });

const rentetilleggGruppe = (): HTMLElement =>
    screen.getByRole('radiogroup', {
        name: /Skal det beregnes 10% rentetillegg\?/,
    });

const særligeGrunnerGruppe = (): HTMLElement =>
    screen.getByRole('group', {
        name: 'Hvilke særlige grunner kan være aktuelle i denne saken?',
    });

const skalRedusereBeløpGruppe = (): HTMLElement =>
    screen.getByRole('radiogroup', {
        name: 'Skal særlige grunner redusere beløpet?',
    });

const under4RettsgebyrGruppe = (): HTMLElement =>
    screen.getByRole('radiogroup', {
        name: /Totalbeløpet kan være under 4 ganger rettsgebyret/,
    });

const andelTilbakekrevesSelect = (): HTMLElement =>
    screen.getByRole('combobox', {
        name: 'Angi andel som skal tilbakekreves',
    });
// Vilkårsresultat-valg
const godTroValg = (): HTMLElement =>
    within(vilkårsresultatGruppe()).getByRole('radio', { name: /aktsom god tro/i });
const forstoBurdeForståttValg = (): HTMLElement =>
    within(vilkårsresultatGruppe()).getByRole('radio', {
        name: /forsto eller burde forstått/i,
    });
const feilaktigeOpplysningerValg = (): HTMLElement =>
    within(vilkårsresultatGruppe()).getByRole('radio', {
        name: /feilaktige.*opplysninger/i,
    });
const mangelfulleOpplysningerValg = (): HTMLElement =>
    within(vilkårsresultatGruppe()).getByRole('radio', {
        name: /mangelfulle.*opplysninger/i,
    });

// Aktsomhet forsto/burde forstått - valg
const mottakerForstoValg = (): HTMLElement =>
    within(aktsomhetForstoBurdeForståttGruppe()).getByRole('radio', {
        name: 'Mottaker forsto at utbetalingen skyldtes en feil',
    });
const mottakerMåHaForståttValg = (): HTMLElement =>
    within(aktsomhetForstoBurdeForståttGruppe()).getByRole('radio', {
        name: 'Mottaker må ha forstått at utbetalingen skyldtes en feil',
    });

// Aktsomhetsgrad-valg
const forsettligValg = (): HTMLElement =>
    within(aktsomhetsgradGruppe()).getByRole('radio', { name: 'Forsettlig' });
const grovtUaktsomtValg = (): HTMLElement =>
    within(aktsomhetsgradGruppe()).getByRole('radio', { name: 'Grovt uaktsomt' });
const uaktsomtValg = (): HTMLElement =>
    within(aktsomhetsgradGruppe()).getByRole('radio', { name: 'Uaktsomt' });

// Er beløpet i behold - valg
const beløpIBeholdJa = (): HTMLElement =>
    within(erBeløpetIBeholdGruppe()).getByRole('radio', { name: 'Ja' });
const beløpIBeholdNei = (): HTMLElement =>
    within(erBeløpetIBeholdGruppe()).getByRole('radio', { name: 'Nei' });

// Rentetillegg-valg
const rentetilleggJa = (): HTMLElement =>
    within(rentetilleggGruppe()).getByRole('radio', { name: 'Ja' });
const rentetilleggNei = (): HTMLElement =>
    within(rentetilleggGruppe()).getByRole('radio', { name: 'Nei' });

// Særlige grunner-valg (checkboxes)
const gradAvUaktsomhetValg = (): HTMLElement =>
    within(særligeGrunnerGruppe()).getByRole('checkbox', {
        name: 'Graden av uaktsomhet hos den som kravet retter seg mot',
    });
const størrelseBeløpValg = (): HTMLElement =>
    within(særligeGrunnerGruppe()).getByRole('checkbox', {
        name: 'Størrelsen av det feilutbetalte beløpet',
    });
const annetSærligGrunnValg = (): HTMLElement =>
    within(særligeGrunnerGruppe()).getByRole('checkbox', { name: 'Annet' });

// Skal redusere beløp - valg
const skalRedusereJa = (): HTMLElement =>
    within(skalRedusereBeløpGruppe()).getByRole('radio', { name: 'Ja' });
const skalRedusereNei = (): HTMLElement =>
    within(skalRedusereBeløpGruppe()).getByRole('radio', { name: 'Nei' });

// Under 4 rettsgebyr - valg
const under4RettsgebyrJa = (): HTMLElement =>
    within(under4RettsgebyrGruppe()).getByRole('radio', { name: 'Ja' });
const under4RettsgebyrNei = (): HTMLElement =>
    within(under4RettsgebyrGruppe()).getByRole('radio', { name: 'Nei' });

// Begrunnelse-tekstfelt
const begrunnVilkår = (): HTMLElement =>
    screen.getByRole('textbox', { name: 'Begrunn hvorfor du valgte vilkåret ovenfor' });
const begrunnAlternativ = (): HTMLElement =>
    screen.getByRole('textbox', { name: 'Begrunn hvorfor du valgte alternativet ovenfor' });
const begrunnAktsomhetsgrad = (): HTMLElement =>
    screen.getByRole('textbox', { name: 'Begrunn mottakerens aktsomhetsgrad' });
const begrunnResultat = (): HTMLElement =>
    screen.getByRole('textbox', { name: 'Begrunn resultatet av vurderingen ovenfor' });
const begrunnBeløpIkkeIBehold = (): HTMLElement =>
    screen.getByRole('textbox', { name: 'Begrunn hvorfor beløpet ikke er i behold' });
const begrunnBeløpIBehold = (): HTMLElement =>
    screen.getByRole('textbox', { name: 'Begrunn hvorfor beløpet er i behold' });

// Beløp-felt
const angiBeløpTilbakekreves = (): HTMLElement =>
    screen.getByRole('textbox', { name: 'Angi beløp som skal tilbakekreves' });
const beløpSomTilbakekreves = (): HTMLElement =>
    screen.getByRole('textbox', { name: 'Beløp som skal tilbakekreves' });

// Knapper
const gåVidereKnapp = (): HTMLElement =>
    screen.getByRole('button', { name: 'Gå videre til vedtakssteget' });

// Feilmeldinger
const antallFeiledeFelter = (): HTMLElement[] => screen.queryAllByText('Feltet må fylles ut');
const særligGrunnFeil = (): HTMLElement[] =>
    screen.queryAllByText('Du må velge minst en særlig grunn');

// Query-versjoner av gruppe-hjelpere (returnerer null hvis ikke funnet)
const queryRentetilleggGruppe = (): HTMLElement | null =>
    screen.queryByRole('radiogroup', { name: /Skal det beregnes 10% rentetillegg\?/ });

// Informasjonstekst
const sjetteLeddInfoTekst = (): HTMLElement | null =>
    screen.queryByText('Når 6. ledd anvendes må alle perioder behandles likt');

// Ytterligere tekstfelt-hjelpere
const begrunnAnnet = (): HTMLElement => screen.getByRole('textbox', { name: 'Begrunnelse: Annet' });
const andelTilbakekrevesFritekst = (): HTMLElement =>
    screen.getByRole('textbox', { name: 'Angi andel som skal tilbakekreves - fritekst' });

describe('VilkårsvurderingPeriodeSkjema', () => {
    let user: UserEvent;
    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
        mockKanIlleggeRenter.value = true;
    });

    test('God tro - beløp ikke i behold', async () => {
        const vilkårsvurderingPeriode = lagVilkårsvurderingPeriodeSkjemaData({
            aktiviteter: [
                {
                    aktivitet: 'Aktivitet 1',
                    beløp: 1333,
                },
                {
                    aktivitet: 'Aktivitet 2',
                    beløp: 1000,
                },
            ],
        });
        const { getByText } = renderVilkårsvurderingPeriodeSkjema({
            periode: vilkårsvurderingPeriode,
            erTotalbeløpUnder4Rettsgebyr: false,
            behandletPerioder: [lagVilkårsvurderingPeriodeSkjemaData()],
        });

        expect(getByText('Aktivitet 1')).toBeInTheDocument();
        expect(getByText('1 333')).toBeInTheDocument();
        expect(getByText('Aktivitet 2')).toBeInTheDocument();
        expect(getByText('1 000')).toBeInTheDocument();

        await user.click(godTroValg());
        await user.type(begrunnVilkår(), 'begrunnelse');

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(1);

        await user.click(beløpIBeholdNei());
        await user.type(begrunnBeløpIkkeIBehold(), 'begrunnelse');

        const tilbakekrevdBeløp = beløpSomTilbakekreves();
        expect(tilbakekrevdBeløp).toHaveValue('0');

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(0);
    });

    test('God tro - beløp i behold', async () => {
        renderVilkårsvurderingPeriodeSkjema({});

        await user.click(godTroValg());
        await user.type(begrunnVilkår(), 'begrunnelse');

        await user.click(beløpIBeholdJa());
        await user.type(begrunnBeløpIBehold(), 'begrunnelse');

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(1);

        await user.type(angiBeløpTilbakekreves(), '2000');

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(0);
    });

    test('Forsto/burde forstått - forsto', async () => {
        renderVilkårsvurderingPeriodeSkjema({});

        await user.click(forstoBurdeForståttValg());
        await user.type(begrunnVilkår(), 'begrunnelse');

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(2);

        await user.click(mottakerForstoValg());
        await user.type(begrunnAlternativ(), 'begrunnelse');

        expect(rentetilleggNei()).toBeChecked();

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(0);
    });

    test('Forsto/burde forstått - må ha forstått - ingen grunn til reduksjon', async () => {
        renderVilkårsvurderingPeriodeSkjema({});

        await user.click(forstoBurdeForståttValg());
        await user.type(begrunnVilkår(), 'begrunnelse');

        await user.click(mottakerMåHaForståttValg());
        await user.type(begrunnAlternativ(), 'begrunnelse');

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(2);
        expect(særligGrunnFeil()).toHaveLength(1);

        await user.click(gradAvUaktsomhetValg());
        await user.click(annetSærligGrunnValg());

        await user.click(skalRedusereNei());

        await user.type(begrunnResultat(), 'begrunnelse');

        expect(rentetilleggNei()).toBeChecked();

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(1);

        await user.type(begrunnAnnet(), 'begrunnelse');

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(0);
    });

    test('Feilaktig - forsto', async () => {
        renderVilkårsvurderingPeriodeSkjema({});

        await user.click(feilaktigeOpplysningerValg());
        await user.type(begrunnVilkår(), 'begrunnelse');

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(2);

        await user.click(forsettligValg());
        await user.type(begrunnAktsomhetsgrad(), 'begrunnelse');

        expect(rentetilleggJa()).toBeChecked();

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(0);
    });

    test('BAKS - Feilaktig - forsto', async () => {
        // Simulerer BAKS hvor det ikke kan ilegges renter
        mockKanIlleggeRenter.value = false;
        renderVilkårsvurderingPeriodeSkjema({});

        await user.click(feilaktigeOpplysningerValg());
        await user.type(begrunnVilkår(), 'begrunnelse');

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(2);

        await user.click(forsettligValg());
        await user.type(begrunnAktsomhetsgrad(), 'begrunnelse');

        expect(rentetilleggNei()).toBeChecked();

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(0);
    });

    test('Feilaktige - grovt uaktsomt - ingen grunn til reduksjon', async () => {
        renderVilkårsvurderingPeriodeSkjema({});

        await user.click(feilaktigeOpplysningerValg());
        await user.type(begrunnVilkår(), 'begrunnelse');

        await user.click(grovtUaktsomtValg());
        await user.type(begrunnAktsomhetsgrad(), 'begrunnelse');

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(2);
        expect(særligGrunnFeil()).toHaveLength(1);

        await user.click(gradAvUaktsomhetValg());
        await user.click(skalRedusereNei());
        await user.type(begrunnResultat(), 'begrunnelse');

        expect(rentetilleggJa()).toBeChecked();

        await user.click(gåVidereKnapp());

        expect(særligGrunnFeil()).toHaveLength(0);
        expect(antallFeiledeFelter()).toHaveLength(0);
    });

    test('BAKS - Feilaktige - grovt uaktsomt - ingen grunn til reduksjon', async () => {
        // Simulerer BAKS hvor det ikke kan ilegges renter
        mockKanIlleggeRenter.value = false;
        renderVilkårsvurderingPeriodeSkjema({});

        await user.click(feilaktigeOpplysningerValg());
        await user.type(begrunnVilkår(), 'begrunnelse');

        await user.click(grovtUaktsomtValg());
        await user.type(begrunnAktsomhetsgrad(), 'begrunnelse');

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(2);
        expect(særligGrunnFeil()).toHaveLength(1);

        await user.click(gradAvUaktsomhetValg());
        await user.click(skalRedusereNei());
        await user.type(begrunnResultat(), 'begrunnelse');

        expect(rentetilleggNei()).toBeChecked();

        await user.click(gåVidereKnapp());

        expect(særligGrunnFeil()).toHaveLength(0);
        expect(antallFeiledeFelter()).toHaveLength(0);
    });

    test('Feilaktige - grovt uaktsomt - grunn til reduksjon', async () => {
        renderVilkårsvurderingPeriodeSkjema({});

        await user.click(feilaktigeOpplysningerValg());
        await user.type(begrunnVilkår(), 'begrunnelse');

        await user.type(begrunnAktsomhetsgrad(), 'begrunnelse');
        await user.click(grovtUaktsomtValg());

        await user.click(gåVidereKnapp());
        expect(særligGrunnFeil()).toHaveLength(1);
        expect(antallFeiledeFelter()).toHaveLength(2);

        await user.click(gradAvUaktsomhetValg());

        await user.click(skalRedusereJa());

        await user.type(begrunnResultat(), 'begrunnelse');

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(1);

        await user.selectOptions(andelTilbakekrevesSelect(), '30');

        expect(rentetilleggJa()).toBeChecked();

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(0);
    });

    test('nyModell - Feilaktige - grovt uaktsomt - låst ja rentetillegg', async () => {
        renderVilkårsvurderingPeriodeSkjema({
            behandling: lagBehandling({ erNyModell: true }),
        });

        await user.click(feilaktigeOpplysningerValg());
        await user.click(grovtUaktsomtValg());
        await user.click(skalRedusereJa());

        expect(rentetilleggJa()).toBeChecked();
    });

    test('nyModell - ForstoBurdeForstått - forsto - ikke synlig rentetillegg', async () => {
        renderVilkårsvurderingPeriodeSkjema({
            behandling: lagBehandling({ erNyModell: true }),
        });

        await user.click(forstoBurdeForståttValg());
        await user.click(mottakerForstoValg());

        expect(queryRentetilleggGruppe()).not.toBeInTheDocument();
    });

    test('nyModell - ForstoBurdeForstått - må ha forstått - ikke synlig rentetillegg', async () => {
        renderVilkårsvurderingPeriodeSkjema({
            behandling: lagBehandling({ erNyModell: true }),
        });

        await user.click(forstoBurdeForståttValg());
        await user.click(mottakerMåHaForståttValg());
        await user.click(skalRedusereJa());

        expect(queryRentetilleggGruppe()).not.toBeInTheDocument();
    });

    test('Feilaktige - grovt uaktsomt - grunn til reduksjon - egendefinert', async () => {
        renderVilkårsvurderingPeriodeSkjema({});

        await user.click(feilaktigeOpplysningerValg());
        await user.type(begrunnVilkår(), 'begrunnelse');

        await user.click(grovtUaktsomtValg());
        await user.type(begrunnAktsomhetsgrad(), 'begrunnelse');

        await user.click(gradAvUaktsomhetValg());

        await user.click(skalRedusereJa());

        await user.type(begrunnResultat(), 'begrunnelse');

        const andelAvBeløp = andelTilbakekrevesSelect();
        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(1);

        await user.selectOptions(andelAvBeløp, 'Egendefinert');

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(1);

        const andelAvBeløpFritekst = andelTilbakekrevesFritekst();
        await user.type(andelAvBeløpFritekst, '22');

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(0);
    });

    test('Mangelfulle - uaktsomt - under 4 rettsgebyr - grunn til reduksjon', async () => {
        renderVilkårsvurderingPeriodeSkjema({
            erTotalbeløpUnder4Rettsgebyr: true,
        });

        await user.click(mangelfulleOpplysningerValg());
        await user.type(begrunnVilkår(), 'begrunnelse');

        await user.click(uaktsomtValg());
        await user.type(begrunnAktsomhetsgrad(), 'begrunnelse');

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(1);

        await user.click(under4RettsgebyrJa());

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(2);
        expect(særligGrunnFeil()).toHaveLength(1);

        await user.click(gradAvUaktsomhetValg());

        await user.click(skalRedusereJa());

        await user.type(begrunnResultat(), 'begrunnelse');

        expect(queryRentetilleggGruppe()).not.toBeInTheDocument();
        andelTilbakekrevesSelect();

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(1);

        await user.selectOptions(andelTilbakekrevesSelect(), '30');

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(0);
    });

    test('Mangelfulle - uaktsomt - under 4 rettsgebyr - ingen grunn til reduksjon', async () => {
        const { getByText } = renderVilkårsvurderingPeriodeSkjema({
            erTotalbeløpUnder4Rettsgebyr: true,
        });

        await user.click(mangelfulleOpplysningerValg());
        await user.type(begrunnVilkår(), 'begrunnelse');

        await user.click(uaktsomtValg());
        await user.type(begrunnAktsomhetsgrad(), 'begrunnelse');

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(1);

        await user.click(under4RettsgebyrJa());
        expect(sjetteLeddInfoTekst()).not.toBeInTheDocument();

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(2);
        expect(særligGrunnFeil()).toHaveLength(1);

        await user.click(gradAvUaktsomhetValg());

        await user.click(skalRedusereNei());

        await user.type(begrunnResultat(), 'begrunnelse');

        expect(getByText('Andel som skal tilbakekreves')).toBeInTheDocument();
        expect(getByText('100%')).toBeInTheDocument();
        expect(queryRentetilleggGruppe()).not.toBeInTheDocument();

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(0);
    });

    test('Mangelfulle - uaktsomt - under 4 rettsgebyr - ikke tilbakekreves', async () => {
        renderVilkårsvurderingPeriodeSkjema({
            erTotalbeløpUnder4Rettsgebyr: true,
        });

        await user.click(mangelfulleOpplysningerValg());
        await user.type(begrunnVilkår(), 'begrunnelse');

        await user.click(uaktsomtValg());
        await user.type(begrunnAktsomhetsgrad(), 'begrunnelse');

        expect(sjetteLeddInfoTekst()).not.toBeInTheDocument();

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(1);

        await user.click(under4RettsgebyrNei());

        expect(sjetteLeddInfoTekst()).toBeInTheDocument();

        await user.click(gåVidereKnapp());
        expect(antallFeiledeFelter()).toHaveLength(0);
    });

    test('Åpner vurdert periode - god tro - beløp i behold', async () => {
        const periode = lagVilkårsvurderingPeriodeSkjemaData({
            begrunnelse: 'Gitt i god tro',
            vilkårsvurderingsresultatInfo: {
                vilkårsvurderingsresultat: Vilkårsresultat.GodTro,
                godTro: {
                    begrunnelse: 'Deler av beløpet er i behold',
                    beløpErIBehold: true,
                    beløpTilbakekreves: 699,
                },
            },
        });
        renderVilkårsvurderingPeriodeSkjema({
            periode: periode,
            erTotalbeløpUnder4Rettsgebyr: true,
        });
        expect(godTroValg()).toBeChecked();
        expect(begrunnVilkår()).toHaveValue('Gitt i god tro');

        expect(beløpIBeholdJa()).toBeChecked();
        expect(angiBeløpTilbakekreves()).toHaveValue('699');
    });

    test('Åpner vurdert periode - mangelfulle - uaktsomt - under 4 rettsgebyr', async () => {
        const periode = lagVilkårsvurderingPeriodeSkjemaData({
            begrunnelse: 'Gitt mangelfulle opplysninger',
            vilkårsvurderingsresultatInfo: {
                vilkårsvurderingsresultat: Vilkårsresultat.MangelfulleOpplysningerFraBruker,
                aktsomhet: {
                    begrunnelse: 'Vurdert aktsomhet til uaktsomt',
                    aktsomhet: Aktsomhet.Uaktsomt,
                    unnlates4Rettsgebyr: SkalUnnlates.Tilbakekreves,
                    særligeGrunnerBegrunnelse: 'Det finnes særlige grunner',
                    særligeGrunner: [
                        { særligGrunn: SærligeGrunner.GradAvUaktsomhet },
                        { særligGrunn: SærligeGrunner.StørrelseBeløp },
                        {
                            særligGrunn: SærligeGrunner.Annet,
                            begrunnelse: 'Dette er en annen begrunnelse',
                        },
                    ],
                    særligeGrunnerTilReduksjon: true,
                    andelTilbakekreves: 33,
                },
            },
        });
        const { getByTestId } = renderVilkårsvurderingPeriodeSkjema({
            periode: periode,
            erTotalbeløpUnder4Rettsgebyr: true,
        });
        expect(mangelfulleOpplysningerValg()).toBeChecked();
        expect(begrunnVilkår()).toHaveValue('Gitt mangelfulle opplysninger');

        expect(uaktsomtValg()).toBeChecked();
        expect(begrunnAktsomhetsgrad()).toHaveValue('Vurdert aktsomhet til uaktsomt');

        expect(gradAvUaktsomhetValg()).toBeChecked();
        expect(størrelseBeløpValg()).toBeChecked();
        expect(annetSærligGrunnValg()).toBeChecked();

        expect(begrunnAnnet()).toHaveValue('Dette er en annen begrunnelse');

        expect(skalRedusereJa()).toBeChecked();

        expect(begrunnResultat()).toHaveValue('Det finnes særlige grunner');

        expect(under4RettsgebyrJa()).toBeChecked();

        expect(getByTestId('andelSomTilbakekrevesManuell')).toHaveValue('33');
    });

    test('Viser særlige grunner og for over 4 rettsgebyr alternativ - uaktsomt', async () => {
        const periode = lagVilkårsvurderingPeriodeSkjemaData({
            begrunnelse: 'Gitt mangelfulle opplysninger',
            vilkårsvurderingsresultatInfo: {
                vilkårsvurderingsresultat: Vilkårsresultat.MangelfulleOpplysningerFraBruker,
                aktsomhet: {
                    begrunnelse: 'Vurdert aktsomhet til uaktsomt',
                    aktsomhet: Aktsomhet.Uaktsomt,
                    unnlates4Rettsgebyr: SkalUnnlates.Over4Rettsgebyr,
                    særligeGrunnerBegrunnelse: 'Det finnes særlige grunner',
                    særligeGrunner: [
                        { særligGrunn: SærligeGrunner.GradAvUaktsomhet },
                        { særligGrunn: SærligeGrunner.StørrelseBeløp },
                        {
                            særligGrunn: SærligeGrunner.Annet,
                            begrunnelse: 'Dette er en annen begrunnelse',
                        },
                    ],
                    særligeGrunnerTilReduksjon: true,
                    andelTilbakekreves: 33,
                },
            },
        });
        const { getByTestId } = renderVilkårsvurderingPeriodeSkjema({
            periode: periode,
            behandling: lagBehandling({ erNyModell: true }),
            erTotalbeløpUnder4Rettsgebyr: true,
        });
        under4RettsgebyrGruppe();
        expect(
            getByTestId('tilbakekrevSelvOmBeloepErUnder4Rettsgebyr_Over4Rettsgebyr')
        ).toBeChecked();
        særligeGrunnerGruppe();
    });

    test('Viser ikke over 4 rettsgebyr alternativ for gammel modell', async () => {
        const periode = lagVilkårsvurderingPeriodeSkjemaData({
            begrunnelse: 'Gitt mangelfulle opplysninger',
            vilkårsvurderingsresultatInfo: {
                vilkårsvurderingsresultat: Vilkårsresultat.MangelfulleOpplysningerFraBruker,
                aktsomhet: {
                    begrunnelse: 'Vurdert aktsomhet til uaktsomt',
                    aktsomhet: Aktsomhet.Uaktsomt,
                    unnlates4Rettsgebyr: SkalUnnlates.Unnlates,
                    særligeGrunnerBegrunnelse: 'Det finnes særlige grunner',
                    særligeGrunner: [
                        { særligGrunn: SærligeGrunner.GradAvUaktsomhet },
                        { særligGrunn: SærligeGrunner.StørrelseBeløp },
                        {
                            særligGrunn: SærligeGrunner.Annet,
                            begrunnelse: 'Dette er en annen begrunnelse',
                        },
                    ],
                    særligeGrunnerTilReduksjon: true,
                    andelTilbakekreves: 33,
                },
            },
        });
        const { queryByTestId } = renderVilkårsvurderingPeriodeSkjema({
            periode: periode,
            erTotalbeløpUnder4Rettsgebyr: true,
        });
        under4RettsgebyrGruppe();
        expect(
            queryByTestId('tilbakekrevSelvOmBeloepErUnder4Rettsgebyr_Over4Rettsgebyr')
        ).not.toBeInTheDocument();
    });
});
