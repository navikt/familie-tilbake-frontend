import * as React from 'react';

import styled from 'styled-components';

import navFarger from 'nav-frontend-core';
import Lenke from 'nav-frontend-lenker';
import { Undertekst } from 'nav-frontend-typografi';

import { ExternalLink } from '@navikt/ds-icons';
import { type ISkjema } from '@navikt/familie-skjema';

import { IBehandling } from '../../../../../../typer/behandling';
import PdfVisningModal from '../../../../../Felleskomponenter/PdfVisningModal/PdfVisningModal';
import { HenleggelseSkjemaDefinisjon } from '../HenleggBehandlingModal/HenleggBehandlingModalContext';
import { useForhåndsvisHenleggelsesbrev } from './useForhåndsvisHenleggelsesbrev';

const StyledContainer = styled.div`
    margin-top: -5px;
    margin-right: auto;
`;

interface IProps {
    behandling: IBehandling;
    skjema: ISkjema<HenleggelseSkjemaDefinisjon, string>;
    kanForhåndsvise: boolean;
}

const ForhåndsvisHenleggelsesBrev: React.FC<IProps> = ({ behandling, skjema, kanForhåndsvise }) => {
    const {
        hentetForhåndsvisning,
        hentBrev,
        visModal,
        settVisModal,
        nullstillHentetForhåndsvisning,
    } = useForhåndsvisHenleggelsesbrev({ skjema });

    React.useEffect(() => {
        if (visModal) {
            hentBrev(behandling);
        }
    }, [visModal]);

    return kanForhåndsvise ? (
        <StyledContainer>
            <Undertekst>Informer søker: </Undertekst>
            <Lenke
                href="#"
                onMouseDown={e => e.preventDefault()}
                onClick={e => {
                    e.preventDefault();
                    settVisModal(true);
                }}
            >
                <span>Forhåndsvis brev</span>
                <ExternalLink color={navFarger.navBla} />
            </Lenke>
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
        </StyledContainer>
    ) : null;
};

export default ForhåndsvisHenleggelsesBrev;
