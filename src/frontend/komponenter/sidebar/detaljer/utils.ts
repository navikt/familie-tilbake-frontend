export const ICON_PROPS = {
    'aria-hidden': true,
    fontSize: '1.25rem',
    className: 'text-ax-text-neutral-subtle',
} as const;

const MYK_BINDESTREK = '\u00AD';
const HOVEDDELING = '|';
const FINDELING = '·';

const ORDDELINGER: Record<string, string> = {
    arbeidsavklaringspenger: 'arbeids·avklarings|penger',
    barnetrygd: 'barne|trygd',
    overgangsstønad: 'overgangs|stønad',
    barnetilsyn: 'barne|tilsyn',
    skolepenger: 'skole|penger',
    kontantstøtte: 'kontant|støtte',
    tilleggsstønad: 'tilleggs|stønad',
    infotrygd: 'info|trygd',
    tiltakspenger: 'tiltaks|penger',
    dagpenger: 'dag|penger',
};

const ORD_REGEX = new RegExp(Object.keys(ORDDELINGER).join('|'), 'gi');

type Orddelingsvalg = {
    finDeling?: boolean;
};

export const medOrddeling = (tekst: string, { finDeling = false }: Orddelingsvalg = {}): string =>
    tekst.replace(ORD_REGEX, ord => {
        let indeks = 0;
        let resultat = '';
        for (const tegn of ORDDELINGER[ord.toLowerCase()]) {
            if (tegn === HOVEDDELING || (finDeling && tegn === FINDELING)) {
                resultat += MYK_BINDESTREK;
            } else if (tegn !== FINDELING) {
                resultat += ord[indeks++];
            }
        }
        return resultat;
    });
