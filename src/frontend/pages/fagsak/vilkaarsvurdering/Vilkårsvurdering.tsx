import type { FC } from 'react';
import type { Vilkaar } from '@/generated-new';
import type { Vilkårsperiode } from './typer';

import { DocPencilIcon, SealCheckmarkIcon } from '@navikt/aksel-icons';
import { Heading, InlineMessage, Tag, VStack } from '@navikt/ds-react';
import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';

import { useBehandling } from '@/context/BehandlingContext';
import { useBehandlingState } from '@/context/BehandlingStateContext';
import {
    behandlingVilkaarsvurderingOptions,
    behandlingVilkaarsvurderingQueryKey,
} from '@/generated-new/@tanstack/react-query.gen';
import { useActionBar } from '@/hooks/useActionBar';
import { formatterDatostring } from '@/utils/dateUtils';
import { useStegNavigering } from '@/utils/sider';

import { finnStandardValgtPeriode, utledVurdering } from './utils';
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
    const queryClient = useQueryClient();

    const { data: vilkår } = useSuspenseQuery(
        behandlingVilkaarsvurderingOptions({ path: { behandlingId } })
    );

    const perioder = useMemo(() => mapTilVilkårsperioder(vilkår), [vilkår]);

    const [valgtPeriodeId, setValgtPeriodeId] = useState<Vilkårsperiode['id'] | undefined>(
        undefined
    );

    const valgtPeriode = useMemo(() => {
        const funnetPeriode = perioder.find(({ id }) => id === valgtPeriodeId);
        return funnetPeriode ?? finnStandardValgtPeriode(perioder);
    }, [perioder, valgtPeriodeId]);

    const invaliderVilkårsvurdering = (): void => {
        queryClient.invalidateQueries({
            queryKey: behandlingVilkaarsvurderingQueryKey({ path: { behandlingId } }),
        });
    };

    useActionBar({
        stegtekst: actionBarStegtekst('VILKÅRSVURDERING'),
        forrigeAriaLabel: 'Gå tilbake til foreldelsessteget',
        onForrige: navigerTilForrige,
        nesteAriaLabel: 'Gå videre til vedtakssteget',
        onNeste: navigerTilNeste,
    });

    const statusTag = vilkår.ferdigvurdert ? (
        <Tag
            variant="moderate"
            data-color="success"
            icon={<SealCheckmarkIcon aria-hidden />}
            className="w-fit ml-auto ax-xl:order-3"
        >
            Vurdert
        </Tag>
    ) : (
        <Tag
            variant="moderate"
            data-color="info"
            icon={<DocPencilIcon aria-hidden />}
            className="w-fit ml-auto ax-xl:order-3"
        >
            Under vurdering
        </Tag>
    );

    return (
        <VStack gap="space-24" className="min-h-0 h-full">
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2">
                <Heading size="medium">Vilkårsvurdering</Heading>
                {statusTag}
                <InlineMessage
                    size="small"
                    status="info"
                    className="gap-1! basis-full ax-xl:basis-auto ax-xl:order-2"
                >
                    Intern vurdering (ikke synlig i vedtaksbrevet)
                </InlineMessage>
            </div>
            <div className="flex flex-col ax-md:flex-row min-h-0 h-full">
                <VilkårsvurderingPeriodeListe
                    perioder={perioder}
                    valgtPeriodeId={valgtPeriode?.id}
                    setValgtPeriodeId={setValgtPeriodeId}
                />
                {valgtPeriode && (
                    <VilkårsvurderingDetaljer
                        valgtPeriode={valgtPeriode}
                        vilkårsperioder={vilkår.vilkårsperioder}
                        hentVilkårsvurdering={invaliderVilkårsvurdering}
                    />
                )}
            </div>
        </VStack>
    );
};
