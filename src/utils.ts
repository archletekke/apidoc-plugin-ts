import { InterfaceDeclaration, PropertySignature, SourceFile, NamespaceDeclaration, ts } from 'ts-morph'
import { ast, definitionFilesAddedByUser } from '.'

type NamespacedContext = SourceFile | NamespaceDeclaration
interface NamespacedDeclaration {
  declaration: InterfaceDeclaration
  parentNamespace: NamespacedContext
}

export interface ParseResult {
  element: string
  interface: string
  path: string
}

export interface ArrayMatch {
  full: string
  interface: string
}

export enum PropType {
  Enum = 'Enum',
  Array = 'Array',
  Object = 'Object',
  Native = 'Native',
  NativeArray = 'NativeArray'
}

export function parseDefinitionFiles (interfacePath: string): SourceFile | undefined {
  const interfaceFile = ast.addExistingSourceFile(interfacePath)
  if (!interfaceFile) return

  trackUserAddedDefinitionFile(interfaceFile)
  for (const file of ast.resolveSourceFileDependencies()) {
    trackUserAddedDefinitionFile(file)
  }
  return interfaceFile
}

export function extractNamespace (
  rootNamespace: NamespacedContext,
  interfaceName: string
): { namespace: NamespaceDeclaration | undefined; leafName: string; } {
  const isNamespaced = interfaceName.match(/(?:[a-zA-Z0-9_]\.)*[a-zA-Z0-9_]\./i)

  const nameSegments = isNamespaced
    ? interfaceName.replace('[]', '').split('.')
    : [interfaceName]

  const namespaces = nameSegments.slice(0, -1)
  const leafName = nameSegments[nameSegments.length - 1]

  const namespace = namespaces.reduce(
    (parent: NamespacedContext | undefined, name: string) => {
      if (!parent) return
      const namespace = parent.getNamespace(name)
      if (!namespace) this.log.warn(`Could not find namespace ${name} in root namespace in file at ${rootNamespace.getSourceFile().getFilePath()}`)
      return namespace
    },
    rootNamespace
  ) as NamespaceDeclaration | undefined
  return {
    namespace,
    leafName
  }
}

export function getNamespacedInterface (
  namespace: NamespaceDeclaration,
  interfaceName: string
): InterfaceDeclaration | undefined {
  return namespace.getInterface(interfaceName)
}

export function getInterface (interfacePath: string, interfaceName: string): InterfaceDeclaration | undefined {
  const interfaceFile = parseDefinitionFiles(interfacePath)
  const { namespace, leafName } = extractNamespace.call(this, interfaceFile, interfaceName)
  return getNamespacedInterface.call(this, namespace, leafName)
}

export function trackUserAddedDefinitionFile (file: SourceFile) {
  definitionFilesAddedByUser[file.getFilePath()] = true
}

export function getCapitalized (text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export const NATIVE_TYPES = ['boolean', 'Boolean', 'string', 'String', 'number', 'Number', 'Date', 'any']
export function isNativeType (propType: string): boolean {
  return NATIVE_TYPES.indexOf(propType) >= 0
}

export function isNativeArrayType (propType: string): boolean {
  return NATIVE_TYPES.find(nativeType => propType === `${nativeType}[]`) !== undefined
}

export function getPropTypeEnum (prop: PropertySignature): PropType {
  const propType = prop.getType().getText()

  const propTypeIsEnum = prop.getType().isEnum()
  const propTypeIsObject = !propTypeIsEnum && !isNativeType(propType)
  const propTypeIsArray = propTypeIsObject && propType.includes('[]')
  const propTypeIsNativeArray = !propTypeIsEnum && isNativeArrayType(propType)

  if (propTypeIsNativeArray) return PropType.NativeArray
  if (propTypeIsArray) return PropType.Array
  if (propTypeIsObject) return PropType.Object
  if (propTypeIsEnum) return PropType.Enum
  return PropType.Native
}

export function getPropLabel (typeEnum: PropType, propTypeName: string): string {
  if (typeEnum === PropType.NativeArray) return getCapitalized(propTypeName)
  if (typeEnum === PropType.Array) return 'Object[]'
  if (typeEnum === PropType.Object) return 'Object'
  if (typeEnum === PropType.Enum) return 'Enum'

  return getCapitalized(propTypeName)
}

export function matchArrayInterface (interfaceName): ArrayMatch | null {
  const match = interfaceName.match(/^Array<(.*)>$/) || interfaceName.match(/^(.*)\[\]$/)
  if (!match) {
    return null
  }
  return {
    full: interfaceName,
    interface: match[1]
  }
}

export function isUserDefinedSymbol (symbol: ts.Symbol): boolean {
  const declarationFile = symbol.valueDeclaration.parent.getSourceFile()
  return definitionFilesAddedByUser[declarationFile.fileName]
}
