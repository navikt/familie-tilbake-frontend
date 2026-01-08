import type { BehandlingDto } from '../../../../generated';
import type { Behandlingsstegstilstand } from '../../../../typer/behandling';

import { Alert, BodyLong, Button, Heading, Modal, Select } from '@navikt/ds-react';
import { ASpacing8, ATextDanger } from '@navikt/ds-tokens/dist/tokens';
import { useQueryClient } from '@tanstack/react-query';
import { addDays, addMonths } from 'date-fns';
import * as React from 'react';
import { styled } from 'styled-components';

import { usePåVentBehandling } from './PåVentContext';
import { Valideringsstatus } from '../../../../hooks/skjema';
import {
    Behandlingssteg,
    manuelleVenteÅrsaker,
    Saksbehandlingstype,
    venteårsaker,
} from '../../../../typer/behandling';
import { dateBeforeToday } from '../../../../utils';
import { dagensDato } from '../../../../utils/dato';
import Datovelger from '../../Datovelger/Datovelger';
import { Spacer20 } from '../../Flytelementer';

const StyledAlert = styled(Alert)`
    margin-bottom: 1.5rem;
`;

const FeilContainer = styled.div`
    margin-top: ${ASpacing8};

    & .typo-normal {
        color: ${ATextDanger};
    }
`;

type Props = {
    behandling: BehandlingDto;
    ventegrunn: Behandlingsstegstilstand;
    onClose: () => void;
};

const PåVentModal: React.FC<Props> = ({ behandling, ventegrunn, onClose }) => {
    const queryClient = useQueryClient();

    const lukkModalOgHentBehandling = (): void => {
        onClose();
        queryClient.invalidateQueries({
            queryKey: ['hentBehandling', { path: { behandlingId: behandling.behandlingId } }],
        });
    };

    const { skjema, onBekreft, onOkTaAvVent, tilbakestillFelterTilDefault, feilmelding } =
        usePåVentBehandling(lukkModalOgHentBehandling, ventegrunn);

    const erVenterPåKravgrunnlag = ventegrunn.behandlingssteg === Behandlingssteg.Grunnlag;
    const erAutomatiskVent =
        ventegrunn.behandlingssteg === Behandlingssteg.Varsel || erVenterPåKravgrunnlag;

    const muligeÅrsaker =
        ventegrunn.venteårsak && !manuelleVenteÅrsaker.includes(ventegrunn.venteårsak)
            ? manuelleVenteÅrsaker.concat([ventegrunn.venteårsak])
            : manuelleVenteÅrsaker;

    const erFristenUtløpt =
        erVenterPåKravgrunnlag && ventegrunn.tidsfrist && dateBeforeToday(ventegrunn.tidsfrist);

    const ugyldigDatoValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.tidsfrist.valideringsstatus === Valideringsstatus.Feil;

    const uendret =
        ventegrunn.venteårsak === skjema.felter.årsak.verdi &&
        ventegrunn.tidsfrist === skjema.felter.tidsfrist.verdi;

    const venterPåKravgrunnlag = ventegrunn?.behandlingssteg === Behandlingssteg.Grunnlag;

    const vilBliAutomatiskBehandletUnder4rettsgebyr =
        venterPåKravgrunnlag &&
        behandling.saksbehandlingstype ===
            Saksbehandlingstype.AutomatiskIkkeInnkrevingUnder4XRettsgebyr;

    const lukkModal = (): void => {
        tilbakestillFelterTilDefault();
        onClose();
    };

    const automatiskUnder4rettsgebyrBehandletTekst =
        'Denne behandlingen vil bli automatisk utført dersom mottatt kravgrunnlag er under 4 rettsgebyr.';

    return (
        <Modal
            open
            onClose={lukkModal}
            header={{
                heading: 'Behandling satt på vent',
                size: 'medium',
                closeButton: true,
            }}
            portal={true}
            width="small"
        >
            <Modal.Body>
                <>
                    {vilBliAutomatiskBehandletUnder4rettsgebyr && (
                        <>
                            <StyledAlert variant="info">
                                {automatiskUnder4rettsgebyrBehandletTekst}
                            </StyledAlert>
                        </>
                    )}

                    {erFristenUtløpt && (
                        <>
                            <Heading level="3" size="xsmall" spacing>
                                OBS! Fristen på denne behandlingen er utløpt!
                            </Heading>
                            <BodyLong size="small">
                                Kontroller hvorfor Økonomi ikke har dannet et kravgrunnlag.
                            </BodyLong>
                            <BodyLong size="small">
                                Dersom det feilutbetalte beløpet er bortfalt skal saken henlegges.
                            </BodyLong>
                            <BodyLong size="small" spacing>
                                For mer informasjon, se rutine under tilbakekreving.
                            </BodyLong>
                        </>
                    )}
                    <Datovelger
                        felt={skjema.felter.tidsfrist}
                        label="Frist"
                        visFeilmeldinger={ugyldigDatoValgt}
                        readOnly={erVenterPåKravgrunnlag}
                        minDatoAvgrensning={addDays(dagensDato, 1)}
                        maksDatoAvgrensning={addMonths(dagensDato, 3)}
                    />
                    <Spacer20 />
                    <Select
                        {...skjema.felter.årsak.hentNavInputProps(skjema.visFeilmeldinger)}
                        label="Årsak"
                        readOnly={erAutomatiskVent}
                    >
                        <option value="" disabled>
                            Velg årsak
                        </option>
                        {muligeÅrsaker.map((årsak, index) => (
                            <option key={`årsak_${index}`} value={årsak}>
                                {venteårsaker[årsak]}
                            </option>
                        ))}
                    </Select>
                    {feilmelding && feilmelding !== '' && (
                        <FeilContainer>
                            <BodyLong size="small">{feilmelding}</BodyLong>
                        </FeilContainer>
                    )}
                </>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="primary"
                    key="bekreft"
                    onClick={() => {
                        onBekreft(behandling.behandlingId);
                    }}
                    disabled={uendret}
                    size="small"
                >
                    Oppdater frist og årsak
                </Button>
                <Button
                    variant="tertiary"
                    key="avbryt"
                    onClick={() => onOkTaAvVent(behandling.behandlingId)}
                    size="small"
                    disabled={!behandling.kanEndres || venterPåKravgrunnlag}
                >
                    Ta av vent
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PåVentModal;
