import { Ytelsetype } from '../kodeverk';

const behandendeEnheter: IArbeidsfordelingsenhet[] = [
    { enhetId: '2103', enhetNavn: 'NAV Vikafossen' },
    { enhetId: '4806', enhetNavn: 'NAV Familie- og pensjonsytelser Drammen' },
    { enhetId: '4820', enhetNavn: 'NAV Familie- og pensjonsytelser Vadsø' },
    { enhetId: '4833', enhetNavn: 'NAV Familie- og pensjonsytelser Oslo 1' },
    { enhetId: '4842', enhetNavn: 'NAV Familie- og pensjonsytelser Stord' },
    { enhetId: '4817', enhetNavn: 'NAV Familie- og pensjonsytelser Steinkjer' },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const finnMuligeEnheter = (_ytelse: Ytelsetype): IArbeidsfordelingsenhet[] => {
    return behandendeEnheter;
};

export interface IArbeidsfordelingsenhet {
    enhetId: string;
    enhetNavn: string;
}
