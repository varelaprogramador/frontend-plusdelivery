"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { ConfigService } from "@/lib/config-service"
import type { ConfigurationData } from "@/lib/types-config"
import {
  Loader2,
  CheckCircle,
  XCircle,
  Settings,
  Key,
  Zap,
  Bell,
  Save,
  RotateCcw,
  Download,
  Upload,
  Eye,
  EyeOff,
  AlertTriangle,
  Info
} from "lucide-react"

export default function Configuracoes() {
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState<{ plus: boolean; saboritte: boolean }>({
    plus: false,
    saboritte: false,
  })
  const [connectionStatus, setConnectionStatus] = useState<{
    plus: boolean | null
    saboritte: boolean | null
  }>({
    plus: null,
    saboritte: null,
  })
  const [showPasswords, setShowPasswords] = useState<{
    plus: boolean
    saboritte: boolean
  }>({
    plus: false,
    saboritte: false,
  })
  const [hasChanges, setHasChanges] = useState(false)
  const [originalConfig, setOriginalConfig] = useState<ConfigurationData | null>(null)

  const [config, setConfig] = useState<ConfigurationData>({
    plus: {
      credentials: {
        email: "",
        senha: "",
        api_secret: "",
        api_url: "",
      },
      settings: {
        auto_sync: true,
        sync_interval: 300,
        test_mode: false,
      },
    },
    saboritte: {
      credentials: {
        email: "",
        senha: "",
        api_token: "",
        api_url: "",
      },
      settings: {
        auto_sync: true,
        sync_interval: 300,
        test_mode: false,
        notify_errors: true,
      },
    },
  })

  // Carregar configurações ao montar o componente
  useEffect(() => {
    loadConfigurations()
  }, [])

  const loadConfigurations = async () => {
    try {
      setLoading(true)
      const configurations = await ConfigService.getAllConfigurations()
      setConfig(configurations)
      setOriginalConfig(JSON.parse(JSON.stringify(configurations)))
      setHasChanges(false)
    } catch (error) {
      console.error("Erro ao carregar configurações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (platform: "plus" | "saboritte") => {
    try {
      setSaving(true)
      await ConfigService.updatePlatformConfigurations(
        platform,
        config[platform].credentials,
        config[platform].settings,
      )

      setOriginalConfig(JSON.parse(JSON.stringify(config)))
      setHasChanges(false)

      toast({
        title: "Sucesso",
        description: `Configurações da ${platform === "plus" ? "Plus Delivery" : "Saboritte"} salvas com sucesso!`,
      })
    } catch (error) {
      console.error(`Erro ao salvar configurações da ${platform}:`, error)
      toast({
        title: "Erro",
        description: `Não foi possível salvar as configurações da ${platform === "plus" ? "Plus Delivery" : "Saboritte"}.`,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveAll = async () => {
    try {
      setSaving(true)
      await Promise.all([
        ConfigService.updatePlatformConfigurations("plus", config.plus.credentials, config.plus.settings),
        ConfigService.updatePlatformConfigurations("saboritte", config.saboritte.credentials, config.saboritte.settings)
      ])

      setOriginalConfig(JSON.parse(JSON.stringify(config)))
      setHasChanges(false)

      toast({
        title: "Sucesso",
        description: "Todas as configurações foram salvas com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar todas as configurações.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (originalConfig) {
      setConfig(JSON.parse(JSON.stringify(originalConfig)))
      setHasChanges(false)
      toast({
        title: "Configurações restauradas",
        description: "As alterações foram descartadas.",
      })
    }
  }

  const handleExportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `configuracoes-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)

    toast({
      title: "Configurações exportadas",
      description: "Arquivo de configurações baixado com sucesso.",
    })
  }

  const handleTestConnection = async (platform: "plus" | "saboritte") => {
    try {
      setTesting((prev) => ({ ...prev, [platform]: true }))
      const result = await ConfigService.testConnection(platform)

      setConnectionStatus((prev) => ({ ...prev, [platform]: result.success }))

      toast({
        title: result.success ? "Sucesso" : "Erro",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    } catch (error) {
      console.error(`Erro ao testar conexão com ${platform}:`, error)
      setConnectionStatus((prev) => ({ ...prev, [platform]: false }))
      toast({
        title: "Erro",
        description: `Erro ao testar conexão com ${platform === "plus" ? "Plus Delivery" : "Saboritte"}.`,
        variant: "destructive",
      })
    } finally {
      setTesting((prev) => ({ ...prev, [platform]: false }))
    }
  }

  const updateConfig = (platform: "plus" | "saboritte", type: "credentials" | "settings", key: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [type]: {
          ...prev[platform][type],
          [key]: value,
        },
      },
    }))
    setHasChanges(true)
  }

  const validateConfig = (platform: "plus" | "saboritte") => {
    const platformConfig = config[platform]
    const errors: string[] = []

    if (!platformConfig.credentials.email) {
      errors.push("Email é obrigatório")
    }
    if (!platformConfig.credentials.senha) {
      errors.push("Senha é obrigatória")
    }
    if (platform === "plus") {
      if (!platformConfig.credentials.api_secret) {
        errors.push("API Secret é obrigatório")
      }
      if (!platformConfig.credentials.api_url) {
        errors.push("URL da API é obrigatória")
      }
    }

    return errors
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-500" />
            Configurações
          </h1>
          <p className="text-zinc-400 mt-2">Gerencie as configurações de acesso e integração das plataformas.</p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-amber-500 border-amber-500">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Alterações não salvas
            </Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportConfig}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Alert className="border-amber-500 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertDescription className="text-amber-200">
            Você tem alterações não salvas.
            <Button variant="link" size="sm" onClick={handleReset} className="p-0 h-auto ml-2 text-amber-300 hover:text-amber-100">
              Descartar alterações
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="credenciais" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-zinc-900">
          <TabsTrigger value="credenciais" className="data-[state=active]:bg-blue-600 flex items-center gap-2">
            <Key className="h-4 w-4" />
            Credenciais
          </TabsTrigger>
          <TabsTrigger value="integracao" className="data-[state=active]:bg-blue-600 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Integração
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="data-[state=active]:bg-blue-600 flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credenciais" className="mt-4 space-y-6">
          {/* Plus Delivery */}
          <Card className="border-zinc-800 bg-zinc-950/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    Plus Delivery
                  </CardTitle>
                  <CardDescription>Configure as credenciais de acesso à plataforma Plus Delivery.</CardDescription>
                </div>
                <Badge variant="outline" className="text-green-500 border-green-500">
                  Ativo
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="plus-email">Email</Label>
                  <Input
                    id="plus-email"
                    value={config.plus.credentials.email}
                    onChange={(e) => updateConfig("plus", "credentials", "email", e.target.value)}
                    placeholder="email@plusdelivery.com"
                    className="bg-zinc-900 text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="plus-senha">Senha</Label>
                  <div className="relative">
                    <Input
                      id="plus-senha"
                      type={showPasswords.plus ? "text" : "password"}
                      value={config.plus.credentials.senha}
                      onChange={(e) => updateConfig("plus", "credentials", "senha", e.target.value)}
                      placeholder="••••••••"
                      className="bg-zinc-900 text-white placeholder:text-zinc-500 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(prev => ({ ...prev, plus: !prev.plus }))}
                    >
                      {showPasswords.plus ? (
                        <EyeOff className="h-4 w-4 text-zinc-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-zinc-400" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="plus-secret">API Secret</Label>
                <Input
                  id="plus-secret"
                  value={config.plus.credentials.api_secret}
                  onChange={(e) => updateConfig("plus", "credentials", "api_secret", e.target.value)}
                  placeholder="api_secret_xxxxxxxxxxxxxxxxxxxxx"
                  className="bg-zinc-900 text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plus-url">URL da API</Label>
                <Input
                  id="plus-url"
                  value={config.plus.credentials.api_url}
                  onChange={(e) => updateConfig("plus", "credentials", "api_url", e.target.value)}
                  placeholder="https://api.plusdelivery.com"
                  className="bg-zinc-900 text-white placeholder:text-zinc-500"
                />
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t border-zinc-800 pt-4">
              <div className="flex items-center space-x-2">
                {connectionStatus.plus === null ? (
                  <div className="h-2 w-2 rounded-full bg-zinc-500"></div>
                ) : connectionStatus.plus ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`text-sm ${connectionStatus.plus === null
                    ? "text-zinc-500"
                    : connectionStatus.plus
                      ? "text-green-500"
                      : "text-red-500"
                    }`}
                >
                  {connectionStatus.plus === null
                    ? "Não testado"
                    : connectionStatus.plus
                      ? "Conectado"
                      : "Erro de conexão"}
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleTestConnection("plus")}
                  disabled={testing.plus || validateConfig("plus").length > 0}
                  className="flex items-center gap-2"
                >
                  {testing.plus ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Testar
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                  onClick={() => handleSave("plus")}
                  disabled={saving || validateConfig("plus").length > 0}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Saboritte */}
          <Card className="border-zinc-800 bg-zinc-950/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    Saboritte
                  </CardTitle>
                  <CardDescription>Configure as credenciais de acesso à plataforma Saboritte.</CardDescription>
                </div>
                <Badge variant="outline" className="text-blue-500 border-blue-500">
                  Ativo
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="saboritte-email">Email</Label>
                  <Input
                    id="saboritte-email"
                    value={config.saboritte.credentials.email}
                    onChange={(e) => updateConfig("saboritte", "credentials", "email", e.target.value)}
                    placeholder="email@saboritte.com"
                    className="bg-zinc-900 text-white placeholder:text-zinc-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="saboritte-senha">Senha</Label>
                  <div className="relative">
                    <Input
                      id="saboritte-senha"
                      type={showPasswords.saboritte ? "text" : "password"}
                      value={config.saboritte.credentials.senha}
                      onChange={(e) => updateConfig("saboritte", "credentials", "senha", e.target.value)}
                      placeholder="••••••••"
                      className="bg-zinc-900 text-white placeholder:text-zinc-500 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPasswords(prev => ({ ...prev, saboritte: !prev.saboritte }))}
                    >
                      {showPasswords.saboritte ? (
                        <EyeOff className="h-4 w-4 text-zinc-400" />
                      ) : (
                        <Eye className="h-4 w-4 text-zinc-400" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between border-t border-zinc-800 pt-4">
              <div className="flex items-center space-x-2">
                {connectionStatus.saboritte === null ? (
                  <div className="h-2 w-2 rounded-full bg-zinc-500"></div>
                ) : connectionStatus.saboritte ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`text-sm ${connectionStatus.saboritte === null
                    ? "text-zinc-500"
                    : connectionStatus.saboritte
                      ? "text-green-500"
                      : "text-red-500"
                    }`}
                >
                  {connectionStatus.saboritte === null
                    ? "Não testado"
                    : connectionStatus.saboritte
                      ? "Conectado"
                      : "Erro de conexão"}
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleTestConnection("saboritte")}
                  disabled={testing.saboritte || validateConfig("saboritte").length > 0}
                  className="flex items-center gap-2"
                >
                  {testing.saboritte ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                  Testar
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                  onClick={() => handleSave("saboritte")}
                  disabled={saving || validateConfig("saboritte").length > 0}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Salvar
                </Button>
              </div>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="integracao" className="mt-4 space-y-6">
          <Card className="border-zinc-800 bg-zinc-950/50">
            <CardHeader>
              <CardTitle>Configurações de Sincronização</CardTitle>
              <CardDescription>Configure como o sistema sincroniza os dados entre as plataformas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sincronização Automática - Plus</Label>
                  <p className="text-sm text-zinc-400">Sincroniza automaticamente os dados da Plus Delivery</p>
                </div>
                <Switch
                  checked={config.plus.settings.auto_sync}
                  onCheckedChange={(checked) => updateConfig("plus", "settings", "auto_sync", checked)}
                />
              </div>

              <Separator className="bg-zinc-800" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sincronização Automática - Saboritte</Label>
                  <p className="text-sm text-zinc-400">Sincroniza automaticamente os dados da Saboritte</p>
                </div>
                <Switch
                  checked={config.saboritte.settings.auto_sync}
                  onCheckedChange={(checked) => updateConfig("saboritte", "settings", "auto_sync", checked)}
                />
              </div>

              <Separator className="bg-zinc-800" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Modo de Teste</Label>
                  <p className="text-sm text-zinc-400">Executa as operações em modo de teste, sem enviar dados reais</p>
                </div>
                <Switch
                  checked={config.plus.settings.test_mode}
                  onCheckedChange={(checked) => {
                    updateConfig("plus", "settings", "test_mode", checked)
                    updateConfig("saboritte", "settings", "test_mode", checked)
                  }}
                />
              </div>

              <Separator className="bg-zinc-800" />

              <div className="space-y-2">
                <Label htmlFor="sync-interval">Intervalo de Sincronização (segundos)</Label>
                <Input
                  id="sync-interval"
                  type="number"
                  value={config.plus.settings.sync_interval}
                  onChange={(e) => {
                    const value = Number.parseInt(e.target.value, 10)
                    updateConfig("plus", "settings", "sync_interval", value)
                    updateConfig("saboritte", "settings", "sync_interval", value)
                  }}
                  min="60"
                  max="3600"
                  className="bg-zinc-900 text-white placeholder:text-zinc-500"
                />
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={saving || !hasChanges}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Resetar
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 flex-1 flex items-center gap-2"
                onClick={handleSaveAll}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar Todas as Configurações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notificacoes" className="mt-4 space-y-6">
          <Card className="border-zinc-800 bg-zinc-950/50">
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>Configure como deseja receber notificações do sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificar Erros</Label>
                  <p className="text-sm text-zinc-400">Receba notificações quando ocorrem erros na sincronização</p>
                </div>
                <Switch
                  checked={config.saboritte.settings.notify_errors}
                  onCheckedChange={(checked) => updateConfig("saboritte", "settings", "notify_errors", checked)}
                />
              </div>

              <Separator className="bg-zinc-800" />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notificações no Sistema</Label>
                  <p className="text-sm text-zinc-400">Receba notificações no painel administrativo</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="bg-blue-600 hover:bg-blue-700 w-full flex items-center gap-2"
                onClick={() => handleSave("saboritte")}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Salvar Configurações de Notificações
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Seção de Informações */}
      <Card className="border-zinc-800 bg-zinc-950/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-500" />
            Informações Importantes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium text-green-400">Plus Delivery</h4>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li>• Certifique-se de que o email e senha estão corretos</li>
                <li>• O API Secret é fornecido pela Plus Delivery</li>
                <li>• A URL da API deve apontar para o endpoint correto</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-blue-400">Saboritte</h4>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li>• Use as credenciais do seu painel Saboritte</li>
                <li>• Apenas email e senha são necessários</li>
                <li>• A conexão é feita automaticamente</li>
              </ul>
            </div>
          </div>
          <Separator className="bg-zinc-800" />
          <div className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-200 mb-1">Dica de Segurança</p>
              <p className="text-amber-300/80">
                Mantenha suas credenciais seguras e nunca as compartilhe.
                As configurações são salvas localmente e sincronizadas com o banco de dados.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
