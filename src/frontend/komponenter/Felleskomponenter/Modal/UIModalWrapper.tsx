import * as React from 'react';

import classNames from 'classnames';
import ReactModal from 'react-modal';
import styled from 'styled-components';

import Modal from 'nav-frontend-modal';
import { Undertittel } from 'nav-frontend-typografi';

const StyledModal = styled(Modal)`
    width: 30rem;
    min-height: 12rem;

    .uimodal {
        &__content {
            padding: 0.5rem 1.5rem;

            &--inner-content {
                margin-top: 2rem;
            }

            &--actions {
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
    style?: ReactModal.Styles;
}

const UIModalWrapper: React.FunctionComponent<IProps> = ({ modal, style, children }) => {
    const { tittel, visModal, onClose, lukkKnapp, actions, className, innhold } = modal;

    return (
        <StyledModal
            className={classNames(className, 'uimodal')}
            isOpen={visModal}
            onRequestClose={(): void => onClose && onClose()}
            contentLabel="ui-modal"
            closeButton={lukkKnapp}
            style={style}
        >
            <div className="uimodal__content">
                <Undertittel children={tittel} />
                <div className="uimodal__content--inner-content">
                    {innhold ? innhold() : children}
                </div>
                {actions && <div className="uimodal__content--actions"> {actions} </div>}
            </div>
        </StyledModal>
    );
};

export default UIModalWrapper;
