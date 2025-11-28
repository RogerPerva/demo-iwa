import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, ShoppingCart, DollarSign, Package, Clock } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Dashboard() {
  const { currentCompany, users, products, activityLog } = useStore();
  const [newLogsCount, setNewLogsCount] = useState(0);

  const companyUsers = users.filter(u => u.companyId === currentCompany?.id);
  const companyProducts = products.filter(p => p.companyId === currentCompany?.id);
  const lowStockProducts = companyProducts.filter(p => p.stock < 5);
  const companyLogs = activityLog.filter(l => l.companyId === currentCompany?.id);

  // Mock sales data
  const salesData = [
    { month: 'Ene', ventas: 45000 },
    { month: 'Feb', ventas: 52000 },
    { month: 'Mar', ventas: 48000 },
    { month: 'Abr', ventas: 61000 },
    { month: 'May', ventas: 55000 },
    { month: 'Jun', ventas: 67000 },
  ];

  const stockData = [
    { name: 'Disponible', value: companyProducts.filter(p => p.status === 'Disponible').length },
    { name: 'Bajo Stock', value: companyProducts.filter(p => p.status === 'Bajo Stock').length },
    { name: 'Agotado', value: companyProducts.filter(p => p.status === 'Agotado').length },
  ];

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))'];

  // Simulate real-time activity
  useEffect(() => {
    const interval = setInterval(() => {
      const randomEvents = [
        'Usuario nuevo registrado',
        'Producto actualizado en inventario',
        'Reporte generado exitosamente',
        'Cambio de empresa realizado',
        'Stock actualizado automáticamente'
      ];
      
      const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
      
      setNewLogsCount(prev => prev + 1);
      
      // This would add to activity log in real app
      console.log('New simulated event:', event);
    }, 12000); // Every 12 seconds

    return () => clearInterval(interval);
  }, []);

  const kpis = [
    {
      title: 'Usuarios Activos',
      value: companyUsers.filter(u => u.status === 'Activo').length,
      total: companyUsers.length,
      icon: Users,
      color: 'text-chart-1'
    },
    {
      title: 'Operaciones del Mes',
      value: '1,247',
      change: '+12.5%',
      icon: ShoppingCart,
      color: 'text-chart-2'
    },
    {
      title: 'Ventas',
      value: '$67,000',
      change: '+8.2%',
      icon: DollarSign,
      color: 'text-chart-3'
    },
    {
      title: 'Stock Bajo',
      value: lowStockProducts.length,
      total: companyProducts.length,
      icon: Package,
      color: 'text-destructive'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Bienvenido al panel de control de {currentCompany?.name}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <div className="flex items-baseline gap-2 mt-2">
                      <h3 className="text-3xl font-bold">{kpi.value}</h3>
                      {kpi.total && (
                        <span className="text-sm text-muted-foreground">/ {kpi.total}</span>
                      )}
                    </div>
                    {kpi.change && (
                      <Badge variant="secondary" className="mt-2">
                        {kpi.change}
                      </Badge>
                    )}
                  </div>
                  <div className={`p-3 bg-muted/50 rounded-lg ${kpi.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Ventas Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="ventas" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estado del Inventario</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stockData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stockData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Timeline de Actividad</CardTitle>
            {newLogsCount > 0 && (
              <Badge variant="default" className="animate-pulse">
                {newLogsCount} nuevos eventos
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {companyLogs.slice(0, 10).map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{log.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(log.timestamp).toLocaleString()}
                  </p>
                </div>
                <Badge variant="outline">{log.type}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
