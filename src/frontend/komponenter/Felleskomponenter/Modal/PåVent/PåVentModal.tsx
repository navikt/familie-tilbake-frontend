import * as React from 'react';

import { styled } from 'styled-components';

import { BodyLong, Heading, Modal, Select } from '@navikt/ds-react';
import { ATextDanger, ASpacing8 } from '@navikt/ds-tokens/dist/tokens';
import { Valideringsstatus } from '@navikt/familie-skjema';

import {
    Behandlingssteg,
    IBehandling,
    IBehandlingsstegstilstand,
    manuelleVenteÅrsaker,
    venteårsaker,
} from '../../../../typer/behandling';
import { dateBeforeToday, datoformatNorsk, finnDateRelativtTilNå } from '../../../../utils';
import { FTButton, Spacer20 } from '../../Flytelementer';
import { FixedDatovelger } from '../../Skjemaelementer';
import { usePåVentBehandling } from './PåVentContext';

const FeilContainer = styled.div`
    margin-top: ${ASpacing8};

    & .typo-normal {
        color: ${ATextDanger};
    }
`;

export const minTidsfrist = (): string => {
    const minDato = new Date();
    minDato.setDate(minDato.getDate() + 1);
    return minDato.toISOString();
};

export const maxTidsfrist = (): string => {
    const dato = finnDateRelativtTilNå({ months: 3 });
    return dato.toISOString();
};

interface IProps {
    behandling: IBehandling;
    ventegrunn: IBehandlingsstegstilstand;
    onClose: () => void;
}

const PåVentModal: React.FC<IProps> = ({ behandling, ventegrunn, onClose }) => {
    const { skjema, onBekreft, nullstillSkjema, feilmelding } = usePåVentBehandling(
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
                    <FixedDatovelger
                        id={'frist'}
                        label={'Frist'}
                        onChange={(nyVerdi?: string) =>
                            skjema.felter.tidsfrist.onChange(nyVerdi ? nyVerdi : '')
                        }
                        limitations={{ minDate: minTidsfrist(), maxDate: maxTidsfrist() }}
                        placeholder={datoformatNorsk.DATO}
                        value={skjema.felter.tidsfrist.verdi}
                        feil={
                            ugyldigDatoValgt ? skjema.felter.tidsfrist.feilmelding?.toString() : ''
                        }
                        erLesesvisning={erVenterPåKravgrunnlag}
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
                        nullstillSkjema();
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
