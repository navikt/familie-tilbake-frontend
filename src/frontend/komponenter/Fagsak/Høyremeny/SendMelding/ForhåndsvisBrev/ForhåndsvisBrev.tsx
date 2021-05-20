import * as React from 'react';

import { Flatknapp } from 'nav-frontend-knapper';

import PdfVisningModal from '../../../../Felleskomponenter/PdfVisningModal/PdfVisningModal';
import { useSendMelding } from '../SendMeldingContext';
import { useForhåndsvisBrev } from './useForhåndsvisBrev';

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
            <Flatknapp
                mini
                onClick={() => {
                    if (kanSendeSkjema()) {
                        settVisModal(true);
                    }
                }}
            >
                Forhåndsvis
            </Flatknapp>
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
