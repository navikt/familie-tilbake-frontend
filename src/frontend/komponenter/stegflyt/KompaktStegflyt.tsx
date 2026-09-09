import type { FC } from 'react';
import type { StegflytSteg } from '@/komponenter/stegflyt/useStegflyt';

import { CheckmarkIcon } from '@navikt/aksel-icons';
import { Link as ReactRouterLink } from 'react-router';

import { useHarPlassTilStegnavn } from '@/komponenter/stegflyt/useHarPlassTilStegnavn';
import { useStegflyt } from '@/komponenter/stegflyt/useStegflyt';

const SKJUL_NAVN = 'sr-only';

const SIRKEL_BASE =
    'flex size-[1.5625rem] shrink-0 items-center justify-center rounded-full border-2 text-[1rem] font-ax-bold leading-[1.25rem]';

const NAVN_BASE = 'whitespace-nowrap text-[1rem] font-ax-bold leading-[1.25rem]';

const sirkelKlasser = ({ erGjeldende, erTilgjengelig }: StegflytSteg): string => {
    if (erGjeldende) {
        return `${SIRKEL_BASE} border-ax-bg-accent-strong-pressed bg-ax-bg-accent-strong-pressed text-ax-text-accent-contrast`;
    }
    if (erTilgjengelig) {
        return `${SIRKEL_BASE} border-ax-border-accent-strong text-ax-text-accent-subtle group-hover:bg-ax-bg-accent-moderate-hoverA`;
    }
    return `${SIRKEL_BASE} border-dashed border-ax-border-neutral-strong text-ax-text-neutral-subtle`;
};

const navnKlasser = (
    { erGjeldende, erTilgjengelig }: StegflytSteg,
    harPlassTilAlleNavn: boolean
): string => {
    const base = erGjeldende || harPlassTilAlleNavn ? NAVN_BASE : `${NAVN_BASE} ${SKJUL_NAVN}`;
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
    harPlassTilAlleNavn: boolean;
};

const tilgjengeligNavn = (
    { navn, nummer, erUtført, erTilgjengelig }: StegflytSteg,
    antallSteg: number
): string => {
    const posisjon = `steg ${nummer} av ${antallSteg}`;
    if (erUtført) return `${navn}, ${posisjon}, fullført`;
    if (!erTilgjengelig) return `${navn}, ${posisjon}, ikke tilgjengelig`;
    return `${navn}, ${posisjon}`;
};

const StegInnhold: FC<StegInnholdProps> = ({ steg, harPlassTilAlleNavn }: StegInnholdProps) => (
    <>
        <span className={sirkelKlasser(steg)} aria-hidden>
            {steg.erUtført ? <CheckmarkIcon aria-hidden fontSize="1.25rem" /> : steg.nummer}
        </span>
        <span className={navnKlasser(steg, harPlassTilAlleNavn)}>{steg.navn}</span>
    </>
);

export const KompaktStegflyt: FC = () => {
    const { steg, harGjeldendeSteg, sporStegbytte } = useStegflyt('kompakt-stegflyt');
    const {
        beholderRef,
        innholdRef,
        harPlass,
        kanSideScrolle: kanRulle,
    } = useHarPlassTilStegnavn(steg.map(({ navn }) => navn).join('|'));

    if (!harGjeldendeSteg) return null;

    const rulleegenskaper = kanRulle
        ? { tabIndex: 0, role: 'group', 'aria-label': 'Behandlingssteg, kan rulles vannrett' }
        : {};

    return (
        <div
            ref={beholderRef}
            {...rulleegenskaper}
            className="-m-1 flex min-w-0 flex-1 items-center overflow-x-auto p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ax-border-focus"
        >
            <ol
                ref={innholdRef}
                aria-label="Behandlingssteg"
                className="flex w-max shrink-0 flex-nowrap items-center gap-2"
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
                                aria-label={tilgjengeligNavn(stegdata, steg.length)}
                                className="group -m-1 flex flex-nowrap items-center gap-2 rounded-lg p-1 no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ax-border-focus"
                                onClick={(): void => sporStegbytte(stegdata.nummer)}
                            >
                                <StegInnhold steg={stegdata} harPlassTilAlleNavn={harPlass} />
                            </ReactRouterLink>
                        ) : (
                            <span className="flex flex-nowrap items-center gap-2">
                                <span className="sr-only">
                                    {tilgjengeligNavn(stegdata, steg.length)}
                                </span>
                                <span aria-hidden className="flex flex-nowrap items-center gap-2">
                                    <StegInnhold steg={stegdata} harPlassTilAlleNavn={harPlass} />
                                </span>
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </div>
    );
};
