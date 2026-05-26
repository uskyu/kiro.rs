import axios from 'axios'
import { storage } from '@/lib/storage'
import type {
  CredentialsStatusResponse,
  BalanceResponse,
  SuccessResponse,
  SetDisabledRequest,
  SetPriorityRequest,
  SetSystemPromptRequest,
  SystemPromptResponse,
  AddCredentialRequest,
  AddCredentialResponse,
  CacheSimulationResponse,
  SetCacheSimulationRequest,
  ModelSystemPromptsResponse,
  SetModelSystemPromptsRequest,
} from '@/types/api'

// 创建 axios 实例
const api = axios.create({
  baseURL: '/api/admin',
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器添加 API Key
api.interceptors.request.use((config) => {
  const apiKey = storage.getApiKey()
  if (apiKey) {
    config.headers['x-api-key'] = apiKey
  }
  return config
})

// 获取所有凭据状态
export async function getCredentials(): Promise<CredentialsStatusResponse> {
  const { data } = await api.get<CredentialsStatusResponse>('/credentials')
  return data
}

// 设置凭据禁用状态
export async function setCredentialDisabled(
  id: number,
  disabled: boolean
): Promise<SuccessResponse> {
  const { data } = await api.post<SuccessResponse>(
    `/credentials/${id}/disabled`,
    { disabled } as SetDisabledRequest
  )
  return data
}

// 设置凭据优先级
export async function setCredentialPriority(
  id: number,
  priority: number
): Promise<SuccessResponse> {
  const { data } = await api.post<SuccessResponse>(
    `/credentials/${id}/priority`,
    { priority } as SetPriorityRequest
  )
  return data
}

// 重置失败计数
export async function resetCredentialFailure(
  id: number
): Promise<SuccessResponse> {
  const { data } = await api.post<SuccessResponse>(`/credentials/${id}/reset`)
  return data
}

// 强制刷新 Token
export async function forceRefreshToken(
  id: number
): Promise<SuccessResponse> {
  const { data } = await api.post<SuccessResponse>(`/credentials/${id}/refresh`)
  return data
}

// 获取凭据余额
export async function getCredentialBalance(id: number): Promise<BalanceResponse> {
  const { data } = await api.get<BalanceResponse>(`/credentials/${id}/balance`)
  return data
}

// 添加新凭据
export async function addCredential(
  req: AddCredentialRequest
): Promise<AddCredentialResponse> {
  const { data } = await api.post<AddCredentialResponse>('/credentials', req)
  return data
}

// 删除凭据
export async function deleteCredential(id: number): Promise<SuccessResponse> {
  const { data } = await api.delete<SuccessResponse>(`/credentials/${id}`)
  return data
}

// 获取负载均衡模式
export async function getLoadBalancingMode(): Promise<{ mode: 'priority' | 'balanced' }> {
  const { data } = await api.get<{ mode: 'priority' | 'balanced' }>('/config/load-balancing')
  return data
}

// 设置负载均衡模式
export async function setLoadBalancingMode(mode: 'priority' | 'balanced'): Promise<{ mode: 'priority' | 'balanced' }> {
  const { data } = await api.put<{ mode: 'priority' | 'balanced' }>('/config/load-balancing', { mode })
  return data
}

export async function getSystemPrompt(): Promise<SystemPromptResponse> {
  const { data } = await api.get<SystemPromptResponse>('/config/system-prompt')
  return data
}

export async function setSystemPrompt(
  defaultSystemPrompt: string
): Promise<SystemPromptResponse> {
  const { data } = await api.put<SystemPromptResponse>(
    '/config/system-prompt',
    { defaultSystemPrompt } as SetSystemPromptRequest
  )
  return data
}

// 获取缓存模拟配置
export async function getCacheSimulation(): Promise<CacheSimulationResponse> {
  const { data } = await api.get<CacheSimulationResponse>('/config/cache-simulation')
  return data
}

// 设置缓存模拟配置
export async function setCacheSimulation(
  config: SetCacheSimulationRequest
): Promise<CacheSimulationResponse> {
  const { data } = await api.put<CacheSimulationResponse>('/config/cache-simulation', config)
  return data
}

// 获取模型级系统提示词映射
export async function getModelSystemPrompts(): Promise<ModelSystemPromptsResponse> {
  const { data } = await api.get<ModelSystemPromptsResponse>('/config/model-system-prompts')
  return data
}

// 设置模型级系统提示词映射
export async function setModelSystemPrompts(
  req: SetModelSystemPromptsRequest
): Promise<ModelSystemPromptsResponse> {
  const { data } = await api.put<ModelSystemPromptsResponse>(
    '/config/model-system-prompts',
    req
  )
  return data
}
