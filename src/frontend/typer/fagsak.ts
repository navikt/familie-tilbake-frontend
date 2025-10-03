import type { Behandlingstatus, Behandlingstype } from './behandling';
import type { Person } from './person';
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
    behandlingId: string;
    eksternBrukId: string;
    type: Behandlingstype;
    status: Behandlingstatus;
};
export type Fagsak = {
    eksternFagsakId: string;
    status?: string;
    fagsystem: Fagsystem;
    ytelsestype: Ytelsetype;
    språkkode: Målform;
    bruker: Person;
    behandlinger: FagsakBehandling[];
    institusjon?: Institusjon;
};
