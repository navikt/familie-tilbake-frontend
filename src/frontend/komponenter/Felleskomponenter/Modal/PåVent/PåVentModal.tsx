import * as React from 'react';

import { Flatknapp, Knapp } from 'nav-frontend-knapper';
import { Normaltekst } from 'nav-frontend-typografi';

import { FamilieSelect } from '@navikt/familie-form-elements';
import { Valideringsstatus } from '@navikt/familie-skjema';

import {
    Behandlingssteg,
    IBehandling,
    IBehandlingsstegstilstand,
    manuelleÅrsaker,
    venteårsaker,
} from '../../../../typer/behandling';
import { datoformatNorsk } from '../../../../utils';
import { Spacer20 } from '../../Flytelementer';
import { FixedDatovelger } from '../../Skjemaelementer';
import UIModalWrapper from '../UIModalWrapper';
import { usePåVentBehandling } from './PåVentContext';

export const settMinDato = (): string => {
    const minDato = new Date();
    minDato.setDate(minDato.getDate() + 1);
    return minDato.toISOString();
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

    React.useEffect(() => {
        if (ventegrunn.venteårsak) {
            skjema.felter.årsak.verdi = ventegrunn.venteårsak;
        }
        if (ventegrunn.tidsfrist) {
            skjema.felter.tidsfrist.verdi = ventegrunn.tidsfrist;
        }
    }, [ventegrunn]);

    const erAutomatiskVent =
        ventegrunn.behandlingssteg === Behandlingssteg.VARSEL ||
        ventegrunn.behandlingssteg === Behandlingssteg.GRUNNLAG;

    const muligeÅrsaker =
        ventegrunn.venteårsak && !manuelleÅrsaker.includes(ventegrunn.venteårsak)
            ? manuelleÅrsaker.concat([ventegrunn.venteårsak])
            : manuelleÅrsaker;

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
                    >
                        Lukk
                    </Flatknapp>,
                    <Knapp
                        key={'bekreft'}
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
                    width: '25rem',
                    minHeight: '18rem',
                },
            }}
        >
            <>
                {feilmelding && feilmelding !== '' && <Normaltekst>{feilmelding}</Normaltekst>}
                <FixedDatovelger
                    id={'frist'}
                    label={'Frist'}
                    onChange={(nyVerdi?: string) =>
                        skjema.felter.tidsfrist.onChange(nyVerdi ? nyVerdi : '')
                    }
                    limitations={{ minDate: settMinDato() }}
                    placeholder={datoformatNorsk.DATO}
                    valgtDato={skjema.felter.tidsfrist.verdi}
                    harFeil={ugyldigDatoValgt}
                    feilmelding={
                        ugyldigDatoValgt ? skjema.felter.tidsfrist.feilmelding?.toString() : ''
                    }
                />
                <Spacer20 />
                <FamilieSelect
                    label={'Årsak'}
                    value={skjema.felter.årsak.verdi}
                    onChange={event => skjema.felter.årsak.onChange(event)}
                    lesevisningVerdi={
                        skjema.felter.årsak.verdi ? venteårsaker[skjema.felter.årsak.verdi] : ''
                    }
                    erLesevisning={erAutomatiskVent}
                >
                    <option value="-">-</option>
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
