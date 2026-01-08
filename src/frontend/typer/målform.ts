export enum Målform {
    Nb = 'NB',
    Nn = 'NN',
}

export const målform: Record<Målform, string> = {
    [Målform.Nb]: 'Bokmål',
    [Målform.Nn]: 'Nynorsk',
};
