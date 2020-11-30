export namespace FirstNamespace {
    export namespace SecondNamespace {
        export interface Result {
          id: string
        }
    }
}

/**
 * @api {get} /api/:id
 * @apiInterfaceSuccess {FirstNamespace.SecondNamespace.Result} namespaced value
 * @apiGroup Interface inside namespace
 */
