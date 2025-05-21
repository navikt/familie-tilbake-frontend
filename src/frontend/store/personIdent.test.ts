import { useFagsakStore } from './fagsak';

describe('usePersonIdentStore', () => {
    beforeEach(() => {
        useFagsakStore.setState({ personIdent: undefined });
    });

    test('PersonIdent ha undefined som default verdi', () => {
        const defaultState = useFagsakStore.getState();
        expect(defaultState.personIdent).toBeUndefined();
    });

    test('FagsakId ha undefined som default verdi', () => {
        const defaultState = useFagsakStore.getState();
        expect(defaultState.fagsakId).toBeUndefined();
    });

    test('BehandlingId ha undefined som default verdi', () => {
        const defaultState = useFagsakStore.getState();
        expect(defaultState.behandlingId).toBeUndefined();
    });

    test('Skal oppdatere personIdent når setPersonIdent kalles med en verdi', () => {
        // Arrange
        const testIdent = '12345678910';
        // Act
        useFagsakStore.getState().setPersonIdent(testIdent);

        // Assert
        const oppdatertState = useFagsakStore.getState();
        expect(oppdatertState.personIdent).toBe(testIdent);
    });

    test('Skal oppdatere fagsakId når setFagsakId kalles med en verdi', () => {
        // Arrange
        const testIdent = '12345678910';
        // Act
        useFagsakStore.getState().setFagsakId(testIdent);

        // Assert
        const oppdatertState = useFagsakStore.getState();
        expect(oppdatertState.fagsakId).toBe(testIdent);
    });

    test('Skal oppdatere behandlingId når setBehandlingId kalles med en verdi', () => {
        // Arrange
        const testIdent = '12345678910';
        // Act
        useFagsakStore.getState().setBehandlingId(testIdent);

        // Assert
        const oppdatertState = useFagsakStore.getState();
        expect(oppdatertState.behandlingId).toBe(testIdent);
    });

    test('Skal sette personIdent til undefined når setPersonIdent kalles med undefined', () => {
        // Arrange
        useFagsakStore.getState().setPersonIdent('12345678910');

        // Act
        useFagsakStore.getState().setPersonIdent(undefined);

        // Assert
        const oppdatertState = useFagsakStore.getState();
        expect(oppdatertState.personIdent).toBeUndefined();
    });

    test('Skal sette fagsakId til undefined når setFagsakId kalles med undefined', () => {
        // Arrange
        useFagsakStore.getState().setFagsakId('12345678910');

        // Act
        useFagsakStore.getState().setFagsakId(undefined);

        // Assert
        const oppdatertState = useFagsakStore.getState();
        expect(oppdatertState.fagsakId).toBeUndefined();
    });

    test('Skal sette behandlingId til undefined når setBehandlingId kalles med undefined', () => {
        // Arrange
        useFagsakStore.getState().setBehandlingId('12345678910');

        // Act
        useFagsakStore.getState().setBehandlingId(undefined);

        // Assert
        const oppdatertState = useFagsakStore.getState();
        expect(oppdatertState.behandlingId).toBeUndefined();
    });
});
