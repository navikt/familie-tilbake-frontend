import type { BehandlingsstegsinfoDto } from '~/generated';

import { BodyLong, BodyShort, Button, Heading, LocalAlert, Modal, Select } from '@navikt/ds-react';
import { useQueryClient } from '@tanstack/react-query';
import { addDays, addMonths } from 'date-fns';
import * as React from 'react';

import { useBehandling } from '~/context/BehandlingContext';
import { hentBehandlingQueryKey } from '~/generated/@tanstack/react-query.gen';
import { Valideringsstatus } from '~/hooks/skjema';
import { Datovelger } from '~/komponenter/datovelger/Datovelger';
import { manuelleVenteÅrsaker, venteårsaker } from '~/typer/behandling';
import { dateBeforeToday } from '~/utils';
import { dagensDato } from '~/utils/dato';

import { usePåVentBehandling } from './PåVentContext';

type Props = {
    ventegrunn: BehandlingsstegsinfoDto;
    onClose: () => void;
};

export const PåVentModal: React.FC<Props> = ({ ventegrunn, onClose }) => {
    const { behandlingId, saksbehandlingstype, kanEndres } = useBehandling();
    const queryClient = useQueryClient();

    const lukkModalOgHentBehandling = async (): Promise<void> => {
        onClose();
        await queryClient.invalidateQueries({
            queryKey: hentBehandlingQueryKey({ path: { behandlingId: behandlingId } }),
        });
    };

    const { skjema, onBekreft, onOkTaAvVent, tilbakestillFelterTilDefault, feilmelding } =
        usePåVentBehandling(lukkModalOgHentBehandling, ventegrunn);

    const erVenterPåKravgrunnlag = ventegrunn.behandlingssteg === 'GRUNNLAG';
    const erAutomatiskVent = ventegrunn.behandlingssteg === 'VARSEL' || erVenterPåKravgrunnlag;

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

    const venterPåKravgrunnlag = ventegrunn?.behandlingssteg === 'GRUNNLAG';

    const vilBliAutomatiskBehandletUnder4rettsgebyr =
        venterPåKravgrunnlag &&
        saksbehandlingstype === 'AUTOMATISK_IKKE_INNKREVING_UNDER_4X_RETTSGEBYR';

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
            portal
            width="medium"
        >
            <Modal.Body className="flex flex-col gap-4">
                <>
                    {vilBliAutomatiskBehandletUnder4rettsgebyr && (
                        <LocalAlert status="announcement">
                            <LocalAlert.Content>
                                {automatiskUnder4rettsgebyrBehandletTekst}
                            </LocalAlert.Content>
                        </LocalAlert>
                    )}
                    {erFristenUtløpt && (
                        <>
                            <Heading level="3" size="xsmall">
                                OBS! Fristen på denne behandlingen er utløpt!
                            </Heading>
                            <div>
                                <BodyShort size="small">
                                    Kontroller hvorfor Økonomi ikke har dannet et kravgrunnlag.
                                </BodyShort>
                                <BodyShort size="small">
                                    Dersom det feilutbetalte beløpet er bortfalt skal saken
                                    henlegges.
                                </BodyShort>
                                <BodyShort size="small">
                                    For mer informasjon, se rutine under tilbakekreving.
                                </BodyShort>
                            </div>
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
                        <BodyLong size="small" className="text-ax-text-danger">
                            {feilmelding}
                        </BodyLong>
                    )}
                </>
            </Modal.Body>
            <Modal.Footer>
                <Button
                    key="bekreft"
                    onClick={() => onBekreft(behandlingId)}
                    disabled={uendret}
                    size="small"
                >
                    Oppdater frist og årsak
                </Button>
                <Button
                    variant="tertiary"
                    key="avbryt"
                    onClick={() => onOkTaAvVent(behandlingId)}
                    size="small"
                    disabled={!kanEndres || venterPåKravgrunnlag}
                >
                    Ta av vent
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
