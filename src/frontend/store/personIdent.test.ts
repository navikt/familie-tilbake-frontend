import { usePersonIdentStore } from './personIdent';

describe('usePersonIdentStore', () => {
    beforeEach(() => {
        usePersonIdentStore.setState({ personIdent: undefined });
    });

    test('Skal ha undefined som default verdi', () => {
        const defaultState = usePersonIdentStore.getState();
        expect(defaultState.personIdent).toBeUndefined();
    });

    test('Skal oppdatere personIdent når setPersonIdent kalles med en verdi', () => {
        // Arrange
        const testIdent = '12345678910';
        // Act
        usePersonIdentStore.getState().setPersonIdent(testIdent);

        // Assert
        const oppdatertState = usePersonIdentStore.getState();
        expect(oppdatertState.personIdent).toBe(testIdent);
    });

    test('Skal sette personIdent til undefined når setPersonIdent kalles med undefined', () => {
        // Arrange
        usePersonIdentStore.getState().setPersonIdent('12345678910');

        // Act
        usePersonIdentStore.getState().setPersonIdent(undefined);

        // Assert
        const oppdatertState = usePersonIdentStore.getState();
        expect(oppdatertState.personIdent).toBeUndefined();
    });
});
