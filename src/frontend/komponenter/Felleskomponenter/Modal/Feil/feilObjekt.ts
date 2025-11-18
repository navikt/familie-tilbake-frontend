type FeilMelding = {
    tittel: string;
    beskjed: string;
    hvaKanGjøres: string[];
    httpStatus?: string;
};

export const hentFeilObjekt = (status: number | undefined): FeilMelding => {
    switch (status) {
        case 400:
            return {
                tittel: 'Ugyldig forespørsel',
                beskjed: 'Forespørselen din er ugyldig',
                httpStatus: `${status} Bad Request`,
                hvaKanGjøres: [
                    'Sjekk at du har fylt ut alle nødvendige felt',
                    'Sjekk at dataene du har sendt er i riktig format',
                    'Prøv igjen senere hvis problemet vedvarer',
                ],
            };
        case 401:
            return {
                tittel: 'Uautorisert',
                beskjed: 'Du er ikke autorisert til å gjøre dette',
                httpStatus: `${status} Unauthorized`,
                hvaKanGjøres: ['Logg inn med riktig bruker', 'Vent et par minutter og prøv igjen'],
            };
        case 403:
            return {
                tittel: 'Ingen tilgang',
                beskjed: 'Du har ikke tilgang til å gjøre dette',
                httpStatus: `${status} Forbidden`,
                hvaKanGjøres: ['Om du mener at du burde ha tilgang, ta kontakt med nærmeste leder'],
            };
        case 404:
            return {
                tittel: 'Ikke funnet',
                beskjed: 'Ressursen du prøver å nå finnes ikke',
                httpStatus: `${status} Not Found`,
                hvaKanGjøres: [
                    'Sjekk at du har riktig url',
                    'Hvis du mener at dette er en feil, vennligst kontakt support',
                ],
            };
        case 500:
            return {
                tittel: 'Intern feil',
                beskjed: 'Oi, dette fungerte vist ikke',
                httpStatus: `${status} Internal Server Error`,
                hvaKanGjøres: ['Last inn siden på nytt', 'Vent et par minutter og prøv igjen'],
            };
        case 502:
        case 503:
        case 504: {
            const statusCodeMap = {
                502: 'Bad Gateway',
                503: 'Service Unavailable',
                504: 'Gateway Timeout',
            };

            const httpstatusText = statusCodeMap[status];
            return {
                tittel: 'Feil hos noen andre',
                beskjed: 'Noe galt har skjedd hos en annen part, prøv igjen senere',
                httpStatus: `${status} ${httpstatusText}`,
                hvaKanGjøres: ['Vent et par minutter og prøv igjen'],
            };
        }
        default:
            return {
                tittel: 'Ukjent feil',
                beskjed: 'En ukjent feil har oppstått, vennligst prøv igjen senere',
                httpStatus: `${status} Unknown Error`,
                hvaKanGjøres: ['Last inn siden på nytt', 'Vent et par minutter og prøv igjen'],
            };
    }
};
