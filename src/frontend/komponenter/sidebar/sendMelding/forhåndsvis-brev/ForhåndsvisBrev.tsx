import type { FC } from 'react';

import { Button } from '@navikt/ds-react';
import { useEffect } from 'react';

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
        settVisModal,
        nullstillHentetForhåndsvisning,
    } = useForhåndsvisBrev();
    const { kanSendeSkjema } = useSendMelding();

    useEffect(() => {
        if (visModal) {
            hentBrev();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visModal]);

    return (
        <>
            <Button
                size="small"
                variant="tertiary"
                onClick={() => {
                    if (kanSendeSkjema()) {
                        settVisModal(true);
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
                        settVisModal(false);
                    }}
                />
            )}
        </>
    );
};
