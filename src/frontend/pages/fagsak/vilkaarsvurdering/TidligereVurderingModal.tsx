import type { FC } from 'react';

import { BodyLong, Button, Modal } from '@navikt/ds-react';

import { MODAL_BREDDE } from '@/komponenter/meny/utils';

type Props = {
    laster: boolean;
    onStartVurderingPåNytt: () => void;
    onBrukTidligereVurdering: () => void;
};

export const TidligereVurderingModal: FC<Props> = ({
    laster,
    onStartVurderingPåNytt,
    onBrukTidligereVurdering,
}: Props) => (
    <Modal
        open
        onClose={(): void => undefined}
        onBeforeClose={(): boolean => false}
        header={{
            heading: 'Det finnes en tidligere vurdering for denne perioden',
            size: 'medium',
            closeButton: false,
        }}
        portal
        className={MODAL_BREDDE}
    >
        <Modal.Body>
            <BodyLong>
                Du kan bruke den tidligere vurderingen og gå videre til neste steg. Hvis du velger å
                vurdere perioden på nytt, blir den tidligere vurderingen erstattet.
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
