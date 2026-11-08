import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import ReplyCard from '../../components/forum/ReplyCard';
import VoteButton from '../../components/forum/VoteButton';
import { formatLastInteraction } from '../../utils/forum';
import * as forum from '../../services/forumService';
import { useAuthSession } from '../../hooks/useAuthSession';

const hoursSince = (date) => Math.max(0, Math.floor((Date.now() - new Date(date || Date.now()).getTime()) / 3600000));
const normalizeReply = (reply) => ({ ...reply, time: reply.createdAt, votes: reply.votes ?? 0 });
export default function Topic() {
  const { topicId: id } = useParams();
  const navigate = useNavigate();
  const { user: sessionUser, loading: sessionLoading } = useAuthSession();
  const isAdmin = sessionUser?.role === 'ADMIN';
  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { const data = await forum.getTopicDetails(id); setTopic({ ...data, tags: Array.isArray(data.tags) ? data.tags.map((x) => typeof x === 'string' ? x : x.name) : [], lastInteractionHours: hoursSince(data.lastInteractionAt || data.updatedAt || data.createdAt) }); setReplies((data.replies || []).map(normalizeReply)); }
    catch (err) { setError(forum.getErrorMessage(err)); }
    finally { setLoading(false); }
  }, [id]);
  useEffect(() => {
    const request = window.setTimeout(() => { load(); }, 0);
    return () => window.clearTimeout(request);
  }, [load]);
  useEffect(() => { forum.listForumTags().then(setAvailableTags).catch(() => {}); }, []);

  async function handleReply(e) { e.preventDefault(); const form=e.currentTarget; const content=String(new FormData(form).get('content') || '').trim(); if (!content) return; setBusy(true); setError(''); try { await forum.createReply(id, content); form.reset(); await load(); } catch(err) { setError(forum.getErrorMessage(err)); } finally { setBusy(false); } }
  async function handleUpdate(e) { e.preventDefault(); const fd=new FormData(e.currentTarget); const payload={title:String(fd.get('title')||'').trim(),content:String(fd.get('content')||'').trim(),tags:fd.getAll('tags').map(String)}; if (!payload.title || !payload.content) return; setBusy(true); try { await forum.updateTopic(id,payload); setIsEditing(false); await load(); } catch(err) { setError(forum.getErrorMessage(err)); } finally { setBusy(false); } }
  async function handleDeleteTopic() { if (!window.confirm('Excluir este tópico?')) return; setBusy(true); try { await forum.deleteTopic(id); navigate('/forum', { replace:true }); } catch(err) { setError(forum.getErrorMessage(err)); setBusy(false); } }
  async function handleDeleteReply(reply) { setBusy(true); try { await forum.deleteReply(reply.id); await load(); } catch(err) { setError(forum.getErrorMessage(err)); } finally { setBusy(false); } }
  async function handleVote(item, kind) { try { if (item.hasVoted) { if (kind==='thread') await forum.removeThreadVote(item.id); else await forum.removeReplyVote(item.id); } else if (kind==='thread') await forum.voteOnThread(item.id); else await forum.voteOnReply(item.id); await load(); } catch(err) { setError(forum.getErrorMessage(err)); } }

  if (sessionLoading || loading) return <Layout><p role="status">Validando sessão e carregando tópico…</p></Layout>;
  if (!sessionUser) return <Navigate to="/" replace />;
  if (!topic) return <Layout><Button onClick={() => navigate('/forum')}>Voltar ao fórum</Button><p role="alert">{error || 'Tópico não encontrado.'}</p></Layout>;
  const canManageTopic = isAdmin || topic.userId === sessionUser?.id;
  return <Layout>
    <header className="page-header topic-detail-header"><Button onClick={() => navigate('/forum')}>Voltar ao fórum</Button></header>
    {error && <p role="alert">{error}</p>}
    <article className="card topic-detail"><div className="topic-detail-title-row"><h1 className="page-title">{topic.title}</h1>{canManageTopic && <div className="forum-admin-actions"><Button className="btn--small" onClick={() => setIsEditing(true)}>Editar</Button><Button className="btn--small" disabled={busy} onClick={handleDeleteTopic}>Excluir tópico</Button></div>}</div><p className="topic-meta"><span>por {topic.author?.name || 'Usuário'}</span><span>•</span><span>Última interação {formatLastInteraction(topic.lastInteractionHours)}</span><span>•</span><span>{topic.repliesCount ?? replies.length} respostas</span></p><VoteButton count={topic.votes || 0} hasVoted={topic.hasVoted} inline onClick={() => handleVote(topic,'thread')} />{topic.tags.length>0 && <div className="chip-list topic-detail-tags">{topic.tags.map((tag)=><span className="chip" key={tag}>{tag}</span>)}</div>}<p className="topic-detail-content">{topic.content}</p></article>
    {canManageTopic && isEditing && <section className="card reply-form-card"><h2>Editar tópico</h2><form className="modal-form" onSubmit={handleUpdate}><div className="input-group"><label>Título</label><input name="title" defaultValue={topic.title} maxLength={100} required /></div><div className="input-group"><label>Conteúdo</label><textarea name="content" defaultValue={topic.content} rows="6" maxLength={2000} required /></div><fieldset className="tag-fieldset"><legend>Tecnologias</legend><div className="tag-options">{availableTags.map((tag)=><label className="tag-option" key={tag}><input type="checkbox" name="tags" value={tag} defaultChecked={topic.tags.includes(tag)} /><span>{tag}</span></label>)}</div></fieldset><div className="modal-actions"><Button onClick={() => setIsEditing(false)}>Cancelar</Button><Button className="btn--primary" type="submit" disabled={busy}>Salvar alterações</Button></div></form></section>}
    <section className="topic-replies-section"><h2>Respostas</h2>{replies.length===0 ? <p>Ainda não há respostas.</p> : <div className="stack">{replies.map((reply)=><ReplyCard key={reply.id} reply={reply} isAdmin={isAdmin || reply.userId === sessionUser?.id} onDelete={()=>handleDeleteReply(reply)} onUpvote={()=>handleVote(reply,'reply')} />)}</div>}</section>
    <section className="card reply-form-card"><h2>Adicionar resposta</h2><form className="modal-form" onSubmit={handleReply}><div className="input-group"><label>Resposta</label><textarea name="content" placeholder="Escreva sua contribuição..." rows="5" required /></div><div className="modal-actions"><Button className="btn--primary" type="submit" disabled={busy}>Responder</Button></div></form></section>
  </Layout>;
}
