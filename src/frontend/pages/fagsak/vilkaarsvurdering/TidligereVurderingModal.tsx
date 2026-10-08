import type { FC } from 'react';

import { BodyLong, Button, Modal } from '@navikt/ds-react';

import { MODAL_BREDDE } from '@/utils/modalUtils';

type Props = {
    laster: boolean;
    harBlittUnder4xRettsgebyr: boolean;
    onStartVurderingPåNytt: () => void;
    onBrukTidligereVurdering: () => void;
};

export const TidligereVurderingModal: FC<Props> = ({
    laster,
    harBlittUnder4xRettsgebyr,
    onStartVurderingPåNytt,
    onBrukTidligereVurdering,
}: Props) => (
    <Modal
        open
        onClose={(): void => undefined}
        onBeforeClose={(): boolean => false}
        header={{
            heading: harBlittUnder4xRettsgebyr
                ? 'Du kan bruke deler av den tidligere vurderingen'
                : 'Det finnes en tidligere vurdering for denne perioden',
            size: 'medium',
            closeButton: false,
        }}
        portal
        className={MODAL_BREDDE}
    >
        <Modal.Body>
            <BodyLong>
                {harBlittUnder4xRettsgebyr
                    ? 'Det nye beløpet er under fire ganger rettsgebyret. Du kan bruke deler av den tidligere vurderingen og gå videre til neste steg. Hvis du velger å lage en ny vurdering, blir den tidligere vurderingen erstattet.'
                    : 'Du kan bruke den tidligere vurderingen og gå videre til neste steg. Hvis du velger å vurdere perioden på nytt, blir den tidligere vurderingen erstattet.'}
            </BodyLong>
        </Modal.Body>
        <Modal.Footer>
            <Button size="small" loading={laster} onClick={onBrukTidligereVurdering}>
                Bruk tidligere vurdering
            </Button>
            <Button
                size="small"
                variant="secondary"
                onClick={onStartVurderingPåNytt}
                disabled={laster}
            >
                Start vurdering på nytt
            </Button>
        </Modal.Footer>
    </Modal>
);
