import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUpdateCredential } from '@/hooks/use-credentials'
import type { CredentialStatusItem } from '@/types/api'

interface EditCredentialDialogProps {
  credential: CredentialStatusItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function EditCredentialDialog({
  credential,
  open,
  onOpenChange,
}: EditCredentialDialogProps) {
  const [proxyUrl, setProxyUrl] = useState('')
  const [proxyUsername, setProxyUsername] = useState('')
  const [proxyPassword, setProxyPassword] = useState('')
  const [endpoint, setEndpoint] = useState('')
  const [authRegion, setAuthRegion] = useState('')
  const [apiRegion, setApiRegion] = useState('')
  const [machineId, setMachineId] = useState('')

  const updateCredential = useUpdateCredential()

  useEffect(() => {
    if (credential && open) {
      setProxyUrl(credential.proxyUrl || '')
      setProxyUsername('')
      setProxyPassword('')
      setEndpoint(credential.endpoint || '')
      setAuthRegion('')
      setApiRegion('')
      setMachineId('')
    }
  }, [credential, open])

  const handleSave = () => {
    if (!credential) return

    const data: Record<string, string | null> = {}

    // 只发送有变化的字段
    // proxyUrl: 空字符串 = 清空, 有值 = 设置
    if (proxyUrl !== (credential.proxyUrl || '')) {
      data.proxyUrl = proxyUrl || null
    }
    if (proxyUsername) {
      data.proxyUsername = proxyUsername
    }
    if (proxyPassword) {
      data.proxyPassword = proxyPassword
    }
    if (endpoint !== (credential.endpoint || '')) {
      data.endpoint = endpoint || null
    }
    if (authRegion) {
      data.authRegion = authRegion
    }
    if (apiRegion) {
      data.apiRegion = apiRegion
    }
    if (machineId) {
      data.machineId = machineId
    }

    if (Object.keys(data).length === 0) {
      toast.info('没有需要更新的字段')
      return
    }

    updateCredential.mutate(
      { id: credential.id, data },
      {
        onSuccess: (res) => {
          toast.success(res.message)
          onOpenChange(false)
        },
        onError: (err) => {
          toast.error('更新失败: ' + (err as Error).message)
        },
      }
    )
  }

  if (!credential) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            编辑凭据 #{credential.id}
            {credential.email && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({credential.email})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 代理配置 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">代理配置</h4>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground">代理 URL</label>
                <Input
                  placeholder="http://ip:port 或 socks5://ip:port（留空清除）"
                  value={proxyUrl}
                  onChange={(e) => setProxyUrl(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">代理用户名</label>
                  <Input
                    placeholder="留空不修改"
                    value={proxyUsername}
                    onChange={(e) => setProxyUsername(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">代理密码</label>
                  <Input
                    type="password"
                    placeholder="留空不修改"
                    value={proxyPassword}
                    onChange={(e) => setProxyPassword(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 端点配置 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">端点配置</h4>
            <div>
              <label className="text-xs text-muted-foreground">端点名称</label>
              <Input
                placeholder="ide / cli（留空使用默认）"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
              />
            </div>
          </div>

          {/* 区域配置 */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">区域配置</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-muted-foreground">Auth Region</label>
                <Input
                  placeholder="留空不修改"
                  value={authRegion}
                  onChange={(e) => setAuthRegion(e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">API Region</label>
                <Input
                  placeholder="留空不修改"
                  value={apiRegion}
                  onChange={(e) => setApiRegion(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Machine ID */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Machine ID</h4>
            <Input
              placeholder="留空不修改"
              value={machineId}
              onChange={(e) => setMachineId(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={updateCredential.isPending}
          >
            取消
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateCredential.isPending}
          >
            {updateCredential.isPending ? '保存中...' : '保存'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
