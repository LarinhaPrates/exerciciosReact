import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import senac from './Image/senacBranco.png';
import sesc from './Image/sescBranco.png';

function AdicionarProdutos() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nomeProduto: '',
        descricao: '',
        imagem: null,
        preco: ''
    });
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [userNome, setUserNome] = useState('');
    const [carregandoUser, setCarregandoUser] = useState(true);

    // Carregar nome do usuário para header
    useEffect(() => {
        const carregar = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;
                const { data: perfil } = await supabase
                    .from('perfil')
                    .select('nome')
                    .eq('id_user', user.id)
                    .maybeSingle();
                if (perfil && perfil.nome) setUserNome(perfil.nome);
            } catch (e) {
                console.error('Erro ao carregar nome usuário:', e);
            } finally {
                setCarregandoUser(false);
            }
        };
        carregar();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData(prevState => ({
            ...prevState,
            imagem: file
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setSucesso('');

        if (salvando) return;

        // Validações simples
        if (!formData.nomeProduto || !formData.descricao || !formData.preco) {
            setErro('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // Converter preco: remover R$, vírgula -> ponto
        const precoNumerico = parseFloat(
            formData.preco
                .replace('R$', '')
                .replace(',', '.')
                .trim()
        );
        if (isNaN(precoNumerico)) {
            setErro('Preço inválido. Use formato 10,50 ou 10.50.');
            return;
        }

        setSalvando(true);
        let imagemUrl = null;
        try {
            // Upload robusto: tenta múltiplos buckets e caminhos
            if (formData.imagem) {
                const file = formData.imagem;

                // Verificar se usuário está autenticado
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                if (authError || !user) {
                    setErro('Você precisa estar logado para fazer upload de imagens.');
                    setSalvando(false);
                    return;
                }

                const extensao = (file.name.split('.').pop() || 'jpg').toLowerCase();
                const timestamp = Date.now();
                const random = Math.random().toString(36).substring(2, 8);
                const nomeArquivo = `produto-${timestamp}-${random}.${extensao}`;

                // Tentar diferentes buckets e caminhos
                const tentativas = [
                    { bucket: 'Fotos0.2', path: nomeArquivo },
                    { bucket: 'Fotos0.2', path: `fotos/${nomeArquivo}` },
                    { bucket: 'Fotos0.2', path: `produtos/${nomeArquivo}` },
                ];

                let uploadSucesso = false;
                let ultimoErro = null;

                for (const tentativa of tentativas) {
                    try {
                        console.log(`Tentando upload no bucket '${tentativa.bucket}', caminho: '${tentativa.path}'`);

                        const { data: uploadData, error: upErr } = await supabase.storage
                            .from(tentativa.bucket)
                            .upload(tentativa.path, file, {
                                cacheControl: '3600',
                                upsert: true,
                                contentType: file.type || 'image/jpeg',
                            });

                        if (upErr) {
                            console.warn(`Erro no bucket '${tentativa.bucket}':`, upErr.message);
                            ultimoErro = upErr;
                            continue;
                        }

                        console.log('Upload bem-sucedido:', uploadData);

                        // Obter URL pública
                        const { data: urlData } = supabase.storage
                            .from(tentativa.bucket)
                            .getPublicUrl(tentativa.path);

                        if (urlData && urlData.publicUrl) {
                            imagemUrl = urlData.publicUrl;
                            uploadSucesso = true;
                            console.log('URL pública obtida:', imagemUrl);
                            break;
                        }
                    } catch (exUp) {
                        console.warn(`Exceção no bucket '${tentativa.bucket}':`, exUp);
                        ultimoErro = exUp;
                        continue;
                    }
                }

                if (!uploadSucesso) {
                    const erroMsg = ultimoErro?.message || 'Erro desconhecido';
                    console.error('Todas as tentativas de upload falharam. Último erro:', erroMsg);
                    setErro(`Falha no upload: ${erroMsg}. Certifique-se de que existe um bucket chamado 'produtos' ou 'public' no Supabase Storage com permissões de upload.`);
                    setSalvando(false);
                    return;
                }
            }

            // Inserir produto na tabela 'produto' com colunas compatíveis à listagem Senac
            const { error: insertError } = await supabase.from('produto').insert({
                nome_produto: formData.nomeProduto,
                descricao: formData.descricao,
                preco: precoNumerico,
                foto: imagemUrl,
                id_lanchonete: 2 // Garantir vínculo com lanchonete Senac
            });
            if (insertError) {
                console.error('Erro ao inserir produto:', insertError.message);
                setErro('Erro ao salvar produto.');
            } else {
                // Limpar formulário
                setFormData({
                    nomeProduto: '',
                    descricao: '',
                    imagem: null,
                    preco: ''
                });
                // Reset do input file
                const fileInput = document.getElementById('imagem');
                if (fileInput) fileInput.value = '';

                setSucesso('Produto adicionado com sucesso! Você pode adicionar outro ou voltar.');
            }
        } catch (ex) {
            console.error('Exceção ao salvar produto:', ex);
            setErro('Erro inesperado ao salvar produto.');
        } finally {
            setSalvando(false);
        }
    };

    const handleCancel = () => {
        navigate('/GerenciarProdutosSenac');
    };

    const handleAdicionarOutro = () => {
        setSucesso('');
        setErro('');
        setFormData({
            nomeProduto: '',
            descricao: '',
            imagem: null,
            preco: ''
        });
        const fileInput = document.getElementById('imagem');
        if (fileInput) fileInput.value = '';
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-[#004d9d] text-white app-header">
                <div className="flex items-center gap-4">
                    <div className="border-2 border-white rounded-full p-2 w-12 h-12 flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
                        </svg>
                    </div>
                    <span className="font-semibold">{carregandoUser ? 'Carregando...' : (userNome || 'USUÁRIO')}</span>
                </div>

                <nav className="flex gap-8">
                    <Link to="/GerenciarProdutosSenac" className="hover:underline">PRODUTOS</Link>
                    <Link to="/GerenciarPedidos" className="hover:underline">PEDIDOS</Link>
                    <Link to="/GerenciarAlunos" className="hover:underline">ALUNOS</Link>
                </nav>

                <div className="flex gap-4">
                    <img src={senac} alt="Senac" className="h-8" />
                    <img src={sesc} alt="Sesc" className="h-8" />
                </div>
            </header>

            {/* Conteúdo Principal */}
            <main className="flex items-center justify-center py-12 px-4">
                <div className="bg-white rounded-3xl shadow-xl p-12 w-full max-w-2xl">
                    <h1 className="text-center text-5xl font-bold text-[#004d9d] mb-10 font-lobster">
                        Adicionar Produtos
                    </h1>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {erro && (
                            <div className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm">
                                {erro}
                            </div>
                        )}
                        {sucesso && (
                            <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm">
                                {sucesso}
                            </div>
                        )}
                        {/* Nome do Produto */}
                        <div>
                            <label htmlFor="nomeProduto" className="block text-gray-700 font-medium mb-2">
                                Nome do Produto
                            </label>
                            <input
                                type="text"
                                id="nomeProduto"
                                name="nomeProduto"
                                value={formData.nomeProduto}
                                onChange={handleChange}
                                placeholder="Nome"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d9d] focus:border-transparent"
                            />
                        </div>

                        {/* Descrição */}
                        <div>
                            <label htmlFor="descricao" className="block text-gray-700 font-medium mb-2">
                                Descrição
                            </label>
                            <textarea
                                id="descricao"
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleChange}
                                placeholder="Descrição ..."
                                rows="4"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d9d] focus:border-transparent resize-none"
                            />
                        </div>

                        {/* Imagem */}
                        <div>
                            <label htmlFor="imagem" className="block text-gray-700 font-medium mb-2">
                                Imagem
                            </label>
                            <div className="w-full px-4 py-3 border border-gray-300 rounded-lg">
                                <label
                                    htmlFor="imagem"
                                    className="cursor-pointer bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-6 rounded-lg inline-block transition-colors"
                                >
                                    Upload Arquivos
                                </label>
                                <input
                                    type="file"
                                    id="imagem"
                                    name="imagem"
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                                {formData.imagem && (
                                    <span className="ml-4 text-gray-600 text-sm">
                                        {formData.imagem.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Preço */}
                        <div>
                            <label htmlFor="preco" className="block text-gray-700 font-medium mb-2">
                                Preço
                            </label>
                            <input
                                type="text"
                                id="preco"
                                name="preco"
                                value={formData.preco}
                                onChange={handleChange}
                                placeholder="R$"
                                className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004d9d] focus:border-transparent"
                            />
                        </div>

                        {/* Botões */}
                        <div className="flex gap-4 justify-end pt-4">
                            {sucesso ? (
                                <>
                                    <button
                                        type="button"
                                        onClick={handleAdicionarOutro}
                                        className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                                    >
                                        Adicionar Outro
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-8 py-3 bg-[#004d9d] text-white font-semibold rounded-lg hover:bg-[#003d7d] transition-colors"
                                    >
                                        Voltar aos Produtos
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        type="submit"
                                        disabled={salvando}
                                        className={`px-8 py-3 font-semibold rounded-lg transition-colors text-white ${salvando ? 'bg-gray-500 cursor-not-allowed' : 'bg-[#004d9d] hover:bg-[#003d7d]'}`}
                                    >
                                        {salvando ? 'Salvando...' : 'Salvar'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCancel}
                                        className="px-8 py-3 bg-gray-400 text-white font-semibold rounded-lg hover:bg-gray-500 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}

export default AdicionarProdutos;