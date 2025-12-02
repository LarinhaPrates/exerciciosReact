import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import senac from './Image/senacBranco.png';
import sesc from './Image/sescBranco.png';
import { supabase } from '../lib/supabase';
import { useToast } from './ToastContext';

function EditarAluno() {
    const { id } = useParams(); // id_user do aluno
    const toast = useToast();

    const [formData, setFormData] = useState({
        nomeCompleto: '',
        email: '',
        escolaVinculada: ''
    });
    const [escolas, setEscolas] = useState([]);
    const [loadingEscolas, setLoadingEscolas] = useState(true);
    const [erroEscolas, setErroEscolas] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [carregandoPerfil, setCarregandoPerfil] = useState(true);
    const [erroPerfil, setErroPerfil] = useState(null);
    const [userNome, setUserNome] = useState('');
    const [carregandoUserNome, setCarregandoUserNome] = useState(true);

    useEffect(() => {
        const carregarEscolas = async () => {
            setLoadingEscolas(true);
            const { data, error } = await supabase
                .from('escola')
                .select('id_escola, nome_escola')
                .order('nome_escola', { ascending: true });
            if (error) setErroEscolas(error.message); else setEscolas(data || []);
            setLoadingEscolas(false);
        };
        carregarEscolas();
    }, []);

    useEffect(() => {
        const carregarPerfil = async () => {
            if (!id) {
                setErroPerfil('ID não fornecido para edição.');
                setCarregandoPerfil(false);
                return;
            }
            setCarregandoPerfil(true);
            const { data, error } = await supabase
                .from('perfil')
                .select('nome, email, id_escola, tipoConta')
                .eq('id_user', id)
                .eq('tipoConta', 'aluno')
                .limit(1)
                .maybeSingle();
            if (error) {
                console.error('Erro ao carregar aluno:', error);
                setErroPerfil(error.message);
            } else if (data) {
                console.log('Dados do aluno carregados:', data);
                setFormData({
                    nomeCompleto: data.nome || '',
                    email: data.email || '',
                    escolaVinculada: data.id_escola || ''
                });
            } else {
                setErroPerfil('Aluno não encontrado.');
            }
            setCarregandoPerfil(false);
        };
        carregarPerfil();
    }, [id]);

    useEffect(() => {
        const carregarUsuario = async () => {
            setCarregandoUserNome(true);
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData?.user) {
                setUserNome('Usuário');
                setCarregandoUserNome(false);
                return;
            }
            const userId = userData.user.id;
            const { data: perfilData, error: perfilError } = await supabase
                .from('perfil')
                .select('nome')
                .eq('id_user', userId)
                .limit(1)
                .maybeSingle();
            if (!perfilError && perfilData?.nome) setUserNome(perfilData.nome);
            else setUserNome(userData.user.user_metadata?.nomeCompleto || userData.user.email || 'Usuário');
            setCarregandoUserNome(false);
        };
        carregarUsuario();
    }, []);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (submitting) return;
        if (!id) { toast.error('ID inválido para edição.'); return; }
        if (!formData.nomeCompleto || !formData.email || !formData.escolaVinculada) {
            toast.warning('Preencha nome, email e escola.');
            return;
        }
        setSubmitting(true);
        try {
            const { error: updateError } = await supabase
                .from('perfil')
                .update({
                    nome: formData.nomeCompleto,
                    email: formData.email,
                    id_escola: formData.escolaVinculada
                })
                .eq('id_user', id);
            if (updateError) throw new Error(updateError.message);
            toast.success('Aluno atualizado com sucesso!');
        } catch (err) {
            // eslint-disable-next-line no-console
            console.error(err);
            toast.error(`Erro: ${err.message}`);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = () => window.history.back();

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-[#004d9d] text-white app-header">
                <div className="flex items-center gap-4">
                    <div className="border-2 border-white rounded-full p-2 w-12 h-12 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                        </svg>
                    </div>
                    <span className="font-semibold">{carregandoUserNome ? '...' : (userNome || 'Usuário')}</span>
                </div>
                <nav className="flex gap-8">
                    <Link to="/GerenciarEscolas" className="hover:underline">ESCOLA</Link>
                    <Link to="/GerenciarPedidos" className="hover:underline ">PEDIDO</Link>
                    <Link to="/GerenciarAlunos" className="hover:underline">ALUNO</Link>
                </nav>
                <div className="flex gap-4">
                    <img src={senac} alt="Senac" className="h-8" />
                    <img src={sesc} alt="Sesc" className="h-8" />
                </div>
            </header>
            <main className="flex items-center justify-center py-12 px-4">
                <div className="bg-white rounded-3xl shadow-xl p-12 w-full max-w-2xl">
                    <h1 className="text-center text-4xl font-bold text-[#004d9d] mb-8 font-lobster">Editar Aluno</h1>
                    {erroPerfil && <p className="text-red-600 mb-4 text-sm">Erro ao carregar perfil: {erroPerfil}</p>}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="nomeCompleto" className="block text-gray-700 font-medium mb-2">Nome Completo</label>
                            <input
                                type="text"
                                id="nomeCompleto"
                                name="nomeCompleto"
                                value={formData.nomeCompleto}
                                onChange={handleChange}
                                placeholder="Nome"
                                disabled={carregandoPerfil}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d9d] focus:border-transparent disabled:bg-gray-100"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-gray-700 font-medium mb-2">E-mail</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="E-mail"
                                disabled={carregandoPerfil}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d9d] focus:border-transparent disabled:bg-gray-100"
                            />
                        </div>
                        <div>
                            <label htmlFor="escolaVinculada" className="block text-gray-700 font-medium mb-2">Escola Vinculada</label>
                            {erroEscolas && <p className="text-sm text-red-600 mb-2">Erro ao carregar escolas: {erroEscolas}</p>}
                            <select
                                id="escolaVinculada"
                                name="escolaVinculada"
                                value={formData.escolaVinculada}
                                onChange={handleChange}
                                disabled={loadingEscolas || !!erroEscolas || carregandoPerfil}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d9d] focus:border-transparent appearance-none bg-white cursor-pointer disabled:bg-gray-100 disabled:text-gray-500"
                                style={{
                                    backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23004d9d' viewBox='0 0 24 24'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E\")",
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'right 0.5rem center',
                                    backgroundSize: '1.5em 1.5em'
                                }}
                            >
                                <option value="">{loadingEscolas ? 'Carregando escolas...' : 'Selecione uma escola'}</option>
                                {escolas.map(esc => (
                                    <option key={esc.id_escola} value={esc.id_escola}>{esc.nome_escola}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex gap-4 justify-end pt-4">
                            <button type="button" onClick={handleCancel} className="px-8 py-3 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors">Voltar</button>
                            <button
                                type="submit"
                                disabled={submitting || carregandoPerfil}
                                className={`px-8 py-3 text-white font-semibold rounded-lg transition-colors ${(submitting || carregandoPerfil) ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#004d9d] hover:bg-[#003d7d]'}`}
                            >
                                {carregandoPerfil ? 'Carregando...' : (submitting ? 'Salvando...' : 'Salvar alterações')}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default EditarAluno;
