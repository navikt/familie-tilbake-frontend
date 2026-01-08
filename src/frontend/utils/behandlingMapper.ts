import type { BehandlingDto } from '../generated/types.gen';
import type { Behandling } from '../typer/behandling';

export const tilBehandlingDto = (behandling: Behandling): BehandlingDto =>
    behandling as unknown as BehandlingDto;
