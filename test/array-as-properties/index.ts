interface SquareConfig {
  color: string
  width: number
}

interface SquareConfigsInterface {
  squares: SquareConfig[]
}

interface SquareConfigsGeneric {
  squares: Array<SquareConfig>
}

/**
 * @api {get} /api/:id
 * @apiParam {SquareConfig} id Unique ID.
 * @apiInterfaceSuccess {SquareConfigsInterface}
 * @apiGroup arrayAsInterface
 */

/**
 * @api {get} /api/:id
 * @apiParam {SquareConfig} id Unique ID.
 * @apiInterfaceSuccess {SquareConfigsGeneric}
 * @apiGroup arrayGenericsTest
 */
