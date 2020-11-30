import { PropertySignature } from 'ts-morph'
import { getCapitalized, getPropLabel, getPropTypeEnum, isNativeArrayType, isNativeType, PropType } from './utils'

describe('utils', () => {
  describe('getCapitalized', () => {
    it('should capitalize a string', () => {
      expect(getCapitalized('string')).toBe('String')
    })
  })

  describe('isNativeType', () => {
    it('should return true for - string', () => {
      expect(isNativeType('string')).toBe(true)
    })
    it('should return false for - CustomString', () => {
      expect(isNativeType('CustomString')).toBe(false)
    })
  })

  describe('isNativeArrayType', () => {
    it('should return true for - string[]', () => {
      expect(isNativeArrayType('string[]')).toBe(true)
    })
    it('should return false for - CustomString[]', () => {
      expect(isNativeArrayType('CustomString[]')).toBe(false)
    })
  })

  describe('getPropTypeEnum', () => {
    it('should return NativeArray enum for string[]', () => {
      const stringArraySignature = {
        getType: () => {
          return {
            getText: () => 'string[]',
            isEnum: () => false
          }
        }
      } as PropertySignature

      expect(getPropTypeEnum(stringArraySignature)).toBe(PropType.NativeArray)
    })
    it('should return Array enum for CustomInterface[]', () => {
      const stringArraySignature = {
        getType: () => {
          return {
            getText: () => 'CustomInterface[]',
            isEnum: () => false
          }
        }
      } as PropertySignature

      expect(getPropTypeEnum(stringArraySignature)).toBe(PropType.Array)
    })
    it('should return Object enum for CustomInterface', () => {
      const stringArraySignature = {
        getType: () => {
          return {
            getText: () => 'CustomInterface',
            isEnum: () => false
          }
        }
      } as PropertySignature

      expect(getPropTypeEnum(stringArraySignature)).toBe(PropType.Object)
    })
    it('should return Enum enum for CustomInterface & isEnum = true', () => {
      const stringArraySignature = {
        getType: () => {
          return {
            getText: () => 'CustomInterface',
            isEnum: () => true
          }
        }
      } as PropertySignature

      expect(getPropTypeEnum(stringArraySignature)).toBe(PropType.Enum)
    })
    it('should return Native enum for number', () => {
      const stringArraySignature = {
        getType: () => {
          return {
            getText: () => 'number',
            isEnum: () => false
          }
        }
      } as PropertySignature

      expect(getPropTypeEnum(stringArraySignature)).toBe(PropType.Native)
    })
  })

  describe('getPropLabel', () => {
    it('should return original name if NativeArray', () => {
      expect(getPropLabel(PropType.NativeArray, 'string[]')).toEqual('String[]')
    })
    it('should return Object[] if Array', () => {
      expect(getPropLabel(PropType.Array, 'AString[]')).toEqual('Object[]')
    })
    it('should return Object if Object', () => {
      expect(getPropLabel(PropType.Object, 'AString')).toEqual('Object')
    })
    it('should return Enum if Enum', () => {
      expect(getPropLabel(PropType.Enum, 'AString')).toEqual('Enum')
    })
    it('should return original name if Native', () => {
      expect(getPropLabel(PropType.Native, 'string')).toEqual('String')
    })
  })
})
