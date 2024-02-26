import * as React from 'react';

import { styled } from 'styled-components';

import {
    BodyLong,
    ErrorMessage,
    Heading,
    HGrid,
    Loader,
    Select,
    Textarea,
    TextField,
    VStack,
} from '@navikt/ds-react';
import { ASpacing3 } from '@navikt/ds-tokens/dist/tokens';

import { useVerge } from './VergeContext';
import { useBehandling } from '../../../context/BehandlingContext';
import { Vergetype, vergetyper } from '../../../kodeverk/verge';
import { hentFrontendFeilmelding } from '../../../utils';
import { FTButton, Navigering } from '../../Felleskomponenter/Flytelementer';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';

const StyledVerge = styled.div`
    padding: ${ASpacing3};
`;

const StyledVStack = styled(VStack)`
    max-width: 30rem;
`;

const VergeContainer: React.FC = () => {
    const { skjema, henterData, stegErBehandlet, erAutoutført, sendInn, vergeRespons } = useVerge();
    const { behandlingILesemodus } = useBehandling();
    const erLesevisning = !!behandlingILesemodus;

    const onChangeVergeType = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const nyVergetype = Vergetype[e.target.value as keyof typeof Vergetype];
        skjema.felter.vergetype.validerOgSettFelt(nyVergetype);
    };

    const vergetypeValgt = !!skjema.felter.vergetype.verdi;

    const feilmelding = vergeRespons && hentFrontendFeilmelding(vergeRespons);

    return (
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
                <StyledVStack gap="5">
                    {erAutoutført && (
                        <BodyLong size="small">
                            Automatisk vurdert. Verge er kopiert fra fagsystemet.
                        </BodyLong>
                    )}
                    <Steginformasjon
                        behandletSteg={stegErBehandlet}
                        infotekst={'Fyll ut og kontroller vergeopplysninger'}
                    />
                    <Select
                        {...skjema.felter.vergetype.hentNavInputProps(skjema.visFeilmeldinger)}
                        id="vergeType"
                        label={'Vergetype'}
                        readOnly={erLesevisning}
                        value={skjema.felter.vergetype.verdi}
                        onChange={event => onChangeVergeType(event)}
                    >
                        <option disabled={true} value={''}>
                            Velg vergetype
                        </option>
                        {Object.values(Vergetype)
                            .filter(type => type !== Vergetype.UDEFINERT)
                            .map(opt => (
                                <option key={opt} value={opt}>
                                    {vergetyper[opt]}
                                </option>
                            ))}
                    </Select>
                    {vergetypeValgt && (
                        <HGrid columns={{ lg: 2, md: 1 }} gap="4" align="start">
                            <TextField
                                {...skjema.felter.navn.hentNavInputProps(skjema.visFeilmeldinger)}
                                label={'Navn'}
                                readOnly={erLesevisning}
                                value={skjema.felter.navn.verdi}
                                onChange={event =>
                                    skjema.felter.navn.validerOgSettFelt(event.target.value)
                                }
                            />
                            {skjema.felter.vergetype.verdi === Vergetype.ADVOKAT ? (
                                <TextField
                                    {...skjema.felter.organisasjonsnummer.hentNavInputProps(
                                        skjema.visFeilmeldinger
                                    )}
                                    label={'Organisasjonsnummer'}
                                    readOnly={erLesevisning}
                                    value={skjema.felter.organisasjonsnummer.verdi}
                                    onChange={event =>
                                        skjema.felter.organisasjonsnummer.validerOgSettFelt(
                                            event.target.value
                                        )
                                    }
                                />
                            ) : (
                                <TextField
                                    {...skjema.felter.fødselsnummer.hentNavInputProps(
                                        skjema.visFeilmeldinger
                                    )}
                                    label={'Fødselsnummer'}
                                    readOnly={erLesevisning}
                                    value={skjema.felter.fødselsnummer.verdi}
                                    onChange={event =>
                                        skjema.felter.fødselsnummer.validerOgSettFelt(
                                            event.target.value
                                        )
                                    }
                                />
                            )}
                        </HGrid>
                    )}
                    <Textarea
                        {...skjema.felter.begrunnelse.hentNavInputProps(skjema.visFeilmeldinger)}
                        label={'Begrunn endringene'}
                        value={skjema.felter.begrunnelse.verdi}
                        readOnly={erLesevisning}
                        onChange={event =>
                            skjema.felter.begrunnelse.validerOgSettFelt(event.target.value)
                        }
                        maxLength={400}
                    />
                    {feilmelding && <ErrorMessage size="small">{feilmelding}</ErrorMessage>}
                    <Navigering>
                        <FTButton
                            variant="primary"
                            onClick={sendInn}
                            disabled={erLesevisning && !stegErBehandlet}
                        >
                            {stegErBehandlet ? 'Neste' : 'Bekreft og fortsett'}
                        </FTButton>
                    </Navigering>
                </StyledVStack>
            )}
        </StyledVerge>
    );
};

export default VergeContainer;
