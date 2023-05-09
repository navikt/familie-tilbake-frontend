import React from 'react';

import styled from 'styled-components';

import { Button, Fieldset, Heading, Modal, Radio, RadioGroup } from '@navikt/ds-react';
import { ASpacing2, ASpacing6 } from '@navikt/ds-tokens/dist/tokens';
import { FamilieInput, FamilieSelect } from '@navikt/familie-form-elements';
import { RessursStatus } from '@navikt/familie-typer';

import { useBehandling } from '../../../context/BehandlingContext';
import {
    AdresseKilde,
    adresseKilder,
    MottakerType,
    mottakerTypeVisningsnavn,
} from '../../../typer/Brevmottaker';
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

const erMottakerBruker = (mottakerType: MottakerType | '') =>
    mottakerType === MottakerType.BRUKER_MED_UTENLANDSK_ADRESSE ||
    mottakerType === MottakerType.DØDSBO;

export const LeggTilEndreBrevmottakerModal: React.FC = () => {
    const { visBrevmottakerModal, settVisBrevmottakerModal } = useBehandling();
    const {
        skjema,
        nullstillSkjema,
        adresseKilde,
        settAdresseKilde,
        valideringErOk,
        settVisfeilmeldinger,
        lagreBrevmottakerOgOppdaterState,
        brevmottakerIdTilEndring,
        settBrevmottakerIdTilEndring,
        bruker,
    } = useBrevmottaker();

    const heading = brevmottakerIdTilEndring ? 'Endre brevmottaker' : 'Legg til brevmottaker';
    const [navnErPreutfylt, settNavnErPreutfylt] = React.useState(false);

    React.useEffect(() => {
        const navnSkalVærePreutfylt = erMottakerBruker(skjema.felter.mottaker.verdi);
        if (navnSkalVærePreutfylt !== navnErPreutfylt) {
            skjema.felter.navn.validerOgSettFelt((navnSkalVærePreutfylt && bruker.navn) || '');
            settNavnErPreutfylt(navnSkalVærePreutfylt);
        }
    }, [skjema.felter.mottaker.verdi]);

    const lukkModal = () => {
        settVisBrevmottakerModal(false);
        settAdresseKilde(AdresseKilde.UDEFINERT);
        settBrevmottakerIdTilEndring(undefined);
        nullstillSkjema();
    };

    const nullstillManuellAdresseInput = (inkludertNavn?: boolean) => {
        inkludertNavn && skjema.felter.navn.nullstill();
        skjema.felter.adresselinje1.nullstill();
        skjema.felter.adresselinje2.nullstill();
        skjema.felter.postnummer.nullstill();
        skjema.felter.poststed.nullstill();
        skjema.felter.land.nullstill();
        settVisfeilmeldinger(false);
    };

    const skalNullstilleAdresseInputVedNyMottakerType = (nyMottakerType: MottakerType) =>
        erMottakerBruker(nyMottakerType) !== erMottakerBruker(skjema.felter.mottaker.verdi) ||
        adresseKilde === AdresseKilde.OPPSLAG_ORGANISASJONSREGISTER;

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
                            if (skalNullstilleAdresseInputVedNyMottakerType(nyMottakerType)) {
                                nullstillManuellAdresseInput();
                                settAdresseKilde(
                                    erMottakerBruker(nyMottakerType)
                                        ? AdresseKilde.MANUELL_REGISTRERING
                                        : AdresseKilde.UDEFINERT
                                );
                            }
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
                    {!erMottakerBruker(skjema.felter.mottaker.verdi) && (
                        <RadioGroup
                            legend={'Adresse'}
                            value={adresseKilde}
                            onChange={(val: AdresseKilde) => {
                                settAdresseKilde(val);
                                nullstillManuellAdresseInput(true);
                            }}
                        >
                            <Radio
                                id={'manuell-registrering'}
                                value={AdresseKilde.MANUELL_REGISTRERING}
                            >
                                {adresseKilder[AdresseKilde.MANUELL_REGISTRERING]}
                            </Radio>
                            <Radio id={'oppslag-i-register'} value={AdresseKilde.OPPSLAG_REGISTER}>
                                {adresseKilder[AdresseKilde.OPPSLAG_REGISTER]}
                            </Radio>
                            {skjema.felter.mottaker.verdi === MottakerType.FULLMEKTIG && (
                                <Radio
                                    id={'oppslag-i-organisasjonsregister'}
                                    value={AdresseKilde.OPPSLAG_ORGANISASJONSREGISTER}
                                >
                                    {adresseKilder[AdresseKilde.OPPSLAG_ORGANISASJONSREGISTER]}
                                </Radio>
                            )}
                        </RadioGroup>
                    )}
                    {adresseKilde === AdresseKilde.MANUELL_REGISTRERING && (
                        <BrevmottakerSkjema navnErPreutfylt={navnErPreutfylt} />
                    )}
                    {adresseKilde === AdresseKilde.OPPSLAG_REGISTER && (
                        <FamilieInput
                            {...skjema.felter.fødselsnummer.hentNavBaseSkjemaProps(
                                skjema.visFeilmeldinger
                            )}
                            label={'Fødselsnummer'}
                            onChange={(event): void => {
                                skjema.felter.fødselsnummer.validerOgSettFelt(event.target.value);
                            }}
                        />
                    )}
                    {adresseKilde === AdresseKilde.OPPSLAG_ORGANISASJONSREGISTER && (
                        <>
                            <FamilieInput
                                {...skjema.felter.organisasjonsnummer.hentNavBaseSkjemaProps(
                                    skjema.visFeilmeldinger
                                )}
                                label={'Organisasjonsnummer'}
                                onChange={(event): void => {
                                    skjema.felter.organisasjonsnummer.validerOgSettFelt(
                                        event.target.value
                                    );
                                }}
                            />
                            <FamilieInput
                                {...skjema.felter.navn.hentNavBaseSkjemaProps(
                                    skjema.visFeilmeldinger
                                )}
                                label={'Kontaktperson i organisasjonen'}
                                description={
                                    'Navnet vises etter organisasjonsnavnet slik “Organisasjon AS v/ Navn Navnesen”'
                                }
                                onChange={(event): void => {
                                    skjema.felter.navn.validerOgSettFelt(event.target.value);
                                }}
                            />
                        </>
                    )}
                </StyledFieldset>
                <ModalKnapperad>
                    <>
                        <Button
                            variant={valideringErOk() ? 'primary' : 'secondary'}
                            loading={skjema.submitRessurs.status === RessursStatus.HENTER}
                            disabled={skjema.submitRessurs.status === RessursStatus.HENTER}
                            onClick={() =>
                                lagreBrevmottakerOgOppdaterState(
                                    brevmottakerIdTilEndring,
                                    lukkModal
                                )
                            }
                        >
                            {brevmottakerIdTilEndring ? 'Lagre endringer' : 'Legg til'}
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
