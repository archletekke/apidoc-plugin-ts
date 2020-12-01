interface SquareConfig {
  color: string
  width: number
}

/**
 * @api {get} /api/:id
 * @apiParam {SquareConfig} id Unique ID.
 * @apiInterfaceSuccess {SquareConfig}
 * @apiGroup localInterfaceTest
 */
export function localInterfaceTest (): SquareConfig {
  return { color: 'red', width: 20 }
}

/**
 * @api {get} /api/:id
 * @apiParam {number} id Unique ID.
 * @apiInterfaceSuccess (./interfaces.ts) { InnerSquare }
 * @apiGroup extendInterfaceTest
 */
export function extendInterfaceTest () {
  return false
}

/**
 * @api {get} /api/:id
 * @apiParam {number} id Unique ID.
 * @apiInterfaceSuccess (./interfaces.ts) { Employer }
 * @apiGroup importedInterfaceTest
 */
export function importedInterfaceTest () {
  return false
}

/**
 * @api {get} /api/:id
 * @apiParam {number} id Unique ID.
 * @apiInterfaceSuccess (./interfaces.ts) { TeamPicks }
 * @apiGroup deepExtendsInterfaceTest
 */
export function deepExtendsInterfaceTest () {
  return false
}

/**
 * @api {get} /api/:id
 * @apiParam {number} id Unique ID.
 * @apiInterfaceSuccess (./interfaces.ts) { SearchResult }
 * @apiGroup deepExternalInterfaceTest
 */
export function deepExternalInterfaceTest () {
  return false
}

/**
 * @api {get} /api/:id
 * @apiParam {number} id Unique ID.
 * @apiInterfaceSuccess (./interfaces.ts) {ShapedSkill}
 * @apiGroup multipleInheritanceTest
 */
export function multipleInheritanceTest () {
  return false
}

/**
 * @api {get} /api/:id
 * @apiParam {number} id Unique ID.
 * @apiInterfaceSuccess (./interfaces.ts) {CustomNamespace.ComposedInterface}
 * @apiGroup namespacedInterfaceTest
 */
export function namespacedInterfaceTest () {
  return false
}

/*
// This is not supported yet.
//
//  * @api {get} /api/:id
//  * @apiParam {number} id Unique ID.
//  * @apiInterfaceSuccess (./interfaces.ts) {GenericInterface<boolean>}
//  * @apiGroup genericInterfaceTest
//
// export function genericInterfaceTest () {
//   return false
// }
*/

/**
 * @api {get} /api/:id
 * @apiParam {number} id Unique ID.
 * @apiInterfaceSuccess {X}
 * @apiGroup notFoundTest
 */
export function notFoundTest () {
  return false
}
