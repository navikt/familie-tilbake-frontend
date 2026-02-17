import {
    BodyLong,
    ErrorMessage,
    Heading,
    HGrid,
    Select,
    Textarea,
    TextField,
    VStack,
} from '@navikt/ds-react';
import * as React from 'react';

import { useVerge } from './VergeContext';
import { useBehandlingState } from '../../../context/BehandlingStateContext';
import { Vergetype, vergetyper } from '../../../kodeverk/verge';
import { ActionBar } from '../../../komponenter/action-bar/ActionBar';
import { HenterData } from '../../../komponenter/datalast/HenterData';
import { Steginformasjon } from '../../../komponenter/steginformasjon/StegInformasjon';
import { hentFrontendFeilmelding } from '../../../utils';

export const VergeContainer: React.FC = () => {
    const { skjema, henterData, stegErBehandlet, erAutoutført, sendInn, senderInn, vergeRespons } =
        useVerge();
    const { behandlingILesemodus, settIkkePersistertKomponent, actionBarStegtekst } =
        useBehandlingState();

    const onChangeVergeType = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const nyVergetype = e.target.value as Vergetype;
        skjema.felter.vergetype.validerOgSettFelt(nyVergetype);
        settIkkePersistertKomponent('verge');
    };

    const vergetypeValgt = !!skjema.felter.vergetype.verdi;

    const feilmelding = vergeRespons && hentFrontendFeilmelding(vergeRespons);

    return (
        <>
            <Heading size="small" spacing>
                Verge
            </Heading>
            {henterData ? (
                <HenterData beskrivelse="Henting av vergeinformasjon tar litt tid." />
            ) : (
                <VStack gap="space-20" className="max-w-xl">
                    {erAutoutført && (
                        <BodyLong size="small">
                            Automatisk vurdert. Verge er kopiert fra fagsystemet.
                        </BodyLong>
                    )}
                    <Steginformasjon
                        behandletSteg={stegErBehandlet}
                        infotekst="Fyll ut og kontroller vergeopplysninger"
                    />
                    <Select
                        {...skjema.felter.vergetype.hentNavInputProps(skjema.visFeilmeldinger)}
                        id="vergeType"
                        label="Vergetype"
                        readOnly={behandlingILesemodus}
                        value={skjema.felter.vergetype.verdi}
                        onChange={event => onChangeVergeType(event)}
                    >
                        <option disabled={true} value="">
                            Velg vergetype
                        </option>
                        {Object.values(Vergetype)
                            .filter(type => type !== Vergetype.Udefinert)
                            .map(opt => (
                                <option key={opt} value={opt}>
                                    {vergetyper[opt]}
                                </option>
                            ))}
                    </Select>
                    {vergetypeValgt && (
                        <HGrid columns={{ lg: 2, md: 1 }} gap="space-16" align="start">
                            <TextField
                                {...skjema.felter.navn.hentNavInputProps(skjema.visFeilmeldinger)}
                                label="Navn"
                                readOnly={behandlingILesemodus}
                                value={skjema.felter.navn.verdi}
                                onChange={event => {
                                    skjema.felter.navn.validerOgSettFelt(event.target.value);
                                    settIkkePersistertKomponent('verge');
                                }}
                            />
                            {skjema.felter.vergetype.verdi === Vergetype.Advokat ? (
                                <TextField
                                    {...skjema.felter.organisasjonsnummer.hentNavInputProps(
                                        skjema.visFeilmeldinger
                                    )}
                                    label="Organisasjonsnummer"
                                    readOnly={behandlingILesemodus}
                                    value={skjema.felter.organisasjonsnummer.verdi}
                                    onChange={event => {
                                        skjema.felter.organisasjonsnummer.validerOgSettFelt(
                                            event.target.value
                                        );
                                        settIkkePersistertKomponent('verge');
                                    }}
                                />
                            ) : (
                                <TextField
                                    {...skjema.felter.fødselsnummer.hentNavInputProps(
                                        skjema.visFeilmeldinger
                                    )}
                                    label="Fødselsnummer"
                                    readOnly={behandlingILesemodus}
                                    value={skjema.felter.fødselsnummer.verdi}
                                    onChange={event => {
                                        skjema.felter.fødselsnummer.validerOgSettFelt(
                                            event.target.value
                                        );
                                        settIkkePersistertKomponent('verge');
                                    }}
                                />
                            )}
                        </HGrid>
                    )}
                    <Textarea
                        {...skjema.felter.begrunnelse.hentNavInputProps(skjema.visFeilmeldinger)}
                        label="Begrunn endringene"
                        value={skjema.felter.begrunnelse.verdi}
                        readOnly={behandlingILesemodus}
                        onChange={event => {
                            skjema.felter.begrunnelse.validerOgSettFelt(event.target.value);
                            settIkkePersistertKomponent('verge');
                        }}
                        maxLength={400}
                    />
                    {feilmelding && <ErrorMessage size="small">{feilmelding}</ErrorMessage>}

                    <ActionBar
                        stegtekst={actionBarStegtekst('VERGE')}
                        forrigeAriaLabel={undefined}
                        nesteAriaLabel="Gå videre til faktasteget"
                        onNeste={sendInn}
                        onForrige={undefined}
                        isLoading={senderInn}
                    />
                </VStack>
            )}
        </>
    );
};
