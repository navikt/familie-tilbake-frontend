import type { FC } from 'react';

import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons';
import { BodyLong, Button, Modal } from '@navikt/ds-react';
import { useState } from 'react';

import { MODAL_BREDDE } from '@/utils/modalUtils';
import { Hendelser, Sporingskontekst, sporHendelse } from '@/utils/sporing';

export const ViktigInfoModal: FC = () => {
    const [åpen, settÅpen] = useState(false);

    return (
        <>
            <Button
                variant="tertiary"
                size="medium"
                className="text-ax-text-warning"
                icon={
                    <ExclamationmarkTriangleFillIcon aria-hidden className="text-ax-text-warning" />
                }
                onClick={(): void => {
                    sporHendelse(Hendelser.KNAPP_KLIKKET, {
                        tekst: 'Viktig info',
                        kontekst: Sporingskontekst.Header,
                        komponentId: 'viktig-info',
                    });
                    settÅpen(true);
                }}
            >
                Viktig info, trykk her
            </Button>
            <Modal
                open={åpen}
                onClose={(): void => settÅpen(false)}
                header={{
                    heading: 'Fryseperiode 9. oktober kl. 16.00–19. oktober kl. 08.00',
                    size: 'small',
                }}
                portal
                className={MODAL_BREDDE}
            >
                <Modal.Body>
                    <BodyLong>
                        Skatteetaten avvikler PAK og migrerer til Innfri. I denne perioden er det
                        ikke mulig å sende vedtak til beslutter eller godkjenne vedtak i
                        Tilbakeløsningen.
                    </BodyLong>
                </Modal.Body>
                <Modal.Footer>
                    <Button size="small" onClick={(): void => settÅpen(false)}>
                        Lukk
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};
