import * as React from 'react';

import { Button } from '@navikt/ds-react';

import { useForhåndsvisVedtaksbrev } from './useForhåndsvisVedtaksbrev';
import PdfVisningModal from '../../../Felleskomponenter/PdfVisningModal/PdfVisningModal';

const ForhåndsvisVedtaksbrev: React.FC = () => {
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

export default ForhåndsvisVedtaksbrev;
