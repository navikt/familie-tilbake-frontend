import { BodyLong, Heading } from '@navikt/ds-react';
import * as React from 'react';

export const Landingsside: React.FC = () => (
    <section className="flex justify-center items-center rounded-xl border-ax-bg-brand-blue-strong border bg-ax-bg-brand-blue-soft flex-col gap-4 py-13 max-w-223">
        <img src="" alt=""></img>

        <Heading size="xlarge">Nav tilbakekreving</Heading>

        <BodyLong className="max-w-xl text-center flex flex-col gap-4">
            <span className="font-semibold">
                Velkommen til felles saksbehandlingsløsning for tilbakekreving.
            </span>

            <span>
                Dette gjelder ytelsene barnetrygd, kontantstøtte, enslig forsørger, tilleggsstønader
                og arbeidsavklaringspenger. Flere ytelser vil komme senere.
            </span>

            <span>Arbeidet med å utvide løsningen pågår, og flere ytelser vil kobles på.</span>
        </BodyLong>
    </section>
);
