import type { Behandlingstatus, Behandlingstype } from './behandling';
import type { Bruker } from './bruker';
import type { Fagsystem, Ytelsetype } from '../kodeverk';

export enum Målform {
    Nb = 'NB',
    Nn = 'NN',
}

export const målform: Record<Målform, string> = {
    [Målform.Nb]: 'Bokmål',
    [Målform.Nn]: 'Nynorsk',
};

export type Institusjon = {
    organisasjonsnummer: string;
    navn: string;
};

type FagsakBehandling = {
    /** UUID */
    behandlingId: string;
    /** UUID */
    eksternBrukId: string;
    status: Behandlingstatus;
    type: Behandlingstype;
};

export type Fagsak = {
    eksternFagsakId: string;
    ytelsestype: Ytelsetype;
    fagsystem: Fagsystem;
    språkkode: Målform;
    bruker: Bruker;
    behandlinger: FagsakBehandling[];
    institusjon: Institusjon | null;
};
