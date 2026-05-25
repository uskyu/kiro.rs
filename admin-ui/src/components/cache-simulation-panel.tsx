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
  const [randomMultiplier, setRandomMultiplier] = useState(false)
  const [inputMultiplierMin, setInputMultiplierMin] = useState(0.05)
  const [inputMultiplierMax, setInputMultiplierMax] = useState(1.0)
  const [outputMultiplierMin, setOutputMultiplierMin] = useState(0.05)
  const [outputMultiplierMax, setOutputMultiplierMax] = useState(1.0)
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
      setRandomMultiplier(data.randomMultiplier)
      setInputMultiplierMin(data.inputMultiplierMin)
      setInputMultiplierMax(data.inputMultiplierMax)
      setOutputMultiplierMin(data.outputMultiplierMin)
      setOutputMultiplierMax(data.outputMultiplierMax)
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
        randomMultiplier,
        inputMultiplierMin,
        inputMultiplierMax,
        outputMultiplierMin,
        outputMultiplierMax,
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
      setRandomMultiplier(data.randomMultiplier)
      setInputMultiplierMin(data.inputMultiplierMin)
      setInputMultiplierMax(data.inputMultiplierMax)
      setOutputMultiplierMin(data.outputMultiplierMin)
      setOutputMultiplierMax(data.outputMultiplierMax)
      setForceOverride(data.forceOverride)
      setForceInputTokens(data.forceInputTokens)
      setForceOutputTokens(data.forceOutputTokens)
      setForceCacheReadTokens(data.forceCacheReadTokens)
      setForceCacheCreationTokens(data.forceCacheCreationTokens)
    }
  }

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
              已启用{randomMultiplier ? ' · 随机模式' : ' · 混合模式'}
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
            {/* ===== 1. 强制覆盖（优先级最高） ===== */}
            <div className="border rounded-lg p-3 space-y-3 bg-red-50/50 dark:bg-red-950/20">
              <p className="text-xs font-medium text-red-700 dark:text-red-400">
                1. 强制覆盖（填 &gt;0 = 写死该字段，填 0 = 走下面的倍率/随机）
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">input_tokens</label>
                  <input
                    type="number"
                    min="0"
                    value={forceInputTokens}
                    onChange={(e) => setForceInputTokens(Number(e.target.value))}
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">output_tokens</label>
                  <input
                    type="number"
                    min="0"
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
              </div>
            </div>

            {/* ===== 2. 随机倍率区间 ===== */}
            <div className="border rounded-lg p-3 space-y-3 bg-blue-50/50 dark:bg-blue-950/20">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-blue-700 dark:text-blue-400">
                  2. 随机倍率区间（每次请求在 [min, max] 范围内随机取值）
                </p>
                <button
                  onClick={() => setRandomMultiplier(!randomMultiplier)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    randomMultiplier ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      randomMultiplier ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {randomMultiplier && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      Input 倍率区间: [{(inputMultiplierMin * 100).toFixed(0)}% ~ {(inputMultiplierMax * 100).toFixed(0)}%]
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        value={(inputMultiplierMin * 100).toFixed(0)}
                        onChange={(e) => setInputMultiplierMin(Number(e.target.value) / 100)}
                        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                        placeholder="min %"
                      />
                      <span className="self-center text-xs">~</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        value={(inputMultiplierMax * 100).toFixed(0)}
                        onChange={(e) => setInputMultiplierMax(Number(e.target.value) / 100)}
                        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                        placeholder="max %"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">
                      Output 倍率区间: [{(outputMultiplierMin * 100).toFixed(0)}% ~ {(outputMultiplierMax * 100).toFixed(0)}%]
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        value={(outputMultiplierMin * 100).toFixed(0)}
                        onChange={(e) => setOutputMultiplierMin(Number(e.target.value) / 100)}
                        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                        placeholder="min %"
                      />
                      <span className="self-center text-xs">~</span>
                      <input
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        value={(outputMultiplierMax * 100).toFixed(0)}
                        onChange={(e) => setOutputMultiplierMax(Number(e.target.value) / 100)}
                        className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                        placeholder="max %"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      开启后每次请求随机取倍率，让 token 数看起来更自然。关闭则走下面的固定倍率。
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ===== 3. 固定倍率（随机关闭时生效） ===== */}
            {!randomMultiplier && (
              <div className="border rounded-lg p-3 space-y-3">
                <p className="text-xs font-medium text-muted-foreground">3. 固定倍率（随机关闭时，未被强制覆盖的字段走这里）</p>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Input Token 倍率</label>
                    <span className="text-sm font-mono text-muted-foreground">
                      x{inputTokensMultiplier.toFixed(2)} ({(inputTokensMultiplier * 100).toFixed(0)}%)
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
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Output Token 倍率</label>
                    <span className="text-sm font-mono text-muted-foreground">
                      x{outputTokensMultiplier.toFixed(2)} ({(outputTokensMultiplier * 100).toFixed(0)}%)
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
                </div>
              </div>
            )}

            {/* ===== 4. 缓存模拟比例 ===== */}
            <div className="border rounded-lg p-3 space-y-3">
              <p className="text-xs font-medium text-muted-foreground">4. 缓存模拟（在最终 input_tokens 基础上叠加）</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm">缓存命中率</label>
                  <span className="text-sm font-mono text-muted-foreground">{(cacheHitRatio * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={cacheHitRatio * 100}
                  onChange={(e) => setCacheHitRatio(Number(e.target.value) / 100)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-green-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm">缓存写入率</label>
                  <span className="text-sm font-mono text-muted-foreground">{(cacheCreationRatio * 100).toFixed(0)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={cacheCreationRatio * 100}
                  onChange={(e) => setCacheCreationRatio(Number(e.target.value) / 100)}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-orange-500"
                />
                <p className="text-xs text-muted-foreground">通常设为 0（125% 价格反而加钱）</p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm">最小触发阈值</label>
                  <span className="text-sm font-mono text-muted-foreground">{minTokensToTrigger} tokens</span>
                </div>
                <input
                  type="number"
                  min="0"
                  max="10000"
                  value={minTokensToTrigger}
                  onChange={(e) => setMinTokensToTrigger(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm"
                />
              </div>
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
