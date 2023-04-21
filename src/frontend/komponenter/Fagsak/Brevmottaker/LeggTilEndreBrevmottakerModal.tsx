import React, { useState } from 'react';

import styled from 'styled-components';

import { Button, Fieldset, Heading, Label, Modal, Radio, RadioGroup } from '@navikt/ds-react';
import { ASpacing2, ASpacing6 } from '@navikt/ds-tokens/dist/tokens';
import { FamilieSelect } from '@navikt/familie-form-elements';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import { MottakerType, mottakerTypeVisningsnavn } from '../../../typer/Brevmottaker';
import { useBrevmottaker } from './BrevmottakerContext';
import BrevmottakerSkjema from './BrevmottakerSkjema';

const StyledModal = styled(Modal)`
    padding: 1rem;
`;

const FlexContainer = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    min-width: 33rem;
    min-height: 45rem;
`;

const StyledFieldset = styled(Fieldset)`
    &.navds-fieldset > :not(:first-child):not(:empty) {
        margin-top: ${ASpacing6};
    }
`;

const StyledHeading = styled(Heading)`
    margin-bottom: ${ASpacing2};
`;

const MottakerSelect = styled(FamilieSelect)`
    max-width: 19rem;
`;

const ModalKnapperad = styled.div`
    margin-top: 2.5rem;
    display: flex;
    justify-content: flex-start;
    gap: 1rem;
`;

interface Props {
    brevmottakerId?: string;
}

enum AdresseKilde {
    MANUELL_REGISTRERING = 'MANUELL_REGISTRERING',
    OPPSLAG_REGISTER = 'OPPSLAG_REGISTER',
    OPPSLAG_ORGANISASJONSREGISTER = 'OPPSLAG_ORGANISASJONSREGISTER',
    UDEFINERT = 'UDEFINERT',
}

const adresseKilder: Record<AdresseKilde, string> = {
    MANUELL_REGISTRERING: 'Manuell registrering',
    OPPSLAG_REGISTER: 'Oppslag i register',
    OPPSLAG_ORGANISASJONSREGISTER: 'Oppslag i organisasjonsregister',
    UDEFINERT: 'Udefinert',
};

export const LeggTilEndreBrevmottakerModal: React.FC<Props> = ({ brevmottakerId }: Props) => {
    const heading = !brevmottakerId ? 'Legg til brevmottaker' : 'Endre brevmottaker';
    const { visBrevmottakerModal, settVisBrevmottakerModal } = useBehandling();
    const { skjema, nullstillSkjema, valideringErOk, lagreBrevmottakerOgOppdaterState } =
        useBrevmottaker();
    const [adresseKilde, settAdresseKilde] = useState<AdresseKilde>(AdresseKilde.UDEFINERT);
    const lukkModal = () => {
        settVisBrevmottakerModal(false);
        settAdresseKilde(AdresseKilde.UDEFINERT);
        nullstillSkjema();
    };

    return (
        <StyledModal
            open={visBrevmottakerModal}
            aria-label={heading}
            onClose={lukkModal}
            shouldCloseOnOverlayClick={false}
        >
            <StyledHeading level="2" size="medium" id="modal-heading">
                {heading}
            </StyledHeading>
            <FlexContainer>
                <StyledFieldset
                    legend="Skjema for å legge til eller redigere brevmottaker"
                    hideLegend
                >
                    <MottakerSelect
                        {...skjema.felter.mottaker.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                        label="Mottaker"
                        onChange={(event): void => {
                            const nyMottakerType = event.target.value as MottakerType;
                            skjema.felter.mottaker.validerOgSettFelt(nyMottakerType);
                        }}
                    >
                        <option value={''} disabled={true}>
                            Velg
                        </option>
                        {Object.values(MottakerType)
                            .filter(type => type !== MottakerType.BRUKER)
                            .map(mottaker => (
                                <option value={mottaker} key={mottaker}>
                                    {mottakerTypeVisningsnavn[mottaker]}
                                </option>
                            ))}
                    </MottakerSelect>
                    {skjema.felter.mottaker.verdi &&
                        skjema.felter.mottaker.verdi !==
                            MottakerType.BRUKER_MED_UTENLANDSK_ADRESSE && (
                            <RadioGroup
                                legend={<Label>Adresse</Label>}
                                value={adresseKilde}
                                onChange={(val: AdresseKilde) => settAdresseKilde(val)}
                            >
                                <Radio
                                    name={'manuellRegistrering'}
                                    value={AdresseKilde.MANUELL_REGISTRERING}
                                    id={'manuell-registrering'}
                                >
                                    {adresseKilder[AdresseKilde.MANUELL_REGISTRERING]}
                                </Radio>
                                <Radio
                                    name={'oppslagRegister'}
                                    value={AdresseKilde.OPPSLAG_REGISTER}
                                    id={'oppslag-i-register'}
                                >
                                    {adresseKilder[AdresseKilde.OPPSLAG_REGISTER]}
                                </Radio>
                                {skjema.felter.mottaker.verdi === MottakerType.FULLMEKTIG && (
                                    <Radio
                                        name={'oppslagOrgRegister'}
                                        value={AdresseKilde.OPPSLAG_ORGANISASJONSREGISTER}
                                        id={'oppslag-i-organisasjonsregister'}
                                    >
                                        {adresseKilder[AdresseKilde.OPPSLAG_ORGANISASJONSREGISTER]}
                                    </Radio>
                                )}
                            </RadioGroup>
                        )}
                    {(adresseKilde === AdresseKilde.MANUELL_REGISTRERING ||
                        skjema.felter.mottaker.verdi ===
                            MottakerType.BRUKER_MED_UTENLANDSK_ADRESSE) && <BrevmottakerSkjema />}
                </StyledFieldset>
                <ModalKnapperad>
                    <>
                        <Button
                            variant={valideringErOk() ? 'primary' : 'secondary'}
                            loading={skjema.submitRessurs.status === RessursStatus.HENTER}
                            disabled={skjema.submitRessurs.status === RessursStatus.HENTER}
                            onClick={() =>
                                lagreBrevmottakerOgOppdaterState(brevmottakerId, lukkModal)
                            }
                        >
                            Legg til mottaker
                        </Button>
                        <Button variant="tertiary" onClick={lukkModal}>
                            Avbryt
                        </Button>
                    </>
                </ModalKnapperad>
            </FlexContainer>
        </StyledModal>
    );
};
