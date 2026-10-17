export const userRoles = [
  { value: "STUDENT", label: "Aluno" },
  { value: "MENTOR", label: "Mentor" },
  { value: "ADMIN", label: "Admin" },
];

export const initialUsers = [
  { id: "user-1", name: "Ana Souza", email: "ana@devestudo.com", role: "STUDENT", status: "Ativo" },
  { id: "user-2", name: "Pedro Lima", email: "pedro@devestudo.com", role: "MENTOR", status: "Ativo" },
  { id: "user-3", name: "Mariana Alves", email: "mariana@devestudo.com", role: "STUDENT", status: "Ativo" },
  { id: "user-4", name: "Lucas Ribeiro", email: "lucas@devestudo.com", role: "ADMIN", status: "Ativo" },
  { id: "user-5", name: "Sofia Mendes", email: "sofia@devestudo.com", role: "STUDENT", status: "Ativo" },
  { id: "user-6", name: "Carlos Mendes", email: "carlos@devestudo.com", role: "MENTOR", status: "Bloqueado" },
  { id: "user-7", name: "Beatriz Lima", email: "beatriz@devestudo.com", role: "MENTOR", status: "Ativo" },
  { id: "user-8", name: "Rafael Costa", email: "rafael@devestudo.com", role: "STUDENT", status: "Ativo" },
  { id: "user-9", name: "Juliana Rocha", email: "juliana@devestudo.com", role: "MENTOR", status: "Ativo" },
  { id: "user-10", name: "Bruno Costa", email: "bruno@devestudo.com", role: "STUDENT", status: "Ativo" },
  { id: "user-11", name: "Fernanda Lima", email: "fernanda@devestudo.com", role: "STUDENT", status: "Ativo" },
  { id: "user-12", name: "Roberto Silva", email: "roberto@devestudo.com", role: "MENTOR", status: "Ativo" },
  { id: "user-13", name: "Patrícia Melo", email: "patricia@devestudo.com", role: "STUDENT", status: "Ativo" },
  { id: "user-14", name: "Ronaldo Lima", email: "ronaldo@devestudo.com", role: "STUDENT", status: "Bloqueado" },
];

export function getRoleLabel(role) {
  return userRoles.find((item) => item.value === role)?.label || role;
}
