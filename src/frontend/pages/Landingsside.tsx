import type { FC } from 'react';

import { BodyLong, Heading, Tag } from '@navikt/ds-react';

import LandingssideImageUrl from '~/images/dokumenter.svg';
import { Image } from '~/komponenter/image/Image';

const ytelser = [
    'Arbeidsavklaringspenger',
    'Barnetrygd',
    'Enslig forsørger',
    'Kontantstøtte',
    'Tilleggsstønader',
    'Tiltakspenger',
];

export const Landingsside: FC = () => (
    <div className="flex items-center justify-center h-screen px-4">
        <section className="flex items-center rounded-xl border-ax-bg-brand-blue-strong border bg-ax-bg-brand-blue-soft flex-col gap-4 pt-8 pb-24 w-full max-w-223 text-center">
            <Image src={LandingssideImageUrl} altText="Animert bilde av dokumenter" />

            <Heading size="xlarge">Nav Tilbakekreving</Heading>

            <div className="max-w-xl flex flex-col items-center gap-4">
                <BodyLong className="flex flex-col gap-4">
                    <span className="font-semibold">
                        Velkommen til saksbehandlingsløsningen for tilbakekreving.
                    </span>
                    <span>Løsningen støtter tilbakekreving for:</span>
                </BodyLong>

                <div className="flex flex-wrap justify-center gap-2">
                    {ytelser.map(ytelse => (
                        <Tag key={ytelse} variant="moderate" data-color="info" size="medium">
                            {ytelse}
                        </Tag>
                    ))}
                </div>

                <BodyLong>
                    Arbeidet med å utvide løsningen pågår, og flere ytelser vil kobles på.
                </BodyLong>
            </div>
        </section>
    </div>
);
