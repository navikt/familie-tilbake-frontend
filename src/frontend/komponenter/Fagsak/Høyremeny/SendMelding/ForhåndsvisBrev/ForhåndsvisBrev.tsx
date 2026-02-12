import { Button } from '@navikt/ds-react';
import * as React from 'react';

import { useForhåndsvisBrev } from './useForhåndsvisBrev';
import { PdfVisningModal } from '../../../../Felleskomponenter/PdfVisningModal/PdfVisningModal';
import { useSendMelding } from '../SendMeldingContext';

type Props = {
    test?: boolean;
};

export const ForhåndsvisBrev: React.FC<Props> = () => {
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
