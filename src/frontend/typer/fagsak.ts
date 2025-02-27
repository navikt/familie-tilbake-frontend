import type { Behandlingstatus, Behandlingstype } from './behandling';
import type { IPerson } from './person';
import type { Fagsystem, Ytelsetype } from '../kodeverk';

export enum Målform {
    Nb = 'NB',
    Nn = 'NN',
}

export const målform: Record<Målform, string> = {
    [Målform.Nb]: 'Bokmål',
    [Målform.Nn]: 'Nynorsk',
};

export interface IInstitusjon {
    organisasjonsnummer: string;
    navn: string;
}

interface IFagsakBehandling {
    behandlingId: string;
    eksternBrukId: string;
    type: Behandlingstype;
    status: Behandlingstatus;
}
export interface IFagsak {
    eksternFagsakId: string;
    status?: string;
    fagsystem: Fagsystem;
    ytelsestype: Ytelsetype;
    språkkode: Målform;
    bruker: IPerson;
    behandlinger: IFagsakBehandling[];
    institusjon?: IInstitusjon;
}
