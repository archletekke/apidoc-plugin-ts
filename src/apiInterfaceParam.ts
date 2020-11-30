import * as ts from 'typescript'
import * as path from 'path'
import { InterfaceDeclaration, PropertySignature, Symbol, NamespaceDeclaration } from 'ts-morph'
import { Apidoc } from './types'
import { ArrayMatch, extractNamespace, getCapitalized, getInterface, getNamespacedInterface, getPropLabel, getPropTypeEnum, isNativeType, isUserDefinedSymbol, matchArrayInterface, parseDefinitionFiles, ParseResult, PropType } from './utils'

export const APIDOC_PLUGIN_TS_CUSTOM_ELEMENT_NAME = 'apiinterfaceparam'

/**
 * Parse elements
 * @param elements
 * @param element
 * @param block
 * @param filename
 */
export function parseElements (elements: Apidoc.Element[], element: Apidoc.Element, block: string, filename: string) {

  // We only want to do things with the instance of our custom element.
  if (element.name !== APIDOC_PLUGIN_TS_CUSTOM_ELEMENT_NAME) return

  // Remove the element
  elements.pop()

  // Create array of new elements
  const newElements: Apidoc.Element[] = []

  // Get object values
  const values = parse(element.content)

  // Only if there are values...
  if (!values) {
    this.log.warn(`Could not find parse values of element: ${element.content}`)
    return
  }

  // The interface we are looking for
  const namedInterface = values.interface.trim()

  // Get the file path to the interface
  const interfacePath = values.path ? path.resolve(path.dirname(filename), values.path.trim()) : filename
  const parentNamespace = parseDefinitionFiles.call(this, interfacePath)
  const { namespace, leafName } = extractNamespace.call(this, parentNamespace, namedInterface)

  if (isNativeType(leafName)) {
    parseNative(elements, newElements, interfacePath, values)
    return
  }
  const arrayMatch = matchArrayInterface(leafName)
  if (arrayMatch) {
    parseArray.call(this, elements, newElements, values, interfacePath, namespace, arrayMatch)
    return
  }
  parseInterface.call(this, elements, newElements, values, interfacePath, namespace, leafName)
  // Does the interface exist in current file?
}

function parseNative (elements: Apidoc.Element[], newElements: Apidoc.Element[], interfacePath: string, values: ParseResult) {
  setNativeElements(interfacePath, newElements, values)
  elements.push(...newElements)

}

function parseArray (elements: Apidoc.Element[], newElements: Apidoc.Element[], values: ParseResult, interfacePath: string, namespace: NamespaceDeclaration, arrayMatch: ArrayMatch) {
  const leafName = arrayMatch.interface
  const matchedInterface = getNamespacedInterface(namespace, leafName)
  if (!matchedInterface) {
    this.log.warn(`Could not find interface «${leafName}» in file «${interfacePath}»`)
    return
  }
  setArrayElements.call(this, matchedInterface, interfacePath, newElements, values)
  elements.push(...newElements)

}

function parseInterface (elements: Apidoc.Element[], newElements: Apidoc.Element[], values: ParseResult, interfacePath: string, namespace: NamespaceDeclaration, leafName: string) {
  const matchedInterface = getNamespacedInterface(namespace, leafName)

  // If interface is not found, log error
  if (!matchedInterface) {
    this.log.warn(`Could not find interface «${values.interface}» in file «${interfacePath}»`)
    return
  }

  // Match elements of current interface
  setInterfaceElements.call(this, matchedInterface, interfacePath, newElements, values)

  // Push new elements into existing elements
  elements.push(...newElements)
}

/**
 * Parse element content
 * @param content
 */
function parse (content: string): ParseResult | null {
  if (content.length === 0) return null

  const parseRegExp = /^(?:\((.+?)\)){0,1}\s*\{(.+?)\}\s*(?:(.+))?/g
  const matches = parseRegExp.exec(content)

  if (!matches) return null

  return {
    element: matches[3] || 'apiParam',
    interface: matches[2],
    path: matches[1]
  }
}

/**
 *
 * @param matchedInterface
 * @param filename
 * @param newElements
 * @param values
 * @param inttype
 */
function setArrayElements (
    matchedInterface: InterfaceDeclaration,
    filename: string,
    newElements: Apidoc.Element[],
    values: ParseResult,
    inttype?: string
) {
  const name = values.element
  newElements.push(getApiSuccessElement(`{Object[]} ${name} ${name}`))
  setInterfaceElements.call(this, matchedInterface, filename, newElements, values, name)
}
/**
 *
 * @param matchedInterface
 * @param filename
 * @param newElements
 * @param values
 * @param inttype
 */
function setInterfaceElements (
  matchedInterface: InterfaceDeclaration,
  filename: string,
  newElements: Apidoc.Element[],
  values: ParseResult,
  inttype?: string
) {
  // If this is an extended interface
  extendInterface.call(this, matchedInterface, filename, newElements, values, inttype)

  // Iterate over interface properties
  matchedInterface.getProperties().forEach((prop: PropertySignature) => {
    // Set param type definition and description
    const typeDef = inttype ? `${inttype}.${prop.getName()}` : prop.getName()
    const documentationComments = prop.getJsDocs().map((node) => node.getInnerText()).join()
    const description = documentationComments
      ? `\`${typeDef}\` - ${documentationComments}`
      : `\`${typeDef}\``

    // Set property type as a string
    const propTypeName = prop.getType().getText()
    const typeEnum = getPropTypeEnum(prop)
    const propLabel = getPropLabel(typeEnum, propTypeName)
    // Set the element
    newElements.push(getApiSuccessElement(`{${propLabel}} ${typeDef} ${description}`))

    // If property is an object or interface then we need to also display the objects properties
    if ([PropType.Object, PropType.Array].includes(typeEnum)) {
      // First determine if the object is an available interface
      const typeInterface = getInterface.call(this, filename, propTypeName)

      const arrayType = typeEnum === PropType.Array && prop.getType().getArrayElementType()
      const objectProperties = arrayType
        ? arrayType.getProperties()
        : prop.getType().getProperties()

      if (typeInterface) {
        setInterfaceElements.call(this, typeInterface, filename, newElements, values, typeDef)
      } else {
        setObjectElements.call(this, objectProperties, filename, newElements, values, typeDef)
      }
    }
  })
}

/**
 *
 * @param filename
 * @param newElements
 * @param values
 */
function setNativeElements (
  filename: string,
  newElements: Apidoc.Element[],
  values: ParseResult
  // inttype?: string
) {

  const propLabel = getCapitalized(values.interface)
  // Set the element
  newElements.push(getApiSuccessElement(`{${propLabel}} ${values.element}`))
  return
}

/**
 * Set element if type object
 */
function setObjectElements<NodeType extends ts.Node = ts.Node> (
  properties: Symbol[],
  filename: string,
  newElements: Apidoc.Element[],
  values: ParseResult,
  typeDef: string
) {
  properties.forEach((property) => {
    const valueDeclaration = property.getValueDeclaration()
    if (!valueDeclaration) return

    const propName = property.getName()
    const typeDefLabel = `${typeDef}.${propName}`
    const propType = valueDeclaration.getType().getText(valueDeclaration)

    const isUserDefinedProperty = isUserDefinedSymbol(property.compilerSymbol)
    if (!isUserDefinedProperty) return // We don't want to include default members in the docs

    const documentationComments = property.compilerSymbol.getDocumentationComment(undefined).map((node) => node.text).join()

    const desc = documentationComments
      ? `\`${typeDef}.${propName}\` - ${documentationComments}`
      : `\`${typeDef}.${propName}\``

    // Nothing to do if prop is of native type
    if (isNativeType(propType)) {
      newElements.push(getApiSuccessElement(`{${getCapitalized(propType)}} ${typeDefLabel} ${desc}`))
      return
    }

    const isEnum = valueDeclaration.getType().isEnum()
    if (isEnum) {
      newElements.push(getApiSuccessElement(`{Enum} ${typeDefLabel} ${desc}`))
      return
    }

    const newElement = getApiSuccessElement(`{Object${propType.includes('[]') ? '[]' : ''}} ${typeDefLabel} ${desc}`)
    newElements.push(newElement)

    // If property is an object or interface then we need to also display the objects properties
    const typeInterface = getInterface.call(this, filename, propType)

    if (typeInterface) {
      setInterfaceElements.call(this, typeInterface, filename, newElements, values, typeDefLabel)
    } else {

      const externalFileTypeSymbol = valueDeclaration.getType().getSymbol()
      if (!externalFileTypeSymbol) {
        setObjectElements.call(
          this,
          property.getValueDeclarationOrThrow().getType().getProperties(),
          filename,
          newElements,
          values,
          typeDef
        )
        return
      }

      const externalFileDeclaration = externalFileTypeSymbol.getDeclarations()[0]
      const externalFileInterface = externalFileDeclaration.getSourceFile().getInterface(propType)

      if (!externalFileInterface) {
        setObjectElements.call(
          this,
          property.getValueDeclarationOrThrow().getType().getProperties(),
          filename,
          newElements,
          values,
          typeDefLabel
        )
        return
      }

      setObjectElements.call(
        this,
        externalFileInterface.getType().getProperties(),
        filename,
        newElements,
        values,
        typeDefLabel
      )
    }
  })
}

/**
 * Extends the current interface
 * @param matchedInterface
 * @param interfacePath
 * @param newElements
 * @param values
 */
function extendInterface (
  matchedInterface: InterfaceDeclaration,
  interfacePath: string,
  newElements: Apidoc.Element[],
  values: ParseResult,
  inttype?: string
) {
  for (const extendedInterface of matchedInterface.getExtends()) {
    const extendedInterfaceName = extendedInterface.compilerNode.expression.getText()
    const parentNamespace = matchedInterface.getParentNamespace() || parseDefinitionFiles.call(this, interfacePath)
    const { namespace, leafName } = extractNamespace.call(this, parentNamespace, extendedInterfaceName)
    const matchedExtendedInterface = getNamespacedInterface.call(this, namespace, leafName)
    if (!matchedExtendedInterface) {
      this.log.warn(`Could not find interface to be extended ${extendedInterfaceName}`)
      return
    }

    extendInterface.call(this, matchedExtendedInterface, interfacePath, newElements, values)
    setInterfaceElements.call(this, matchedExtendedInterface, interfacePath, newElements, values, inttype)
  }
}

function getApiSuccessElement (param: string | number): Apidoc.Element {
  return {
    content: `${param}\n`,
    name: 'apiparam',
    source: `@apiParam ${param}\n`,
    sourceName: 'apiParam'
  }
}
