import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { LogOut, UserCircle } from 'lucide-react';
import heroBurger from '@/assets/hero-burger.jpg';

const Index = () => {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('available', true)
        .order('category', { ascending: true })
        .order('name', { ascending: true });
      
      if (error) throw error;
      return data;
    },
  });

  const groupedProducts = products?.reduce((acc, product) => {
    if (!acc[product.category]) {
      acc[product.category] = [];
    }
    acc[product.category].push(product);
    return acc;
  }, {});

  const categoryNames = {
    salgados: 'Salgados',
    doces: 'Doces',
    bebidas: 'Bebidas',
    lanches: 'Lanches',
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            🍔 Cantina Escolar
          </h1>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                {isAdmin && (
                  <Button variant="outline" onClick={() => navigate('/admin')}>
                    Painel Admin
                  </Button>
                )}
                <Button variant="ghost" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate('/auth')}>
                <UserCircle className="mr-2 h-4 w-4" />
                Entrar
              </Button>
            )}
          </div>
        </div>
      </header>

      <section className="relative h-[400px] overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBurger})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/80 backdrop-blur-sm" />
        </div>
        <div className="relative h-full flex items-center justify-center text-center px-4">
          <div className="max-w-3xl">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              Bem-vindo à Nossa Cantina! 
            </h2>
            <p className="text-xl text-white/90 drop-shadow-md">
              Confira nosso delicioso cardápio preparado especialmente para você
            </p>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="text-center">
            <p className="text-lg text-muted-foreground">Carregando produtos...</p>
          </div>
        ) : (
          <div className="space-y-12">
            {groupedProducts && Object.entries(groupedProducts).map(([category, items]) => (
              <section key={category}>
                <h2 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-primary/20">
                  {categoryNames[category] || category}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {items.map((product) => (
                    <ProductCard
                      key={product.id}
                      name={product.name}
                      description={product.description}
                      price={product.price}
                      category={categoryNames[product.category]}
                      available={product.available}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-card border-t border-border mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2024 Cantina Escolar. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
