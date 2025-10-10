import type { Behandling } from '../../../../../typer/behandling';
import type { Behandlingresultat } from '../../../../../typer/behandling';

import { Button, Modal, Select, Textarea } from '@navikt/ds-react';
import * as React from 'react';
import { useEffect } from 'react';

import { useHenleggBehandlingSkjema } from './HenleggBehandlingModalContext';
import { useFagsakStore } from '../../../../../stores/fagsakStore';
import { behandlingsresultater } from '../../../../../typer/behandling';
import { målform } from '../../../../../typer/fagsak';
import { Spacer20 } from '../../../../Felleskomponenter/Flytelementer';
import { LabelMedSpråk } from '../../../../Felleskomponenter/Skjemaelementer';
import ForhåndsvisHenleggelsesBrev from '../ForhåndsvisHenleggelsesbrev/ForhåndsvisHenleggelsesbrev';

type Props = {
    behandling: Behandling;
    visModal: boolean;
    settVisModal: (vis: boolean) => void;
    årsaker: Behandlingresultat[];
};

const HenleggBehandlingModal: React.FC<Props> = ({
    behandling,
    visModal,
    settVisModal,
    årsaker,
}) => {
    const { skjema, erVisFritekst, onBekreft, nullstillSkjema, erKanForhåndsvise } =
        useHenleggBehandlingSkjema({ behandling, settVisModal });
    const { språkkode } = useFagsakStore();

    useEffect(() => {
        skjema.felter.behandlingstype.onChange(behandling.type);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [behandling]);

    const onChangeÅrsakskode = (e: React.ChangeEvent<HTMLSelectElement>): void => {
        const årsak = e.target.value as Behandlingresultat;
        skjema.felter.årsakkode.validerOgSettFelt(årsak);
    };

    const visFritekst = erVisFritekst();
    const kanForhåndsvise = erKanForhåndsvise();

    return (
        <>
            {visModal && (
                <Modal
                    open
                    header={{ heading: 'Behandlingen henlegges', size: 'medium' }}
                    portal
                    width="small"
                    onClose={() => {
                        nullstillSkjema();
                        settVisModal(false);
                    }}
                >
                    <Modal.Body>
                        <Select
                            {...skjema.felter.årsakkode.hentNavInputProps(skjema.visFeilmeldinger)}
                            label="Velg årsak"
                            onChange={e => onChangeÅrsakskode(e)}
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
                        {visFritekst && (
                            <>
                                <Spacer20 />
                                <Textarea
                                    {...skjema.felter.fritekst.hentNavInputProps(
                                        skjema.visFeilmeldinger
                                    )}
                                    label={
                                        <LabelMedSpråk
                                            label="Fritekst til brev"
                                            språk={målform[språkkode ?? 'NB']}
                                        />
                                    }
                                    aria-label="Fritekst til brev"
                                    value={skjema.felter.fritekst.verdi || ''}
                                    onChange={event =>
                                        skjema.felter.fritekst.validerOgSettFelt(event.target.value)
                                    }
                                    readOnly={false}
                                    maxLength={1500}
                                />
                            </>
                        )}
                        <Spacer20 />
                        <Textarea
                            {...skjema.felter.begrunnelse.hentNavInputProps(
                                skjema.visFeilmeldinger
                            )}
                            label="Begrunnelse"
                            value={skjema.felter.begrunnelse.verdi || ''}
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
                            kanForhåndsvise={kanForhåndsvise}
                        />
                        <Button
                            key="bekreft"
                            onClick={() => {
                                onBekreft();
                            }}
                            size="small"
                        >
                            Henlegg behandling
                        </Button>
                        <Button
                            variant="tertiary"
                            key="avbryt"
                            onClick={() => {
                                nullstillSkjema();
                                settVisModal(false);
                            }}
                            size="small"
                        >
                            Avbryt
                        </Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>
    );
};

export default HenleggBehandlingModal;
