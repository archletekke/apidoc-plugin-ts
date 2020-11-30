export namespace Apidoc {
    export enum AvailableHook {
        'parser-find-elements' = 'parser-find-elements'
    }

    export interface App {
        addHook(name: AvailableHook, func: Function, priority?: number)
    }

    export interface Element {
        source: string
        name: string
        sourceName: string
        content: string
    }

    export type ParserFindElementsHookCallback = (
        elements: Element[],
        element: Element,
        block: string,
        filename: string
    ) => void
}