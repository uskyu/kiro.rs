import { useState, useEffect } from 'react'
import { Save, RotateCcw, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useModelSystemPrompts, useSetModelSystemPrompts } from '@/hooks/use-credentials'
import { extractErrorMessage } from '@/lib/utils'

export function ModelPromptsPanel() {
  const { data, isLoading } = useModelSystemPrompts()
  const { mutate: saveModelPrompts, isPending: isSaving } = useSetModelSystemPrompts()

  const [entries, setEntries] = useState<Array<{ model: string; prompt: string }>>([])
  const [position, setPosition] = useState('prepend')

  useEffect(() => {
    if (data?.modelSystemPrompts) {
      const items = Object.entries(data.modelSystemPrompts).map(([model, prompt]) => ({
        model,
        prompt,
      }))
      setEntries(items.length > 0 ? items : [])
    }
    if (data?.systemPromptPosition) {
      setPosition(data.systemPromptPosition)
    }
  }, [data])

  const handleSave = () => {
    // 构建映射（过滤空键）
    const prompts: Record<string, string> = {}
    for (const entry of entries) {
      const key = entry.model.trim()
      if (key) {
        prompts[key] = entry.prompt
      }
    }

    saveModelPrompts({ modelSystemPrompts: prompts, systemPromptPosition: position }, {
      onSuccess: () => toast.success('模型提示词映射已保存'),
      onError: (error) => toast.error(`保存失败: ${extractErrorMessage(error)}`),
    })
  }

  const handleRestore = () => {
    if (data?.modelSystemPrompts) {
      const items = Object.entries(data.modelSystemPrompts).map(([model, prompt]) => ({
        model,
        prompt,
      }))
      setEntries(items)
    } else {
      setEntries([])
    }
    if (data?.systemPromptPosition) {
      setPosition(data.systemPromptPosition)
    }
  }

  const addEntry = () => {
    setEntries([...entries, { model: '', prompt: '' }])
  }

  const removeEntry = (index: number) => {
    setEntries(entries.filter((_, i) => i !== index))
  }

  const updateEntry = (index: number, field: 'model' | 'prompt', value: string) => {
    const newEntries = [...entries]
    newEntries[index] = { ...newEntries[index], [field]: value }
    setEntries(newEntries)
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
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Model System Prompts (模型级提示词映射)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          为特定模型设置专用系统提示词。支持前缀匹配，未匹配的模型使用全局默认提示词。
        </p>

        {/* 注入位置选择 */}
        <div className="flex items-center gap-3 p-2 border rounded-md bg-muted/30">
          <label className="text-sm font-medium whitespace-nowrap">注入位置：</label>
          <div className="flex gap-2">
            <button
              onClick={() => setPosition('prepend')}
              className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                position === 'prepend'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-input hover:bg-muted'
              }`}
            >
              前置 (prepend)
            </button>
            <button
              onClick={() => setPosition('append')}
              className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                position === 'append'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-input hover:bg-muted'
              }`}
            >
              后置 (append)
            </button>
          </div>
          <span className="text-xs text-muted-foreground">
            {position === 'append' ? '放最后面，模型更听从注入的提示词' : '放最前面，用户的 system prompt 在后面'}
          </span>
        </div>

        {entries.length === 0 ? (
          <div className="text-center py-4 text-sm text-muted-foreground border border-dashed rounded-md">
            暂无模型级提示词，所有模型使用全局默认提示词
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-shrink-0 w-48">
                  <input
                    type="text"
                    value={entry.model}
                    onChange={(e) => updateEntry(index, 'model', e.target.value)}
                    placeholder="模型名称/前缀"
                    className="w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="flex-1">
                  <textarea
                    value={entry.prompt}
                    onChange={(e) => updateEntry(index, 'prompt', e.target.value)}
                    placeholder="该模型专用的系统提示词"
                    rows={2}
                    className="w-full resize-y rounded-md border border-input bg-background px-3 py-1.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeEntry(index)}
                  className="flex-shrink-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button onClick={addEntry} variant="outline" size="sm">
            <Plus className="h-4 w-4" />
            添加映射
          </Button>
          <Button onClick={handleSave} disabled={isLoading || isSaving} size="sm">
            <Save className="h-4 w-4" />
            {isSaving ? '保存中...' : '保存映射'}
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
