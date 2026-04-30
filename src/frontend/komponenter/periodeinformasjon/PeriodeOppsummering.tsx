import type { FC } from 'react';
import type { HendelseType } from '~/kodeverk';

import { BodyShort } from '@navikt/ds-react';

import { hendelsetyper } from '~/kodeverk';
import { formatterDatostring, hentPeriodelengde, formatCurrencyNoKr } from '~/utils';

type Props = {
    fom: string;
    tom: string;
    beløp: number;
    hendelsetype?: HendelseType;
};

export const PeriodeOppsummering: FC<Props> = ({ fom, tom, beløp, hendelsetype }) => {
    return (
        <div className="flex gap-4 flex-wrap">
            <BodyShort
                size="small"
                className="rounded-xl border border-ax-text-brand-magenta py-2 px-4 bg-ax-bg-brand-magenta-soft w-fit"
            >
                Feilutbetalt:{' '}
                <span className="text-ax-text-brand-magenta">{formatCurrencyNoKr(beløp)}</span>
            </BodyShort>
            <BodyShort
                size="small"
                className="rounded-xl border border-ax-border-neutral-subtle py-2 px-4 w-fit"
            >
                {formatterDatostring(fom)}–{formatterDatostring(tom)}
            </BodyShort>
            {hentPeriodelengde(fom, tom) && (
                <BodyShort
                    size="small"
                    className="rounded-xl border border-ax-border-neutral-subtle py-2 px-4 w-fit"
                >
                    {hentPeriodelengde(fom, tom)}
                </BodyShort>
            )}
            {hendelsetype && (
                <BodyShort
                    size="small"
                    className="rounded-xl border border-ax-border-neutral-subtle py-2 px-4 w-fit"
                >
                    Rettslig grunnlag: {hendelsetyper[hendelsetype]}
                </BodyShort>
            )}
        </div>
    );
};
