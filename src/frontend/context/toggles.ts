export type Toggles = {
    [key: string]: boolean;
};

export enum ToggleName {
    // Permission-toggles - la stå

    // Miljø-toggles - la stå

    // Release-toggles
    SeHistoriskeVurderinger = 'familie-tilbake.se-historiske-vurderinger',
    SaksbehanderKanResettebehandling = 'familie-tilbake-frontend.saksbehandler.kan.resette.behandling',
    Forhåndsvarselsteg = 'familie-tilbake-frontend.forhaandsvarselsteg',
    // Midlertidige toggles - kan fjernes etterhvert
}
