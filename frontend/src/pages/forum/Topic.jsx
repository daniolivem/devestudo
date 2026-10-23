import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import Button from '../../components/ui/Button';
import ReplyCard from '../../components/forum/ReplyCard';
import VoteButton from '../../components/forum/VoteButton';
import { formatLastInteraction } from '../../utils/forum';
import * as forum from '../../services/forumService';

const hoursSince = (date) => Math.max(0, Math.floor((Date.now() - new Date(date || Date.now()).getTime()) / 3600000));
const normalizeReply = (reply) => ({ ...reply, author: reply.author || reply.user?.name || 'Usuário', time: reply.time || reply.createdAt, votes: reply.votes ?? 0 });
export default function Topic() {
  const { topicSlug: id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const role = searchParams.get('role');
  const roleQuery = role === 'admin' || role === 'mentor' ? `?role=${role}` : '';
  let sessionUser = null;
  try { sessionUser = JSON.parse(localStorage.getItem('user') || 'null'); } catch { sessionUser = null; }
  const isAdmin = sessionUser?.role === 'ADMIN';
  const [topic, setTopic] = useState(null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [busy, setBusy] = useState(false);

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

  async function handleReply(e) { e.preventDefault(); const form=e.currentTarget; const content=String(new FormData(form).get('content') || '').trim(); if (!content) return; setBusy(true); setError(''); try { await forum.createReply(id, content); form.reset(); await load(); } catch(err) { setError(forum.getErrorMessage(err)); } finally { setBusy(false); } }
  async function handleUpdate(e) { e.preventDefault(); const fd=new FormData(e.currentTarget); const payload={title:String(fd.get('title')||'').trim(),content:String(fd.get('content')||'').trim(),tags:topic.tags}; if (!payload.title || !payload.content) return; setBusy(true); try { await forum.updateTopic(id,payload); setIsEditing(false); await load(); } catch(err) { setError(forum.getErrorMessage(err)); } finally { setBusy(false); } }
  async function handleDeleteTopic() { if (!window.confirm('Excluir este tópico?')) return; setBusy(true); try { await forum.deleteTopic(id); navigate(`/forum${roleQuery}`, { replace:true }); } catch(err) { setError(forum.getErrorMessage(err)); setBusy(false); } }
  async function handleDeleteReply(reply) { setBusy(true); try { await forum.deleteReply(reply.id); await load(); } catch(err) { setError(forum.getErrorMessage(err)); } finally { setBusy(false); } }
  async function handleVote(item, kind) { try { if (item.hasVoted) { if (kind==='thread') await forum.removeThreadVote(item.id); else await forum.removeReplyVote(item.id); } else if (kind==='thread') await forum.voteOnThread(item.id); else await forum.voteOnReply(item.id); await load(); } catch(err) { setError(forum.getErrorMessage(err)); } }

  if (loading) return <Layout><p role="status">Carregando tópico…</p></Layout>;
  if (!topic) return <Layout><Button onClick={() => navigate(`/forum${roleQuery}`)}>Voltar ao fórum</Button><p role="alert">{error || 'Tópico não encontrado.'}</p></Layout>;
  const canManageTopic = isAdmin || topic.userId === sessionUser?.id;
  return <Layout>
    <header className="page-header topic-detail-header"><Button onClick={() => navigate(`/forum${roleQuery}`)}>Voltar ao fórum</Button></header>
    {error && <p role="alert">{error}</p>}
    <article className="card topic-detail"><div className="topic-detail-title-row"><h1 className="page-title">{topic.title}</h1>{canManageTopic && <div className="forum-admin-actions"><Button className="btn--small" onClick={() => setIsEditing(true)}>Editar</Button><Button className="btn--small" disabled={busy} onClick={handleDeleteTopic}>Excluir tópico</Button></div>}</div><p className="topic-meta"><span>por {topic.author || topic.user?.name}</span><span>•</span><span>Última interação {formatLastInteraction(topic.lastInteractionHours)}</span><span>•</span><span>{replies.length} respostas</span></p><VoteButton count={topic.votes || 0} hasVoted={topic.hasVoted} inline onClick={() => handleVote(topic,'thread')} />{topic.tags.length>0 && <div className="chip-list topic-detail-tags">{topic.tags.map((tag)=><span className="chip" key={tag}>{tag}</span>)}</div>}<p className="topic-detail-content">{topic.content}</p></article>
    {canManageTopic && isEditing && <section className="card reply-form-card"><h2>Editar tópico</h2><form className="modal-form" onSubmit={handleUpdate}><div className="input-group"><label>Título</label><input name="title" defaultValue={topic.title} required /></div><div className="input-group"><label>Conteúdo</label><textarea name="content" defaultValue={topic.content} rows="6" required /></div><div className="modal-actions"><Button onClick={() => setIsEditing(false)}>Cancelar</Button><Button className="btn--primary" type="submit" disabled={busy}>Salvar alterações</Button></div></form></section>}
    <section className="topic-replies-section"><h2>Respostas</h2>{replies.length===0 ? <p>Ainda não há respostas.</p> : <div className="stack">{replies.map((reply)=><ReplyCard key={reply.id} reply={reply} isAdmin={isAdmin || reply.userId === sessionUser?.id} onDelete={()=>handleDeleteReply(reply)} onUpvote={()=>handleVote(reply,'reply')} />)}</div>}</section>
    {!isAdmin && <section className="card reply-form-card"><h2>Adicionar resposta</h2><form className="modal-form" onSubmit={handleReply}><div className="input-group"><label>Resposta</label><textarea name="content" placeholder="Escreva sua contribuição..." rows="5" required /></div><div className="modal-actions"><Button className="btn--primary" type="submit" disabled={busy}>Responder</Button></div></form></section>}
  </Layout>;
}
