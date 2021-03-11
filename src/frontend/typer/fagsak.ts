import { Fagsystem, Ytelsetype } from '../kodeverk';
import { Behandlingstatus, Behandlingstype } from './behandling';
import { IPerson } from './person';

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
    språkkode?: string;
    bruker: IPerson;
    behandlinger: IFagsakBehandling[];
}
