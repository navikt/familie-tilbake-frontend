export interface Toggles {
    [key: string]: boolean;
}

export enum ToggleName {
    // Permission-toggles - la stå

    // Miljø-toggles - la stå

    // Release-toggles
    SeHistoriskeVurderinger = 'familie-tilbake.se-historiske-vurderinger',
    Dummy = 'familie-tilbake.dummy',
    SaksbehanderKanResettebehandling = 'familie-tilbake-frontend.saksbehandler.kan.resette.behandling',
    // Midlertidige toggles - kan fjernes etterhvert
}
