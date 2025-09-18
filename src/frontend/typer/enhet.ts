const behandendeEnheter: IArbeidsfordelingsenhet[] = [
    { enhetId: '2103', enhetNavn: 'Nav Vikafossen' },
    { enhetId: '4806', enhetNavn: 'Nav Familie- og pensjonsytelser Drammen' },
    { enhetId: '4820', enhetNavn: 'Nav Familie- og pensjonsytelser Vadsø' },
    { enhetId: '4833', enhetNavn: 'Nav Familie- og pensjonsytelser Oslo 1' },
    { enhetId: '4842', enhetNavn: 'Nav Familie- og pensjonsytelser Stord' },
    { enhetId: '4817', enhetNavn: 'Nav Familie- og pensjonsytelser Steinkjer' },
];

export const finnMuligeEnheter = (): IArbeidsfordelingsenhet[] => {
    return behandendeEnheter;
};

export interface IArbeidsfordelingsenhet {
    enhetId: string;
    enhetNavn: string;
}
