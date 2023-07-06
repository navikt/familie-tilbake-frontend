import * as React from 'react';

import { useForhåndsvisBrev } from './useForhåndsvisBrev';
import { FTButton } from '../../../../Felleskomponenter/Flytelementer';
import PdfVisningModal from '../../../../Felleskomponenter/PdfVisningModal/PdfVisningModal';
import { useSendMelding } from '../SendMeldingContext';

interface IProps {
    test?: boolean;
}

const ForhåndsvisBrev: React.FC<IProps> = () => {
    const {
        hentetForhåndsvisning,
        hentBrev,
        visModal,
        settVisModal,
        nullstillHentetForhåndsvisning,
    } = useForhåndsvisBrev();
    const { kanSendeSkjema } = useSendMelding();

    React.useEffect(() => {
        if (visModal) {
            hentBrev();
        }
    }, [visModal]);

    return (
        <>
            <FTButton
                size="small"
                variant="tertiary"
                onClick={() => {
                    if (kanSendeSkjema()) {
                        settVisModal(true);
                    }
                }}
            >
                Forhåndsvis
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

export default ForhåndsvisBrev;
