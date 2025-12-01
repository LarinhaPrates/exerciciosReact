import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import senac from './Image/senacBranco.png';
import sesc from './Image/sescBranco.png';

function ItensPedido() {
	const navigate = useNavigate();
	const location = useLocation();
	const { id } = useParams();
	const [usuarioNome, setUsuarioNome] = useState('');
	const [itens, setItens] = useState([]);
	const numeroPedido = location.state?.numero || id;

	const formatCurrency = (valor) =>
		new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor || 0);

	useEffect(() => {
		let isMounted = true;
		const carregarPorUser = async (user) => {
			try {
				if (!user) return;
				const { data: perfil } = await supabase
					.from('perfil')
					.select('nome')
					.eq('id_user', user.id)
					.maybeSingle();
				if (isMounted) setUsuarioNome(perfil?.nome || user.email || 'USUÁRIO');
			} catch (_) {
				if (isMounted) setUsuarioNome('USUÁRIO');
			}
		};

		const bootstrap = async () => {
			const { data: { session } } = await supabase.auth.getSession();
			const user = session?.user;
			if (user) await carregarPorUser(user);
		};
		bootstrap();

		const { data: authListener } = supabase.auth.onAuthStateChange((_evt, session) => {
			const user = session?.user;
			if (user) carregarPorUser(user);
			else if (isMounted) setUsuarioNome('');
		});

		return () => {
			isMounted = false;
			authListener?.subscription?.unsubscribe?.();
		};
	}, []);

		// Parser genérico de itens (array/JSON/string) para estrutura uniforme
		const normalizarItens = (value) => {
			try {
				let data = value;
				if (typeof data === 'string') {
					const s = data.trim();
					if ((s.startsWith('[') && s.endsWith(']')) || (s.startsWith('{') && s.endsWith('}'))) {
						data = JSON.parse(s);
					} else {
						// lista simples separada por vírgula
						return s.split(',').map(n => ({ nome: n.trim(), quantidade: 1, unidade: 'un.', preco: null }));
					}
				}
				if (Array.isArray(data)) {
					return data.map((it) => {
						if (typeof it === 'string') return { nome: it, quantidade: 1, unidade: 'un.', preco: null };
						const nome = it.nome || it.nome_produto || it.produto || it.item || 'Item';
						const quantidade = it.quantidade ?? it.qtd ?? 1;
						const unidade = it.unidade || 'un.';
						const preco = it.preco ?? it.valor ?? null;
						return { nome, quantidade, unidade, preco };
					});
				}
				if (data && typeof data === 'object') {
					// objeto único
					const nome = data.nome || data.nome_produto || data.produto || data.item || 'Item';
					const quantidade = data.quantidade ?? data.qtd ?? 1;
					const unidade = data.unidade || 'un.';
					const preco = data.preco ?? data.valor ?? null;
					return [{ nome, quantidade, unidade, preco }];
				}
			} catch (e) {
				// fallback silencioso
			}
			return [];
		};

		// Carrega itens do pedido a partir das tabelas itens_pedido e produto
		useEffect(() => {
			let isMounted = true;
			const carregar = async () => {
				// Se não há id, tenta fallback via state (quando veio direto da tabela)
				if (!id && location.state?.itens) {
					const norm = normalizarItens(location.state.itens);
					if (isMounted) setItens(norm);
					return;
				}
				if (!id) return;

				try {
					// 1) Busca itens do pedido em itens_pedido por id_pedido, com fallback para pedido_id
					let itensRows = [];
					let resp = await supabase.from('itens_pedido').select('*').eq('id_pedido', id);
					if (resp.error) {
						resp = await supabase.from('itens_pedido').select('*').eq('pedido_id', id);
					}
					if (resp.error) {
						console.warn('Erro ao buscar itens_pedido:', resp.error.message);
						// fallback: usa state, se disponível
						if (location.state?.itens) {
							const norm = normalizarItens(location.state.itens);
							if (isMounted) setItens(norm);
						}
						return;
					}
					itensRows = resp.data || [];

					if (!itensRows.length) {
						if (isMounted) setItens([]);
						return;
					}

					// 2) Busca nomes/preços na tabela produto
					const produtoIds = Array.from(new Set(itensRows.map(r => r.id_produto ?? r.produto_id).filter(Boolean)));
					let produtosMap = new Map();
					if (produtoIds.length) {
						let prod = await supabase.from('produto').select('*').in('id_produto', produtoIds);
						if (prod.error || !(prod.data || []).length) {
							prod = await supabase.from('produto').select('*').in('id', produtoIds);
						}
						if (prod.error) {
							console.warn('Erro ao buscar produtos:', prod.error.message);
						} else {
							(prod.data || []).forEach(p => {
								const pid = String(p.id_produto ?? p.id);
								produtosMap.set(pid, p);
							});
						}
					}

					// 3) Normaliza para a tabela
					const normalizados = itensRows.map(r => {
						const pid = r.id_produto ?? r.produto_id;
						const p = pid != null ? produtosMap.get(String(pid)) : undefined;
						const nome = p?.nome_produto || p?.nome || 'Produto';
						const quantidade = r.quantidade ?? r.qtd ?? 1;
						const unidade = r.unidade || 'un.';
						const preco = r.preco_unitario ?? r.preco ?? p?.preco ?? null;
						return { nome, quantidade, unidade, preco };
					});

					if (isMounted) setItens(normalizados);
				} catch (e) {
					console.warn('Falha ao buscar itens relacionados:', e);
					if (location.state?.itens) {
						const norm = normalizarItens(location.state.itens);
						if (isMounted) setItens(norm);
					}
				}
			};

			carregar();
			return () => { isMounted = false; };
		}, [id]);

	return (
		<div className="min-h-screen bg-[#f3f4f6]">
			{/* Header */}
			<header className="bg-[#004d9d] text-white app-header">
				<div className="flex items-center gap-4">
					<div className="bg-white rounded-full p-2 w-12 h-12 flex items-center justify-center">
						<svg className="w-6 h-6 text-[#004d9d]" fill="currentColor" viewBox="0 0 24 24">
							<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
						</svg>
					</div>
					<span className="font-semibold">{usuarioNome || 'USUÁRIO'}</span>
				</div>

				<nav className="flex gap-8">
					<Link to="/EscolhaAdm" className="hover:underline">ESCOLHA</Link>
					<Link to="/GerenciarPedidos" className="hover:underline">PEDIDOS</Link>
					<Link to="/GerenciarAlunos" className="hover:underline">ALUNOS</Link>
				</nav>

				<div className="flex gap-4">
					<img src={senac} alt="Senac" className="h-8" />
					<img src={sesc} alt="Sesc" className="h-8" />
				</div>
			</header>

			{/* Título */}
					<h1 className="text-center text-5xl font-bold text-[#004d9d] my-10 font-lobster">
						Itens do Pedido {numeroPedido ? `#${numeroPedido}` : ''}
					</h1>

			{/* Tabela */}
			<div className="max-w-4xl mx-auto px-4 pb-12">
				<div className="bg-white rounded-2xl shadow-lg overflow-hidden">
					<table className="w-full table-fixed border-separate border-spacing-0">
						<thead>
							<tr>
								<th className="w-1/2 py-4 px-6 text-left text-[#1e3a8a] font-semibold border-b border-[#1e3a8a]/50">
									Nome
								</th>
								<th className="w-1/4 py-4 px-6 text-center text-[#1e3a8a] font-semibold border-b border-[#1e3a8a]/50">
									Quantidade
								</th>
								<th className="w-1/4 py-4 px-6 text-center text-[#1e3a8a] font-semibold border-b border-[#1e3a8a]/50">
									Preço
								</th>
							</tr>
						</thead>
						<tbody>
											{itens.map((item, idx) => (
								<tr key={idx} className="border-t border-[#1e3a8a]/30">
									<td className="py-5 px-6 text-center sm:text-left text-gray-700 border-r border-[#1e3a8a]/30">
										{item.nome}
									</td>
									<td className="py-5 px-6 text-center text-gray-700 border-r border-[#1e3a8a]/30">
														{item.quantidade} {item.unidade}
									</td>
									<td className="py-5 px-6 text-center font-semibold text-gray-900">
														{item.preco == null ? '-' : formatCurrency(item.preco)}
									</td>
								</tr>
							))}

							
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}

export default ItensPedido;
