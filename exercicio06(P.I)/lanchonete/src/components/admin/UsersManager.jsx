import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const UsersManager = () => {
  const { data: users, isLoading } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;

      const usersWithRoles = await Promise.all(
        profiles.map(async (profile) => {
          const { data: roles } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', profile.id);
          
          return {
            ...profile,
            roles: roles || [],
          };
        })
      );
      
      return usersWithRoles;
    },
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Usuários Cadastrados</h2>

      {isLoading ? (
        <p>Carregando usuários...</p>
      ) : (
        <div className="grid gap-4">
          {users?.map((user) => (
            <Card key={user.id}>
              <CardContent className="flex items-center justify-between p-6">
                <div>
                  <h3 className="font-semibold">{user.full_name || 'Sem nome'}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Cadastrado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex gap-2">
                  {user.roles?.map((roleObj) => (
                    <Badge
                      key={roleObj.role}
                      variant={roleObj.role === 'admin' ? 'default' : 'secondary'}
                    >
                      {roleObj.role === 'admin' ? 'Administrador' : 'Usuário'}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersManager;
