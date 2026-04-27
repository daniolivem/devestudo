import React, { useState } from 'react';

export default function Mentoria() {
  // Estados para controlar os Modais e a Avaliação
  const [modalAvaliarAberto, setModalAvaliarAberto] = useState(false);
  const [mentorSelecionado, setMentorSelecionado] = useState('');
  const [nota, setNota] = useState(0);

  // Função para abrir o modal de avaliação
  const abrirAvaliacao = (nome) => {
    setMentorSelecionado(nome);
    setModalAvaliarAberto(true);
  };

  // Simulação de Solicitação de Mentoria (Rota /mentoring)
  const solicitarMentoria = (nome) => {
    alert(`Solicitação enviada para ${nome}! (Integrando com a rota /mentoring)`);
  };

  return (
    /* bg-[#F3F4F6] é a cor de fundo padrão. Ajuste conforme o Figma! */
    <div className="min-h-screen bg-[#F3F4F6] p-8 font-sans">
      
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-black">Mentoria</h1>
        <p className="text-gray-600 mt-2">Encontre especialistas ou avalie suas sessões de mentoria.</p>
      </header>

      {/* Grid de Mentores (Requisito: Listar) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card do Mentor 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded">
              Especialista Node.js
            </span>
            <h3 className="text-xl font-bold mt-3">Carlos Eduardo</h3>
            <p className="text-gray-500 text-sm mt-2">Focado em APIs REST, Bancos de Dados NoSQL e Performance no Backend.</p>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <button 
              onClick={() => solicitarMentoria('Carlos Eduardo')}
              className="bg-black text-white py-2 rounded-xl font-medium hover:bg-gray-800 transition"
            >
              Solicitar Mentoria
            </button>
            <button 
              onClick={() => abrirAvaliacao('Carlos Eduardo')}
              className="border border-gray-300 text-black py-2 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Avaliar Mentor
            </button>
          </div>
        </div>

        {/* Card do Mentor 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded">
              Especialista React
            </span>
            <h3 className="text-xl font-bold mt-3">Ana Paula</h3>
            <p className="text-gray-500 text-sm mt-2">Expert em Front-end, Hooks, Tailwind CSS e Experiência do Usuário (UX).</p>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <button 
              onClick={() => solicitarMentoria('Ana Paula')}
              className="bg-black text-white py-2 rounded-xl font-medium hover:bg-gray-800 transition"
            >
              Solicitar Mentoria
            </button>
            <button 
              onClick={() => abrirAvaliacao('Ana Paula')}
              className="border border-gray-300 text-black py-2 rounded-xl font-medium hover:bg-gray-50 transition"
            >
              Avaliar Mentor
            </button>
          </div>
        </div>

      </section>

      {/* MODAL DE AVALIAÇÃO (Requisito: Avaliar / Rota: /toevaluate) */}
      {modalAvaliarAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">Avaliar Mentor</h2>
            <p className="text-gray-500 mb-6">Como foi sua experiência com <strong>{mentorSelecionado}</strong>?</p>
            
            <div className="flex flex-col gap-4">
              {/* Sistema de Estrelas */}
              <div className="flex gap-2 justify-center mb-4">
                {[1, 2, 3, 4, 5].map((estrela) => (
                  <button 
                    key={estrela}
                    onClick={() => setNota(estrela)}
                    className={`text-3xl ${nota >= estrela ? 'text-yellow-400' : 'text-gray-300'}`}
                  >
                    ★
                  </button>
                ))}
              </div>

              <div className="flex flex-col">
                <label className="font-medium mb-1">Comentário (opcional)</label>
                <textarea rows={3} placeholder="Escreva seu feedback aqui..." className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-black"></textarea>
              </div>

              <div className="flex gap-3 mt-4">
                <button 
                  onClick={() => { alert("Avaliação enviada!"); setModalAvaliarAberto(false); }}
                  className="bg-black text-white px-6 py-2 rounded-xl flex-1 font-bold"
                >
                  Enviar
                </button>
                <button 
                  onClick={() => setModalAvaliarAberto(false)}
                  className="border border-gray-300 px-6 py-2 rounded-xl flex-1 hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}