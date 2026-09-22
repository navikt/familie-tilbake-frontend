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
});
