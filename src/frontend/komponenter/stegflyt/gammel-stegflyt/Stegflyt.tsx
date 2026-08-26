import type { FC } from 'react';

import { Stepper } from '@navikt/ds-react';

import { useStegflyt } from '@/komponenter/stegflyt/useStegflyt';

export const Stegflyt: FC = () => {
    const { steg, gjeldendeStegnummer, harGjeldendeSteg, gåTilSteg } = useStegflyt('stegflyt');

    if (!harGjeldendeSteg) return null;

    return (
        <nav aria-label="Stegflyt" className="md:px-0 px-4 w-full">
            <Stepper
                activeStep={gjeldendeStegnummer}
                onStepChange={gåTilSteg}
                orientation="horizontal"
                aria-label="Behandlingssteg"
            >
                {steg.map(({ steg: stegtype, navn, erUtført, erTilgjengelig }) => {
                    const ariaLabel = erTilgjengelig
                        ? `Gå til ${navn}`
                        : `Inaktivt steg, ${navn}, ikke klikkbar`;
                    return (
                        <Stepper.Step
                            key={stegtype}
                            completed={erUtført}
                            interactive={erTilgjengelig}
                            aria-label={ariaLabel}
                        >
                            {navn}
                        </Stepper.Step>
                    );
                })}
            </Stepper>
        </nav>
    );
};
