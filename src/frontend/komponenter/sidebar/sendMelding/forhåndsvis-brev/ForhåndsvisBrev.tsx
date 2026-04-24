import type { FC } from 'react';

import { Button } from '@navikt/ds-react';
import { useEffect, useEffectEvent } from 'react';

import { PdfVisningModal } from '~/komponenter/pdf-visning-modal/PdfVisningModal';
import { useSendMelding } from '~/komponenter/sidebar/sendMelding/SendMeldingContext';

import { useForhåndsvisBrev } from './useForhåndsvisBrev';

type Props = {
    test?: boolean;
};

export const ForhåndsvisBrev: FC<Props> = () => {
    const {
        hentetForhåndsvisning,
        hentBrev,
        visModal,
        setVisModal,
        nullstillHentetForhåndsvisning,
    } = useForhåndsvisBrev();
    const { kanSendeSkjema } = useSendMelding();

    const onVisModalEndret = useEffectEvent((skalVises: boolean) => {
        if (skalVises) {
            hentBrev();
        }
    });

    useEffect(() => {
        onVisModalEndret(visModal);
    }, [visModal]);

    return (
        <>
            <Button
                size="small"
                variant="tertiary"
                onClick={() => {
                    if (kanSendeSkjema()) {
                        setVisModal(true);
                    }
                }}
            >
                Forhåndsvis
            </Button>
            {visModal && (
                <PdfVisningModal
                    åpen={visModal}
                    pdfdata={hentetForhåndsvisning}
                    onRequestClose={() => {
                        nullstillHentetForhåndsvisning();
                        setVisModal(false);
                    }}
                />
            )}
        </>
    );
};
