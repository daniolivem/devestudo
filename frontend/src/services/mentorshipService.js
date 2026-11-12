import api from './api';

export const mentorshipStatus = {
  REQUESTED: {
    label: 'Solicitada',
    description: 'Aguardando aprovação do mentor.',
  },
  APPROVED: {
    label: 'Aprovada',
    description: 'O mentor aprovou sua solicitação. Combine os detalhes pelo canal informado.',
  },
  COMPLETED: {
    label: 'Concluída',
    description: 'Mentoria finalizada e avaliada.',
  },
  CANCELLED: {
    label: 'Cancelada',
    description: 'Solicitação cancelada ou recusada.',
  },
};

export const TECHNOLOGIES = [
  'Python',
  'JavaScript',
  'React',
  'Node.js',
  'Java',
  'Spring Boot',
  'SQL',
  'HTML/CSS',
  'TypeScript',
  'Docker',
  'AWS',
  'Git',
];

export function normalizeMentor(mentor = {}) {
  const tags = Array.isArray(mentor.mentorTechnologies) ? mentor.mentorTechnologies : [];
  const rating = Number.isFinite(Number(mentor.rating)) ? Number(mentor.rating) : null;

  return {
    id: mentor.id,
    name: mentor.name || 'Mentor',
    email: mentor.email || '',
    role: mentor.role === 'MENTOR' ? 'Mentor' : mentor.role || 'Mentor',
    tags,
    rating,
    hasRating: rating !== null && rating > 0,
    sessions: Number(mentor.sessions) || 0,
    evaluations: Number(mentor.evaluations) || 0,
    availability: mentor.availability || 'A combinar',
    channel: mentor.calendlyUrl || 'A combinar',
    calendlyUrl: mentor.calendlyUrl || '',
    format: 'Sessão individual',
    instructions: 'Envie sua principal dúvida e links do projeto antes da conversa.',
    photo: mentor.photo || '',
    socialNetwork: mentor.socialNetwork || '',
    knowledgeLevel: mentor.knowledgeLevel || '',
  };
}

export function normalizeMentorship(mentorship = {}) {
  return {
    id: mentorship.id,
    status: mentorship.status,
    rating: mentorship.rating ?? null,
    comment: mentorship.comment || '',
    message: mentorship.message || '',
    mentorId: mentorship.mentorId,
    studentId: mentorship.studentId,
    mentorName: mentorship.mentor?.name || 'Mentor',
    studentName: mentorship.student?.name || 'Aluno',
    mentorEmail: mentorship.mentor?.email || '',
    studentEmail: mentorship.student?.email || '',
    accessUrl: mentorship.accessUrl || '',
    createdAt: mentorship.createdAt,
    statusInfo: mentorshipStatus[mentorship.status] || mentorshipStatus.REQUESTED,
    canEvaluate: ['APPROVED', 'COMPLETED'].includes(mentorship.status),
    wasEvaluated: Number.isInteger(mentorship.rating),
  };
}

export const listMentors = async (technology) => {
  const { data } = await api.get('/mentors', {
    params: technology ? { technology } : undefined,
  });
  return (Array.isArray(data) ? data : []).map(normalizeMentor);
};

export const listMentorships = async () => {
  const { data } = await api.get('/mentorships');
  return (Array.isArray(data) ? data : []).map(normalizeMentorship);
};

export const createMentorship = async ({ mentorId, message }) =>
  (await api.post('/mentorships', { mentorId, message })).data;

export const updateMentorshipStatus = async (mentorshipId, status) =>
  (await api.patch(`/mentorships/${mentorshipId}/status`, { status })).data;

// Rota de compatibilidade da Sprint 4: POST /mentorias/avaliar
export const evaluateMentorship = async (mentorshipId, { rating, comment }) =>
  (await api.post('/mentorias/avaliar', { mentorshipId, rating, comment })).data;

export function getErrorMessage(error) {
  return error.response?.data?.message || error.message || 'Não foi possível concluir a operação.';
}
