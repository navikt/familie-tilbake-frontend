import type { Behandling } from '../../../../../typer/behandling';
import type { Behandlingresultat } from '../../../../../typer/behandling';

import { Button, Modal, Select, Textarea } from '@navikt/ds-react';
import * as React from 'react';
import { useEffect } from 'react';

import { useHenleggBehandlingSkjema } from './HenleggBehandlingModalContext';
import { useFagsakStore } from '../../../../../stores/fagsakStore';
import { behandlingsresultater } from '../../../../../typer/behandling';
import { målform } from '../../../../../typer/fagsak';
import { LabelMedSpråk } from '../../../../Felleskomponenter/Skjemaelementer/LabelMedSpråk';
import ForhåndsvisHenleggelsesBrev from '../ForhåndsvisHenleggelsesbrev/ForhåndsvisHenleggelsesbrev';

type Props = {
    behandling: Behandling;
    dialogRef: React.RefObject<HTMLDialogElement | null>;
    årsaker: Behandlingresultat[];
};

export const HenleggBehandlingModal: React.FC<Props> = ({ behandling, dialogRef, årsaker }) => {
    const { skjema, visFritekst, onBekreft, nullstillSkjema, kanForhåndsvise } =
        useHenleggBehandlingSkjema({ behandling, lukkModal: () => dialogRef.current?.close() });
    const { språkkode } = useFagsakStore();

    useEffect(() => {
        skjema.felter.behandlingstype.onChange(behandling.type);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [behandling]);

    const onChangeÅrsakskode = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const årsak = e.target.value as Behandlingresultat;
        skjema.felter.årsakkode.validerOgSettFelt(årsak);
    };

    return (
        <Modal
            ref={dialogRef}
            header={{ heading: 'Behandlingen henlegges', size: 'medium' }}
            width="small"
            onClose={nullstillSkjema}
        >
            <Modal.Body className="flex flex-col gap-4">
                <Select
                    {...skjema.felter.årsakkode.hentNavInputProps(skjema.visFeilmeldinger)}
                    label="Velg årsak"
                    onChange={onChangeÅrsakskode}
                >
                    <option value="" disabled>
                        Velg årsak til henleggelse
                    </option>
                    {årsaker.map(årsak => (
                        <option key={årsak} value={årsak}>
                            {behandlingsresultater[årsak]}
                        </option>
                    ))}
                </Select>
                {visFritekst() && (
                    <Textarea
                        {...skjema.felter.fritekst.hentNavInputProps(skjema.visFeilmeldinger)}
                        label={
                            <LabelMedSpråk
                                label="Fritekst til brev"
                                språk={målform[språkkode ?? 'NB']}
                            />
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
            </Modal.Body>
            <Modal.Footer>
                <ForhåndsvisHenleggelsesBrev
                    key="forhåndsvis-henleggelsesbrev"
                    behandling={behandling}
                    skjema={skjema}
                    kanForhåndsvise={kanForhåndsvise()}
                />
                <Button key="bekreft" onClick={onBekreft} size="small">
                    Henlegg behandling
                </Button>
                <Button
                    variant="tertiary"
                    key="avbryt"
                    onClick={() => {
                        nullstillSkjema();
                        dialogRef.current?.close();
                    }}
                    size="small"
                >
                    Avbryt
                </Button>
            </Modal.Footer>
        </Modal>
    );
};
