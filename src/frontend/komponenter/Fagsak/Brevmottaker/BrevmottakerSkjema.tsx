import React from 'react';

import { styled } from 'styled-components';

import { Alert, Fieldset, TextField } from '@navikt/ds-react';
import { ASpacing6 } from '@navikt/ds-tokens/dist/tokens';
import CountrySelect from '@navikt/landvelger';

import { useBrevmottaker } from './BrevmottakerContext';
import { MottakerType } from '../../../typer/Brevmottaker';
import { Valideringsstatus } from '../../../hooks/skjema/typer';

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

interface IProps {
    preutfyltNavn?: string;
}

const BrevmottakerSkjema: React.FC<IProps> = ({ preutfyltNavn }) => {
    const { skjema } = useBrevmottaker();

    React.useEffect(() => {
        preutfyltNavn && skjema.felter.navn.validerOgSettFelt(preutfyltNavn);
    });

    return (
        <>
            <StyledFieldset legend="Skjema for manuell registrering av brevmottaker" hideLegend>
                <TextField
                    {...skjema.felter.navn.hentNavBaseSkjemaProps(skjema.visFeilmeldinger)}
                    label="Navn"
                    readOnly={!!preutfyltNavn}
                    onChange={(event): void => {
                        skjema.felter.navn.validerOgSettFelt(event.target.value);
                    }}
                />
                <CountrySelect
                    id="country-select-brevmottaker"
                    label="Land"
                    flags
                    excludeList={
                        skjema.felter.mottaker.verdi === MottakerType.BRUKER_MED_UTENLANDSK_ADRESSE
                            ? ['NO', 'XU']
                            : ['XU']
                    }
                    values={skjema.felter.land.verdi}
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
                {skjema.felter.land.verdi && (
                    <>
                        <TextField
                            {...skjema.felter.adresselinje1.hentNavBaseSkjemaProps(
                                skjema.visFeilmeldinger
                            )}
                            label="Adresselinje 1"
                            onChange={(event): void => {
                                skjema.felter.adresselinje1.validerOgSettFelt(event.target.value);
                            }}
                        />
                        <TextField
                            {...skjema.felter.adresselinje2.hentNavBaseSkjemaProps(
                                skjema.visFeilmeldinger
                            )}
                            label="Adresselinje 2 (valgfri)"
                            onChange={(event): void => {
                                skjema.felter.adresselinje2.validerOgSettFelt(event.target.value);
                            }}
                        />
                        {skjema.felter.land.verdi !== 'NO' && (
                            <Alert variant="info">
                                Ved utenlandsk adresse skal postnummer og poststed legges i
                                adresselinjene.
                            </Alert>
                        )}
                        <PostnummerOgStedContainer>
                            <TextField
                                {...skjema.felter.postnummer.hentNavBaseSkjemaProps(
                                    skjema.visFeilmeldinger
                                )}
                                disabled={skjema.felter.land.verdi !== 'NO'}
                                label="Postnummer"
                                onChange={(event): void => {
                                    skjema.felter.postnummer.validerOgSettFelt(event.target.value);
                                }}
                            />
                            <TextField
                                {...skjema.felter.poststed.hentNavBaseSkjemaProps(
                                    skjema.visFeilmeldinger
                                )}
                                disabled={skjema.felter.land.verdi !== 'NO'}
                                label="Poststed"
                                onChange={(event): void => {
                                    skjema.felter.poststed.validerOgSettFelt(event.target.value);
                                }}
                            />
                        </PostnummerOgStedContainer>
                    </>
                )}
            </StyledFieldset>
        </>
    );
};

export default BrevmottakerSkjema;
