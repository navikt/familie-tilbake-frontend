import { Fagsystem, Ytelsetype } from '../kodeverk';
import { Behandlingstatus, Behandlingstype } from './behandling';
import { IPerson } from './person';

export enum Målform {
    NB = 'NB',
    NN = 'NN',
}

export enum FagsakType {
    NORMAL = 'NORMAL',
    BARN_ENSLIG_MINDREÅRIG = 'BARN_ENSLIG_MINDREÅRIG',
    INSTITUSJON = 'INSTITUSJON',
}

export const målform: Record<Målform, string> = {
    NB: 'Bokmål',
    NN: 'Nynorsk',
};

export interface IInstitusjon {
    organisasjonsnummer: string;
    navn: string;
}

export interface IFagsakBehandling {
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
