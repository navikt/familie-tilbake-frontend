import * as React from 'react';

import styled from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';
import { Knapp } from 'nav-frontend-knapper';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Normaltekst, Undertittel } from 'nav-frontend-typografi';

import { FamilieInput, FamilieSelect } from '@navikt/familie-form-elements';

import { useBehandling } from '../../../context/BehandlingContext';
import { Vergetype, vergeTyper, vergetyper } from '../../../kodeverk/verge';
import { hentFrontendFeilmelding } from '../../../utils';
import { Navigering, Spacer20, Spacer8 } from '../../Felleskomponenter/Flytelementer';
import { FamilieTilbakeTextArea } from '../../Felleskomponenter/Skjemaelementer';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';
import { useVerge } from './VergeContext';

const StyledVerge = styled.div`
    padding: 10px;
`;

const VergeContainer: React.FC = () => {
    const { behandling, skjema, henterData, stegErBehandlet, erAutoutført, sendInn, vergeRespons } =
        useVerge();
    const { behandlingILesemodus } = useBehandling();
    const erLesevisning = !!behandlingILesemodus;

    const onChangeVergeType = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nyVergetype = Vergetype[e.target.value as keyof typeof Vergetype];
        skjema.felter.vergetype.validerOgSettFelt(nyVergetype);
    };

    const vergetypeValgt = !!skjema.felter.vergetype.verdi;

    return (
        <StyledVerge>
            <Undertittel>Verge</Undertittel>
            <Spacer20 />
            {henterData ? (
                <div>
                    <Normaltekst>Henting av vergeinformasjon tar litt tid.</Normaltekst>
                    <NavFrontendSpinner type="XXL" />
                </div>
            ) : (
                <>
                    {erAutoutført && (
                        <>
                            <Normaltekst>
                                Automatisk vurdert. Verge er kopiert fra fagsystemet.
                            </Normaltekst>
                            <Spacer20 />
                        </>
                    )}
                    <Steginformasjon
                        behandletSteg={stegErBehandlet}
                        infotekst={'Fyll ut og kontroller vergeopplysninger'}
                    />
                    <Spacer20 />
                    <SkjemaGruppe
                        feil={vergeRespons ? hentFrontendFeilmelding(vergeRespons) : undefined}
                    >
                        <Row>
                            <Column sm="12" md="6" lg="3">
                                <FamilieSelect
                                    {...skjema.felter.vergetype.hentNavInputProps(
                                        skjema.visFeilmeldinger
                                    )}
                                    id="vergeType"
                                    label={'Vergetype'}
                                    erLesevisning={erLesevisning}
                                    value={skjema.felter.vergetype.verdi}
                                    lesevisningVerdi={
                                        behandling.harVerge
                                            ? // @ts-ignore
                                              vergetyper[skjema.felter.vergetype.verdi]
                                            : '-'
                                    }
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
                                            {...skjema.felter.navn.hentNavInputProps(
                                                skjema.visFeilmeldinger
                                            )}
                                            label={'Navn'}
                                            erLesevisning={erLesevisning}
                                            value={skjema.felter.navn.verdi}
                                            onChange={event =>
                                                skjema.felter.navn.validerOgSettFelt(
                                                    event.target.value
                                                )
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
                                                bredde="S"
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
                                                bredde="S"
                                            />
                                        )}
                                    </Column>
                                </Row>
                            </>
                        )}
                        <Spacer20 />
                        <Row>
                            <Column md="12" lg="6">
                                <FamilieTilbakeTextArea
                                    {...skjema.felter.begrunnelse.hentNavInputProps(
                                        skjema.visFeilmeldinger
                                    )}
                                    label={'Begrunn endringene'}
                                    value={skjema.felter.begrunnelse.verdi}
                                    erLesevisning={erLesevisning}
                                    onChange={event =>
                                        skjema.felter.begrunnelse.validerOgSettFelt(
                                            event.target.value
                                        )
                                    }
                                    maxLength={400}
                                />
                            </Column>
                        </Row>
                    </SkjemaGruppe>
                    <Spacer20 />
                    <Row>
                        <Column xs="12" md="6">
                            <Navigering>
                                <div>
                                    <Knapp
                                        type={'hoved'}
                                        mini={true}
                                        onClick={() => sendInn()}
                                        disabled={erLesevisning && !stegErBehandlet}
                                    >
                                        {stegErBehandlet ? 'Neste' : 'Bekreft og fortsett'}
                                    </Knapp>
                                </div>
                            </Navigering>
                        </Column>
                    </Row>
                </>
            )}
        </StyledVerge>
    );
};

export default VergeContainer;
