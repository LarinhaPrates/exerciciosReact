/* 
 * GUIA DE USO DO TOAST
 * 
 * Como usar o Toast em seus componentes:
 */

// 1. Importe o hook useToast
import { useToast } from './ToastContext';

// 2. No seu componente, chame o hook
function SeuComponente() {
  const toast = useToast();

  // 3. Use os métodos disponíveis:

  // Sucesso (verde)
  const handleSucesso = () => {
    toast.success('Operação realizada com sucesso!');
  };

  // Erro (vermelho)
  const handleErro = () => {
    toast.error('Ocorreu um erro ao processar sua solicitação');
  };

  // Aviso (amarelo)
  const handleAviso = () => {
    toast.warning('Atenção: Esta ação não pode ser desfeita');
  };

  // Informação (azul)
  const handleInfo = () => {
    toast.info('Novo pedido recebido');
  };

  // Com duração personalizada (em milissegundos)
  const handleCustom = () => {
    toast.success('Mensagem rápida!', 2000); // 2 segundos
    toast.error('Mensagem longa', 6000); // 6 segundos
  };

  return (
    <div>
      <button onClick={handleSucesso}>Mostrar Sucesso</button>
      <button onClick={handleErro}>Mostrar Erro</button>
      <button onClick={handleAviso}>Mostrar Aviso</button>
      <button onClick={handleInfo}>Mostrar Info</button>
    </div>
  );
}

/*
 * SUBSTITUINDO ALERT() E WINDOW.CONFIRM()
 * 
 * Antes:
 *   alert('Usuário cadastrado!');
 * 
 * Depois:
 *   toast.success('Usuário cadastrado!');
 * 
 * ----------------------------------------
 * 
 * Antes:
 *   alert('Erro ao salvar');
 * 
 * Depois:
 *   toast.error('Erro ao salvar');
 * 
 * ----------------------------------------
 * 
 * Para confirmações (window.confirm), mantenha o window.confirm
 * pois o toast não tem opção de confirmação, apenas notificação.
 */

export default SeuComponente;
