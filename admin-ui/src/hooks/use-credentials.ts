import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getCredentials,
  setCredentialDisabled,
  setCredentialPriority,
  resetCredentialFailure,
  forceRefreshToken,
  getCredentialBalance,
  addCredential,
  deleteCredential,
  getLoadBalancingMode,
  setLoadBalancingMode,
  getSystemPrompt,
  setSystemPrompt,
  getCacheSimulation,
  setCacheSimulation,
  getModelSystemPrompts,
  setModelSystemPrompts,
  getStats,
  getFreezeConfig,
  setFreezeConfig,
} from '@/api/credentials'
import type { AddCredentialRequest, SetCacheSimulationRequest, SetFreezeConfigRequest } from '@/types/api'

// 查询凭据列表
export function useCredentials() {
  return useQuery({
    queryKey: ['credentials'],
    queryFn: getCredentials,
    refetchInterval: 30000, // 每 30 秒刷新一次
  })
}

// 查询凭据余额
export function useCredentialBalance(id: number | null) {
  return useQuery({
    queryKey: ['credential-balance', id],
    queryFn: () => getCredentialBalance(id!),
    enabled: id !== null,
    retry: false, // 余额查询失败时不重试（避免重复请求被封禁的账号）
  })
}

// 设置禁用状态
export function useSetDisabled() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, disabled }: { id: number; disabled: boolean }) =>
      setCredentialDisabled(id, disabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] })
    },
  })
}

// 设置优先级
export function useSetPriority() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, priority }: { id: number; priority: number }) =>
      setCredentialPriority(id, priority),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] })
    },
  })
}

// 重置失败计数
export function useResetFailure() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => resetCredentialFailure(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] })
    },
  })
}

// 强制刷新 Token
export function useForceRefreshToken() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => forceRefreshToken(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] })
    },
  })
}

// 添加新凭据
export function useAddCredential() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: AddCredentialRequest) => addCredential(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] })
    },
  })
}

// 删除凭据
export function useDeleteCredential() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => deleteCredential(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['credentials'] })
    },
  })
}

// 获取负载均衡模式
export function useLoadBalancingMode() {
  return useQuery({
    queryKey: ['loadBalancingMode'],
    queryFn: getLoadBalancingMode,
  })
}

// 设置负载均衡模式
export function useSetLoadBalancingMode() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setLoadBalancingMode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loadBalancingMode'] })
    },
  })
}

export function useSystemPrompt() {
  return useQuery({
    queryKey: ['systemPrompt'],
    queryFn: getSystemPrompt,
  })
}

export function useSetSystemPrompt() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: setSystemPrompt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['systemPrompt'] })
    },
  })
}

// 缓存模拟配置
export function useCacheSimulation() {
  return useQuery({
    queryKey: ['cacheSimulation'],
    queryFn: getCacheSimulation,
  })
}

export function useSetCacheSimulation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (config: SetCacheSimulationRequest) => setCacheSimulation(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cacheSimulation'] })
    },
  })
}

// 模型级系统提示词映射
export function useModelSystemPrompts() {
  return useQuery({
    queryKey: ['modelSystemPrompts'],
    queryFn: getModelSystemPrompts,
  })
}

export function useSetModelSystemPrompts() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (req: { modelSystemPrompts: Record<string, string>; systemPromptPosition: string }) => setModelSystemPrompts(req),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelSystemPrompts'] })
    },
  })
}

// 实时并发统计
export function useStats() {
  return useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
    refetchInterval: 3000, // 每 3 秒刷新
  })
}

// 冷冻配置
export function useFreezeConfig() {
  return useQuery({
    queryKey: ['freezeConfig'],
    queryFn: getFreezeConfig,
  })
}

export function useSetFreezeConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (config: SetFreezeConfigRequest) => setFreezeConfig(config),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freezeConfig'] })
    },
  })
}
