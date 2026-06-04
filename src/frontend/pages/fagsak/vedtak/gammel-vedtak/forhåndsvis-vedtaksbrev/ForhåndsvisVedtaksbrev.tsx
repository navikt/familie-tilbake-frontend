import type { FC } from 'react';

import { Button } from '@navikt/ds-react';
import { useEffect } from 'react';

import { PdfVisningModal } from '@/komponenter/pdf-visning-modal/PdfVisningModal';

import { useForhåndsvisVedtaksbrev } from './useForhåndsvisVedtaksbrev';

export const ForhåndsvisVedtaksbrev: FC = () => {
    const {
        hentetForhåndsvisning,
        hentVedtaksbrev,
        visModal,
        kanViseForhåndsvisning,
        nullstillHentetForhåndsvisning,
    } = useForhåndsvisVedtaksbrev();

    // biome-ignore lint/correctness/useExhaustiveDependencies: Se på om dette er en bug eller tiltenkt funksjonalitet. Vurder useEffectEvent senere.
    useEffect(() => {
        if (visModal) {
            hentVedtaksbrev();
        }
    }, [visModal]);

    return (
        <>
            <Button variant="tertiary" onClick={(): void => kanViseForhåndsvisning()}>
                Forhåndsvis vedtaksbrev
            </Button>
            {visModal && (
                <PdfVisningModal
                    åpen={visModal}
                    pdfdata={hentetForhåndsvisning}
                    onRequestClose={(): void => nullstillHentetForhåndsvisning()}
                />
            )}
        </>
    );
};
