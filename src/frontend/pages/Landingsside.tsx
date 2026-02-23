import { BodyLong, Heading } from '@navikt/ds-react';
import * as React from 'react';

import LandingssideImageUrl from '~/images/dokumenter.svg';
import { Image } from '~/komponenter/image/Image';

export const Landingsside: React.FC = () => (
    <div className="flex items-center justify-center h-screen px-4">
        <section className="flex items-center rounded-xl border-ax-bg-brand-blue-strong border bg-ax-bg-brand-blue-soft flex-col gap-4 py-13 w-full max-w-223 text-center">
            <Image src={LandingssideImageUrl} altText="Animert bilde av dokumenter" />

            <Heading size="xlarge">Nav tilbakekreving</Heading>

            <BodyLong className="max-w-xl flex flex-col gap-4">
                <span className="font-semibold">
                    Velkommen til felles saksbehandlingsløsning for tilbakekreving.
                </span>

                <span>
                    Dette gjelder ytelsene barnetrygd, kontantstøtte, enslig forsørger,
                    tilleggsstønader og arbeidsavklaringspenger.
                </span>

                <span>Arbeidet med å utvide løsningen pågår, og flere ytelser vil kobles på.</span>
            </BodyLong>
        </section>
    </div>
);
