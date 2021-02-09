import { Ytelsetype } from '../kodeverk/ytelsetype';
import { IPerson } from './person';

export interface IFagsakBehandling {
    id: string;
    eksternBrukId: string;
}
export interface IFagsak {
    eksternFagsakId: string;
    status?: string;
    ytelseType: Ytelsetype;
    søkerFødselsnummer: string;
    språkkode?: string;
    bruker: IPerson;
    behandlinger: Array<IFagsakBehandling>;
}
