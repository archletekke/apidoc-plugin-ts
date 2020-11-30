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
 * @apiInterfaceSuccessSuccess {SquareConfigsInterface}
 * @apiGroup arrayAsInterface
 */

/**
 * @api {get} /api/:id
 * @apiParam {SquareConfig} id Unique ID.
 * @apiInterfaceSuccessSuccess {SquareConfigsGeneric}
 * @apiGroup arrayGenericsTest
 */
