import { render, screen } from '@testing-library/react';
import { type UserEvent, userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { TidligereVurderingModal } from './TidligereVurderingModal';

describe('TidligereVurderingModal', () => {
    let user: UserEvent;
    const onStartVurderingPåNytt = vi.fn();
    const onBrukTidligereVurdering = vi.fn();

    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    test('viser valgene for en tidligere vurdering', async () => {
        render(
            <TidligereVurderingModal
                laster={false}
                harBlittUnder4xRettsgebyr={false}
                onStartVurderingPåNytt={onStartVurderingPåNytt}
                onBrukTidligereVurdering={onBrukTidligereVurdering}
            />
        );

        expect(
            screen.getByRole('heading', {
                name: 'Det finnes en tidligere vurdering for denne perioden',
            })
        ).toBeInTheDocument();

        await user.click(screen.getByRole('button', { name: 'Start vurdering på nytt' }));
        expect(onStartVurderingPåNytt).toHaveBeenCalledOnce();

        await user.click(screen.getByRole('button', { name: 'Bruk tidligere vurdering' }));
        expect(onBrukTidligereVurdering).toHaveBeenCalledOnce();
    });

    test('viser egen tekst når beløpet har blitt under 4x rettsgebyr', () => {
        render(
            <TidligereVurderingModal
                laster={false}
                harBlittUnder4xRettsgebyr
                onStartVurderingPåNytt={onStartVurderingPåNytt}
                onBrukTidligereVurdering={onBrukTidligereVurdering}
            />
        );

        expect(
            screen.getByRole('heading', {
                name: 'Du kan bruke deler av den tidligere vurderingen',
            })
        ).toBeInTheDocument();
        expect(
            screen.getByText(/Det nye beløpet er under fire ganger rettsgebyret\./)
        ).toBeInTheDocument();
        expect(
            screen.getByRole('button', { name: 'Bruk tidligere vurdering' })
        ).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Start vurdering på nytt' })).toBeInTheDocument();
    });
});
