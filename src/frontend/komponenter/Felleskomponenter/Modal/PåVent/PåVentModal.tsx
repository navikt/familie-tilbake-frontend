import * as React from 'react';

import { addDays, addMonths } from 'date-fns';
import { styled } from 'styled-components';

import { Alert, BodyLong, Heading, Modal, Select } from '@navikt/ds-react';
import { ASpacing8, ATextDanger } from '@navikt/ds-tokens/dist/tokens';
import { Valideringsstatus } from '@navikt/familie-skjema';

import { usePåVentBehandling } from './PåVentContext';
import { useBehandling } from '../../../../context/BehandlingContext';
import {
    Behandlingssteg,
    IBehandling,
    IBehandlingsstegstilstand,
    manuelleVenteÅrsaker,
    Saksbehandlingstype,
    venteårsaker,
} from '../../../../typer/behandling';
import { dateBeforeToday } from '../../../../utils';
import { dagensDato } from '../../../../utils/dato';
import Datovelger from '../../Datovelger/Datovelger';
import { FTButton, Spacer20 } from '../../Flytelementer';

const StyledAlert = styled(Alert)`
    margin-bottom: 1.5rem;
`;

const FeilContainer = styled.div`
    margin-top: ${ASpacing8};

    & .typo-normal {
        color: ${ATextDanger};
    }
`;

interface IProps {
    behandling: IBehandling;
    ventegrunn: IBehandlingsstegstilstand;
    onClose: () => void;
}

const PåVentModal: React.FC<IProps> = ({ behandling, ventegrunn, onClose }) => {
    const { hentBehandlingMedBehandlingId } = useBehandling();

    const lukkModalOgHentBehandling = () => {
        onClose();
        hentBehandlingMedBehandlingId(behandling.behandlingId);
    };

    const { skjema, onBekreft, onOkTaAvVent, tilbakestillFelterTilDefault, feilmelding } =
        usePåVentBehandling(lukkModalOgHentBehandling, ventegrunn);

    const erVenterPåKravgrunnlag = ventegrunn.behandlingssteg === Behandlingssteg.GRUNNLAG;
    const erAutomatiskVent =
        ventegrunn.behandlingssteg === Behandlingssteg.VARSEL || erVenterPåKravgrunnlag;

    const muligeÅrsaker =
        ventegrunn.venteårsak && !manuelleVenteÅrsaker.includes(ventegrunn.venteårsak)
            ? manuelleVenteÅrsaker.concat([ventegrunn.venteårsak])
            : manuelleVenteÅrsaker;

    const erFristenUtløpt =
        erVenterPåKravgrunnlag && ventegrunn.tidsfrist && dateBeforeToday(ventegrunn.tidsfrist);

    const ugyldigDatoValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.tidsfrist.valideringsstatus === Valideringsstatus.FEIL;

    const uendret =
        ventegrunn.venteårsak === skjema.felter.årsak.verdi &&
        ventegrunn.tidsfrist === skjema.felter.tidsfrist.verdi;

    const venterPåKravgrunnlag = ventegrunn?.behandlingssteg === Behandlingssteg.GRUNNLAG;

    const vilBliAutomatiskBehandletUnder4rettsgebyr =
        venterPåKravgrunnlag &&
        behandling.saksbehandlingstype ===
            Saksbehandlingstype.AUTOMATISK_IKKE_INNKREVING_UNDER_4X_RETTSGEBYR;

    const lukkModal = () => {
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
                            <StyledAlert
                                children={automatiskUnder4rettsgebyrBehandletTekst}
                                variant="info"
                            />
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
                        label={'Årsak'}
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
                <FTButton
                    variant="primary"
                    key={'bekreft'}
                    onClick={() => {
                        onBekreft(behandling.behandlingId);
                    }}
                    disabled={uendret}
                    size="small"
                >
                    Oppdater frist og årsak
                </FTButton>
                <FTButton
                    variant="tertiary"
                    key={'avbryt'}
                    onClick={() => onOkTaAvVent(behandling.behandlingId)}
                    size="small"
                    disabled={!behandling.kanEndres || venterPåKravgrunnlag}
                >
                    Ta av vent
                </FTButton>
            </Modal.Footer>
        </Modal>
    );
};

export default PåVentModal;
