import { Heading } from '@navikt/ds-react';
import * as React from 'react';

import { useFakta } from './FaktaContext';
import GammelFaktaSkjema from './GammelFaktaSkjema';
import { useBehandlingState } from '../../../context/BehandlingStateContext';
import { RessursStatus } from '../../../typer/ressurs';
import DataLastIkkeSuksess from '../../Felleskomponenter/Datalast/DataLastIkkeSuksess';
import { Spacer20 } from '../../Felleskomponenter/Flytelementer';
import Steginformasjon from '../../Felleskomponenter/Steginformasjon/StegInformasjon';

const FaktaContainer: React.FC = () => {
    const { stegErBehandlet, skjemaData, fakta } = useFakta();
    const { behandlingILesemodus } = useBehandlingState();
    const erLesevisning = !!behandlingILesemodus;

    if (fakta?.status === RessursStatus.Suksess) {
        return (
            <>
                <Heading level="1" size="small" spacing>
                    Fakta fra feilutbetalingssaken
                </Heading>
                {(!erLesevisning || stegErBehandlet) && (
                    <>
                        <Steginformasjon
                            behandletSteg={stegErBehandlet}
                            infotekst="Kontroller at korrekt hendelse er satt"
                        />
                        <Spacer20 />
                    </>
                )}
                <GammelFaktaSkjema
                    skjemaData={skjemaData}
                    fakta={fakta.data}
                    erLesevisning={erLesevisning}
                />
            </>
        );
    } else {
        return <DataLastIkkeSuksess ressurser={[fakta]} />;
    }
};

export default FaktaContainer;
