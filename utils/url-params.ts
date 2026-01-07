import type { PromptVariable } from '@/types/app'

/**
 * 解码 base64 并解压缩 gzip 数据
 * @param encoded - base64 编码的 gzip 压缩字符串
 * @returns 解码后的字符串
 */
export async function decodeBase64AndDecompress(encoded: string): Promise<string> {
  try {
    // Base64 解码
    const binaryString = atob(encoded)
    const uint8Array = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      uint8Array[i] = binaryString.charCodeAt(i)
    }

    // Gzip 解压缩
    const decompressedStream = new Response(
      new Blob([uint8Array]).stream().pipeThrough(new DecompressionStream('gzip')),
    ).arrayBuffer()

    const decompressedUint8Array = new Uint8Array(await decompressedStream)

    // TextDecoder 解码为字符串
    const decoder = new TextDecoder('utf-8')
    return decoder.decode(decompressedUint8Array)
  } catch (error) {
    console.error('Failed to decode and decompress:', error)
    throw new Error('解码和解压缩失败')
  }
}

/**
 * 检测字符串是否为有效的 base64 编码
 * @param str - 待检测的字符串
 * @returns 是否为有效的 base64 编码
 */
function isValidBase64(str: string): boolean {
  // 简单的 base64 格式检测
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  return base64Regex.test(str) && str.length % 4 === 0
}

/**
 * 尝试解码参数值，如果不是 base64 编码则返回原始值
 * @param value - 参数值
 * @returns 解码后的值或原始值
 */
async function tryDecodeParamValue(value: string): Promise<string> {
  // 如果不是有效的 base64，直接返回原始值
  if (!isValidBase64(value)) {
    return value
  }

  // 尝试解码
  try {
    return await decodeBase64AndDecompress(value)
  } catch (error) {
    // 解码失败，返回原始值
    return value
  }
}

/**
 * 从 URL 搜索参数中提取指定参数
 * @param paramName - 参数名称
 * @returns 参数值或 undefined
 */
export function getUrlParam(paramName: string): string | undefined {
  if (typeof window === 'undefined') {
    return undefined
  }

  const urlParams = new URLSearchParams(window.location.search)
  return urlParams.get(paramName) || undefined
}

/**
 * 解析 URL 参数并返回匹配 prompt_variables 的解码数据
 * @param promptVariables - prompt 变量配置列表
 * @returns 包含解码后参数的对象
 */
export async function parseUrlParams(
  promptVariables: PromptVariable[],
): Promise<Record<string, any>> {
  const result: Record<string, any> = {}

  if (typeof window === 'undefined') {
    return result
  }

  try {
    const urlParams = new URLSearchParams(window.location.search)
    const validKeys = new Set(promptVariables.map(v => v.key))

    // 遍历所有 URL 参数
    for (const [key, value] of urlParams.entries()) {
      // 只处理在 prompt_variables 中存在的 key
      if (!validKeys.has(key)) {
        continue
      }

      try {
        // 尝试解码参数值
        const decodedValue = await tryDecodeParamValue(value)
        result[key] = decodedValue
      } catch (error) {
        console.warn(`Failed to decode parameter ${key}:`, error)
        // 解码失败，使用原始值
        result[key] = value
      }
    }
  } catch (error) {
    console.error('Failed to parse URL parameters:', error)
  }

  return result
}
