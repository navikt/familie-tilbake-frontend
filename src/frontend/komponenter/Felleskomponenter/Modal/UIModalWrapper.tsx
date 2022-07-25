import * as React from 'react';

import classNames from 'classnames';
import styled from 'styled-components';

import { Heading, Modal } from '@navikt/ds-react';

interface StyleProps {
    width?: string;
    minHeight?: string;
}

interface ModelStyleProps {
    styleProps?: StyleProps;
}

const StyledModal = styled(Modal)`
    width: ${({ styleProps }: ModelStyleProps) => (styleProps?.width ? styleProps.width : '30rem')};
    min-height: ${({ styleProps }: ModelStyleProps) =>
        styleProps?.minHeight ? styleProps.minHeight : '12rem'};
    padding: 1rem;

    div.navds-modal__content {
        padding: 0.5rem 1.5rem;

        .uimodal__content--inner-content {
            margin-top: 2rem;
        }

        .uimodal__content--actions {
            margin-top: 1rem;
            margin-bottom: 0.5rem;
            display: flex;
            justify-content: flex-end;

            .knapp:not(:first-child) {
                margin-left: 1rem;
            }
            .navds-button:not(:first-child) {
                margin-left: 1rem;
            }
        }
    }
`;

export interface IModal {
    actions?: JSX.Element[] | JSX.Element;
    className?: string;
    innhold?: () => React.ReactNode;
    lukkKnapp: boolean;
    onClose?: () => void;
    tittel: string;
    visModal: boolean;
}

interface IProps {
    modal: IModal;
    children?: React.ReactNode;
    modelStyleProps?: StyleProps;
}

const UIModalWrapper: React.FunctionComponent<IProps> = ({ modal, modelStyleProps, children }) => {
    const { tittel, visModal, onClose, lukkKnapp, actions, className, innhold } = modal;

    return (
        <StyledModal
            className={classNames(className, 'uimodal')}
            shouldCloseOnOverlayClick={false}
            closeButton={lukkKnapp}
            open={visModal}
            onClose={(): void => onClose && onClose()}
            aria-label="Opprett/Fjern verge"
            styleProps={modelStyleProps}
        >
            <Modal.Content className="uimodal__content">
                <Heading level="2" size="small">
                    {tittel}
                </Heading>
                <div className="uimodal__content--inner-content">
                    {innhold ? innhold() : children}
                </div>
                {actions && <div className="uimodal__content--actions"> {actions} </div>}
            </Modal.Content>
        </StyledModal>
    );
};

export default UIModalWrapper;
