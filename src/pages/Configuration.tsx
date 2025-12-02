import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, MessageSquare, Building2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { User, Company, Product } from '@/types';

export default function Configuration() {
  const { 
    currentUser, 
    currentCompany, 
    users, 
    companies, 
    products,
    addUser, 
    updateUser, 
    deleteUser,
    addCompany,
    updateCompany,
    deleteCompany,
    addProduct,
    updateProduct,
    deleteProduct,
    sendSMS
  } = useStore();

  const [activeTab, setActiveTab] = useState('users');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const isAdmin = currentUser?.role === 'Admin';

  const companyProducts = products.filter(p => p.companyId === currentCompany?.id);

  // User Form
  const [userForm, setUserForm] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'Operativo',
    companyId: currentCompany?.id || '',
    status: 'Activo',
    permissions: { users: false, companies: false, inventory: true, reports: true, chat: true }
  });

  // Company Form
  const [companyForm, setCompanyForm] = useState<Partial<Company>>({
    name: '',
    country: '',
    currency: '',
    timezone: ''
  });

  // Product Form
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    sku: '',
    category: '',
    stock: 0,
    price: 0,
    companyId: currentCompany?.id || '',
    status: 'Disponible'
  });

  const handleSaveUser = () => {
    if (editingItem) {
      updateUser(editingItem.id, userForm);
      toast.success('Usuario actualizado');
    } else {
      addUser(userForm as Omit<User, 'id'>);
      toast.success('Usuario creado');
    }
    setDialogOpen(false);
    setEditingItem(null);
    resetForms();
  };

  const handleSaveCompany = () => {
    if (editingItem) {
      updateCompany(editingItem.id, companyForm);
      toast.success('Empresa actualizada');
    } else {
      addCompany(companyForm as Omit<Company, 'id'>);
      toast.success('Empresa creada');
    }
    setDialogOpen(false);
    setEditingItem(null);
    resetForms();
  };

  const handleSaveProduct = () => {
    if (editingItem) {
      updateProduct(editingItem.id, productForm);
      toast.success('Producto actualizado');
    } else {
      addProduct(productForm as Omit<Product, 'id'>);
      toast.success('Producto creado');
    }
    setDialogOpen(false);
    setEditingItem(null);
    resetForms();
  };

  const handleEdit = (item: any, type: string) => {
    setEditingItem(item);
    if (type === 'user') setUserForm(item);
    if (type === 'company') setCompanyForm(item);
    if (type === 'product') setProductForm(item);
    setDialogOpen(true);
  };

  const handleDelete = (id: string, type: string) => {
    if (type === 'user') deleteUser(id);
    if (type === 'company') deleteCompany(id);
    if (type === 'product') deleteProduct(id);
    toast.success(`${type === 'user' ? 'Usuario' : type === 'company' ? 'Empresa' : 'Producto'} eliminado`);
  };

  const handleSendWelcomeSMS = async (user: User) => {
    const loadingToast = toast.loading(`Enviando correo a ${user.name}...`);

    const result = await sendSMS(user.email, `Bienvenido ${user.name} al sistema administrativo!`);

    toast.dismiss(loadingToast);

    if (result.success) {
      toast.success(`Correo de bienvenida enviado a ${user.name}`);
    } else {
      toast.error(`Error al enviar correo: ${result.message}`);
    }
  };

  const resetForms = () => {
    setUserForm({
      name: '',
      email: '',
      role: 'Operativo',
      companyId: currentCompany?.id || '',
      status: 'Activo',
      permissions: { users: false, companies: false, inventory: true, reports: true, chat: true }
    });
    setCompanyForm({ name: '', country: '', currency: '', timezone: '' });
    setProductForm({
      name: '',
      sku: '',
      category: '',
      stock: 0,
      price: 0,
      companyId: currentCompany?.id || '',
      status: 'Disponible'
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configuración</h1>
        <p className="text-muted-foreground mt-1">
          Gestiona usuarios, empresas e inventario
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="companies" disabled={!isAdmin}>Empresas</TabsTrigger>
          <TabsTrigger value="inventory">Inventario</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>Administra usuarios y permisos del sistema</CardDescription>
                </div>
                <Dialog open={dialogOpen && activeTab === 'users'} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingItem(null); resetForms(); }}>
                      <Plus className="mr-2 h-4 w-4" /> Nuevo Usuario
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-popover">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
                      <DialogDescription>
                        Complete los datos del usuario y asigne los permisos correspondientes
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nombre</Label>
                          <Input 
                            id="name" 
                            value={userForm.name} 
                            onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input 
                            id="email" 
                            type="email"
                            value={userForm.email} 
                            onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="role">Rol</Label>
                          <Select value={userForm.role} onValueChange={(value: any) => setUserForm({ ...userForm, role: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover">
                              <SelectItem value="Admin">Admin</SelectItem>
                              <SelectItem value="Operativo">Operativo</SelectItem>
                              <SelectItem value="Viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">Empresa</Label>
                          <Select value={userForm.companyId} onValueChange={(value) => setUserForm({ ...userForm, companyId: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover">
                              {companies.map(c => (
                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label>Permisos</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {Object.entries(userForm.permissions || {}).map(([key, value]) => (
                            <div key={key} className="flex items-center space-x-2">
                              <Checkbox 
                                checked={value}
                                onCheckedChange={(checked) => 
                                  setUserForm({
                                    ...userForm,
                                    permissions: { ...userForm.permissions!, [key]: checked as boolean }
                                  })
                                }
                              />
                              <label className="text-sm capitalize">{key}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={handleSaveUser}>Guardar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Empresa</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>{companies.find(c => c.id === user.companyId)?.name}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'Activo' ? 'default' : 'secondary'}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleSendWelcomeSMS(user)}
                          >
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEdit(user, 'user')}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDelete(user.id, 'user')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Companies Tab */}
        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestión de Empresas</CardTitle>
                  <CardDescription>Administra las empresas del sistema</CardDescription>
                </div>
                <Dialog open={dialogOpen && activeTab === 'companies'} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingItem(null); resetForms(); }}>
                      <Plus className="mr-2 h-4 w-4" /> Nueva Empresa
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-popover">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? 'Editar Empresa' : 'Nueva Empresa'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="companyName">Nombre</Label>
                        <Input 
                          id="companyName" 
                          value={companyForm.name} 
                          onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="country">País</Label>
                          <Input 
                            id="country" 
                            value={companyForm.country} 
                            onChange={(e) => setCompanyForm({ ...companyForm, country: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="currency">Moneda</Label>
                          <Input 
                            id="currency" 
                            value={companyForm.currency} 
                            onChange={(e) => setCompanyForm({ ...companyForm, currency: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Zona Horaria</Label>
                        <Input 
                          id="timezone" 
                          value={companyForm.timezone} 
                          onChange={(e) => setCompanyForm({ ...companyForm, timezone: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={handleSaveCompany}>Guardar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {companies.map(company => (
                  <Card key={company.id} className="relative">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{company.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {company.country}
                          </CardDescription>
                        </div>
                        <Building2 className="h-8 w-8 text-primary" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Moneda:</span>
                          <span className="font-medium">{company.currency}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Zona:</span>
                          <span className="font-medium text-xs">{company.timezone}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleEdit(company, 'company')}
                        >
                          <Pencil className="h-3 w-3 mr-1" /> Editar
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDelete(company.id, 'company')}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Gestión de Inventario</CardTitle>
                  <CardDescription>Administra productos y stock</CardDescription>
                </div>
                <Dialog open={dialogOpen && activeTab === 'inventory'} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => { setEditingItem(null); resetForms(); }}>
                      <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-popover">
                    <DialogHeader>
                      <DialogTitle>{editingItem ? 'Editar Producto' : 'Nuevo Producto'}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="productName">Nombre</Label>
                          <Input 
                            id="productName" 
                            value={productForm.name} 
                            onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sku">SKU</Label>
                          <Input 
                            id="sku" 
                            value={productForm.sku} 
                            onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="category">Categoría</Label>
                          <Input 
                            id="category" 
                            value={productForm.category} 
                            onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="stock">Stock</Label>
                          <Input 
                            id="stock" 
                            type="number"
                            value={productForm.stock} 
                            onChange={(e) => setProductForm({ ...productForm, stock: parseInt(e.target.value) })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Precio</Label>
                        <Input 
                          id="price" 
                          type="number"
                          value={productForm.price} 
                          onChange={(e) => setProductForm({ ...productForm, price: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
                      <Button onClick={handleSaveProduct}>Guardar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Precio</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companyProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>${product.price.toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            product.status === 'Disponible' ? 'default' : 
                            product.status === 'Bajo Stock' ? 'secondary' : 
                            'destructive'
                          }
                        >
                          {product.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleEdit(product, 'product')}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleDelete(product.id, 'product')}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
