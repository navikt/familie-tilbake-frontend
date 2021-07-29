import * as React from 'react';

import styled from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';
import { Knapp } from 'nav-frontend-knapper';
import { Undertittel } from 'nav-frontend-typografi';

import { FamilieInput, FamilieSelect } from '@navikt/familie-form-elements';
import { Valideringsstatus } from '@navikt/familie-skjema';

import { Vergetype, vergeTyper, vergetyper } from '../../../kodeverk/verge';
import { IBehandling } from '../../../typer/behandling';
import { datoformatNorsk } from '../../../utils';
import { Navigering, Spacer20, Spacer8 } from '../../Felleskomponenter/Flytelementer';
import {
    FamilieTilbakeDatovelger,
    FamilieTilbakeTextArea,
} from '../../Felleskomponenter/Skjemaelementer';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';
import { useVergeSkjema } from './VergeSkjemaContext';

const StyledVerge = styled.div`
    padding: 10px;
`;

interface IProps {
    behandling: IBehandling;
}

const VergeContainer: React.FC<IProps> = () => {
    const { skjema, sendInn } = useVergeSkjema();
    const erLesevisning = false;
    const stegErBehandlet = false;

    const onChangeVergeType = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nyVergetype = Vergetype[e.target.value as keyof typeof Vergetype];
        skjema.felter.vergetype.validerOgSettFelt(nyVergetype);
    };

    const vergetypeValgt = !!skjema.felter.vergetype.verdi;

    const ugyldigGyldigFomValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.gyldigFom.valideringsstatus === Valideringsstatus.FEIL;
    const ugyldigGyldigTomValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.gyldigTom.valideringsstatus === Valideringsstatus.FEIL;

    return (
        <StyledVerge>
            <Undertittel>Verge</Undertittel>
            <Spacer20 />
            <>
                <Steginformasjon
                    behandletSteg={false}
                    infotekst={'Fyll ut og kontroller vergeopplysninger'}
                />
                <Spacer20 />
            </>
            <Row>
                <Column sm="12" md="6" lg="3">
                    <FamilieSelect
                        {...skjema.felter.vergetype.hentNavInputProps(skjema.visFeilmeldinger)}
                        id="vergeType"
                        label={'Vergetype'}
                        erLesevisning={erLesevisning}
                        value={skjema.felter.vergetype.verdi}
                        lesevisningVerdi={skjema.felter.vergetype.verdi}
                        onChange={event => onChangeVergeType(event)}
                    >
                        <option disabled={true} value={''}>
                            Velg vergetype
                        </option>
                        {vergeTyper.map(opt => (
                            <option key={opt} value={opt}>
                                {vergetyper[opt]}
                            </option>
                        ))}
                    </FamilieSelect>
                </Column>
            </Row>
            {vergetypeValgt && (
                <>
                    <Spacer8 />
                    <Row>
                        <Column sm="12" md="6" lg="3">
                            <FamilieInput
                                {...skjema.felter.navn.hentNavInputProps(skjema.visFeilmeldinger)}
                                label={'Navn'}
                                erLesevisning={erLesevisning}
                                value={skjema.felter.navn.verdi}
                                onChange={event =>
                                    skjema.felter.navn.validerOgSettFelt(event.target.value)
                                }
                            />
                        </Column>
                        <Column sm="12" md="6" lg="3">
                            {skjema.felter.vergetype.verdi === Vergetype.ADVOKAT ? (
                                <FamilieInput
                                    {...skjema.felter.organisasjonsnummer.hentNavInputProps(
                                        skjema.visFeilmeldinger
                                    )}
                                    label={'Organisasjonsnummer'}
                                    erLesevisning={erLesevisning}
                                    value={skjema.felter.organisasjonsnummer.verdi}
                                    onChange={event =>
                                        skjema.felter.organisasjonsnummer.validerOgSettFelt(
                                            event.target.value
                                        )
                                    }
                                />
                            ) : (
                                <FamilieInput
                                    {...skjema.felter.fødselsnummer.hentNavInputProps(
                                        skjema.visFeilmeldinger
                                    )}
                                    label={'Fødselsnummer'}
                                    erLesevisning={erLesevisning}
                                    value={skjema.felter.fødselsnummer.verdi}
                                    onChange={event =>
                                        skjema.felter.fødselsnummer.validerOgSettFelt(
                                            event.target.value
                                        )
                                    }
                                />
                            )}
                        </Column>
                    </Row>
                    <Spacer8 />
                    <Row>
                        <Column sm="12" md="6" lg="3">
                            <FamilieTilbakeDatovelger
                                id={'gyldigFom'}
                                label={'Periode f.o.m.'}
                                erLesesvisning={erLesevisning}
                                placeholder={datoformatNorsk.DATO}
                                valgtDato={skjema.felter.gyldigFom.verdi}
                                onChange={(nyDato?: string) => {
                                    skjema.felter.gyldigFom.validerOgSettFelt(nyDato ? nyDato : '');
                                }}
                                harFeil={ugyldigGyldigFomValgt}
                                feilmelding={
                                    ugyldigGyldigFomValgt
                                        ? skjema.felter.gyldigFom.feilmelding?.toString()
                                        : ''
                                }
                            />
                        </Column>
                        <Column sm="12" md="6" lg="3">
                            <FamilieTilbakeDatovelger
                                id={'gyldigTom'}
                                label={'Periode t.o.m.'}
                                erLesesvisning={erLesevisning}
                                placeholder={datoformatNorsk.DATO}
                                valgtDato={skjema.felter.gyldigTom.verdi}
                                onChange={(nyDato?: string) => {
                                    skjema.felter.gyldigTom.validerOgSettFelt(nyDato ? nyDato : '');
                                }}
                                harFeil={ugyldigGyldigTomValgt}
                                feilmelding={
                                    ugyldigGyldigTomValgt
                                        ? skjema.felter.gyldigTom.feilmelding?.toString()
                                        : ''
                                }
                            />
                        </Column>
                    </Row>
                </>
            )}
            <Spacer20 />
            <Row>
                <Column md="12" lg="6">
                    <FamilieTilbakeTextArea
                        {...skjema.felter.begrunnelse.hentNavInputProps(skjema.visFeilmeldinger)}
                        label={'Begrunn endringene'}
                        value={skjema.felter.begrunnelse.verdi}
                        erLesevisning={erLesevisning}
                        onChange={event =>
                            skjema.felter.begrunnelse.validerOgSettFelt(event.target.value)
                        }
                    />
                </Column>
            </Row>
            <Spacer20 />
            <Row>
                <Column xs="12" md="6">
                    <Navigering>
                        <div>
                            <Knapp
                                type={'hoved'}
                                mini={true}
                                onClick={() => sendInn()}
                                disabled={erLesevisning}
                            >
                                {stegErBehandlet ? 'Neste' : 'Bekreft og fortsett'}
                            </Knapp>
                        </div>
                    </Navigering>
                </Column>
            </Row>
        </StyledVerge>
    );
};

export default VergeContainer;
