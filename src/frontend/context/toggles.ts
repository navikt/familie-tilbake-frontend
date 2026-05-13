export type Toggles = {
    [key: string]: boolean;
};

export enum ToggleName {
    Vilkårsvurdering = 'tilbakekreving-frontend.nytt-vilkaarsvurderingssteg',
    Vedtaksbrev = 'tilbakekreving-frontend.nytt-vedtaksbrev',
    Forhaandsvarsel = 'familie-tilbake-frontend.forhaandsvarselsteg',
}
