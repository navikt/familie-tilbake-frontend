import type { FC, ReactNode } from 'react';

import { createContext, use, useCallback, useEffect, useMemo, useState } from 'react';

import { useHttp } from '@/api/http/HttpProvider';
import { type Ressurs, RessursStatus } from '@/typer/ressurs';
import { hentFrontendFeilmelding } from '@/utils';

export enum ToggleName {
    Vilkårsvurdering = 'tilbakekreving-frontend.nytt-vilkaarsvurderingssteg',
    NyStegflyt = 'tilbakekreving-frontend.ny-stegflyt',
}

type Toggles = {
    [key: string]: boolean;
};

type TogglesContextType = {
    toggles: Toggles;
    feilmelding: string;
};

export const TogglesContext = createContext<TogglesContextType>({
    toggles: {},
    feilmelding: '',
});

type Props = {
    children: ReactNode;
};

export const TogglesProvider: FC<Props> = ({ children }: Props) => {
    const [toggles, setToggles] = useState<Toggles>({});
    const [feilmelding, setFeilmelding] = useState<string>('');
    const { request } = useHttp();

    const fetchToggles = useCallback(() => {
        const hentToggles = (): Promise<Ressurs<Toggles>> => {
            return request<void, Toggles>({
                url: `/familie-tilbake/api/featuretoggle`,
                method: 'GET',
            });
        };

        hentToggles()
            .then((resp: Ressurs<Toggles>) => {
                setFeilmelding('');
                if (resp.status === RessursStatus.Suksess) {
                    setToggles(resp.data);
                } else if (hentFrontendFeilmelding(resp)) {
                    setFeilmelding('Kunne ikke hente toggles');
                }
            })
            .catch(() => {
                // False positive: setState skjer i .catch og er derfor asynkront. Bør uansett migreres til TanStack Query (useQuery) slik at server state håndteres uten useEffect.
                setFeilmelding('Kunne ikke hente toggles');
            });
    }, [request]);

    useEffect(() => {
        fetchToggles();
    }, [fetchToggles]);

    const verdi = useMemo(
        (): TogglesContextType => ({ toggles, feilmelding }),
        [toggles, feilmelding]
    );

    return <TogglesContext value={verdi}>{children}</TogglesContext>;
};

export const useToggles = (): TogglesContextType => use(TogglesContext);

export const useToggle = (navn: ToggleName): boolean => {
    const { toggles } = useToggles();
    return toggles[navn] === true;
};
