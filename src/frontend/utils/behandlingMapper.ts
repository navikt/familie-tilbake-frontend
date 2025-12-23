import type { BehandlingDto, FagsakDto } from '../generated/types.gen';
import type { Behandling } from '../typer/behandling';

export const tilBehandlingDto = (behandling: Behandling, fagsak: FagsakDto): BehandlingDto => {
    return {
        ...behandling,
        eksternFagsakId: fagsak.eksternFagsakId,
    } as unknown as BehandlingDto;
};
