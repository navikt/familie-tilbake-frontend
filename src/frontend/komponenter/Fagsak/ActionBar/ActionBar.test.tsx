import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

import { ActionBar } from './ActionBar';

describe('ActionBar', () => {
    test('Kaller ikke onNeste eller onForrige når isLoading = true', () => {
        const onNeste = jest.fn();
        const onForrige = jest.fn();
        render(
            <ActionBar
                stegtekst="Steg 2 av 5"
                forrigeAriaLabel="Gå tilbake til faktasteget"
                nesteAriaLabel="Gå videre til vilkårsvurderingssteget"
                åpenHøyremeny={false}
                harVærtPåFatteVedtakSteg={false}
                onNeste={onNeste}
                onForrige={onForrige}
                isLoading
            />
        );

        fireEvent.click(
            screen.getByRole('button', { name: /gå videre til vilkårsvurderingssteget/i })
        );
        fireEvent.click(screen.getByRole('button', { name: /gå tilbake til faktasteget/i }));

        expect(onNeste).not.toHaveBeenCalled();
        expect(onForrige).not.toHaveBeenCalled();
    });
});
