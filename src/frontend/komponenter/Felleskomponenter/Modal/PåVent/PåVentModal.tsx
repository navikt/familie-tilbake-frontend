import * as React from 'react';

import { addDays, addMonths } from 'date-fns';
import { styled } from 'styled-components';

import { BodyLong, Heading, Modal, Select } from '@navikt/ds-react';
import { ATextDanger, ASpacing8 } from '@navikt/ds-tokens/dist/tokens';
import { Valideringsstatus } from '@navikt/familie-skjema';

import { usePåVentBehandling } from './PåVentContext';
import {
    Behandlingssteg,
    IBehandling,
    IBehandlingsstegstilstand,
    manuelleVenteÅrsaker,
    venteårsaker,
} from '../../../../typer/behandling';
import { dateBeforeToday } from '../../../../utils';
import { dagensDato } from '../../../../utils/dato';
import Datovelger from '../../Datovelger/Datovelger';
import { FTButton, Spacer20 } from '../../Flytelementer';

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
    const { skjema, onBekreft, tilbakestillFelterTilDefault, feilmelding } = usePåVentBehandling(
        onClose,
        ventegrunn
    );

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

    return (
        <Modal
            open
            header={{
                heading: 'Behandling satt på vent',
                size: 'medium',
                closeButton: false,
            }}
            portal={true}
            width="small"
        >
            <Modal.Body>
                <>
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
                    Oppdater
                </FTButton>
                <FTButton
                    variant="tertiary"
                    key={'avbryt'}
                    onClick={() => {
                        tilbakestillFelterTilDefault();
                        onClose();
                    }}
                    size="small"
                >
                    Lukk
                </FTButton>
            </Modal.Footer>
        </Modal>
    );
};

export default PåVentModal;
