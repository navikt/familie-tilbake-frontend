import type { FC } from 'react';

import { render, screen } from '@testing-library/react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { useHarPlassTilStegnavn } from '@/komponenter/stegflyt/useHarPlassTilStegnavn';

/**
 * jsdom regner ikke ut layout, så både `clientWidth` og `scrollWidth` er alltid 0.
 * Vi styrer derfor geometrien eksplisitt for å kunne teste beslutningslogikken.
 */
let tilgjengeligBredde = 0;
let nødvendigBredde = 0;
let utløsResize: (() => void) | undefined;

const opprinneligResizeObserver: typeof global.ResizeObserver = global.ResizeObserver;

beforeEach(() => {
    Object.defineProperty(HTMLDivElement.prototype, 'clientWidth', {
        configurable: true,
        get: (): number => tilgjengeligBredde,
    });
    Object.defineProperty(HTMLOListElement.prototype, 'scrollWidth', {
        configurable: true,
        get: (): number => nødvendigBredde,
    });
    global.ResizeObserver = class {
        constructor(callback: () => void) {
            utløsResize = callback;
        }
        observe(): void {
            // Testen utløser callbacken manuelt.
        }
        unobserve(): void {
            // Testen utløser callbacken manuelt.
        }
        disconnect(): void {
            utløsResize = undefined;
        }
        // biome-ignore lint/suspicious/noExplicitAny: minimal teststubb
    } as any;
});

afterEach(() => {
    Reflect.deleteProperty(HTMLDivElement.prototype, 'clientWidth');
    Reflect.deleteProperty(HTMLOListElement.prototype, 'scrollWidth');
    global.ResizeObserver = opprinneligResizeObserver;
    utløsResize = undefined;
});

type TestkomponentProps = {
    stegsignatur: string;
};

const Testkomponent: FC<TestkomponentProps> = ({ stegsignatur }: TestkomponentProps) => {
    const { beholderRef, innholdRef, harPlass } = useHarPlassTilStegnavn(stegsignatur);
    return (
        <div ref={beholderRef}>
            <ol ref={innholdRef} />
            <span data-testid="status">{harPlass ? 'viser navn' : 'skjuler navn'}</span>
        </div>
    );
};

const endreBredde = (nyTilgjengeligBredde: number): void => {
    tilgjengeligBredde = nyTilgjengeligBredde;
    act(() => utløsResize?.());
};

describe('useHarPlassTilStegnavn', () => {
    test('viser navnene når de får plass', () => {
        tilgjengeligBredde = 1000;
        nødvendigBredde = 664;

        render(<Testkomponent stegsignatur="a|b" />);

        expect(screen.getByTestId('status')).toHaveTextContent('viser navn');
    });

    test('skjuler navnene når de ikke får plass', () => {
        tilgjengeligBredde = 500;
        nødvendigBredde = 664;

        render(<Testkomponent stegsignatur="a|b" />);

        expect(screen.getByTestId('status')).toHaveTextContent('skjuler navn');
    });

    test('viser navnene igjen når det blir mer plass', () => {
        tilgjengeligBredde = 500;
        nødvendigBredde = 664;
        render(<Testkomponent stegsignatur="a|b" />);
        expect(screen.getByTestId('status')).toHaveTextContent('skjuler navn');

        endreBredde(1000);

        expect(screen.getByTestId('status')).toHaveTextContent('viser navn');
    });

    test('husker plassbehovet etter at navnene er skjult, slik at beslutningen ikke oscillerer', () => {
        tilgjengeligBredde = 500;
        nødvendigBredde = 664;
        render(<Testkomponent stegsignatur="a|b" />);

        // Når navnene er skjult krymper innholdet. Behovet skal likevel være
        // det målte, ellers ville navnene blitt vist igjen umiddelbart.
        nødvendigBredde = 200;
        endreBredde(500);

        expect(screen.getByTestId('status')).toHaveTextContent('skjuler navn');
    });

    test('måler behovet på nytt når stegene endrer seg', () => {
        tilgjengeligBredde = 500;
        nødvendigBredde = 664;
        const { rerender } = render(<Testkomponent stegsignatur="a|b" />);
        expect(screen.getByTestId('status')).toHaveTextContent('skjuler navn');

        // Ny stegsammensetning med kortere navn skal få plass.
        nødvendigBredde = 300;
        rerender(<Testkomponent stegsignatur="a" />);

        expect(screen.getByTestId('status')).toHaveTextContent('viser navn');
    });
});
