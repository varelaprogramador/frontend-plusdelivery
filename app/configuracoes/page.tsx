"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { ConfigService } from "@/lib/config-service"
import type { ConfigurationData } from "@/lib/types-config"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-zinc-400">Gerencie as configurações de acesso e integração.</p>
      </div>

      <Tabs defaultValue="credenciais" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-zinc-900">
          <TabsTrigger value="credenciais" className="data-[state=active]:bg-blue-600">
            Credenciais
          </TabsTrigger>
          <TabsTrigger value="integracao" className="data-[state=active]:bg-blue-600">
            Integração
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="data-[state=active]:bg-blue-600">
            Notificações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="credenciais" className="mt-4 space-y-6">
          {/* Plus Delivery */}
          <Card className="border-zinc-800 bg-zinc-950/50">
            <CardHeader>
              <CardTitle>Plus Delivery</CardTitle>
              <CardDescription>Configure as credenciais de acesso à plataforma Plus Delivery.</CardDescription>
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
                  <Input
                    id="plus-senha"
                    type="password"
                    value={config.plus.credentials.senha}
                    onChange={(e) => updateConfig("plus", "credentials", "senha", e.target.value)}
                    placeholder="••••••••"
                    className="bg-zinc-900 text-white placeholder:text-zinc-500"
                  />
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
                  className={`text-sm ${
                    connectionStatus.plus === null
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
                <Button variant="outline" onClick={() => handleTestConnection("plus")} disabled={testing.plus}>
                  {testing.plus ? <Loader2 className="h-4 w-4 animate-spin" /> : "Testar"}
                </Button>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleSave("plus")} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                </Button>
              </div>
            </CardFooter>
          </Card>

          {/* Saboritte */}
          <Card className="border-zinc-800 bg-zinc-950/50">
            <CardHeader>
              <CardTitle>Saboritte</CardTitle>
              <CardDescription>Configure as credenciais de acesso à plataforma Saboritte.</CardDescription>
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
                  <Input
                    id="saboritte-senha"
                    type="password"
                    value={config.saboritte.credentials.senha}
                    onChange={(e) => updateConfig("saboritte", "credentials", "senha", e.target.value)}
                    placeholder="••••••••"
                    className="bg-zinc-900 text-white placeholder:text-zinc-500"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="saboritte-token">Token de API</Label>
                <Input
                  id="saboritte-token"
                  value={config.saboritte.credentials.api_token}
                  onChange={(e) => updateConfig("saboritte", "credentials", "api_token", e.target.value)}
                  placeholder="api_token_xxxxxxxxxxxxxxxxxxxxx"
                  className="bg-zinc-900 text-white placeholder:text-zinc-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="saboritte-url">URL da API</Label>
                <Input
                  id="saboritte-url"
                  value={config.saboritte.credentials.api_url}
                  onChange={(e) => updateConfig("saboritte", "credentials", "api_url", e.target.value)}
                  placeholder="https://api.saboritte.com"
                  className="bg-zinc-900 text-white placeholder:text-zinc-500"
                />
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
                  className={`text-sm ${
                    connectionStatus.saboritte === null
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
                  disabled={testing.saboritte}
                >
                  {testing.saboritte ? <Loader2 className="h-4 w-4 animate-spin" /> : "Testar"}
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleSave("saboritte")}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
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
            <CardFooter>
              <Button
                className="bg-blue-600 hover:bg-blue-700 w-full"
                onClick={() => {
                  handleSave("plus")
                  handleSave("saboritte")
                }}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Configurações"}
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
                className="bg-blue-600 hover:bg-blue-700 w-full"
                onClick={() => handleSave("saboritte")}
                disabled={saving}
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Configurações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
