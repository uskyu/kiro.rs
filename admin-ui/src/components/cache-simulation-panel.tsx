import { useState, useEffect } from 'react'
import { Save, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useCacheSimulation, useSetCacheSimulation } from '@/hooks/use-credentials'
import { extractErrorMessage } from '@/lib/utils'

export function CacheSimulationPanel() {
  const { data, isLoading } = useCacheSimulation()
  const { mutate: saveCacheSimulation, isPending: isSaving } = useSetCacheSimulation()

  const [enabled, setEnabled] = useState(false)
  const [cacheHitRatio, setCacheHitRatio] = useState(0.8)
  const [cacheCreationRatio, setCacheCreationRatio] = useState(0.0)
  const [minTokensToTrigger, setMinTokensToTrigger] = useState(100)

  useEffect(() => {
    if (data) {
      setEnabled(data.enabled)
      setCacheHitRatio(data.cacheHitRatio)
      setCacheCreationRatio(data.cacheCreationRatio)
      setMinTokensToTrigger(data.minTokensToTrigger)
    }
  }, [data])

  const handleSave = () => {
    saveCacheSimulation(
      { enabled, cacheHitRatio, cacheCreationRatio, minTokensToTrigger },
      {
        onSuccess: () => toast.success('缓存模拟配置已保存'),
        onError: (error) => toast.error(`保存失败: ${extractErrorMessage(error)}`),
      }
    )
  }

  const handleRestore = () => {
    if (data) {
      setEnabled(data.enabled)
      setCacheHitRatio(data.cacheHitRatio)
      setCacheCreationRatio(data.cacheCreationRatio)
      setMinTokensToTrigger(data.minTokensToTrigger)
    }
  }

  // 计算模拟节省比例
  const savingsPercent = enabled
    ? Math.round((cacheHitRatio * 0.9 + cacheCreationRatio * -0.25) * 100)
    : 0

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-4 text-center text-muted-foreground">加载中...</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center justify-between">
          <span>Cache Simulation (缓存计费模拟)</span>
          {enabled && (
            <span className="text-xs font-normal px-2 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
              已启用 · 预计节省 ~{savingsPercent}%
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 启用开关 */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">启用缓存模拟</label>
          <button
            onClick={() => setEnabled(!enabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              enabled ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {enabled && (
          <>
            {/* 缓存命中率 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">缓存命中率 (Cache Hit Ratio)</label>
                <span className="text-sm font-mono text-muted-foreground">
                  {(cacheHitRatio * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={cacheHitRatio * 100}
                onChange={(e) => setCacheHitRatio(Number(e.target.value) / 100)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-green-500"
              />
              <p className="text-xs text-muted-foreground">
                input_tokens 中被标记为 cache_read 的比例，下游按 10% 价格计费
              </p>
            </div>

            {/* 缓存写入率 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">缓存写入率 (Cache Creation Ratio)</label>
                <span className="text-sm font-mono text-muted-foreground">
                  {(cacheCreationRatio * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                value={cacheCreationRatio * 100}
                onChange={(e) => setCacheCreationRatio(Number(e.target.value) / 100)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-orange-500"
              />
              <p className="text-xs text-muted-foreground">
                input_tokens 中被标记为 cache_creation 的比例，下游按 125% 价格计费（通常设为 0）
              </p>
            </div>

            {/* 最小触发阈值 */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm">最小触发阈值</label>
                <span className="text-sm font-mono text-muted-foreground">
                  {minTokensToTrigger} tokens
                </span>
              </div>
              <input
                type="number"
                min="0"
                max="10000"
                value={minTokensToTrigger}
                onChange={(e) => setMinTokensToTrigger(Number(e.target.value))}
                className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
              />
              <p className="text-xs text-muted-foreground">
                input_tokens 低于此值时不模拟缓存
              </p>
            </div>
          </>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button onClick={handleSave} disabled={isLoading || isSaving} size="sm">
            <Save className="h-4 w-4" />
            {isSaving ? '保存中...' : '保存配置'}
          </Button>
          <Button variant="outline" onClick={handleRestore} disabled={isLoading || isSaving} size="sm">
            <RotateCcw className="h-4 w-4" />
            恢复
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
