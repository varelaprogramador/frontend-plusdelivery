"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Package, Settings, ShoppingCart, Users, Pizza, ShoppingBag, HelpCircle, LogOut, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser, useClerk } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: BarChart3,
    badge: null,
    color: "blue-500"
  },
  {
    title: "Cardápio Plus",
    href: "/cardapio-plus",
    icon: Pizza,
    badge: "Plus",
    color: "blue-600"
  },
  {
    title: "Cardápio Saboritte",
    href: "/cardapio-saboritte",
    icon: ShoppingBag,
    badge: null,
    color: "blue-400"
  },
  {
    title: "Pedidos",
    href: "/pedidos",
    icon: ShoppingCart,
    badge: "Live",
    color: "blue-700"
  },
  {
    title: "Produtos Vinculados",
    href: "/produtos-vinculados",
    icon: Package,
    badge: null,
    color: "blue-500"
  },
  {
    title: "Clientes Saboritte",
    href: "/clientes-saboritte",
    icon: Users,
    badge: null,
    color: "blue-600"
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    badge: null,
    color: "blue-400"
  },
  {
    title: "Documentação",
    href: "/doc",
    icon: HelpCircle,
    badge: "Docs",
    color: "blue-500"
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user } = useUser()
  const { signOut } = useClerk()

  const handleSignOut = () => {
    signOut()
  }

  const getUserInitials = () => {
    if (!user) return "U"
    const firstName = user.firstName || ""
    const lastName = user.lastName || ""
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || user.emailAddresses[0]?.emailAddress.charAt(0).toUpperCase() || "U"
  }

  const getUserName = () => {
    if (!user) return "Usuário"
    return user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || "Usuário"
  }

  const getUserEmail = () => {
    if (!user) return "user@example.com"
    return user.emailAddresses[0]?.emailAddress || "user@example.com"
  }

  return (
    <div className="w-64 min-w-64 border-r border-zinc-800/50 bg-zinc-900 min-h-screen flex flex-col">
      {/* Header limpo */}
      <div className="flex h-16 items-center border-b border-zinc-800/50 px-4 bg-zinc-900">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-blue-500 flex items-center justify-center">
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">
              Intermediator
            </h1>
            <p className="text-xs text-zinc-500">Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 relative overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-zinc-800/80 to-zinc-700/40 text-white shadow-lg border border-zinc-700/50"
                      : "text-zinc-400 hover:bg-zinc-800/40 hover:text-white hover:border-zinc-700/30 border border-transparent",
                  )}
                >
                  {/* Indicador ativo */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                  )}
                  
                  {/* Ícone simples */}
                  <div className={cn(
                    "relative p-2 rounded-lg transition-all duration-200",
                    isActive 
                      ? `bg-${item.color} shadow-lg` 
                      : "bg-zinc-800/50 group-hover:bg-zinc-700/50"
                  )}>
                    <item.icon className={cn(
                      "h-4 w-4 transition-all duration-200",
                      isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-300"
                    )} />
                  </div>
                  
                  <span className="flex-1">{item.title}</span>
                  
                  {/* Badge */}
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className={cn(
                        "text-xs px-2 py-0.5 font-medium border-0",
                        isActive 
                          ? "bg-white/20 text-white" 
                          : "bg-zinc-700/50 text-zinc-300 group-hover:bg-zinc-600/50"
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User section limpo */}
      <div className="border-t border-zinc-800/50 p-4 bg-zinc-900">
        <div className="space-y-3">
          {/* Status online */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-800/30 border border-zinc-700/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-xs text-zinc-300 font-medium">Sistema Online</span>
            </div>
            <div className="ml-auto text-xs text-zinc-500">99.9%</div>
          </div>

          {/* User info */}
          <div className="flex items-center gap-3">
            <Avatar className="h-11 w-11 border-2 border-zinc-700/50">
              <AvatarImage src={user?.imageUrl} alt={getUserName()} />
              <AvatarFallback className="bg-blue-500 text-white font-semibold text-sm">
                {getUserInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{getUserName()}</p>
              <p className="text-xs text-zinc-400 truncate">{getUserEmail()}</p>
            </div>
          </div>

          {/* Logout button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all duration-200 border border-zinc-800/50 hover:border-zinc-700/50"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>
    </div>
  )
}
