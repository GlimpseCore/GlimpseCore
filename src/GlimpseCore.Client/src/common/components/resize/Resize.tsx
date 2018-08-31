import React from 'react';
import Hammer from 'hammerjs';
import { connect } from 'react-redux';
import classNames from 'classnames';

import styles from './Resize.scss';
import { saveSize, saveOpenState, toggleOpenState } from './ResizeActions';
import { getResizePanelsState } from './ResizeSelectors';
import { IStoreState } from '@client/IStoreState';
import { clamp } from '@common/util/CommonUtilities';

// enable DOM events so `preventDefault()` could be called on events
Hammer.defaults.domEvents = true;

import { IResizeProps, IResizeCallbacks, IResizeState } from './ResizeInterfaces';

const INITIAL_STATE: IResizeState = {
    // difference between the start position
    // of the drag and the current pointer position
    delta: 0
};

class Resize extends React.Component<IResizeProps & IResizeCallbacks, IResizeState> {
    public static defaultProps = {
        minSize: 0,
        maxSize: Infinity,
        isPadding: true,
        bodyClassName: '',
        gripClassName: ''
    };

    /**
     * grip element
     */
    private gripEl: HTMLElement;

    /**
     * panel element
     */
    private panelEl: HTMLElement;

    /**
     * `hammerjs` manager on `grip`
     */
    private mc;

    /**
     * Constructor just to create `state` object.
     */
    constructor(props: IResizeProps & IResizeCallbacks, context) {
        super(props, context);
        this.state = { ...INITIAL_STATE };
    }

    /**
     * Function to `initialize` touch input listeners.
     */
    public componentDidMount(): void {
        this.mc = new Hammer.Manager(this.gripEl);
        this.mc.add(new Hammer.Pan());
        this.mc.on('pan', this.onPan);
        this.mc.on('panend', this.onPanEnd);
        this.mc.on('panstart', this.onPanStart);
        // initialize size in store with initialSize
        const {
            id,
            size: currentSize,
            isOpen: currentIsOpen,
            initialSize,
            initialIsOpen,
            saveSize,
            saveOpenState
        } = this.props;

        const size = currentSize === undefined ? initialSize : currentSize;
        const isOpen = currentIsOpen === undefined ? initialIsOpen : currentIsOpen;

        saveSize({ id, size });
        saveOpenState({ id, isOpen });
    }

    /**
     * Function to handle `resize` event.
     *
     * @param {Object} Event object.
     */
    private onPan = (e): void => {
        e.preventDefault();
        const { direction } = this.props;

        this.setState({ delta: e[`delta${direction.toUpperCase()}`] });
    };

    /**
     * Function to handle `resize start` event.
     *
     * @param {Object} Event object.
     */
    private onPanStart = (e): void => {
        const { id, size, saveSize } = this.props;
        // get real size in DOM
        const sizeInDOM = this.getDOMSize();
        /* ensure that width in the state is the same as
           actual width in the DOM - edge case for window resize */
        if (size !== sizeInDOM) {
            saveSize({ id, size: sizeInDOM });
        }
    };

    /**
     * getDOMSize - function to handle `resize end` event.
     *
     * @returns {Number} size in DOM.
     */
    private getDOMSize(): number {
        const { direction } = this.props;
        const propertyName = this.getPropertyName(direction);
        // get size of the main element in the DOM
        const style = window.getComputedStyle(this.panelEl);

        return parseInt(style[propertyName], 10);
    }

    /**
     * Function to handle `resize end` event.
     *
     * @param {Object} Event object.
     */
    private onPanEnd = (e): void => {
        const { minSize, maxSize, id, saveSize, saveOpenState, isOpen: currentIsOpen } = this.props;

        const clampedSize = clamp(this.getSize(this.state.delta), minSize, maxSize);
        const isOpen = clampedSize > minSize;

        // save size only if it is greater than `minSize` thus when user
        // closes the panel by dragging it is able to open it by toggle
        if (isOpen === true) {
            // get real size in DOM
            const sizeInDOM = this.getDOMSize();
            saveSize({ id, size: sizeInDOM });
        }

        if (isOpen !== currentIsOpen) {
            saveOpenState({ id, isOpen });
        }
        // reset current `delta`
        this.setState({ delta: 0 });
    };

    /**
     * Function to get current `size` regarding delta.
     *
     * @param {Number} Delta `x` of the user's `pan` input.
     * @returns {Number} Current `size`.
     */
    private getSize(delta: number): number {
        const {
            threshold,
            minSize,
            isOpen,
            size: currentSize,
            direction
        } = this.props;
        const directionCoef = (direction === 'y') ? -1 : 1;
        const openSize = (isOpen ? currentSize : minSize) + (directionCoef * delta);

        if (threshold !== undefined) {
            return (openSize >= threshold)
                    ? Math.max(openSize, minSize)
                    : minSize;
        }

        return Math.max(openSize, minSize);
    }

    private getPropertyName(direction: string): string {
        return direction === 'x' ? 'width' : 'height';
    }

    public render() {
        const {
            children,
            direction,
            minSize,
            maxSize,
            isPadding,
            className: propsClassName,
            bodyClassName,
            gripClassName
        } = this.props;

        const size = clamp(this.getSize(this.state.delta), minSize, maxSize);

        const style = {
            [this.getPropertyName(direction)]: (size > minSize) ? size : minSize
        };

        const className = classNames(
            styles.resize,
            styles[`is${direction.toUpperCase()}`],
            propsClassName,
            { [styles.isPadding]: isPadding }
        );

        return (
            <div
                className={className}
                style={style}
                ref={this.savePanelReference}>
                <div
                    className={classNames(styles.grip, gripClassName)}
                    ref={this.saveGripReference} />
                <div className={classNames(styles.body, bodyClassName)}>
                    {children}
                </div>
            </div>
        );
    }

    /**
     * savePanelReference - function to save the `panel` DOM el reference.
     *
     * @param {HTMLElement} el element to save.
     */
    private savePanelReference = el => {
        this.panelEl = el;
    };

    /**
     * saveGripReference - function to save the `grip` DOM el reference.
     *
     * @param {HTMLElement} el element to save.
     */
    private saveGripReference = el => {
        this.gripEl = el;
    };

    /**
     * Function to `remove` touch input listeners.
     */
    public componentWillUnmount(): void {
        this.mc.off('pan panstart panend');
    }
}

export function mapStateToProps(state: IStoreState, ownProps: IResizeProps): Partial<IResizeProps> {
    return getResizePanelsState(state)[ownProps.id] || {};
}

export function mapDispatchToProps(dispatch): IResizeCallbacks {
    return {
        saveSize: payload => {
            dispatch(saveSize(payload));
        },
        saveOpenState: payload => {
            dispatch(saveOpenState(payload));
        }
    };
}

const connectedResize = connect(mapStateToProps, mapDispatchToProps)(Resize);

export { connectedResize as Resize };
export { toggleOpenState };



// WEBPACK FOOTER //
// ./src/client/common/components/resize/Resize.tsx