// 凭据状态响应
export interface CredentialsStatusResponse {
  total: number
  available: number
  currentId: number
  credentials: CredentialStatusItem[]
}

// 单个凭据状态
export interface CredentialStatusItem {
  id: number
  priority: number
  disabled: boolean
  failureCount: number
  isCurrent: boolean
  expiresAt: string | null
  authMethod: string | null
  hasProfileArn: boolean
  email?: string
  refreshTokenHash?: string
  apiKeyHash?: string
  maskedApiKey?: string
  successCount: number
  lastUsedAt: string | null
  hasProxy: boolean
  proxyUrl?: string
  refreshFailureCount: number
  disabledReason?: string
  endpoint: string
  freezeRemainingSecs: number
  freezeCount: number
}

// 余额响应
export interface BalanceResponse {
  id: number
  subscriptionTitle: string | null
  currentUsage: number
  usageLimit: number
  remaining: number
  usagePercentage: number
  nextResetAt: number | null
}

// 成功响应
export interface SuccessResponse {
  success: boolean
  message: string
}

// 错误响应
export interface AdminErrorResponse {
  error: {
    type: string
    message: string
  }
}

// 请求类型
export interface SetDisabledRequest {
  disabled: boolean
}

export interface SetPriorityRequest {
  priority: number
}

export interface SystemPromptResponse {
  defaultSystemPrompt: string
}

export interface SetSystemPromptRequest {
  defaultSystemPrompt: string
}

// 缓存模拟配置
export interface CacheSimulationResponse {
  enabled: boolean
  cacheHitRatio: number
  cacheCreationRatio: number
  minTokensToTrigger: number
  cacheTriggerProbability: number
  inputTokensMultiplier: number
  outputTokensMultiplier: number
  randomMultiplier: boolean
  inputMultiplierMin: number
  inputMultiplierMax: number
  outputMultiplierMin: number
  outputMultiplierMax: number
  forceOverride: boolean
  forceInputTokens: number
  forceOutputTokens: number
  forceCacheReadTokens: number
  forceCacheCreationTokens: number
}

export interface SetCacheSimulationRequest {
  enabled: boolean
  cacheHitRatio: number
  cacheCreationRatio: number
  minTokensToTrigger: number
  cacheTriggerProbability: number
  inputTokensMultiplier: number
  outputTokensMultiplier: number
  randomMultiplier: boolean
  inputMultiplierMin: number
  inputMultiplierMax: number
  outputMultiplierMin: number
  outputMultiplierMax: number
  forceOverride: boolean
  forceInputTokens: number
  forceOutputTokens: number
  forceCacheReadTokens: number
  forceCacheCreationTokens: number
}

// 模型级系统提示词映射
export interface ModelSystemPromptsResponse {
  modelSystemPrompts: Record<string, string>
  systemPromptPosition: string
}

export interface SetModelSystemPromptsRequest {
  modelSystemPrompts: Record<string, string>
  systemPromptPosition: string
}

// 添加凭据请求
export interface AddCredentialRequest {
  refreshToken?: string
  authMethod?: 'social' | 'idc' | 'api_key'
  clientId?: string
  clientSecret?: string
  priority?: number
  authRegion?: string
  apiRegion?: string
  machineId?: string
  proxyUrl?: string
  proxyUsername?: string
  proxyPassword?: string
  kiroApiKey?: string
  endpoint?: string
}

// 添加凭据响应
export interface AddCredentialResponse {
  success: boolean
  message: string
  credentialId: number
  email?: string
}

// 冷冻配置（各禁用原因独立设置）
export interface FreezeConfigItem {
  baseSecs: number
  maxSecs: number
}

export interface FreezeConfigResponse {
  tooManyFailures: FreezeConfigItem
  tooManyRefreshFailures: FreezeConfigItem
  quotaExceeded: FreezeConfigItem
  invalidRefreshToken: FreezeConfigItem
  maxWaitForThawSecs: number
}

export type SetFreezeConfigRequest = FreezeConfigResponse

// 更新凭据请求
export interface UpdateCredentialRequest {
  proxyUrl?: string | null
  proxyUsername?: string | null
  proxyPassword?: string | null
  endpoint?: string | null
  authRegion?: string | null
  apiRegion?: string | null
  machineId?: string | null
}
