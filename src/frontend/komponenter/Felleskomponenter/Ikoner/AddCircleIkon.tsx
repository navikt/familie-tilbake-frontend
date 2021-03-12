import * as React from 'react';

interface IProps {
    test?: boolean;
}

const AddCircleIkon: React.FC<IProps> = () => {
    return (
        <svg
            width="18px"
            height="18px"
            viewBox="0 0 18 18"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            xmlnsXlink="http://www.w3.org/1999/xlink"
        >
            <title>Pluss-tegn i sirkel</title>
            <defs></defs>
            <g
                id="Legg-til-ikon"
                stroke="none"
                strokeWidth="1"
                fill="none"
                fillRule="evenodd"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <g
                    id="Legg-til-ikon-alt"
                    transform="translate(-57.000000, -537.000000)"
                    stroke="#0067C5"
                >
                    <g id="19-interface-add-circle" transform="translate(58.000000, 538.000000)">
                        <g id="Stroke-1">
                            <path d="M8,0.347826087 C12.226087,0.347826087 15.6521739,3.77391304 15.6521739,8 C15.6521739,12.226087 12.226087,15.6521739 8,15.6521739 C3.77391304,15.6521739 0.347826087,12.226087 0.347826087,8 C0.347826087,3.77391304 3.77391304,0.347826087 8,0.347826087 Z"></path>
                            <path d="M8,3.82608696 L8,12.173913" id="Stroke-3"></path>
                            <path d="M12.173913,8 L3.82608696,8" id="Stroke-5"></path>
                        </g>
                    </g>
                </g>
            </g>
        </svg>
    );
};

export { AddCircleIkon };
