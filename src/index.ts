import { Project as Ast } from 'ts-morph'

import { Apidoc } from './types'
import { parseElements as parseSuccessElements } from './apiInterfaceSuccess'
import { parseElements as parseParamElements } from './apiInterfaceParam'

const ast = new Ast()
export { ast }

export const definitionFilesAddedByUser: {[key: string]: boolean} = {}

/**
 * Initialise plugin (add app hooks)
 * The ApiDocs core node module scans all the node modules for this.
 * @param app
 */
export function init (app: Apidoc.App) {
  /*
    We need to define different priorities here because otherwise they somehow conflict and only the first one is run.
  */
  app.addHook(Apidoc.AvailableHook['parser-find-elements'], parseSuccessElements.bind(app), 200)
  app.addHook(Apidoc.AvailableHook['parser-find-elements'], parseParamElements.bind(app), 201)
}
