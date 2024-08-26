export interface Toggles {
    [key: string]: boolean;
}

export enum ToggleName {
    // Permission-toggles - la stå

    // Miljø-toggles - la stå

    // Release-toggles
    seHistoriskeVurderinger = 'familie-tilbake.se-historiske-vurderinger',
    dummy = 'familie-tilbake.dummy',
    // Midlertidige toggles - kan fjernes etterhvert
}
