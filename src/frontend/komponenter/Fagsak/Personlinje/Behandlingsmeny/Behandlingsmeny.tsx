import * as React from 'react';

import styled from 'styled-components';

import { ExpandFilled } from '@navikt/ds-icons';
import { Button, Popover } from '@navikt/ds-react';
import { NavdsFontSizeXlarge, NavdsFontWeightBold } from '@navikt/ds-tokens/dist/tokens';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../../context/BehandlingContext';
import { Fagsystem } from '../../../../kodeverk';
import { Behandlingssteg, Behandlingstatus } from '../../../../typer/behandling';
import { IFagsak } from '../../../../typer/fagsak';
import EndreBehandlendeEnhet from './EndreBehandlendeEnhet/EndreBehandlendeEnhet';
import GjennoptaBehandling from './GjennoptaBehandling/GjennoptaBehandling';
import HenleggBehandling from './HenleggBehandling/HenleggBehandling';
import OpprettBehandling from './OpprettBehandling/OpprettBehandling';
import OpprettFjernVerge from './OpprettFjernVerge/OpprettFjernVerge';
import SettBehandlingPåVent from './SettBehandlingPåVent/SettBehandlingPåVent';

const StyledList = styled.ul`
    list-style-type: none;
    padding: 0;
    min-width: 210px;
`;

const StyledButton = styled(Button)`
    & .navds-label {
        font-size: ${NavdsFontSizeXlarge};
        font-weight: ${NavdsFontWeightBold};
    }
`;

interface IProps {
    fagsak: IFagsak;
}

const Behandlingsmeny: React.FC<IProps> = ({ fagsak }) => {
    const { behandling, ventegrunn, erStegBehandlet, aktivtSteg } = useBehandling();
    const [visMeny, settVisMeny] = React.useState<boolean>(false);
    const buttonRef = React.useRef(null);

    const venterPåKravgrunnlag = ventegrunn?.behandlingssteg === Behandlingssteg.GRUNNLAG;
    const vedtakFattetEllerFattes =
        erStegBehandlet(Behandlingssteg.FATTE_VEDTAK) ||
        aktivtSteg?.behandlingssteg === Behandlingssteg.FATTE_VEDTAK;

    return (
        <>
            <StyledButton
                ref={buttonRef}
                id={'behandlingsmeny-arialabel-knapp'}
                size="small"
                variant="secondary"
                onClick={() => settVisMeny(!visMeny)}
            >
                Behandlingsmeny
                <ExpandFilled />
            </StyledButton>

            {buttonRef && (
                <Popover
                    open={visMeny}
                    anchorEl={buttonRef.current}
                    arrow={false}
                    placement="bottom-end"
                    onClose={() => settVisMeny(false)}
                >
                    <StyledList role="menu" aria-labelledby={'behandlingsmeny-arialabel-knapp'}>
                        {behandling?.status === RessursStatus.SUKSESS && (
                            <li>
                                <OpprettBehandling
                                    behandling={behandling.data}
                                    fagsak={fagsak}
                                    onListElementClick={() => settVisMeny(false)}
                                />
                            </li>
                        )}
                        {behandling?.status === RessursStatus.SUKSESS &&
                            behandling.data.status !== Behandlingstatus.AVSLUTTET &&
                            !vedtakFattetEllerFattes &&
                            behandling.data.kanEndres && (
                                <>
                                    <li>
                                        <HenleggBehandling
                                            behandling={behandling.data}
                                            fagsak={fagsak}
                                            onListElementClick={() => settVisMeny(false)}
                                        />
                                    </li>
                                    <li>
                                        <OpprettFjernVerge
                                            behandling={behandling.data}
                                            onListElementClick={() => settVisMeny(false)}
                                        />
                                    </li>
                                    {!venterPåKravgrunnlag &&
                                        (behandling.data.erBehandlingPåVent || ventegrunn ? (
                                            <li>
                                                <GjennoptaBehandling
                                                    behandling={behandling.data}
                                                    onListElementClick={() => settVisMeny(false)}
                                                />
                                            </li>
                                        ) : (
                                            <li>
                                                <SettBehandlingPåVent
                                                    behandling={behandling.data}
                                                    onListElementClick={() => settVisMeny(false)}
                                                />
                                            </li>
                                        ))}
                                    {fagsak.fagsystem === Fagsystem.BA && (
                                        <li>
                                            <EndreBehandlendeEnhet
                                                ytelse={fagsak.ytelsestype}
                                                behandling={behandling.data}
                                                onListElementClick={() => settVisMeny(false)}
                                            />
                                        </li>
                                    )}
                                </>
                            )}
                    </StyledList>
                </Popover>
            )}
        </>
    );
};

export default Behandlingsmeny;
