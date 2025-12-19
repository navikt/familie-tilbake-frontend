import type { BehandlingDto } from '../generated/types.gen';
import type { Behandling } from '../typer/behandling';
import type { Fagsak } from '../typer/fagsak';

export const tilBehandlingDto = (behandling: Behandling, fagsak: Fagsak): BehandlingDto => {
    return {
        ...behandling,
        eksternFagsakId: fagsak.eksternFagsakId,
    } as unknown as BehandlingDto;
};
