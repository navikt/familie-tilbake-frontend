import React from 'react';

import styled from 'styled-components';

import { Fieldset } from '@navikt/ds-react';
import { ASpacing6 } from '@navikt/ds-tokens/dist/tokens';
import { FamilieInput, FamilieSelect } from '@navikt/familie-form-elements';
import { Valideringsstatus } from '@navikt/familie-skjema';
import CountrySelect from '@navikt/landvelger';

import { useBehandling } from '../../../context/BehandlingContext';
import { MottakerType, mottakerTypeVisningsnavn } from '../../../typer/Brevmottaker';
import { useBrevmottaker } from './BrevmottakerContext';

const PostnummerOgStedContainer = styled.div`
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: 8rem 24rem;

    &:has(.navds-text-field--error) {
        .navds-form-field .navds-form-field__error {
            height: 3rem;
            display: initial;
        }
    }
`;

const StyledFieldset = styled(Fieldset)`
    &.navds-fieldset > div:not(:first-of-type):not(:empty) {
        margin-top: ${ASpacing6};
    }
`;

const MottakerSelect = styled(FamilieSelect)`
    max-width: 19rem;
`;

interface IProps {
    behandlingId: string;
}

const BrevmottakerSkjema: React.FC<IProps> = () => {
    const { behandlingILesemodus } = useBehandling();
    const { skjema } = useBrevmottaker();
    const erLesevisning = behandlingILesemodus;
    return (
        <>
            <StyledFieldset legend="Skjema for å legge til eller fjerne brevmottaker" hideLegend>
                <MottakerSelect
                    {...skjema.felter.mottaker.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                    erLesevisning={erLesevisning}
                    label="Mottaker"
                    onChange={(event): void => {
                        skjema.felter.mottaker.validerOgSettFelt(
                            event.target.value as MottakerType
                        );
                    }}
                >
                    <option value="">Velg</option>
                    {Object.values(MottakerType)
                        .filter(type => type !== MottakerType.BRUKER)
                        .map(mottaker => (
                            <option value={mottaker} key={mottaker}>
                                {mottakerTypeVisningsnavn[mottaker]}
                            </option>
                        ))}
                </MottakerSelect>
                <FamilieInput
                    {...skjema.felter.navn.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                    erLesevisning={erLesevisning}
                    label={'Navn'}
                    onChange={(event): void => {
                        skjema.felter.navn.validerOgSettFelt(event.target.value);
                    }}
                />
                <FamilieInput
                    {...skjema.felter.adresselinje1.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                    erLesevisning={erLesevisning}
                    label={'Adresselinje 1'}
                    onChange={(event): void => {
                        skjema.felter.adresselinje1.validerOgSettFelt(event.target.value);
                    }}
                />
                <FamilieInput
                    {...skjema.felter.adresselinje2.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                    erLesevisning={erLesevisning}
                    label={'Adresselinje 2 (valgfri)'}
                    onChange={(event): void => {
                        skjema.felter.adresselinje2.validerOgSettFelt(event.target.value);
                    }}
                />
                <PostnummerOgStedContainer>
                    <FamilieInput
                        {...skjema.felter.postnummer.hentNavBaseSkjemaProps(
                            skjema.visFeilmeldinger
                        )}
                        erLesevisning={erLesevisning}
                        label={'Postnummer'}
                        onChange={(event): void => {
                            skjema.felter.postnummer.validerOgSettFelt(event.target.value);
                        }}
                    />
                    <FamilieInput
                        {...skjema.felter.poststed.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                        erLesevisning={erLesevisning}
                        label={'Poststed'}
                        onChange={(event): void => {
                            skjema.felter.poststed.validerOgSettFelt(event.target.value);
                        }}
                    />
                </PostnummerOgStedContainer>

                <CountrySelect
                    id={'country-select-brevmottaker'}
                    flags
                    excludeList={
                        skjema.felter.mottaker.verdi === MottakerType.BRUKER_MED_UTENLANDSK_ADRESSE
                            ? ['NO']
                            : []
                    }
                    isDisabled={erLesevisning}
                    onOptionSelected={(land: { landkode: string }) => {
                        skjema.felter.land.validerOgSettFelt(land.landkode);
                    }}
                    error={
                        skjema.visFeilmeldinger &&
                        skjema.felter.land.valideringsstatus === Valideringsstatus.FEIL
                            ? skjema.felter.land.feilmelding?.toString()
                            : ''
                    }
                />
            </StyledFieldset>
        </>
    );
};

export default BrevmottakerSkjema;
