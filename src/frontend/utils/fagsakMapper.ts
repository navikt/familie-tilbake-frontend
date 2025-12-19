import type { FagsakDto } from '../generated/types.gen';
import type { Fagsak } from '../typer/fagsak';

export const tilFagsakDto = (fagsak: Fagsak): FagsakDto => {
    return fagsak as unknown as FagsakDto;
};
