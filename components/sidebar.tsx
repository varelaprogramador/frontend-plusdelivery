"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Package, Settings, ShoppingCart, Users, Pizza, ShoppingBag, HelpCircle, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser, useClerk } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const menuItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: BarChart3,
  },
  {
    title: "Cardápio Plus",
    href: "/cardapio-plus",
    icon: Pizza,
  },
  {
    title: "Cardápio Saboritte",
    href: "/cardapio-saboritte",
    icon: ShoppingBag,
  },
  {
    title: "Pedidos",
    href: "/pedidos",
    icon: ShoppingCart,
  },
  {
    title: "Produtos Vinculados",
    href: "/produtos-vinculados",
    icon: Package,
  },
  {
    title: "Clientes Saboritte",
    href: "/clientes-saboritte",
    icon: Users,
  },
  {
    title: "Configurações",
    href: "/configuracoes",
    icon: Settings,
  },
  {
    title: "Documentação",
    href: "/doc",
    icon: HelpCircle,
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
    <div className="w-64 min-w-64 border-r border-zinc-800 bg-zinc-900 min-h-screen flex flex-col ">
      <div className="flex h-14 items-center border-b border-zinc-800 px-4">
        <h1 className="text-lg font-bold">Intermediator Admin</h1>
      </div>
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-zinc-800 text-white"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white",
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="border-t border-zinc-800 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.imageUrl} alt={getUserName()} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{getUserName()}</p>
            <p className="text-xs text-zinc-400 truncate">{getUserEmail()}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  )
}
