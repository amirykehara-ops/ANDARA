import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"

interface StatCardProps {
  title: string
  value: string
  description: string
  icon: LucideIcon
  trend?: "up" | "down" | "neutral"
  trendValue?: string
}

export function StatCard({ title, value, description, icon: Icon, trend, trendValue }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-foreground tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-2 flex items-center font-medium">
          {trend === "up" && <span className="text-emerald-500 mr-1 flex items-center">↑ {trendValue}</span>}
          {trend === "down" && <span className="text-rose-500 mr-1 flex items-center">↓ {trendValue}</span>}
          {trend === "neutral" && <span className="text-muted-foreground mr-1 flex items-center">{trendValue}</span>}
          <span className="opacity-80">{description}</span>
        </p>
      </CardContent>
    </Card>
  )
}
