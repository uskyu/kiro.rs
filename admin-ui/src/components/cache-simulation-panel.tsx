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
  const [inputTokensMultiplier, setInputTokensMultiplier] = useState(1.0)
  const [outputTokensMultiplier, setOutputTokensMultiplier] = useState(1.0)
  const [forceOverride, setForceOverride] = useState(false)
  const [forceInputTokens, setForceInputTokens] = useState(0)
  const [forceOutputTokens, setForceOutputTokens] = useState(0)
  const [forceCacheReadTokens, setForceCacheReadTokens] = useState(0)
  const [forceCacheCreationTokens, setForceCacheCreationTokens] = useState(0)

  useEffect(() => {
    if (data) {
      setEnabled(data.enabled)
      setCacheHitRatio(data.cacheHitRatio)
      setCacheCreationRatio(data.cacheCreationRatio)
      setMinTokensToTrigger(data.minTokensToTrigger)
      setInputTokensMultiplier(data.inputTokensMultiplier)
      setOutputTokensMultiplier(data.outputTokensMultiplier)
      setForceOverride(data.forceOverride)
      setForceInputTokens(data.forceInputTokens)
      setForceOutputTokens(data.forceOutputTokens)
      setForceCacheReadTokens(data.forceCacheReadTokens)
      setForceCacheCreationTokens(data.forceCacheCreationTokens)
    }
  }, [data])

  const handleSave = () => {
    saveCacheSimulation(
      {
        enabled,
        cacheHitRatio,
        cacheCreationRatio,
        minTokensToTrigger,
        inputTokensMultiplier,
        outputTokensMultiplier,
        forceOverride,
        forceInputTokens,
        forceOutputTokens,
        forceCacheReadTokens,
        forceCacheCreationTokens,
      },
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
      setInputTokensMultiplier(data.inputTokensMultiplier)
      setOutputTokensMultiplier(data.outputTokensMultiplier)
      setForceOverride(data.forceOverride)
      setForceInputTokens(data.forceInputTokens)
      setForceOutputTokens(data.forceOutputTokens)
      setForceCacheReadTokens(data.forceCacheReadTokens)
      setForceCacheCreationTokens(data.forceCacheCreationTokens)
    }
  }

  // 计算模拟节省比例
  const calcSavings = () => {
    if (!enabled) return 0
    if (forceOverride) {
      // 强制覆盖模式：假设实际 10000 tokens，计算节省
      const actualCost = 10000 // 假设基准
      const reportedCost = forceInputTokens + forceOutputTokens * 4 // output 通常 4x 价格
      return Math.max(0, Math.round((1 - reportedCost / actualCost) * 100))
    }
    // 倍率模式
    const inputSaving = (1 - inputTokensMultiplier) * 100
    const outputSaving = (1 - outputTokensMultiplier) * 100
    const cacheSaving = inputTokensMultiplier * cacheHitRatio * 0.9 * 100
    return Math.round(Math.min(99, inputSaving * 0.6 + outputSaving * 0.4 + cacheSaving * 0.3))
  }

  const savingsPercent = calcSavings()

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
              已启用{forceOverride ? ' · 强制覆盖' : ` · 预计节省 ~${savingsPercent}%`}
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
            {/* ===== 强制覆盖模式 ===== */}
            <div className="border rounded-lg p-3 space-y-3 bg-red-50/50 dark:bg-red-950/20">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-red-700 dark:text-red-400">
                  🔒 强制覆盖模式（直接写死固定值）
                </label>
                <button
                  onClick={() => setForceOverride(!forceOverride)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    forceOverride ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      forceOverride ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {forceOverride && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">input_tokens（固定值）</label>
                    <input
                      type="number"
                      min="1"
                      value={forceInputTokens}
                      onChange={(e) => setForceInputTokens(Number(e.target.value))}
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">output_tokens（固定值）</label>
                    <input
                      type="number"
                      min="1"
                      value={forceOutputTokens}
                      onChange={(e) => setForceOutputTokens(Number(e.target.value))}
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">cache_read_input_tokens</label>
                    <input
                      type="number"
                      min="0"
                      value={forceCacheReadTokens}
                      onChange={(e) => setForceCacheReadTokens(Number(e.target.value))}
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">cache_creation_input_tokens</label>
                    <input
                      type="number"
                      min="0"
                      value={forceCacheCreationTokens}
                      onChange={(e) => setForceCacheCreationTokens(Number(e.target.value))}
                      className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                    />
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-red-600 dark:text-red-400">
                      ⚠️ 强制覆盖模式：填 0 = 不覆盖该字段（保留实际值），填 &gt;0 = 强制写死为该值。
                      只想改一两个字段就只填那几个，其余留 0。
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ===== 倍率模式（强制覆盖关闭时显示） ===== */}
            {!forceOverride && (
              <div className="border rounded-lg p-3 space-y-3">
                <p className="text-xs font-medium text-muted-foreground">📊 倍率模式（按比例缩减）</p>

                {/* Input Token 倍率 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Input Token 倍率</label>
                    <span className="text-sm font-mono text-muted-foreground">
                      ×{inputTokensMultiplier.toFixed(2)} (报告 {(inputTokensMultiplier * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={inputTokensMultiplier * 100}
                    onChange={(e) => setInputTokensMultiplier(Number(e.target.value) / 100)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-500"
                  />
                  <p className="text-xs text-muted-foreground">
                    报告给下游的 input_tokens = 实际值 × 此倍率。设为 0.1 = 只报告 10%
                  </p>
                </div>

                {/* Output Token 倍率 */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Output Token 倍率</label>
                    <span className="text-sm font-mono text-muted-foreground">
                      ×{outputTokensMultiplier.toFixed(2)} (报告 {(outputTokensMultiplier * 100).toFixed(0)}%)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={outputTokensMultiplier * 100}
                    onChange={(e) => setOutputTokensMultiplier(Number(e.target.value) / 100)}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-purple-500"
                  />
                  <p className="text-xs text-muted-foreground">
                    报告给下游的 output_tokens = 实际值 × 此倍率。设为 0.1 = 只报告 10%
                  </p>
                </div>

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
                    缩减后的 input_tokens 中被标记为 cache_read 的比例（下游按 10% 价格计费）
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
                    标记为 cache_creation 的比例（下游按 125% 价格计费，通常设为 0）
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
                    input_tokens 低于此值时不模拟缓存（倍率缩减仍生效）
                  </p>
                </div>
              </div>
            )}
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
