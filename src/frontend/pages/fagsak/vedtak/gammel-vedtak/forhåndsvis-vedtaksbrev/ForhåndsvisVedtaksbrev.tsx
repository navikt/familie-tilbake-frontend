import type { FC } from 'react';

import { Button } from '@navikt/ds-react';
import { useEffect } from 'react';

import { PdfVisningModal } from '~/komponenter/pdf-visning-modal/PdfVisningModal';

import { useForhåndsvisVedtaksbrev } from './useForhåndsvisVedtaksbrev';

export const ForhåndsvisVedtaksbrev: FC = () => {
    const {
        hentetForhåndsvisning,
        hentVedtaksbrev,
        visModal,
        kanViseForhåndsvisning,
        nullstillHentetForhåndsvisning,
    } = useForhåndsvisVedtaksbrev();

    useEffect(() => {
        if (visModal) {
            hentVedtaksbrev();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visModal]);

    return (
        <>
            <Button variant="tertiary" onClick={() => kanViseForhåndsvisning()}>
                Forhåndsvis vedtaksbrev
            </Button>
            {visModal && (
                <PdfVisningModal
                    åpen={visModal}
                    pdfdata={hentetForhåndsvisning}
                    onRequestClose={() => {
                        nullstillHentetForhåndsvisning();
                    }}
                />
            )}
        </>
    );
};
