import type { Behandlingresultat, Behandlingstype } from '../../../../../typer/behandling';

import { CircleSlashIcon } from '@navikt/aksel-icons';
import { Button, ErrorMessage, Modal, Select, Textarea } from '@navikt/ds-react';
import * as React from 'react';
import { useEffect, useEffectEvent } from 'react';

import { useHenleggSkjema } from './HenleggModalContext';
import { useBehandling } from '../../../../../context/BehandlingContext';
import { useFagsak } from '../../../../../context/FagsakContext';
import { behandlingsresultater } from '../../../../../typer/behandling';
import { målform } from '../../../../../typer/målform';
import { hentFrontendFeilmelding } from '../../../../../utils';
import { LabelMedSpråk } from '../../../../Felleskomponenter/Skjemaelementer/LabelMedSpråk';
import { MODAL_BREDDE } from '../../utils';
import ForhåndsvisHenleggelsesBrev from '../forhåndsvisHenleggelsesbrev/ForhåndsvisHenleggelsesbrev';

type Props = {
    dialogRef: React.RefObject<HTMLDialogElement | null>;
    årsaker: Behandlingresultat[];
};

export const HenleggModal: React.FC<Props> = ({ dialogRef, årsaker }) => {
    const { type } = useBehandling();
    const { skjema, visFritekst, onBekreft, nullstillSkjema, kanForhåndsvise } = useHenleggSkjema({
        lukkModal: () => dialogRef.current?.close(),
    });
    const { språkkode } = useFagsak();
    const feilmelding = hentFrontendFeilmelding(skjema.submitRessurs);

    const oppdaterBehandlingstype = useEffectEvent((behandlingstype: Behandlingstype) => {
        skjema.felter.behandlingstype.onChange(behandlingstype);
    });

    useEffect(() => {
        oppdaterBehandlingstype(type as Behandlingstype);
    }, [type]);

    const onChangeÅrsakskode = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const årsak = e.target.value as Behandlingresultat;
        skjema.felter.årsakkode.validerOgSettFelt(årsak);
    };

    const velgEnesteÅrsak = useEffectEvent(() => {
        if (årsaker.length === 1 && skjema.felter.årsakkode.verdi !== årsaker[0]) {
            skjema.felter.årsakkode.validerOgSettFelt(årsaker[0]);
        }
    });

    useEffect(() => {
        velgEnesteÅrsak();
    }, []);

    return (
        <Modal
            ref={dialogRef}
            header={{
                heading: 'Henlegg tilbakekrevingen',
                icon: <CircleSlashIcon aria-hidden className="mr-2" />,
            }}
            onClose={nullstillSkjema}
            className={MODAL_BREDDE}
        >
            <Modal.Body className="flex flex-col gap-4">
                {årsaker.length > 1 && (
                    <Select
                        {...skjema.felter.årsakkode.hentNavInputProps(skjema.visFeilmeldinger)}
                        label="Årsak til henleggelse"
                        onChange={onChangeÅrsakskode}
                        value={skjema.felter.årsakkode.verdi || 'default'}
                    >
                        <option value="default" disabled>
                            Velg årsak
                        </option>
                        {årsaker.map(årsak => (
                            <option key={årsak} value={årsak}>
                                {behandlingsresultater[årsak]}
                            </option>
                        ))}
                    </Select>
                )}
                {visFritekst() && (
                    <Textarea
                        {...skjema.felter.fritekst.hentNavInputProps(skjema.visFeilmeldinger)}
                        label={
                            <LabelMedSpråk label="Fritekst til brev" språk={målform[språkkode]} />
                        }
                        aria-label="Fritekst til brev"
                        value={skjema.felter.fritekst.verdi}
                        onChange={event =>
                            skjema.felter.fritekst.validerOgSettFelt(event.target.value)
                        }
                        readOnly={false}
                        maxLength={1500}
                    />
                )}
                <Textarea
                    {...skjema.felter.begrunnelse.hentNavInputProps(skjema.visFeilmeldinger)}
                    label="Begrunnelse"
                    value={skjema.felter.begrunnelse.verdi}
                    onChange={event =>
                        skjema.felter.begrunnelse.validerOgSettFelt(event.target.value)
                    }
                    readOnly={false}
                    maxLength={200}
                />
                {feilmelding && <ErrorMessage size="small">{feilmelding}</ErrorMessage>}
            </Modal.Body>
            <Modal.Footer>
                <ForhåndsvisHenleggelsesBrev
                    key="forhåndsvis-henleggelsesbrev"
                    skjema={skjema}
                    kanForhåndsvise={kanForhåndsvise()}
                />
                <Button key="bekreft" onClick={onBekreft}>
                    Henlegg
                </Button>
                <Button
                    variant="secondary"
                    key="avbryt"
                    onClick={() => {
                        nullstillSkjema();
                        dialogRef.current?.close();
                    }}
                >
                    Avbryt
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
