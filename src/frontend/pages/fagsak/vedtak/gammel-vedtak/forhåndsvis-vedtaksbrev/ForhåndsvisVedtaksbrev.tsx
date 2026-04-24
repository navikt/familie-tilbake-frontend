import type { FC } from 'react';

import { Button } from '@navikt/ds-react';
import { useEffect, useEffectEvent } from 'react';

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

    const onVisModalEndret = useEffectEvent((skalVises: boolean) => {
        if (skalVises) {
            hentVedtaksbrev();
        }
    });

    useEffect(() => {
        onVisModalEndret(visModal);
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
