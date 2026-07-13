import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Building2, LayoutDashboard, Mail, Phone, Search, UserPlus, Users } from 'lucide-react';
import { Cliente, carregarTodosProjetos, listarClientes, novoCliente, salvarCliente } from '@/lib/gestao';

const Clientes = () => {
  const navigate = useNavigate();
  const [clientes, setClientes] = useState<Cliente[]>(() => listarClientes());
  const [busca, setBusca] = useState('');

  const obrasPorCliente = useMemo(() => {
    const mapa = new Map<string, number>();
    carregarTodosProjetos().forEach((p) => {
      if (p.clienteId) mapa.set(p.clienteId, (mapa.get(p.clienteId) ?? 0) + 1);
    });
    return mapa;
  }, []);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return clientes;
    return clientes.filter((c) =>
      [c.nome, c.cpfCnpj, c.email, c.telefone, c.municipio].some((v) => v.toLowerCase().includes(termo))
    );
  }, [clientes, busca]);

  const criarCliente = () => {
    const cliente = salvarCliente(novoCliente('Novo cliente'));
    setClientes(listarClientes());
    navigate(`/clientes/${cliente.id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Projetos
          </Button>
          <h1 className="text-lg font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" /> Clientes
          </h1>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/painel')}>
              <LayoutDashboard className="w-4 h-4 mr-1" /> Painel
            </Button>
            <Button size="sm" onClick={criarCliente}>
              <UserPlus className="w-4 h-4 mr-1" /> Novo Cliente
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome, CPF/CNPJ, e-mail, telefone ou município…"
            className="pl-9"
          />
        </div>

        {filtrados.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-16 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-40" />
              {clientes.length === 0 ? (
                <>
                  <p className="font-medium mb-1">Nenhum cliente cadastrado</p>
                  <p className="text-sm mb-6">
                    Cadastre seus clientes e vincule-os às obras para acompanhar tudo em um só lugar.
                  </p>
                  <Button onClick={criarCliente}>
                    <UserPlus className="w-4 h-4 mr-2" /> Cadastrar primeiro cliente
                  </Button>
                </>
              ) : (
                <p className="text-sm">Nenhum cliente encontrado para “{busca}”.</p>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {filtrados.map((c) => (
              <Card
                key={c.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(`/clientes/${c.id}`)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg flex items-center justify-between gap-2">
                    <span className="truncate">{c.nome || '(sem nome)'}</span>
                    <Badge variant="secondary">{c.tipoPessoa === 'PJ' ? 'Empresa' : 'Pessoa física'}</Badge>
                  </CardTitle>
                  <CardDescription>
                    {c.municipio ? `${c.municipio} – BA` : 'Município não informado'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-1">
                  {c.telefone && (
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5" /> {c.telefone}
                    </p>
                  )}
                  {c.email && (
                    <p className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5" /> {c.email}
                    </p>
                  )}
                  <p className="flex items-center gap-2 pt-1">
                    <Building2 className="w-3.5 h-3.5" />
                    {obrasPorCliente.get(c.id) ?? 0} obra(s)/projeto(s)
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Clientes;
