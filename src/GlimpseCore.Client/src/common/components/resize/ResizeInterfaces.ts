export interface IResizeProps {
    id: string,
    size: number,
    isOpen: boolean,
    initialSize: string,
    initialIsOpen: string,
    direction: string,
    minSize: number,
    maxSize: number,
    threshold: number,
    isPadding: boolean,
    className: string,
    bodyClassName: string,
    gripClassName: string
}
export interface IResizeCallbacks {
    saveSize: Function,
    saveOpenState: Function,
}
export interface IResizeState {
    delta: number
 }