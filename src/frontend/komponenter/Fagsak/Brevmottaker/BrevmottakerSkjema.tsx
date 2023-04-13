import React from 'react';

import styled from 'styled-components';

import { Fieldset } from '@navikt/ds-react';
import { ASpacing6 } from '@navikt/ds-tokens/dist/tokens';
import { FamilieInput } from '@navikt/familie-form-elements';
import { Valideringsstatus } from '@navikt/familie-skjema';
import CountrySelect from '@navikt/landvelger';

import { useBehandling } from '../../../context/BehandlingContext';
import { MottakerType } from '../../../typer/Brevmottaker';
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

const BrevmottakerSkjema: React.FC = () => {
    const { behandlingILesemodus } = useBehandling();
    const { skjema } = useBrevmottaker();
    const erLesevisning = behandlingILesemodus;
    return (
        <>
            <StyledFieldset legend="Skjema for å legge til eller fjerne brevmottaker" hideLegend>
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
                    label={'Land'}
                    flags
                    excludeList={
                        skjema.felter.mottaker.verdi === MottakerType.BRUKER_MED_UTENLANDSK_ADRESSE
                            ? ['NO']
                            : undefined
                    }
                    values={skjema.felter.land.verdi}
                    isDisabled={erLesevisning}
                    onOptionSelected={(land: { alpha2: string }) => {
                        skjema.felter.land.validerOgSettFelt(land.alpha2);
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
