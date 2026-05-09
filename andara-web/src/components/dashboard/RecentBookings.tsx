import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const recentBookings = [
  {
    id: "B-1001",
    tour: "Tour Huacachina VIP",
    customer: "María Gómez",
    date: "12 May 2024",
    amount: "$120.00",
    status: "confirmed",
  },
  {
    id: "B-1002",
    tour: "Líneas de Nazca",
    customer: "John Doe",
    date: "14 May 2024",
    amount: "$250.00",
    status: "pending",
  },
  {
    id: "B-1003",
    tour: "Islas Ballestas",
    customer: "Carlos Ruiz",
    date: "15 May 2024",
    amount: "$80.00",
    status: "confirmed",
  },
  {
    id: "B-1004",
    tour: "Tour Huacachina VIP",
    customer: "Ana Silva",
    date: "16 May 2024",
    amount: "$240.00",
    status: "cancelled",
  },
]

export function RecentBookings() {
  return (
    <Card className="col-span-1 lg:col-span-4">
      <CardHeader>
        <CardTitle className="text-xl">Últimas Reservas</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reserva</TableHead>
              <TableHead>Tour</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentBookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium text-foreground">{booking.id}</TableCell>
                <TableCell className="text-muted-foreground">{booking.tour}</TableCell>
                <TableCell className="text-foreground">{booking.customer}</TableCell>
                <TableCell className="text-muted-foreground">{booking.date}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      booking.status === "confirmed"
                        ? "success"
                        : booking.status === "pending"
                        ? "warning"
                        : "destructive"
                    }
                  >
                    {booking.status === "confirmed"
                      ? "Confirmado"
                      : booking.status === "pending"
                      ? "Pendiente"
                      : "Cancelado"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium text-foreground">{booking.amount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
