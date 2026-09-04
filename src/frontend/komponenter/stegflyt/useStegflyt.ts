import type { BehandlingDto } from '@/generated';
import type { SynligSteg } from '@/utils/sider';

import { useLocation, useNavigate } from 'react-router';

import { useBehandling } from '@/context/BehandlingContext';
import { erStegUtført } from '@/context/BehandlingStateContext';
import { useFagsak } from '@/context/FagsakContext';
import { erSidenAktiv, SYNLIGE_STEG, visSide } from '@/utils/sider';
import { Hendelser, Sporingskontekst, sporHendelse } from '@/utils/sporing';

export interface StegflytSteg extends SynligSteg {
    /** Fortløpende nummer, 1-indeksert. */
    nummer: number;
    /** Steget er ferdig behandlet. */
    erUtført: boolean;
    /** Steget er en del av behandlingen og kan navigeres til. */
    erTilgjengelig: boolean;
    /** Steget er det brukeren står på nå. */
    erGjeldende: boolean;
    url: string;
}

export type Stegflytdata = {
    steg: StegflytSteg[];
    /** 1-indeksert nummer for gjeldende steg, eller 0 om ingen av stegene matcher URL-en. */
    gjeldendeStegnummer: number;
    harGjeldendeSteg: boolean;
    /** Sporer stegbyttet og navigerer. Brukes når komponenten ikke er en lenke. */
    gåTilSteg: (stegnummer: number) => void;
    /** Sporer stegbyttet uten å navigere. Brukes når navigeringen skjer via en lenke. */
    sporStegbytte: (stegnummer: number) => void;
};

/**
 * Felles datagrunnlag for stegflyten, delt mellom gammel modell (Aksel Stepper over
 * behandlingscontaineren) og ny modell (kompakt stegflyt inne i action-baren).
 *
 * @param komponentId Identifiserer hvilken variant som sporer stegbytter.
 */
export const useStegflyt = (komponentId: string): Stegflytdata => {
    const behandling: BehandlingDto = useBehandling();
    const { fagsystem, eksternFagsakId } = useFagsak();
    const location = useLocation();
    const navigate = useNavigate();

    const behandlingUrl = `/fagsystem/${fagsystem}/fagsak/${eksternFagsakId}/behandling/${behandling.eksternBrukId}`;

    const synligeSteg = Object.values(SYNLIGE_STEG).filter(({ steg }) => visSide(steg, behandling));

    const gjeldendeStegnummer =
        synligeSteg.findIndex(({ href }) => location.pathname.includes(href)) + 1;

    const steg: StegflytSteg[] = synligeSteg.map((synligSteg, indeks) => {
        const { behandlingsstegstatus } =
            behandling.behandlingsstegsinfo.find(
                ({ behandlingssteg }) => behandlingssteg === synligSteg.steg
            ) || {};

        return {
            ...synligSteg,
            nummer: indeks + 1,
            erUtført: behandlingsstegstatus ? erStegUtført(behandlingsstegstatus) : false,
            erTilgjengelig: erSidenAktiv(synligSteg, behandling),
            erGjeldende: indeks + 1 === gjeldendeStegnummer,
            url: `${behandlingUrl}/${synligSteg.href}`,
        };
    });

    const sporStegbytte = (stegnummer: number): void => {
        const nyttSteg = steg[stegnummer - 1];
        if (!nyttSteg || gjeldendeStegnummer === stegnummer) return;

        const forrigeSteg = steg[gjeldendeStegnummer - 1];
        const erFramover = stegnummer > gjeldendeStegnummer;
        const erNabosteg = Math.abs(stegnummer - gjeldendeStegnummer) === 1;

        sporHendelse(Hendelser.STEPPER_STEG_ENDRET, {
            stegId: nyttSteg.steg,
            stegIndeks: stegnummer - 1,
            totaltAntallSteg: steg.length,
            handling: erNabosteg ? (erFramover ? 'neste' : 'forrige') : 'hopp',
            retning: erFramover ? 'fremover' : 'bakover',
            forrigeStegFullfort: forrigeSteg?.erUtført,
            kontekst: Sporingskontekst.Behandling,
            komponentId,
        });
    };

    const gåTilSteg = (stegnummer: number): void => {
        const nyttSteg = steg[stegnummer - 1];
        if (!nyttSteg || gjeldendeStegnummer === stegnummer) return;

        sporStegbytte(stegnummer);
        navigate(nyttSteg.url);
    };

    return {
        steg,
        gjeldendeStegnummer,
        harGjeldendeSteg: gjeldendeStegnummer > 0,
        gåTilSteg,
        sporStegbytte,
    };
};
