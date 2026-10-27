import axios from 'axios';

export const tilFeilUtenToken = (beskrivelse: string, e: unknown): Error => {
    if (axios.isAxiosError(e)) {
        const detaljer = e.response ? `statuskode ${e.response.status}` : (e.code ?? 'ukjent feil');
        return new Error(`${beskrivelse}: ${detaljer}`);
    }
    return new Error(`${beskrivelse}: ${e instanceof Error ? e.message : 'ukjent feil'}`);
};
