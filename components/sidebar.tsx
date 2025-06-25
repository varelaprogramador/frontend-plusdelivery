"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, Package, Settings, ShoppingCart, Users, Pizza, ShoppingBag, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"

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
      <div className="border-t border-zinc-800 p-4 ">
        <div className="mb-2 flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-sm font-medium">A</span>
          </div>
          <div>
            <p className="text-sm font-medium">Administrador</p>
            <p className="text-xs text-zinc-400">Admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}
