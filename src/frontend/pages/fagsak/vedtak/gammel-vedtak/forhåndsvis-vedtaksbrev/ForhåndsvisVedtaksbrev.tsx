import { Button } from '@navikt/ds-react';
import * as React from 'react';

import { PdfVisningModal } from '~/komponenter/pdf-visning-modal/PdfVisningModal';

import { useForhåndsvisVedtaksbrev } from './useForhåndsvisVedtaksbrev';

export const ForhåndsvisVedtaksbrev: React.FC = () => {
    const {
        hentetForhåndsvisning,
        hentVedtaksbrev,
        visModal,
        kanViseForhåndsvisning,
        nullstillHentetForhåndsvisning,
    } = useForhåndsvisVedtaksbrev();

    React.useEffect(() => {
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
