import { SignIn } from '@clerk/nextjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Settings, Shield, Zap, Users } from 'lucide-react'

export default function Page() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 flex items-center justify-center p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-40" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}></div>

            <div className="relative w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 items-center">
                {/* Left Side - Branding */}
                <div className="space-y-8 text-center lg:text-left">
                    <div className="space-y-4">
                        <div className="flex items-center justify-center lg:justify-start gap-3">
                            <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                <Settings className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Plus Delivery</h1>
                                <p className="text-zinc-400 text-sm">Intermediador</p>
                            </div>
                        </div>

                        <h2 className="text-4xl lg:text-5xl font-bold text-white leading-tight">
                            Gerencie suas
                            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> integrações</span>
                        </h2>

                        <p className="text-xl text-zinc-300 max-w-lg">
                            Conecte Plus Delivery e Saboritte de forma inteligente.
                            Sincronize pedidos, gerencie produtos e automatize seu negócio.
                        </p>
                    </div>

                    {/* Features */}
                    <div className="grid gap-4">
                        <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                            <div className="h-10 w-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                                <Zap className="h-5 w-5 text-green-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Sincronização Automática</h3>
                                <p className="text-sm text-zinc-400">Pedidos sincronizados em tempo real</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                            <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                                <Users className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Gestão de Clientes</h3>
                                <p className="text-sm text-zinc-400">Clientes unificados entre plataformas</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50">
                            <div className="h-10 w-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                                <Shield className="h-5 w-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-white">Segurança Total</h3>
                                <p className="text-sm text-zinc-400">Dados protegidos e criptografados</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-center lg:justify-start gap-6 pt-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">99.9%</div>
                            <div className="text-sm text-zinc-400">Uptime</div>
                        </div>
                        <div className="h-8 w-px bg-zinc-700"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">24/7</div>
                            <div className="text-sm text-zinc-400">Suporte</div>
                        </div>
                        <div className="h-8 w-px bg-zinc-700"></div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-white">100%</div>
                            <div className="text-sm text-zinc-400">Seguro</div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Login Form */}
                <div className="relative">
                    <Card className="bg-zinc-900/80 backdrop-blur-xl border-zinc-700/50 shadow-2xl">
                        <CardHeader className="text-center space-y-2">
                            <div className="mx-auto h-16 w-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                                <Settings className="h-8 w-8 text-white" />
                            </div>
                            <CardTitle className="text-2xl font-bold text-white">Bem-vindo de volta</CardTitle>
                            <CardDescription className="text-zinc-400">
                                Faça login para acessar o painel de controle
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <SignIn
                                    appearance={{
                                        elements: {
                                            rootBox: "w-full",
                                            card: "bg-transparent shadow-none border-none",
                                            headerTitle: "text-white font-bold text-xl",
                                            headerSubtitle: "text-zinc-400",
                                            socialButtonsBlockButton: "bg-zinc-800 hover:bg-zinc-700 border-zinc-600 text-white",
                                            formButtonPrimary: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold",
                                            formFieldInput: "bg-zinc-800 border-zinc-600 text-white placeholder:text-zinc-400 focus:border-blue-500",
                                            formFieldLabel: "text-zinc-300",
                                            footerActionLink: "text-blue-400 hover:text-blue-300",
                                            identityPreviewText: "text-zinc-300",
                                            formHeaderTitle: "text-white",
                                            formHeaderSubtitle: "text-zinc-400",
                                            dividerLine: "bg-zinc-700",
                                            dividerText: "text-zinc-400",
                                            formResendCodeLink: "text-blue-400 hover:text-blue-300",
                                            otpCodeFieldInput: "bg-zinc-800 border-zinc-600 text-white",
                                            formFieldSuccessText: "text-green-400",
                                            formFieldErrorText: "text-red-400",
                                            alertText: "text-zinc-300",
                                            formFieldWarningText: "text-amber-400"
                                        }
                                    }}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Floating Elements */}
                    <div className="absolute -top-4 -right-4 h-8 w-8 bg-blue-500/20 rounded-full blur-sm"></div>
                    <div className="absolute -bottom-4 -left-4 h-12 w-12 bg-purple-500/20 rounded-full blur-sm"></div>
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                    <Badge variant="outline" className="border-zinc-600 text-zinc-400">
                        v1.0.0
                    </Badge>
                    <span>Powered by Clerk Authentication</span>
                </div>
            </div>
        </div>
    )
}