import type { FC } from 'react';
import type { Vilkaar } from '@/generated-new';
import type { Vilkårsperiode } from './typer';

import { Heading, HStack, InlineMessage, VStack } from '@navikt/ds-react';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useBehandling } from '@/context/BehandlingContext';
import { useBehandlingState } from '@/context/BehandlingStateContext';
import { hentBehandlingQueryKey } from '@/generated/@tanstack/react-query.gen';
import {
    behandlingLagreVilkaarsvurderingMutation,
    behandlingVilkaarsvurderingOptions,
    behandlingVilkaarsvurderingQueryKey,
} from '@/generated-new/@tanstack/react-query.gen';
import { useActionBar } from '@/hooks/useActionBar';
import { useVisGlobalAlert } from '@/stores/globalAlertStore';
import { formatterDatostring } from '@/utils/dateUtils';
import { useStegNavigering } from '@/utils/sider';

import { StatusTag } from '../StegStatus';
import { usePeriodeIUrl } from './usePeriodeIUrl';
import { utledVurdering } from './utils';
import {
    LAGRE_VILKÅRSVURDERING_MUTATION_KEY,
    VilkårsvurderingDetaljer,
} from './VilkårsvurderingDetaljer';
import { VilkårsvurderingLesedataProvider } from './VilkårsvurderingLesedataContext';
import { VilkårsvurderingPeriodeListe } from './VilkårsvurderingPeriodeListe';

const mapTilVilkårsperioder = (vilkår: Vilkaar): Vilkårsperiode[] =>
    vilkår.vilkårsperioder.map(periode => ({
        id: periode.vilkårsvurdering.id,
        fom: formatterDatostring(periode.vilkårsvurdering.fom),
        tom: formatterDatostring(periode.vilkårsvurdering.tom),
        feilutbetalt: periode.feilutbetaltBeløp,
        vurdering: utledVurdering(periode.vilkårsvurdering.valg),
        resultat: periode.delresultat,
        rettsligGrunnlag: periode.fakta.rettsligGrunnlag,
    }));

export const Vilkårsvurdering: FC = () => {
    const { behandlingId } = useBehandling();
    const { actionBarStegtekst } = useBehandlingState();
    const navigerTilForrige = useStegNavigering('FORELDELSE');
    const navigerTilNeste = useStegNavigering('FORESLÅ_VEDTAK');
    const queryClient = useQueryClient();
    const visGlobalAlert = useVisGlobalAlert();

    const { data: vilkår } = useSuspenseQuery(
        behandlingVilkaarsvurderingOptions({ path: { behandlingId } })
    );

    const perioder = useMemo(() => mapTilVilkårsperioder(vilkår), [vilkår]);

    const { valgtPeriode, setValgtPeriodeId } = usePeriodeIUrl(perioder);

    const invaliderVilkårsvurdering = (): void => {
        queryClient.invalidateQueries({
            queryKey: behandlingVilkaarsvurderingQueryKey({ path: { behandlingId } }),
        });
    };

    queryClient.setMutationDefaults(LAGRE_VILKÅRSVURDERING_MUTATION_KEY, {
        ...behandlingLagreVilkaarsvurderingMutation(),
        onSuccess: async (): Promise<void> => {
            invaliderVilkårsvurdering();
            await queryClient.invalidateQueries({
                queryKey: hentBehandlingQueryKey({ path: { behandlingId } }),
            });
        },
    });

    const håndterNeste = (): void => {
        if (!vilkår.ferdigvurdert) {
            visGlobalAlert({
                title: `Du må vurdere perioden${perioder.length > 1 ? 'e' : ''} og lagre før du kan gå videre`,
                status: 'announcement',
            });
            return;
        }
        navigerTilNeste();
    };

    useActionBar({
        stegtekst: actionBarStegtekst('VILKÅRSVURDERING'),
        forrigeAriaLabel: 'Gå tilbake til foreldelsessteget',
        onForrige: navigerTilForrige,
        nesteAriaLabel: 'Gå videre til vedtakssteget',
        onNeste: håndterNeste,
    });

    return (
        <VStack gap="space-24" className="min-h-0 h-full">
            <HStack className="justify-between" gap="space-8 space-0" align="center">
                <HStack gap="space-0 space-32" align="center">
                    <Heading size="medium">Vilkårsvurdering</Heading>
                    <InlineMessage size="small" status="info">
                        Intern vurdering (ikke synlig i vedtaksbrevet)
                    </InlineMessage>
                </HStack>
                <StatusTag tilbakeført={vilkår.tilbakeført} ferdigvurdert={vilkår.ferdigvurdert} />
            </HStack>
            <div className="flex flex-col ax-md:flex-row min-h-0 h-full">
                <VilkårsvurderingPeriodeListe
                    perioder={perioder}
                    valgtPeriodeId={valgtPeriode?.id}
                    setValgtPeriodeId={setValgtPeriodeId}
                />
                {valgtPeriode && (
                    <VilkårsvurderingLesedataProvider
                        momenterSærligeGrunner={vilkår.momenterSærligeGrunner}
                        momenterReduksjonGodTro={vilkår.momenterReduksjonGodTro}
                        erUnder4xRettsgebyr={vilkår.erUnder4xRettsgebyr}
                    >
                        <VilkårsvurderingDetaljer
                            key={valgtPeriode.id}
                            valgtPeriode={valgtPeriode}
                            vilkårsperioder={vilkår.vilkårsperioder}
                            hentVilkårsvurdering={invaliderVilkårsvurdering}
                        />
                    </VilkårsvurderingLesedataProvider>
                )}
            </div>
        </VStack>
    );
};
