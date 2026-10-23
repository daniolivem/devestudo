import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import Pagination from '../../components/ui/Pagination';
import TopicCard from '../../components/forum/TopicCard';
import TopicFormModal from '../../components/forum/TopicFormModal';
import { useForumTopics } from '../../hooks/useForumTopics';
import { forumTags, getErrorMessage, listForumTags } from '../../services/forumService';
import { createTopicSlug } from '../../utils/forum';

const itemsPerPage = 10;
const displayTags = (tags) => (Array.isArray(tags) ? tags : []).map((tag) => typeof tag === 'string' ? tag : tag.name);
const interactionHours = (value) => Math.max(0, Math.floor((Date.now() - new Date(value || Date.now()).getTime()) / 3600000));

export default function Forum() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');
  let sessionUser = null;
  try { sessionUser = JSON.parse(localStorage.getItem('user') || 'null'); } catch { sessionUser = null; }
  const isAdmin = sessionUser?.role === 'ADMIN';
  const isMentor = sessionUser?.role === 'MENTOR';
  const roleQuery = isAdmin || isMentor ? `?role=${role}` : '';
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [tags, setTags] = useState(forumTags);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [topicBeingEdited, setTopicBeingEdited] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const { topics, total, loading, error, createTopic, updateTopic, deleteTopic, upvoteTopic } = useForumTopics({ search, tag, page: currentPage, limit: itemsPerPage });
  const [actionError, setActionError] = useState('');

  useEffect(() => { listForumTags().then(setTags).catch(() => {}); }, []);
  async function handleCreate(payload) {
    try { const created = await createTopic(payload); setIsModalOpen(false); navigate(`/forum/${created.id || createTopicSlug(created.title)}${roleQuery}`); }
    catch (err) { setActionError(getErrorMessage(err)); }
  }
  async function handleUpdate(payload) {
    try { await updateTopic(topicBeingEdited.id, payload); setTopicBeingEdited(null); }
    catch (err) { setActionError(getErrorMessage(err)); }
  }
  async function handleDelete(id) {
    try { await deleteTopic(id); setCurrentPage((p) => Math.min(p, Math.max(1, Math.ceil((total - 1) / itemsPerPage)))); }
    catch (err) { setActionError(getErrorMessage(err)); }
  }
  function openTopic(topic) { navigate(`/forum/${topic.id || createTopicSlug(topic.title)}${roleQuery}`); }

  return <Layout>
    <header className="page-header forum-header"><div><h1 className="page-title">{isAdmin ? 'Moderação de Fórum' : 'Fórum Temático'}</h1><p className="page-subtitle">{isAdmin ? 'Gerencie tópicos, conteúdos e respostas da comunidade' : isMentor ? 'Crie tópicos e participe das discussões da comunidade' : 'Compartilhe dúvidas e discussões com a comunidade'}</p></div><Button className="btn--primary" onClick={() => setIsModalOpen(true)}>Criar novo fórum</Button></header>
    <input className="field-input forum-search" value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} placeholder="Buscar por título ou palavra-chave..." aria-label="Buscar tópicos" />
    <div className="chip-list" style={{ marginBottom: 24 }}><Button className={`btn--small ${!tag ? 'btn--primary' : ''}`} onClick={() => { setTag(''); setCurrentPage(1); }}>Todas</Button>{tags.map((item) => <Button className={`btn--small ${tag === item ? 'btn--primary' : ''}`} key={item} onClick={() => { setTag(tag === item ? '' : item); setCurrentPage(1); }}>{item}</Button>)}</div>
    {actionError && <p role="alert">{actionError}</p>}{error && <p role="alert">{error}</p>}
    {loading ? <p role="status">Carregando tópicos…</p> : topics.length === 0 ? <p>Nenhum tópico encontrado.</p> : <div className="stack">{topics.map((topic) => <TopicCard key={topic.id} topic={{ ...topic, tags: displayTags(topic.tags), lastInteractionHours: interactionHours(topic.lastInteractionAt || topic.updatedAt || topic.createdAt), replies: topic.repliesCount ?? topic.replies, canManage: topic.userId === sessionUser?.id }} isAdmin={isAdmin} isMentor={isMentor} onOpen={openTopic} onEdit={setTopicBeingEdited} onDelete={handleDelete} onUpvote={async (id) => { try { await upvoteTopic(id); } catch (err) { setActionError(getErrorMessage(err)); } }} />)}</div>}
    <Pagination currentPage={currentPage} totalItems={total} itemsPerPage={itemsPerPage} itemLabel="tópicos" onPageChange={setCurrentPage} />
    {isModalOpen && <TopicFormModal title="Criar novo fórum" subtitle="Informe os dados iniciais do tópico" submitLabel="Criar fórum" tags={tags} onClose={() => setIsModalOpen(false)} onSubmit={handleCreate} />}
    {topicBeingEdited && <TopicFormModal title="Editar fórum" subtitle="Atualize título, conteúdo e tecnologias do tópico" submitLabel="Salvar alterações" tags={tags} initialTopic={{ ...topicBeingEdited, tags: displayTags(topicBeingEdited.tags) }} onClose={() => setTopicBeingEdited(null)} onSubmit={handleUpdate} />}
  </Layout>;
}
