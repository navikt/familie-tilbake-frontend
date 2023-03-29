import * as React from 'react';

import styled from 'styled-components';

import { Column, Row } from 'nav-frontend-grid';

import { BodyLong, Button, ErrorMessage, Heading, Loader } from '@navikt/ds-react';
import { FamilieInput, FamilieSelect } from '@navikt/familie-form-elements';

import { useBehandling } from '../../../context/BehandlingContext';
import { Vergetype, vergeTyper, vergetyper } from '../../../kodeverk/verge';
import { hentFrontendFeilmelding } from '../../../utils';
import { FTButton, Navigering, Spacer20, Spacer8 } from '../../Felleskomponenter/Flytelementer';
import { FamilieTilbakeTextArea } from '../../Felleskomponenter/Skjemaelementer';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';
import Brevmottaker from './Brevmottaker';
import { useBrevmottaker } from './BrevmottakerContext';

const StyledVerge = styled.div`
    padding: 10px;
`;

const StyledBrevmottaker = styled.div`
    padding: 2.5rem;
`;

const FlexDiv = styled.div`
    display: flex;
    justify-content: start;
`;

const NesteKnapp = styled(Button)`
    margin-top: 3rem;
`;

const BrevmottakerContainer: React.FC = () => {
    const {
        behandling,
        skjema,
        henterData,
        stegErBehandlet,
        erAutoutført,
        sendInn,
        vergeRespons,
        brevmottakere,
        gåTilNeste,
    } = useBrevmottaker();
    const { behandlingILesemodus } = useBehandling();
    const erLesevisning = !!behandlingILesemodus;

    const onChangeVergeType = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nyVergetype = Vergetype[e.target.value as keyof typeof Vergetype];
        skjema.felter.vergetype.validerOgSettFelt(nyVergetype);
    };

    const vergetypeValgt = !!skjema.felter.vergetype.verdi;

    const feilmelding = vergeRespons && hentFrontendFeilmelding(vergeRespons);

    return behandling.harManuelleBrevmottakere ? (
        <StyledBrevmottaker>
            <Heading size={'large'} level={'1'} children={'Brevmottaker(e)'} />
            <FlexDiv>
                {Object.keys(brevmottakere).map(id => (
                    <Brevmottaker
                        key={id}
                        brevmottaker={brevmottakere[id]}
                        id={id}
                        erLesevisning={erLesevisning}
                    />
                ))}
            </FlexDiv>
            <NesteKnapp variant="primary" onClick={gåTilNeste}>
                Neste
            </NesteKnapp>
        </StyledBrevmottaker>
    ) : (
        <StyledVerge>
            <Heading level="2" size="small" spacing>
                Verge
            </Heading>
            {henterData ? (
                <div>
                    <BodyLong>Henting av vergeinformasjon tar litt tid.</BodyLong>
                    <Loader
                        size="2xlarge"
                        title="henter..."
                        transparent={false}
                        variant="neutral"
                    />
                </div>
            ) : (
                <>
                    {erAutoutført && (
                        <BodyLong size="small" spacing>
                            Automatisk vurdert. Verge er kopiert fra fagsystemet.
                        </BodyLong>
                    )}
                    <Steginformasjon
                        behandletSteg={stegErBehandlet}
                        infotekst={'Fyll ut og kontroller vergeopplysninger'}
                    />
                    <Spacer20 />
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
                                    skjema.felter.begrunnelse.validerOgSettFelt(event.target.value)
                                }
                                maxLength={400}
                            />
                        </Column>
                    </Row>
                    {feilmelding && (
                        <>
                            <Spacer8 />
                            <div className="skjemaelement__feilmelding">
                                <ErrorMessage size="small">{feilmelding}</ErrorMessage>
                            </div>
                        </>
                    )}
                    <Spacer20 />
                    <Row>
                        <Column xs="12" md="6">
                            <Navigering>
                                <div>
                                    <FTButton
                                        variant="primary"
                                        onClick={sendInn}
                                        disabled={erLesevisning && !stegErBehandlet}
                                    >
                                        {stegErBehandlet ? 'Neste' : 'Bekreft og fortsett'}
                                    </FTButton>
                                </div>
                            </Navigering>
                        </Column>
                    </Row>
                </>
            )}
        </StyledVerge>
    );
};

export default BrevmottakerContainer;
