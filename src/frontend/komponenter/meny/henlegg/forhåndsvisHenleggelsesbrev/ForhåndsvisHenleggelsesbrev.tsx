import type { FC } from 'react';
import type { Skjema } from '@/hooks/skjema';
import type { HenleggelseSkjemaDefinisjon } from '@/komponenter/meny/henlegg/henleggModal/HenleggModalContext';

import { ExternalLinkIcon } from '@navikt/aksel-icons';
import { Detail, Link } from '@navikt/ds-react';
import { useEffect } from 'react';

import { PdfVisningModal } from '@/komponenter/pdf-visning-modal/PdfVisningModal';

import { useForhåndsvisHenleggelsesbrev } from './useForhåndsvisHenleggelsesbrev';

type Props = {
    skjema: Skjema<HenleggelseSkjemaDefinisjon, string>;
    kanForhåndsvise: boolean;
};

export const ForhåndsvisHenleggelsesBrev: FC<Props> = ({ skjema, kanForhåndsvise }: Props) => {
    const {
        hentetForhåndsvisning,
        hentBrev,
        visModal,
        setVisModal,
        nullstillHentetForhåndsvisning,
    } = useForhåndsvisHenleggelsesbrev({ skjema });

    // biome-ignore lint/correctness/useExhaustiveDependencies: Se på om dette er en bug eller tiltenkt funksjonalitet. Vurder useEffectEvent senere.
    useEffect(() => {
        if (visModal) {
            hentBrev();
        }
    }, [visModal]);

    return kanForhåndsvise ? (
        <div className="m-auto">
            <Detail>Informer søker: </Detail>
            <Link
                href="#"
                onMouseDown={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void =>
                    e.preventDefault()
                }
                onClick={(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void => {
                    e.preventDefault();
                    setVisModal(true);
                }}
            >
                Forhåndsvis brev
                <ExternalLinkIcon />
            </Link>
            {visModal && (
                <PdfVisningModal
                    åpen={visModal}
                    pdfdata={hentetForhåndsvisning}
                    onRequestClose={(): void => {
                        nullstillHentetForhåndsvisning();
                        setVisModal(false);
                    }}
                />
            )}
        </div>
    ) : null;
};
