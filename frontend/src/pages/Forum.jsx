import React, { useState } from 'react';

export default function Forum() {
  // Estado para controlar se o modal de criar tópico está aberto ou fechado
  const [modalAberto, setModalAberto] = useState(false);

  return (
    /* bg-[#F3F4F6] é um exemplo de cor de fundo do Figma. 
       Troque pelo código hexadecimal real que encontrar no Figma! */
    <div className="min-h-screen bg-[#F3F4F6] p-8 font-sans">
      
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-black">Fórum Temático</h1>
        <button 
          onClick={() => setModalAberto(true)}
          className="bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition"
        >
          + Criar Novo Tópico
        </button>
      </header>

      {/* Lista de Threads (Requisito: Listar) */}
      <section className="grid gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <span className="text-xs font-bold bg-blue-100 text-blue-600 px-2 py-1 rounded">
            React
          </span>
          <h3 className="text-xl font-bold mt-2">Como integrar o Supabase no Projeto II?</h3>
          <p className="text-gray-500 text-sm mt-1">Postado por: Sistema • 0 respostas</p>
          <button className="mt-4 text-sm font-semibold text-black underline">
            Responder
          </button>
        </div>
      </section>

      {/* MODAL DE CRIAÇÃO (Requisito: Criar Thread / Rota: /threads) */}
      {modalAberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold mb-4">Nova Discussão</h2>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col">
                <label className="font-medium mb-1">Título</label>
                <input type="text" placeholder="Ex: Erro no Prisma" className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-black" />
              </div>
              
              <div className="flex flex-col">
                <label className="font-medium mb-1">Conteúdo</label>
                <textarea rows={4} placeholder="Descreva sua dúvida..." className="border p-2 rounded-lg outline-none focus:ring-2 focus:ring-black"></textarea>
              </div>

              <div className="flex gap-3 mt-2">
                <button className="bg-black text-white px-6 py-2 rounded-lg flex-1">Publicar</button>
                <button 
                  onClick={() => setModalAberto(false)}
                  className="border border-gray-300 px-6 py-2 rounded-lg flex-1 hover:bg-gray-50"
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