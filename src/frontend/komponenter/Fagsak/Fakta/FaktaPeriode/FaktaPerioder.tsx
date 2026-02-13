import type { FaktaPeriodeSkjemaData } from '../typer/fakta';

import { Table } from '@navikt/ds-react';
import * as React from 'react';

import { FaktaPeriodeSkjema } from './FaktaPeriodeSkjema';
import { useFagsak } from '../../../../context/FagsakContext';
import { hentHendelseTyper } from '../../../../kodeverk';

type Props = {
    perioder: FaktaPeriodeSkjemaData[];
    erLesevisning: boolean;
};

export const FaktaPerioder: React.FC<Props> = ({ perioder, erLesevisning }) => {
    const { ytelsestype, institusjon } = useFagsak();
    const hendelsestyper = hentHendelseTyper(ytelsestype, !!institusjon);

    return (
        <Table size="small">
            <Table.Header>
                <Table.Row>
                    <Table.HeaderCell scope="col">Periode</Table.HeaderCell>
                    <Table.HeaderCell scope="col">Rettslig grunnlag</Table.HeaderCell>
                    <Table.HeaderCell scope="col" align="right">
                        Feilutbetalt beløp
                    </Table.HeaderCell>
                </Table.Row>
            </Table.Header>
            <Table.Body>
                {perioder.map(periode => {
                    return (
                        <FaktaPeriodeSkjema
                            hendelseTyper={hendelsestyper}
                            periode={periode}
                            key={`formIndex${periode.index + 1}`}
                            index={periode.index}
                            erLesevisning={erLesevisning}
                        />
                    );
                })}
            </Table.Body>
        </Table>
    );
};
