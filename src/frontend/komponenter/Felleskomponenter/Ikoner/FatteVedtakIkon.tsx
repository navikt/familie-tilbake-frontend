import * as React from 'react';

interface IProps {
    width?: number;
    height?: number;
}

const FatteVedtakIkon: React.FC<IProps> = ({ height = 24, width = 24 }) => {
    return (
        <svg
            version="1.1"
            id="Filled_Version"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
            x="0px"
            y="0px"
            width={`${width}px`}
            height={`${height}px`}
            viewBox="0 0 24 24"
            enableBackground="new 0 0 24 24"
            xmlSpace="preserve"
            aria-label="Fatte vedtak"
        >
            <g>
                <path
                    d="M14.529,19.924l-1.751-1.501c-0.538-0.462-0.726-1.142-0.49-1.775c0.23-0.623,0.83-1.025,1.526-1.025h2.015l0.93-1.82
       c-0.773-0.353-1.739-0.673-2.81-1.026c-0.624-0.206-1.266-0.418-1.885-0.644v-1.864c0.486-0.325,1.383-1.159,1.49-2.932
       c0.366-0.234,0.597-0.744,0.597-1.393c0-0.57-0.177-1.031-0.468-1.295c0.243-0.615,0.641-1.688,0.367-2.79
       C13.719,0.523,11.83,0.05,10.314,0.05l0,0c-1.343,0-2.977,0.372-3.563,1.384C6.236,1.406,5.835,1.543,5.554,1.85
       c-0.669,0.727-0.298,2.078-0.077,2.84C5.36,4.785,5.26,4.909,5.182,5.06C5.05,5.312,4.978,5.638,4.978,5.979
       c0,0.635,0.231,1.132,0.599,1.361c0.108,1.77,1.003,2.603,1.488,2.928v1.864c-0.618,0.226-1.26,0.438-1.883,0.644
       c-2.352,0.776-4.208,1.389-4.592,2.546c-0.492,1.486-0.523,4.113-0.525,4.224c0,0.133,0.051,0.262,0.146,0.357
       c0.094,0.095,0.222,0.148,0.354,0.148h13.919L14.529,19.924z"
                />
                <path
                    d="M23.904,16.996c-0.072-0.196-0.287-0.374-0.59-0.374H20.69l-1.56-3.074c-0.114-0.227-0.328-0.367-0.559-0.367
       s-0.445,0.14-0.559,0.364l-1.572,3.077h-2.627c-0.281,0-0.502,0.14-0.589,0.373c-0.087,0.234-0.011,0.484,0.204,0.669l2.275,1.95
       l-1.275,3.532v0.001c-0.136,0.375,0.027,0.539,0.24,0.802c0.26,0,0.414,0.022,0.629-0.121l1.303-0.867l1.963-1.308l3.256,2.168
       l0.008,0.005c0.234,0.163,0.394,0.122,0.668,0.106l0.149-0.212c0.097-0.135,0.134-0.356,0.055-0.575
       c-0.45-1.248-0.151-0.42-1.274-3.531l2.275-1.951C23.929,17.469,23.977,17.191,23.904,16.996z"
                />
            </g>
        </svg>
    );
};

export { FatteVedtakIkon };
