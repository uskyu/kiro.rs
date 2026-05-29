import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useFreezeConfig, useSetFreezeConfig } from '@/hooks/use-credentials'
import type { FreezeConfigResponse } from '@/types/api'

const REASON_LABELS: Record<string, string> = {
  tooManyFailures: 'API 连续失败',
  tooManyRefreshFailures: 'Token 刷新失败',
  quotaExceeded: '额度用尽',
  invalidRefreshToken: 'RefreshToken 失效',
}

export function FreezeConfigPanel() {
  const { data: config, isLoading } = useFreezeConfig()
  const setConfig = useSetFreezeConfig()

  const [form, setForm] = useState<FreezeConfigResponse>({
    tooManyFailures: { baseSecs: 30, maxSecs: 300 },
    tooManyRefreshFailures: { baseSecs: 60, maxSecs: 600 },
    quotaExceeded: { baseSecs: 300, maxSecs: 3600 },
    invalidRefreshToken: { baseSecs: 120, maxSecs: 1800 },
    maxWaitForThawSecs: 30,
  })

  useEffect(() => {
    if (config) {
      setForm(config)
    }
  }, [config])

  const handleSave = () => {
    setConfig.mutate(form, {
      onSuccess: () => toast.success('冷冻配置已保存'),
      onError: (err) => toast.error('保存失败: ' + (err as Error).message),
    })
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>冷冻配置</CardTitle>
        </CardHeader>
        <CardContent>加载中...</CardContent>
      </Card>
    )
  }

  const reasons = ['tooManyFailures', 'tooManyRefreshFailures', 'quotaExceeded', 'invalidRefreshToken'] as const

  return (
    <Card>
      <CardHeader>
        <CardTitle>冷冻/解冻配置</CardTitle>
        <p className="text-sm text-muted-foreground">
          凭据被禁用后进入冷冻状态，冷冻期到后自动解冻重试。再次失败则冷冻时间翻倍（指数退避）。
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 各原因独立配置 */}
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2 text-sm font-medium text-muted-foreground">
            <span>禁用原因</span>
            <span>基础冷冻 (秒)</span>
            <span>最大冷冻 (秒)</span>
          </div>
          {reasons.map((reason) => (
            <div key={reason} className="grid grid-cols-3 gap-2 items-center">
              <span className="text-sm">{REASON_LABELS[reason]}</span>
              <Input
                type="number"
                min="5"
                value={form[reason].baseSecs}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    [reason]: { ...prev[reason], baseSecs: parseInt(e.target.value) || 0 },
                  }))
                }
                className="h-8"
              />
              <Input
                type="number"
                min="10"
                value={form[reason].maxSecs}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    [reason]: { ...prev[reason], maxSecs: parseInt(e.target.value) || 0 },
                  }))
                }
                className="h-8"
              />
            </div>
          ))}
        </div>

        {/* 全局等待上限 */}
        <div className="flex items-center gap-4">
          <span className="text-sm">请求最大等待时间 (秒)：</span>
          <Input
            type="number"
            min="5"
            max="120"
            value={form.maxWaitForThawSecs}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, maxWaitForThawSecs: parseInt(e.target.value) || 30 }))
            }
            className="w-24 h-8"
          />
          <span className="text-xs text-muted-foreground">
            所有凭据冷冻时，请求最多等待此时长
          </span>
        </div>

        {/* 指数退避说明 */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
          <p className="font-medium mb-1">指数退避规则：</p>
          <p>实际冷冻时长 = min(基础时长 x 2^冷冻次数, 最大时长)</p>
          <p>例如 API 连续失败：第1次 30s, 第2次 60s, 第3次 120s, 第4次 240s, 第5次 300s(封顶)</p>
          <p className="mt-1">成功调用后冷冻次数归零，完全恢复。手动禁用不自动解冻。</p>
        </div>

        <Button onClick={handleSave} disabled={setConfig.isPending}>
          {setConfig.isPending ? '保存中...' : '保存配置'}
        </Button>
      </CardContent>
    </Card>
  )
}
