import * as React from 'react';

import { useForhåndsvisVedtaksbrev } from './useForhåndsvisVedtaksbrev';
import { FTButton } from '../../../Felleskomponenter/Flytelementer';
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
            <FTButton variant="tertiary" onClick={() => kanViseForhåndsvisning()}>
                Forhåndsvis vedtaksbrev
            </FTButton>
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
