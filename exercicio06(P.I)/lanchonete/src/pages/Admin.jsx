import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut } from 'lucide-react';
import ProductsManager from '@/components/admin/ProductsManager';
import UsersManager from '@/components/admin/UsersManager';

const Admin = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/auth');
    }
  }, [user, isAdmin, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              🍔 Painel Administrativo
            </h1>
            <p className="text-sm text-muted-foreground">Gerencie sua cantina escolar</p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/')}>
              Ver Cardápio
            </Button>
            <Button variant="ghost" onClick={signOut}>
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products" className="space-y-4">
            <ProductsManager />
          </TabsContent>
          
          <TabsContent value="users" className="space-y-4">
            <UsersManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
