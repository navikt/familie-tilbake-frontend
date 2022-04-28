import * as React from 'react';

import { FTButton } from '../../../Felleskomponenter/Flytelementer';
import PdfVisningModal from '../../../Felleskomponenter/PdfVisningModal/PdfVisningModal';
import { useForhåndsvisVedtaksbrev } from './useForhåndsvisVedtaksbrev';

interface IProps {
    test?: boolean;
}

const ForhåndsvisVedtaksbrev: React.FC<IProps> = () => {
    const {
        hentetForhåndsvisning,
        hentVedtaksbrev,
        visModal,
        settVisModal,
        nullstillHentetForhåndsvisning,
    } = useForhåndsvisVedtaksbrev();

    React.useEffect(() => {
        if (visModal) {
            hentVedtaksbrev();
        }
    }, [visModal]);

    return (
        <>
            <FTButton variant="tertiary" onClick={() => settVisModal(true)}>
                Forhåndsvis vedtaksbrev
            </FTButton>
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

export default ForhåndsvisVedtaksbrev;
