export interface Toggles {
    [key: string]: boolean;
}

export enum ToggleName {
    // Permission-toggles - la stå

    // Miljø-toggles - la stå

    // Release-toggles
    vurderBrukersUttalelse = 'familie-tilbake.bruker.har.uttalt.seg',
    seHistoriskeVurderinger = 'familie-tilbake.se-historiske-vurderinger',
    // Midlertidige toggles - kan fjernes etterhvert
}
