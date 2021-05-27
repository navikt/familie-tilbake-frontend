import * as React from 'react';

import { Flatknapp, Knapp } from 'nav-frontend-knapper';
import { Element, Normaltekst } from 'nav-frontend-typografi';

import { FamilieSelect } from '@navikt/familie-form-elements';
import { Valideringsstatus } from '@navikt/familie-skjema';

import {
    Behandlingssteg,
    IBehandling,
    IBehandlingsstegstilstand,
    manuelleÅrsaker,
    venteårsaker,
} from '../../../../typer/behandling';
import { dateBeforeToday, datoformatNorsk, finnDateRelativtTilNå } from '../../../../utils';
import { Spacer20, Spacer8 } from '../../Flytelementer';
import { FixedDatovelger } from '../../Skjemaelementer';
import UIModalWrapper from '../UIModalWrapper';
import { usePåVentBehandling } from './PåVentContext';

export const minTidsfrist = (): string => {
    const minDato = new Date();
    minDato.setDate(minDato.getDate() + 1);
    return minDato.toISOString();
};

export const maxTidsfrist = (): string => {
    const dato = finnDateRelativtTilNå({ months: 3 });
    return dato.toISOString();
};

interface IProps {
    behandling: IBehandling;
    ventegrunn: IBehandlingsstegstilstand;
    onClose: () => void;
}

const PåVentModal: React.FC<IProps> = ({ behandling, ventegrunn, onClose }) => {
    const { skjema, onBekreft, nullstillSkjema, feilmelding } = usePåVentBehandling(
        onClose,
        ventegrunn
    );

    const erVenterPåKravgrunnlag = ventegrunn.behandlingssteg === Behandlingssteg.GRUNNLAG;
    const erAutomatiskVent =
        ventegrunn.behandlingssteg === Behandlingssteg.VARSEL || erVenterPåKravgrunnlag;

    const muligeÅrsaker =
        ventegrunn.venteårsak && !manuelleÅrsaker.includes(ventegrunn.venteårsak)
            ? manuelleÅrsaker.concat([ventegrunn.venteårsak])
            : manuelleÅrsaker;

    const erFristenUtløpt =
        erVenterPåKravgrunnlag && ventegrunn.tidsfrist && dateBeforeToday(ventegrunn.tidsfrist);

    const ugyldigDatoValgt =
        skjema.visFeilmeldinger &&
        skjema.felter.tidsfrist.valideringsstatus === Valideringsstatus.FEIL;

    const uendret =
        ventegrunn.venteårsak === skjema.felter.årsak.verdi &&
        ventegrunn.tidsfrist === skjema.felter.tidsfrist.verdi;

    return (
        <UIModalWrapper
            modal={{
                tittel: 'Behandling satt på vent',
                visModal: true,
                lukkKnapp: false,
                actions: [
                    <Flatknapp
                        key={'avbryt'}
                        onClick={() => {
                            nullstillSkjema();
                            onClose();
                        }}
                        mini={true}
                    >
                        Lukk
                    </Flatknapp>,
                    <Knapp
                        key={'bekreft'}
                        type={'hoved'}
                        mini={true}
                        onClick={() => {
                            onBekreft(behandling.behandlingId);
                        }}
                        disabled={skjema.visFeilmeldinger || uendret}
                    >
                        Oppdater
                    </Knapp>,
                ],
            }}
            style={{
                content: {
                    width: erFristenUtløpt ? '35rem' : '25rem',
                    minHeight: '18rem',
                },
            }}
        >
            <>
                {feilmelding && feilmelding !== '' && <Normaltekst>{feilmelding}</Normaltekst>}
                {erFristenUtløpt && (
                    <>
                        <Element>OBS! Fristen på denne behandlingen er utløpt!</Element>
                        <Spacer8 />
                        <Normaltekst>
                            Kontroller hvorfor Økonomi ikke har dannet et kravgrunnlag.
                        </Normaltekst>
                        <Normaltekst>
                            Dersom det feilutbetalte beløpet er bortfalt skal saken henlegges.
                        </Normaltekst>
                        <Normaltekst>
                            For mer informasjon, se rutine under tilbakekreving.
                        </Normaltekst>
                        <Spacer20 />
                    </>
                )}
                <FixedDatovelger
                    id={'frist'}
                    label={'Frist'}
                    onChange={(nyVerdi?: string) =>
                        skjema.felter.tidsfrist.onChange(nyVerdi ? nyVerdi : '')
                    }
                    limitations={{ minDate: minTidsfrist(), maxDate: maxTidsfrist() }}
                    placeholder={datoformatNorsk.DATO}
                    valgtDato={skjema.felter.tidsfrist.verdi}
                    harFeil={ugyldigDatoValgt}
                    feilmelding={
                        ugyldigDatoValgt ? skjema.felter.tidsfrist.feilmelding?.toString() : ''
                    }
                />
                <Spacer20 />
                <FamilieSelect
                    {...skjema.felter.årsak.hentNavInputProps(skjema.visFeilmeldinger)}
                    label={'Årsak'}
                    value={skjema.felter.årsak.verdi}
                    onChange={event => skjema.felter.årsak.onChange(event)}
                    lesevisningVerdi={
                        skjema.felter.årsak.verdi ? venteårsaker[skjema.felter.årsak.verdi] : ''
                    }
                    erLesevisning={erAutomatiskVent}
                >
                    <option value="" disabled>
                        Velg årsak
                    </option>
                    {muligeÅrsaker.map((årsak, index) => (
                        <option key={`årsak_${index}`} value={årsak}>
                            {venteårsaker[årsak]}
                        </option>
                    ))}
                </FamilieSelect>
            </>
        </UIModalWrapper>
    );
};

export default PåVentModal;
