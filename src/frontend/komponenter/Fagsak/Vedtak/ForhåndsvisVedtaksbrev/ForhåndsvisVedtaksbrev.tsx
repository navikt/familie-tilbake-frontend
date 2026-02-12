import { Button } from '@navikt/ds-react';
import * as React from 'react';

import { useForhåndsvisVedtaksbrev } from './useForhåndsvisVedtaksbrev';
import { PdfVisningModal } from '../../../Felleskomponenter/PdfVisningModal/PdfVisningModal';

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
