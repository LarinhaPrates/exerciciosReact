import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus } from 'lucide-react';

const ProductsManager = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'salgados',
    image_url: '',
    available: true,
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newProduct) => {
      const { error } = await supabase
        .from('products')
        .insert([newProduct]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto criado com sucesso!');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Erro ao criar produto: ' + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto atualizado com sucesso!');
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast.error('Erro ao atualizar produto: ' + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success('Produto deletado com sucesso!');
    },
    onError: (error) => {
      toast.error('Erro ao deletar produto: ' + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'salgados',
      image_url: '',
      available: true,
    });
    setEditingProduct(null);
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      image_url: product.image_url || '',
      available: product.available ?? true,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, ...productData });
    } else {
      createMutation.mutate(productData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Produtos</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-accent">
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Preço (R$)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salgados">Salgados</SelectItem>
                      <SelectItem value="doces">Doces</SelectItem>
                      <SelectItem value="bebidas">Bebidas</SelectItem>
                      <SelectItem value="lanches">Lanches</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image_url">URL da Imagem</Label>
                <Input
                  id="image_url"
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) => setFormData({ ...formData, available: checked })}
                />
                <Label htmlFor="available">Disponível</Label>
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetForm();
                    setIsDialogOpen(false);
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingProduct ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <p>Carregando produtos...</p>
      ) : (
        <div className="grid gap-4">
          {products?.map((product) => (
            <Card key={product.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div className="flex items-center gap-4">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">{product.category}</p>
                    <p className="text-sm font-bold text-primary">
                      R$ {product.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {product.available ? '✓ Disponível' : '✗ Indisponível'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(product)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => {
                      if (confirm('Tem certeza que deseja deletar este produto?')) {
                        deleteMutation.mutate(product.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductsManager;
