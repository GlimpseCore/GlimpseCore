import React from 'react';
import classNames from 'classnames';

import styles from './Octopus.scss';

interface IOctopusConnectionProps extends React.SVGProps<{}> {
    connected: boolean;
    className?: string;
}

/* tslint:disable:variable-name */
export const OctopusConnection = ({
    connected,
    className,
    children,
    ...rest
}: IOctopusConnectionProps) =>
    <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        viewBox="0 0 186 186"
        enableBackground="new 0 0 186 186"
        xmlSpace="preserve"
        {...rest}
        className={classNames(styles.octopus, className, {
            [styles.connected]: connected
        })}>
        <g className={styles.octopusBack}>
            <path
                fill="#1772B9"
                d="M122.6,184.5c-2.2,0-4.3-1.5-4.9-3.7c-0.8-2.7,0.8-5.5,3.5-6.3c8.7-2.4,11.9-8.7,13.1-13.5 c2.2-9-1-19.9-7.9-26.3c-15.7-14.8-23.2-23.3-23.2-31.3V55.8c0-2.8,2.3-5.1,5.1-5.1s5.1,2.3,5.1,5.1v47.6c0,5,13,17.3,20,23.9 c9.6,9,13.9,23.6,10.8,36.2c-2.6,10.5-9.8,17.9-20.3,20.8C123.5,184.5,123.1,184.5,122.6,184.5z"
            />
            <path
                fill="#1772B9"
                d="M96,162.3c-2.8,0-5.1-2.3-5.1-5.1v-96c0-2.8,2.3-5.1,5.1-5.1s5.1,2.3,5.1,5.1v96 C101.1,160.1,98.8,162.3,96,162.3z"
            />
            <path
                fill="#1772B9"
                d="M161.7,144.5c-2.8,0-5.1-2.3-5.1-5.1c0-21.6-4.5-30-16.2-30c-17.9,0-24.6-6.9-24.6-25.3V61.8 c0-2.8,2.3-5.1,5.1-5.1s5.1,2.3,5.1,5.1V84c0,6.7,0.9,10.7,2.8,12.6c1.8,1.8,5.4,2.6,11.6,2.6c26.4,0,26.4,29.2,26.4,40.2 C166.8,142.2,164.6,144.5,161.7,144.5z"
            />
        </g>
        <g className={styles.octopusFront}>
            <path
                fill="#51C9F1"
                d="M151.6,113.5c-8.1,0-18.9-2.4-18.9-23.5V66l0,0V32c0-0.1,0-0.2,0-0.4c0-16.8-13.6-30.4-30.4-30.4 C85.7,1.2,72.1,14.7,72,31.4l0,0v12.2l0,0v60.9c-1.5,0.4-3,0.6-4.6,0.6c-9.5,0-17.3-7.8-17.3-17.3c0-4.5-1.4-14.8-14.8-14.8h-2.4 c-1.5-1.8-3.9-2.9-7.7-2.9c-0.1,0-0.2,0-0.3,0V74h-6.4v3h6.4v3h-6.4v3h6.4v3.5c0.1,0,0.2,0,0.3,0c3.9,0,6.4-1.3,7.9-3.2h2.2 c3.2,0,4.6,0.4,4.6,4.6c0,15.2,12.3,27.5,27.5,27.5c1.6,0,3.1-0.1,4.6-0.4v4.5h-2.6c-12.7,0-19.1,6.7-19.1,19.9 c0,2.8,2.3,5.1,5.1,5.1s5.1-2.3,5.1-5.1c0-8.3,2.7-9.7,8.9-9.7H72v2.9c0,2.8,2.3,5.1,5.1,5.1s5.1-2.3,5.1-5.1v-2.9h13.2 c0.6,0,1.3,0,1.9,0v2c0,9.8-4.1,10.7-8.3,10.7H68.6c-2.8,0-5.1,2.3-5.1,5.1s2.3,5.1,5.1,5.1H89c5.6,0,18.5-2,18.5-20.9V128 c2.8-1,5.1-2.4,6.9-4.3c5.6-5.7,5.6-13.8,5.5-21.7c0-0.9,0-1.7,0-2.6V66h2.7v24c0,21.7,10.3,33.7,29,33.7c23.7,0,23.7,6.4,23.7,10.7 c0,2.8,2.3,5.1,5.1,5.1s5.1-2.3,5.1-5.1C185.5,115.9,167.4,113.5,151.6,113.5z M84.7,88.1c0,3.2-0.9,6.1-2.5,8.7V66h2.4v21.9 C84.7,88,84.7,88,84.7,88.1z M95.4,119.5H82.2V111c7.6-4.9,12.7-13.4,12.7-23.1c0-0.1,0-0.2,0-0.2V66h2.4v53.5 C96.7,119.5,96.1,119.5,95.4,119.5z M109.7,102.1c0,6,0.1,11.3-2.2,14.1V66h2.2v33.4C109.7,100.3,109.7,101.2,109.7,102.1z"
            />
            <g className={styles.eye}>
                <circle fill="white" cx="82.8" cy="47.6" r="3.6" />
                <circle fill="#1172B7" cx="84.5" cy="47.8" r="1.9" />
            </g>
            <g className={styles.eye}>
                <circle fill="white" cx="105.7" cy="47.6" r="3.6" />
                <circle fill="#1172B7" cx="107.4" cy="47.7" r="1.9" />
            </g>
            <path fill="#1772B9" d="M88.2,34.4c-1.4-1.2-3.4-1.9-5.6-1.9s-4.2,0.7-5.6,1.9H88.2z" />
            <path fill="#1772B9" d="M111.2,37.4c-1.5-1.2-3.6-1.9-5.9-1.9s-4.4,0.7-5.9,1.9H111.2z" />
            <circle fill="#77D0EC" cx="102.8" cy="16.4" r="4.1" />
            <circle fill="#77D0EC" cx="114.9" cy="19.2" r="6.9" />
            <circle fill="#77D0EC" cx="108.6" cy="9" r="3.6" />
        </g>
        <rect x="0.2" y="63.6" fill="#1772B9" width="11.8" height="52.4" />
        <path fill="#51C9F1" d="M8.4,83v-7c0-1.3-1.1-2.4-2.4-2.4S3.6,74.7,3.6,76v7H8.4z" />
        <path fill="#51C9F1" d="M8.4,103.4v-7c0-1.3-1-2.4-2.4-2.4s-2.4,1.1-2.4,2.4v7H8.4z" />
        <path
            fill="none"
            stroke="#1772B9"
            strokeWidth="10.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            d="M108.3,60.3"
        />
        <path
            fill="none"
            stroke="#1772B9"
            strokeWidth="10.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeMiterlimit="10"
            d="M108.3,60.3"
        />
    </svg>;

export const OctopusFeedbackTentacles = ({
    className = '',
    bottomTentacleClassName,
    topTentacleClassName = ''
}) =>
    <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        viewBox="0 0 93 102"
        xmlSpace="preserve"
        className={classNames(className)}>
        <path
            d="M67,10 C74,10 76,13 79,16 C82,19 85,20 90,20"
            className={topTentacleClassName}
            stroke="#55C9F0"
            strokeWidth="5"
            strokeLinecap="round"
        />
        <path
            d="M23,72 C23,83 30,85 34,89 C38,93 36,99 36,99"
            className={bottomTentacleClassName}
            stroke="#55C9F0"
            strokeWidth="5"
            strokeLinecap="round"
        />
    </svg>;

export const OctopusFeedback = ({ className = '', ...rest }) =>
    <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        viewBox="0 0 93 102"
        xmlSpace="preserve"
        className={className}
        {...rest}>
        <g stroke="none" strokeWidth={1} fill="none" fillRule="evenodd">
            <path
                d="M41.009,60.793 C40.455,60.793 39.899,60.6 39.45,60.207 L17.868,41.29 C16.885,40.428 16.786,38.933 17.648,37.951 C18.509,36.969 20.006,36.87 20.987,37.731 L42.57,56.647 C43.553,57.509 43.652,59.004 42.79,59.986 C42.322,60.52 41.667,60.793 41.009,60.793 Z"
                fill="#1B73B9"
                fillRule="nonzero"
            />
            <path
                d="M19.08,87.916 C18.21,87.916 17.373,87.435 16.96,86.604 C13.916,80.491 18.027,73.29 23.582,70.123 C24.813,69.421 25.675,68.896 26.714,68.264 C28.387,67.245 30.47,65.978 35.101,63.342 C36.236,62.696 37.681,63.092 38.328,64.228 C38.974,65.364 38.578,66.809 37.442,67.455 C32.871,70.057 30.821,71.304 29.174,72.307 C28.097,72.962 27.202,73.507 25.926,74.234 C22.302,76.301 19.468,81.023 21.197,84.495 C21.78,85.665 21.303,87.085 20.134,87.668 C19.793,87.836 19.434,87.916 19.08,87.916 Z"
                fill="#1B73B9"
                fillRule="nonzero"
            />
            <path
                d="M64.894,20.833 C64.394,20.833 63.891,20.675 63.462,20.349 C62.422,19.557 62.221,18.073 63.013,17.033 C66.239,12.796 67.772,10.901 69.003,9.378 C69.768,8.432 70.404,7.646 71.264,6.518 C75.142,1.435 82.826,-1.682 88.48,2.145 C89.562,2.878 89.845,4.349 89.112,5.432 C88.379,6.514 86.907,6.797 85.825,6.064 C82.615,3.889 77.557,6.07 75.027,9.388 C74.135,10.557 73.476,11.372 72.683,12.354 C71.471,13.853 69.962,15.718 66.778,19.9 C66.313,20.512 65.607,20.833 64.894,20.833 Z"
                fill="#1B73B9"
                fillRule="nonzero"
            />
            <path
                d="M43.874,81.652 C42.12,81.652 40.936,81.419 40.796,81.39 C39.516,81.125 38.693,79.872 38.959,78.593 C39.225,77.314 40.48,76.491 41.756,76.756 C42.05,76.815 49.258,78.158 53.794,72.299 C57.168,67.941 58.35,61.251 51.551,55.544 C40.217,46.03 25.048,32.315 24.896,32.178 C23.927,31.301 23.852,29.805 24.729,28.836 C25.605,27.865 27.103,27.792 28.071,28.669 C28.222,28.806 43.328,42.462 54.594,51.92 C62.194,58.299 63.376,67.653 57.536,75.197 C53.275,80.7 47.415,81.651 43.874,81.652 Z"
                fill="#1B73B9"
                fillRule="nonzero"
            />
            <path
                d="M43.26,66.336 C42.775,66.336 42.286,66.187 41.864,65.879 C40.809,65.107 40.58,63.627 41.352,62.572 C43.908,59.079 42.451,54.664 39.781,52.283 C36.402,49.268 17.043,32.389 16.848,32.219 C15.863,31.36 15.761,29.865 16.619,28.88 C17.477,27.895 18.972,27.792 19.958,28.651 C20.153,28.821 39.532,45.718 42.931,48.75 C47.155,52.518 49.375,59.622 45.171,65.366 C44.708,66 43.989,66.336 43.26,66.336 Z"
                fill="#1B73B9"
                fillRule="nonzero"
            />
            <path
                d="M56.815,47.875 C56.254,47.875 55.691,47.677 55.239,47.273 L25.425,20.639 C24.45,19.768 24.366,18.272 25.237,17.298 C26.108,16.324 27.603,16.24 28.578,17.11 L58.392,43.745 C59.367,44.616 59.451,46.112 58.58,47.086 C58.113,47.609 57.465,47.875 56.815,47.875 Z"
                fill="#55C9F0"
                fillRule="nonzero"
            />
            <path
                d="M36.316,24.012 L24.335,13.324 L24.333,13.326 C18.518,8.207 9.654,8.733 4.489,14.523 C-0.697,20.336 -0.188,29.253 5.626,34.439 C5.669,34.478 5.715,34.513 5.758,34.551 L17.54,45.061 L36.316,24.012 Z"
                fill="#55C9F0"
                fillRule="nonzero"
            />
            <path
                d="M5.623,34.437 C5.618,34.433 5.613,34.428 5.608,34.424 C5.607,34.423 5.606,34.421 5.605,34.42 C-0.188,29.232 -0.69,20.33 4.489,14.524 C6.46,12.315 8.969,10.874 11.643,10.218 C10.725,10.826 9.869,11.56 9.102,12.42 C4.31,17.793 4.762,26.021 10.097,30.839 L10.094,30.843 C17.688,37.703 16.635,44.228 16.635,44.228 C16.635,44.228 8.877,37.308 5.629,34.442 C5.628,34.441 5.627,34.44 5.626,34.439 C5.625,34.439 5.624,34.438 5.623,34.437 Z"
                id="Shape"
            />
            <path
                d="M39.343,55.584 C38.782,55.584 38.22,55.386 37.769,54.984 C34.487,52.058 15.57,35.375 15.38,35.207 C14.4,34.343 14.306,32.847 15.17,31.867 C16.035,30.887 17.53,30.793 18.51,31.657 C18.701,31.825 37.628,48.517 40.919,51.452 C41.894,52.322 41.98,53.818 41.11,54.793 C40.642,55.317 39.994,55.584 39.343,55.584 Z"
                fill="#55C9F0"
                fillRule="nonzero"
            />
            <path
                d="M18.98,18.774 C19.214,17.947 19.775,17.146 20.607,16.567 C21.439,15.988 22.384,15.74 23.241,15.807 L18.98,18.774 Z"
                fill="#1772B9"
                fillRule="nonzero"
            />
            <path
                d="M12.295,27.588 C12.17,26.711 12.357,25.706 12.886,24.781 C13.416,23.856 14.187,23.186 15.007,22.85 L12.295,27.588 Z"
                fill="#1772B9"
                fillRule="nonzero"
            />
            <g
                transform="translate(3.000000, 16.000000)"
                fillRule="nonzero"
                fill="#79D1EC">
                <circle
                    transform="translate(6.251600, 3.250150) rotate(-48.267021) translate(-6.251600, -3.250150) "
                    cx="6.2516"
                    cy="3.25015"
                    r="2.00012018"
                />
                <circle
                    transform="translate(4.251700, 8.250450) rotate(-48.267021) translate(-4.251700, -8.250450) "
                    cx="4.2517"
                    cy="8.25045"
                    r="3.00018026"
                />
                <circle
                    transform="translate(2.751400, 2.750350) rotate(-48.267021) translate(-2.751400, -2.750350) "
                    cx="2.7514"
                    cy="2.75035"
                    r="1.50009013"
                />
            </g>
            <g className={styles.feedbackEye}>
                <circle
                    fill="#FFFFFF"
                    fillRule="nonzero"
                    transform="translate(26.752300, 21.749450) rotate(-48.267021) translate(-26.752300, -21.749450) "
                    cx="26.7523"
                    cy="21.74945"
                    r="1.50009013"
                />
                <circle
                    fill="#FFFFFF"
                    fillRule="nonzero"
                    transform="translate(19.752400, 29.750050) rotate(-48.267021) translate(-19.752400, -29.750050) "
                    cx="19.7524"
                    cy="29.75005"
                    r="1.50009013"
                />

                <circle
                    className={styles.feedbackPupil}
                    fill="#1172B7"
                    fillRule="nonzero"
                    transform="translate(27.250550, 22.251400) rotate(-31.822579) translate(-27.250550, -22.251400) "
                    cx="27.25055"
                    cy="22.2514"
                    r="1.00001769"
                />
                <circle
                    className={styles.feedbackPupil}
                    fill="#1172B7"
                    fillRule="nonzero"
                    transform="translate(20.250150, 30.251500) rotate(-31.822579) translate(-20.250150, -30.251500) "
                    cx="20.25015"
                    cy="30.2515"
                    r="1.00001769"
                />
            </g>
            <path
                d="M53.91,57.971 C51.213,57.971 48.598,56.962 46.364,54.97 L23.284,34.444 C22.307,33.576 22.22,32.08 23.089,31.103 C23.956,30.127 25.452,30.038 26.43,30.908 L49.512,51.435 C50.911,52.685 53.843,54.424 57.767,52.073 C61.472,49.854 61.426,46.232 61.424,46.196 C61.369,44.89 62.383,43.787 63.689,43.732 C65.006,43.675 66.098,44.69 66.153,45.997 C66.164,46.259 66.352,52.449 60.199,56.134 C58.146,57.362 56.003,57.971 53.91,57.971 Z"
                fill="#55C9F0"
                fillRule="nonzero"
            />
            <path
                d="M58.285,54.096 C55.588,54.096 52.973,53.087 50.739,51.095 L27.659,30.569 C26.682,29.701 26.595,28.205 27.464,27.228 C28.331,26.251 29.827,26.162 30.805,27.033 L53.886,47.56 C55.286,48.809 58.217,50.55 62.141,48.198 C65.846,45.979 65.8,42.357 65.798,42.321 C65.743,41.015 66.757,39.912 68.063,39.857 C69.376,39.811 70.473,40.816 70.527,42.122 C70.538,42.384 70.726,48.574 64.573,52.259 C62.521,53.487 60.378,54.096 58.285,54.096 Z"
                fill="#55C9F0"
                fillRule="nonzero"
            />
            <path
                d="M36.593,61.084 C36.036,61.084 35.476,60.889 35.026,60.49 L15.088,42.849 C14.109,41.983 14.018,40.488 14.884,39.509 C15.749,38.531 17.244,38.437 18.224,39.305 L38.162,56.947 C39.141,57.813 39.232,59.308 38.366,60.287 C37.898,60.815 37.247,61.084 36.593,61.084 Z"
                fill="#55C9F0"
                fillRule="nonzero"
            />
        </g>
        <path
            d="M50,20 C50,20 57,14 60,12 C63,10 65,10 67,10"
            id="Path-2"
            stroke="#55C9F0"
            strokeWidth="5"
            strokeLinecap="round"
        />
        <path
            d="M36,59 C33,59 23,62 23,72"
            id="Path-4"
            stroke="#55C9F0"
            strokeWidth="5"
            strokeLinecap="round"
        />
    </svg>;



// WEBPACK FOOTER //
// ./src/client/common/components/Octopus.tsx