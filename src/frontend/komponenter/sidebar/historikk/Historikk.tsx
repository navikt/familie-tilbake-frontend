import type { FC } from 'react';

import { parseISO } from 'date-fns';

import { DataLastIkkeSuksess } from '@/komponenter/datalast/DataLastIkkeSuksess';
import { RessursStatus } from '@/typer/ressurs';

import { useHistorikk } from './HistorikkContext';
import { HistorikkInnslag } from './HistorikkInnslag';

export const Historikk: FC = () => {
    const { historikkInnslag } = useHistorikk();
    if (historikkInnslag?.status !== RessursStatus.Suksess) {
        return (
            <DataLastIkkeSuksess
                ressurser={[historikkInnslag]}
                henteBeskrivelse="Henter historikk"
                spinnerStørrelse="large"
            />
        );
    }

    const innslag = historikkInnslag.data;
    innslag.sort((a, b) => parseISO(b.opprettetTid).getTime() - parseISO(a.opprettetTid).getTime());
    return (
        <div className="flex flex-col">
            {innslag.map(hi => (
                <HistorikkInnslag key={`${hi.opprettetTid}_${hi.tittel}`} innslag={hi} />
            ))}
        </div>
    );
};
