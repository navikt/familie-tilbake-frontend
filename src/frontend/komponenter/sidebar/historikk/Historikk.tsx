import { Heading } from '@navikt/ds-react';
import { parseISO } from 'date-fns';
import * as React from 'react';

import { DataLastIkkeSuksess } from '~/komponenter/datalast/DataLastIkkeSuksess';
import { RessursStatus } from '~/typer/ressurs';

import { useHistorikk } from './HistorikkContext';
import { HistorikkInnslag } from './HistorikkInnslag';

export const Historikk: React.FC = () => {
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
        <>
            <Heading size="small" level="2">
                Historikk
            </Heading>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-stable">
                {innslag.map((hi, index) => (
                    <HistorikkInnslag key={`${hi.tittel}_${index}`} innslag={hi} />
                ))}
            </div>
        </>
    );
};
