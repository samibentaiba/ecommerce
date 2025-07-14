
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export interface RecentOrder {
  id: string;
  customerName: string;
  total: number;
  status: string;
  createdAt: string;
  productName: string;
}

export function RecentSales({ orders }: { orders: RecentOrder[] }) {
  return (
    <div className="space-y-8">
      {orders.length === 0 && (
        <div className="text-muted-foreground text-center">No recent sales.</div>
      )}
      {orders.map((order) => (
        <div className="flex items-center" key={order.id}>
          <Avatar className="h-9 w-9">
            {/* Optionally use a generated avatar or initials */}
            <AvatarImage src="/placeholder-user.jpg" alt={order.customerName} />
            <AvatarFallback>{order.customerName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{order.customerName}</p>
            <p className="text-sm text-muted-foreground">{order.productName}</p>
          </div>
          <div className="ml-auto font-medium">+${order.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
      ))}
    </div>
  )
}
