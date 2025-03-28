import type { Land } from '../../Felleskomponenter/Landvelger/Landvelger';

import { Alert, Fieldset, TextField } from '@navikt/ds-react';
import { ASpacing6 } from '@navikt/ds-tokens/dist/tokens';
import React, { useCallback, useEffect, useMemo } from 'react';
import { styled } from 'styled-components';

import { useBrevmottaker } from './BrevmottakerContext';
import { Valideringsstatus } from '../../../hooks/skjema/typer';
import { MottakerType } from '../../../typer/Brevmottaker';
import Landvelger from '../../Felleskomponenter/Landvelger/Landvelger';

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
    const { felter, visFeilmeldinger } = skjema;

    const eksluderLandKoder = useMemo(() => {
        if (felter.mottaker.verdi === MottakerType.BrukerMedUtenlandskAdresse) {
            return ['NO'];
        }
        return undefined;
    }, [felter.mottaker.verdi]);

    const landError = useMemo(() => {
        if (visFeilmeldinger && felter.land.valideringsstatus === Valideringsstatus.Feil) {
            return felter.land.feilmelding?.toString();
        }
        return undefined;
    }, [visFeilmeldinger, felter.land.valideringsstatus, felter.land.feilmelding]);

    const håndterLandValgt = useCallback(
        ({ alpha2 }: Land) => {
            felter.land.validerOgSettFelt(alpha2);
        },
        [felter.land]
    );

    useEffect(() => {
        preutfyltNavn && felter.navn.validerOgSettFelt(preutfyltNavn);
    });

    return (
        <>
            <StyledFieldset legend="Skjema for manuell registrering av brevmottaker" hideLegend>
                <TextField
                    {...felter.navn.hentNavBaseSkjemaProps(visFeilmeldinger)}
                    label="Navn"
                    readOnly={!!preutfyltNavn}
                    onChange={(event): void => {
                        felter.navn.validerOgSettFelt(event.target.value);
                    }}
                />
                <Landvelger
                    id="landvelger-brevmottaker"
                    eksluderLandkoder={eksluderLandKoder}
                    defaultValue={felter.land.verdi}
                    håndterLandValgt={håndterLandValgt}
                    error={landError}
                />
                {felter.land.verdi && (
                    <>
                        <TextField
                            {...felter.adresselinje1.hentNavBaseSkjemaProps(visFeilmeldinger)}
                            label="Adresselinje 1"
                            onChange={(event): void => {
                                felter.adresselinje1.validerOgSettFelt(event.target.value);
                            }}
                        />
                        <TextField
                            {...felter.adresselinje2.hentNavBaseSkjemaProps(visFeilmeldinger)}
                            label="Adresselinje 2 (valgfri)"
                            onChange={(event): void => {
                                felter.adresselinje2.validerOgSettFelt(event.target.value);
                            }}
                        />
                        {felter.land.verdi !== 'NO' && (
                            <Alert variant="info">
                                Ved utenlandsk adresse skal postnummer og poststed legges i
                                adresselinjene.
                            </Alert>
                        )}
                        {felter.land.verdi === 'NO' && (
                            <PostnummerOgStedContainer>
                                <TextField
                                    {...felter.postnummer.hentNavBaseSkjemaProps(visFeilmeldinger)}
                                    label="Postnummer"
                                    onChange={(event): void => {
                                        felter.postnummer.validerOgSettFelt(event.target.value);
                                    }}
                                />
                                <TextField
                                    {...felter.poststed.hentNavBaseSkjemaProps(visFeilmeldinger)}
                                    label="Poststed"
                                    onChange={(event): void => {
                                        felter.poststed.validerOgSettFelt(event.target.value);
                                    }}
                                />
                            </PostnummerOgStedContainer>
                        )}
                    </>
                )}
            </StyledFieldset>
        </>
    );
};

export default BrevmottakerSkjema;
