import { useState, useMemo } from 'react';
import { useStore } from '@/store/useStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, FileSpreadsheet, Calendar, Send, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { exportToPDF, exportToExcel } from '@/lib/exportUtils';
import { emailService } from '@/services/emailService';

export default function Reports() {
  const { currentCompany, reports, users, products, activityLog, addActivityLog, sendSMS } = useStore();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ventas');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [emailRecipient, setEmailRecipient] = useState('');

  // 📊 Datos de ventas con filtrado
  const salesData = useMemo(() => {
    const data = [
      { id: 1, mes: 'Enero', fecha: '2024-01-31', ventas: 45000, transacciones: 120, estado: 'Activo' },
      { id: 2, mes: 'Febrero', fecha: '2024-02-28', ventas: 52000, transacciones: 145, estado: 'Activo' },
      { id: 3, mes: 'Marzo', fecha: '2024-03-31', ventas: 48000, transacciones: 132, estado: 'Activo' },
      { id: 4, mes: 'Abril', fecha: '2024-04-30', ventas: 61000, transacciones: 167, estado: 'Activo' },
      { id: 5, mes: 'Mayo', fecha: '2024-05-31', ventas: 55000, transacciones: 151, estado: 'Activo' },
      { id: 6, mes: 'Junio', fecha: '2024-06-30', ventas: 67000, transacciones: 189, estado: 'Activo' },
      { id: 7, mes: 'Julio', fecha: '2024-07-31', ventas: 71000, transacciones: 195, estado: 'Activo' },
      { id: 8, mes: 'Agosto', fecha: '2024-08-31', ventas: 68000, transacciones: 178, estado: 'Archivado' }
    ];

    return data.filter(item => {
      const dateMatch = (!startDate || item.fecha >= startDate) && (!endDate || item.fecha <= endDate);
      const statusMatch = filterStatus === 'all' ||
                         (filterStatus === 'active' && item.estado === 'Activo') ||
                         (filterStatus === 'archived' && item.estado === 'Archivado');
      return dateMatch && statusMatch;
    });
  }, [startDate, endDate, filterStatus]);

  // 📦 Datos de inventario con filtrado
  const inventoryData = useMemo(() => {
    return products
      .filter(p => {
        const statusMatch = filterStatus === 'all' ||
                           (filterStatus === 'active' && p.status === 'Disponible') ||
                           (filterStatus === 'archived' && p.status === 'Agotado');
        return p.companyId === currentCompany?.id && statusMatch;
      })
      .map(p => ({
        id: p.id,
        producto: p.name,
        sku: p.sku,
        stock: p.stock,
        precio: p.price,
        estado: p.status
      }));
  }, [products, currentCompany, filterStatus]);

  // 👥 Datos de usuarios con filtrado
  const usersData = useMemo(() => {
    return users
      .filter(u => {
        const statusMatch = filterStatus === 'all' ||
                           (filterStatus === 'active' && u.status === 'Activo') ||
                           (filterStatus === 'archived' && u.status === 'Inactivo');
        return u.companyId === currentCompany?.id && statusMatch;
      })
      .map(u => ({
        id: u.id,
        nombre: u.name,
        email: u.email,
        rol: u.role,
        estado: u.status
      }));
  }, [users, currentCompany, filterStatus]);

  // 📄 Obtener datos según el tab activo
  const getCurrentData = () => {
    switch (activeTab) {
      case 'ventas':
        return { data: salesData, name: 'Ventas Mensual' };
      case 'inventario':
        return { data: inventoryData, name: 'Movimientos de Inventario' };
      case 'usuarios':
        return { data: usersData, name: 'Usuarios Creados' };
      default:
        return { data: [], name: '' };
    }
  };

  const handleExportPDF = () => {
    const { data, name } = getCurrentData();
    exportToPDF(name, data);

    addActivityLog({
      type: 'report_generated',
      description: `Se exportó reporte "${name}" en PDF`,
      companyId: currentCompany?.id || '',
      userId: useStore.getState().currentUser?.id || ''
    });

    toast.success('Reporte exportado en PDF');
  };

  const handleExportExcel = () => {
    const { data, name } = getCurrentData();
    exportToExcel(name, data);

    addActivityLog({
      type: 'report_generated',
      description: `Se exportó reporte "${name}" en Excel`,
      companyId: currentCompany?.id || '',
      userId: useStore.getState().currentUser?.id || ''
    });

    toast.success('Reporte exportado en Excel');
  };

  const handleSendReportByEmail = async () => {
    if (!emailRecipient) {
      toast.error('Por favor ingresa un correo electrónico');
      return;
    }

    const loadingToast = toast.loading('Generando y enviando reporte...');

    try {
      const { data, name } = getCurrentData();

      // Convertir los datos a un formato legible
      const reportData = {
        'Nombre del Reporte': name,
        'Fecha': new Date().toLocaleString('es-ES'),
        'Total de Registros': data.length,
        'Empresa': currentCompany?.name,
        'Resumen': `Este reporte contiene ${data.length} registros generados el ${new Date().toLocaleString('es-ES')}`
      };

      // Enviar el correo con PDF
      const result = await emailService.sendReportWithPDF(
        emailRecipient,
        name,
        reportData
      );

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(`Reporte enviado a ${emailRecipient}`);
        addActivityLog({
          type: 'report_generated',
          description: `Se envió reporte "${name}" por correo a ${emailRecipient}`,
          companyId: currentCompany?.id || '',
          userId: useStore.getState().currentUser?.id || ''
        });
        setEmailRecipient(''); // Limpiar el campo
      } else {
        toast.error(`Error: ${result.message}`);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Error al enviar el reporte');
      console.error(error);
    }
  };

  const handleScheduleReport = () => {
    if (!emailRecipient) {
      toast.error('Ingrese un correo electrónico');
      return;
    }

    const { name } = getCurrentData();
    sendSMS(emailRecipient, `Reporte "${name}" programado`);

    addActivityLog({
      type: 'report_generated',
      description: `Se programó envío de reporte "${name}" a ${emailRecipient}`,
      companyId: currentCompany?.id || '',
      userId: useStore.getState().currentUser?.id || ''
    });

    toast.success(`Reporte programado para enviar a ${emailRecipient}`);
    setScheduleDialogOpen(false);
    setEmailRecipient('');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Reportes</h1>
        <p className="text-muted-foreground mt-1">
          Genera y programa reportes del sistema
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros Avanzados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Fecha Inicio</Label>
              <Input 
                id="startDate" 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Fecha Fin</Label>
              <Input 
                id="endDate" 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="archived">Archivados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs con Reportes */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ventas">Ventas Mensual</TabsTrigger>
              <TabsTrigger value="inventario">Movimientos de Inventario</TabsTrigger>
              <TabsTrigger value="usuarios">Usuarios Creados</TabsTrigger>
            </TabsList>

            {/* Tab: Ventas */}
            <TabsContent value="ventas" className="space-y-4">
              {/* Botones de acción */}
              <div className="flex gap-2">
                <Button onClick={handleExportPDF} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button onClick={handleExportExcel} variant="outline">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
                <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar por Correo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-popover">
                    <DialogHeader>
                      <DialogTitle>Enviar Reporte por Correo</DialogTitle>
                      <DialogDescription>
                        Ingrese el correo del destinatario
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="recipient">Destinatario</Label>
                        <Input
                          id="recipient"
                          type="email"
                          placeholder="email@empresa.com"
                          value={emailRecipient}
                          onChange={(e) => setEmailRecipient(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={async () => {
                        await handleSendReportByEmail();
                        setScheduleDialogOpen(false);
                      }}>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar con PDF
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Tabla de Ventas */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mes</TableHead>
                      <TableHead>Fecha</TableHead>
                      <TableHead className="text-right">Ventas</TableHead>
                      <TableHead className="text-right">Transacciones</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No hay datos que coincidan con los filtros
                        </TableCell>
                      </TableRow>
                    ) : (
                      salesData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.mes}</TableCell>
                          <TableCell>{item.fecha}</TableCell>
                          <TableCell className="text-right">${item.ventas.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{item.transacciones}</TableCell>
                          <TableCell>
                            <Badge variant={item.estado === 'Activo' ? 'default' : 'secondary'}>
                              {item.estado}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Tab: Inventario */}
            <TabsContent value="inventario" className="space-y-4">
              {/* Botones de acción */}
              <div className="flex gap-2">
                <Button onClick={handleExportPDF} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button onClick={handleExportExcel} variant="outline">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
                <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar por Correo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-popover">
                    <DialogHeader>
                      <DialogTitle>Enviar Reporte por Correo</DialogTitle>
                      <DialogDescription>
                        Ingrese el correo del destinatario
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="recipient2">Destinatario</Label>
                        <Input
                          id="recipient2"
                          type="email"
                          placeholder="email@empresa.com"
                          value={emailRecipient}
                          onChange={(e) => setEmailRecipient(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={async () => {
                        await handleSendReportByEmail();
                        setScheduleDialogOpen(false);
                      }}>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar con PDF
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Tabla de Inventario */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Precio</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inventoryData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No hay datos que coincidan con los filtros
                        </TableCell>
                      </TableRow>
                    ) : (
                      inventoryData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.producto}</TableCell>
                          <TableCell>{item.sku}</TableCell>
                          <TableCell className="text-right">{item.stock}</TableCell>
                          <TableCell className="text-right">${item.precio.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant={item.estado === 'Activo' ? 'default' : 'secondary'}>
                              {item.estado}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Tab: Usuarios */}
            <TabsContent value="usuarios" className="space-y-4">
              {/* Botones de acción */}
              <div className="flex gap-2">
                <Button onClick={handleExportPDF} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button onClick={handleExportExcel} variant="outline">
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
                <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Mail className="h-4 w-4 mr-2" />
                      Enviar por Correo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-popover">
                    <DialogHeader>
                      <DialogTitle>Enviar Reporte por Correo</DialogTitle>
                      <DialogDescription>
                        Ingrese el correo del destinatario
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="recipient3">Destinatario</Label>
                        <Input
                          id="recipient3"
                          type="email"
                          placeholder="email@empresa.com"
                          value={emailRecipient}
                          onChange={(e) => setEmailRecipient(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={async () => {
                        await handleSendReportByEmail();
                        setScheduleDialogOpen(false);
                      }}>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar con PDF
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Tabla de Usuarios */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No hay datos que coincidan con los filtros
                        </TableCell>
                      </TableRow>
                    ) : (
                      usersData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">{item.nombre}</TableCell>
                          <TableCell>{item.email}</TableCell>
                          <TableCell>{item.rol}</TableCell>
                          <TableCell>
                            <Badge variant={item.estado === 'Activo' ? 'default' : 'secondary'}>
                              {item.estado}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Reportes Generados Recientemente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {activityLog
              .filter(log => log.type === 'report_generated' && log.companyId === currentCompany?.id)
              .slice(0, 5)
              .map(log => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{log.description}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(log.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline">Completado</Badge>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
