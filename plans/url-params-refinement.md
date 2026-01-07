# URL 参数处理扩展计划

## 需求概述

将 `utils/url-params.ts` 中的 `parseUrlParams` 和填充默认值的功能扩展到网页地址上携带的所有参数。

### 核心要求
1. **参数解码**：只有 base64 编码的参数才进行解码（base64 + gzip 解压缩）
2. **参数映射**：参数的 key 必须匹配 `prompt_variables` 的 key 才能填充到表单
3. **移除特殊处理**：不再保留 `url` 和 `authorization` 参数的特殊处理逻辑

## 当前实现分析

### 现有代码结构
- `utils/url-params.ts` 包含：
  - `decodeBase64AndDecompress()`: 解码 base64 并解压缩 gzip
  - `getUrlParam()`: 获取单个 URL 参数
  - `parseUrlParams()`: 解析 `url` 和 `authorization` 参数

- `app/components/index.tsx` (第 283-302 行)：
  - 调用 `parseUrlParams()` 获取解码后的数据
  - 解析 `url` 参数为 JSON 对象
  - 根据 `prompt_variables` 的 key 映射数据到表单

### 当前流程
```
URL 参数 → parseUrlParams() → 解码 url/authorization → JSON.parse → 映射到 prompt_variables → 填充表单
```

## 新实现方案

### 修改后的流程
```
所有 URL 参数 → 遍历每个参数 → 检测是否为 base64 → 解码 → 检查 key 是否在 prompt_variables 中 → 填充表单
```

### 详细步骤

#### 1. 修改 `utils/url-params.ts`

**新增辅助函数：**
```typescript
/**
 * 检测字符串是否为有效的 base64 编码
 * @param str - 待检测的字符串
 * @returns 是否为有效的 base64 编码
 */
function isValidBase64(str: string): boolean

/**
 * 尝试解码参数值，如果不是 base64 编码则返回原始值
 * @param value - 参数值
 * @returns 解码后的值或原始值
 */
async function tryDecodeParamValue(value: string): Promise<string>
```

**重构 `parseUrlParams` 函数：**
```typescript
/**
 * 解析 URL 参数并返回匹配 prompt_variables 的解码数据
 * @param promptVariables - prompt 变量配置列表
 * @returns 包含解码后参数的对象
 */
export async function parseUrlParams(
  promptVariables: PromptVariable[]
): Promise<Record<string, any>>
```

**函数逻辑：**
1. 获取所有 URL 搜索参数
2. 遍历每个参数
3. 检查参数 key 是否在 `promptVariables` 中存在
4. 如果存在，尝试解码参数值（base64 + gzip）
5. 如果解码失败，使用原始值
6. 返回所有匹配的参数键值对

#### 2. 修改 `app/components/index.tsx`

**更新调用代码（第 283-302 行）：**
```typescript
// 解析 URL 参数并填充到表单
try {
  const urlParams = await parseUrlParams(prompt_variables)
  // 直接使用返回的参数对象，无需额外的 JSON.parse 和映射逻辑
  if (Object.keys(urlParams).length > 0) {
    setNewConversationInputs(urlParams)
  }
} catch (error) {
  console.error('Failed to parse URL parameters:', error)
}
```

### 关键设计决策

1. **base64 检测策略**：
   - 使用正则表达式检测 base64 格式
   - 尝试解码，如果失败则认为不是 base64 编码

2. **错误处理**：
   - 单个参数解码失败不影响其他参数
   - 记录错误日志但不中断流程

3. **向后兼容**：
   - 移除 `url` 和 `authorization` 的特殊处理
   - 如果需要保留这些参数，它们会作为普通参数处理

4. **性能考虑**：
   - 异步解码操作并行执行
   - 避免不必要的解码尝试

## 实施步骤

### 步骤 1：修改 `utils/url-params.ts`
- [ ] 添加 `isValidBase64()` 辅助函数
- [ ] 添加 `tryDecodeParamValue()` 辅助函数
- [ ] 重构 `parseUrlParams()` 函数签名和实现
- [ ] 更新函数注释和类型定义

### 步骤 2：修改 `app/components/index.tsx`
- [ ] 更新 `parseUrlParams()` 调用，传入 `prompt_variables`
- [ ] 简化参数处理逻辑，移除 JSON.parse 和映射代码
- [ ] 保持错误处理逻辑

### 步骤 3：测试验证
- [ ] 测试 base64 编码参数的解码
- [ ] 测试非 base64 编码参数的处理
- [ ] 测试参数 key 不匹配 prompt_variables 的情况
- [ ] 测试多个参数同时存在的情况
- [ ] 测试解码失败的场景

## 代码示例

### 新的 `parseUrlParams` 实现
```typescript
export async function parseUrlParams(
  promptVariables: PromptVariable[]
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
```

### 辅助函数实现
```typescript
function isValidBase64(str: string): boolean {
  // 简单的 base64 格式检测
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  return base64Regex.test(str) && str.length % 4 === 0
}

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
```

## 风险和注意事项

1. **base64 检测准确性**：简单的正则表达式可能无法准确识别所有 base64 编码
2. **性能影响**：大量参数的解码可能影响页面加载性能
3. **兼容性**：移除 `url` 和 `authorization` 特殊处理可能影响现有功能
4. **错误处理**：需要确保解码失败不会导致应用崩溃

## 验收标准

- [ ] 所有 URL 参数都能被正确处理
- [ ] base64 编码的参数能正确解码
- [ ] 非 base64 编码的参数保持原值
- [ ] 只有匹配 `prompt_variables` key 的参数才会被填充
- [ ] 解码失败时应用能正常运行
- [ ] 代码通过 TypeScript 类型检查
- [ ] 没有控制台错误或警告