import type { FC } from 'react';
import type { StegflytSteg } from '@/komponenter/stegflyt/useStegflyt';

import { CheckmarkIcon } from '@navikt/aksel-icons';
import { Link as ReactRouterLink } from 'react-router';

import { useStegflyt } from '@/komponenter/stegflyt/useStegflyt';

/**
 * Under denne containerbredden er det ikke plass til alle stegnavnene ved siden av
 * navigasjonsknappene. Da vises kun navnet på steget saksbehandler står på. Navnene
 * skjules visuelt med `sr-only` og ikke med `hidden`, slik at de fortsatt tar del i
 * dokumentflyten for hjelpemidler.
 */
const SKJUL_NAVN_UNDER = '@max-[64rem]:sr-only';

const SIRKEL_BASE =
    'flex size-[25px] shrink-0 items-center justify-center rounded-ax-full border-2 text-[16px] font-ax-bold leading-[20px]';

const NAVN_BASE = 'whitespace-nowrap text-[16px] font-ax-bold leading-[20px]';

const sirkelKlasser = ({ erGjeldende, erTilgjengelig }: StegflytSteg): string => {
    if (erGjeldende) {
        return `${SIRKEL_BASE} border-ax-bg-accent-strong-pressed bg-ax-bg-accent-strong-pressed text-ax-text-accent-contrast`;
    }
    if (erTilgjengelig) {
        return `${SIRKEL_BASE} border-ax-border-accent-strong text-ax-text-accent-subtle group-hover:bg-ax-bg-accent-moderate-hoverA`;
    }
    return `${SIRKEL_BASE} border-ax-border-neutral-strong text-ax-text-neutral-subtle`;
};

const navnKlasser = ({ erGjeldende, erTilgjengelig }: StegflytSteg): string => {
    const base = erGjeldende ? NAVN_BASE : `${NAVN_BASE} ${SKJUL_NAVN_UNDER}`;
    if (!erTilgjengelig) {
        return `${base} text-ax-text-neutral-subtle`;
    }
    if (erGjeldende) {
        return `${base} text-ax-text-accent-subtle`;
    }
    return `${base} text-ax-text-accent-subtle underline-offset-2 group-hover:underline`;
};

type StegInnholdProps = {
    steg: StegflytSteg;
};

/**
 * Stegnavnet skjules kun visuelt i smale containere, men statusen må uansett formidles
 * eksplisitt. Vi setter derfor hele det tilgjengelige navnet selv, i stedet for å stole
 * på at hjelpemidler skiller tekstnodene med mellomrom.
 */
const tilgjengeligNavn = ({ navn, erUtført, erTilgjengelig }: StegflytSteg): string => {
    if (erUtført) return `${navn}, fullført`;
    if (!erTilgjengelig) return `${navn}, ikke tilgjengelig`;
    return navn;
};

const StegInnhold: FC<StegInnholdProps> = ({ steg }: StegInnholdProps) => (
    <>
        <span className={sirkelKlasser(steg)} aria-hidden>
            {steg.erUtført ? <CheckmarkIcon aria-hidden fontSize="1.25rem" /> : steg.nummer}
        </span>
        <span className={navnKlasser(steg)}>{steg.navn}</span>
    </>
);

/**
 * Kompakt horisontal stegflyt som vises inne i action-baren for ny modell, og som
 * erstatter den frittstående stepperen over behandlingscontaineren.
 */
export const KompaktStegflyt: FC = () => {
    const { steg, harGjeldendeSteg, sporStegbytte } = useStegflyt('kompakt-stegflyt');

    if (!harGjeldendeSteg) return null;

    return (
        <ol
            aria-label="Behandlingssteg"
            className="@container flex min-w-0 shrink flex-nowrap items-center gap-2 overflow-x-auto"
        >
            {steg.map(stegdata => (
                <li key={stegdata.steg} className="flex flex-nowrap items-center gap-2">
                    {stegdata.nummer > 1 && (
                        <span
                            aria-hidden
                            className="h-px w-1 shrink-0 bg-ax-border-neutral-strong"
                        />
                    )}
                    {stegdata.erTilgjengelig ? (
                        <ReactRouterLink
                            to={stegdata.url}
                            aria-current={stegdata.erGjeldende ? 'step' : undefined}
                            aria-label={tilgjengeligNavn(stegdata)}
                            className="group flex flex-nowrap items-center gap-2 rounded-ax-8 no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ax-border-focus"
                            onClick={(): void => sporStegbytte(stegdata.nummer)}
                        >
                            <StegInnhold steg={stegdata} />
                        </ReactRouterLink>
                    ) : (
                        <span className="flex flex-nowrap items-center gap-2">
                            <span className="sr-only">{tilgjengeligNavn(stegdata)}</span>
                            <span aria-hidden className="flex flex-nowrap items-center gap-2">
                                <StegInnhold steg={stegdata} />
                            </span>
                        </span>
                    )}
                </li>
            ))}
        </ol>
    );
};
