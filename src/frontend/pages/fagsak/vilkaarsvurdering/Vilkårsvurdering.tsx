import type { FC } from 'react';
import type { Vilkaar } from '@/generated-new';
import type { Vilkårsperiode } from './typer';

import { Heading, HStack, Tag, VStack } from '@navikt/ds-react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { useBehandling } from '@/context/BehandlingContext';
import { useBehandlingState } from '@/context/BehandlingStateContext';
import { behandlingVilkaarsvurderingOptions } from '@/generated-new/@tanstack/react-query.gen';
import { useActionBar } from '@/hooks/useActionBar';
import { formatterDatostring } from '@/utils/dateUtils';
import { useStegNavigering } from '@/utils/sider';

import { finnStandardValgtPeriodeId, utledVurdering } from './utils';
import { VilkårsvurderingDetaljer } from './VilkårsvurderingDetaljer';
import { VilkårsvurderingPeriodeListe } from './VilkårsvurderingPeriodeListe';

const mapTilVilkårsperioder = (vilkår: Vilkaar): Vilkårsperiode[] =>
    vilkår.vilkårsperioder.map(periode => ({
        id: periode.vilkårsvurdering.id,
        fom: formatterDatostring(periode.vilkårsvurdering.periode.fom),
        tom: formatterDatostring(periode.vilkårsvurdering.periode.tom),
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

    const { data: vilkår } = useSuspenseQuery(
        behandlingVilkaarsvurderingOptions({ path: { behandlingId } })
    );

    const perioder = useMemo(() => mapTilVilkårsperioder(vilkår), [vilkår]);

    const [valgtPeriodeId, setValgtPeriodeId] = useState<string | undefined>(() =>
        finnStandardValgtPeriodeId(perioder)
    );

    useActionBar({
        stegtekst: actionBarStegtekst('VILKÅRSVURDERING'),
        forrigeAriaLabel: 'Gå tilbake til foreldelsessteget',
        onForrige: navigerTilForrige,
        nesteAriaLabel: 'Gå videre til vedtakssteget',
        onNeste: navigerTilNeste,
    });

    return (
        <VStack gap="space-24" className="min-h-0 h-full">
            <HStack justify="space-between">
                <Heading size="medium">Vilkårsvurdering</Heading>
                {vilkår.ferdigvurdert && (
                    <Tag variant="moderate" data-color="success">
                        Vurdert
                    </Tag>
                )}
            </HStack>
            <div className="flex flex-col ax-md:flex-row min-h-0 h-full">
                <VilkårsvurderingPeriodeListe
                    perioder={perioder}
                    valgtPeriodeId={valgtPeriodeId}
                    onSelectPeriode={setValgtPeriodeId}
                />
                <VilkårsvurderingDetaljer />
            </div>
        </VStack>
    );
};
