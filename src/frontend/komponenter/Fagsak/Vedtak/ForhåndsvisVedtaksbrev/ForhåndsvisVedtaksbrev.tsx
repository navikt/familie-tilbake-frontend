import * as React from 'react';

import { Flatknapp } from 'nav-frontend-knapper';

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
            <Flatknapp onClick={() => settVisModal(true)}>Forhåndsvis vedtaksbrev</Flatknapp>
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
