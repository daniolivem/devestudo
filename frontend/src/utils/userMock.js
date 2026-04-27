// src/utils/userMock.js

/**
 * Simulação de Usuário para Testes de Interface (Frontend)
 * Altere o campo 'role' para testar as visões de Aluno, Mentor ou Admin
 * Opções: 'STUDENT', 'MENTOR', 'ADMIN'
 */

export const currentUser = {
    id: "user-123",
    name: "Rilton Beserra",
    role: "STUDENT", // Experimente mudar aqui para 'ADMIN' ou 'MENTOR' e salve
    email: "rilton@exemplo.com",
    avatar: "https://github.com/rilton.png"
};