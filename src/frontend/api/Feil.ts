export class Feil extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = 'Feil';
        this.status = status;
    }
}
