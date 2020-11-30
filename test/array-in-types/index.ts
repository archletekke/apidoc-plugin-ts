interface SquareConfig {
  color: string
  width: number
}

/**
 * @api {get} /api/:id
 * @apiParam {SquareConfig} id Unique ID.
 * @apiInterfaceSuccess {SquareConfig[]} squareConfigs
 * @apiGroup arrayWithBracketsTest
 */

/**
 * @api {get} /api/:id
 * @apiParam {SquareConfig} id Unique ID.
 * @apiInterfaceSuccess {Array<SquareConfig>} squareConfigs
 * @apiGroup arrayAsGenericsTest
 */
