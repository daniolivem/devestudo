import { useCallback, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import Button from "../../components/ui/Button";
import Pagination from "../../components/ui/Pagination";
import { useAuthSession } from "../../hooks/useAuthSession";
import * as categoryService from "../../services/categoryService";

const itemsPerPage = 10;

function CategoryFormModal({ category = {}, onClose, onSubmit, error = "", loading = false }) {
  const [localError, setLocalError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLocalError("");

    const name = String(new FormData(e.currentTarget).get("name") || "").trim();

    if (!name) {
      setLocalError("Informe o nome da categoria.");
      return;
    }

    if (name.length > 100) {
      setLocalError("O nome da categoria deve ter no máximo 100 caracteres.");
      return;
    }

    setSubmitting(true);

    try {
      await onSubmit(name);
    } catch {
      // O erro da API é exibido pela página.
    } finally {
      setSubmitting(false);
    }
  }

  const isBusy = loading || submitting;

  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section
        className="card modal-card modal-card--small"
        role="dialog"
        aria-modal="true"
        aria-labelledby="category-form-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div>
            <h2 id="category-form-title">{category.id ? "Editar categoria" : "Nova categoria"}</h2>
            <p className="page-subtitle">As categorias são usadas como tags no fórum.</p>
          </div>
        </div>

        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nome *</label>
            <input
              name="name"
              defaultValue={category.name || ""}
              placeholder="Ex: Backend"
              maxLength={100}
              required
              autoFocus
            />
          </div>

          {(localError || error) && <p role="alert">{localError || error}</p>}

          <div className="modal-actions">
            <Button onClick={onClose} disabled={isBusy}>
              Cancelar
            </Button>
            <Button className="btn--primary" type="submit" disabled={isBusy}>
              {isBusy ? "Salvando..." : "Salvar"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function Categories() {
  const { user, loading: sessionLoading } = useAuthSession();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setCategories(await categoryService.listCategories());
    } catch (err) {
      setError(categoryService.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const request = window.setTimeout(() => {
      load();
    }, 0);

    return () => window.clearTimeout(request);
  }, [load]);

  async function runAction(action, successText) {
    setActionLoading(true);
    setActionError("");
    setSuccessMessage("");

    try {
      await action();
      await load();
      setSuccessMessage(successText);
      return true;
    } catch (err) {
      setActionError(categoryService.getErrorMessage(err));
      return false;
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSave(name) {
    const success = await runAction(
      () =>
        editingCategory?.id
          ? categoryService.updateCategory(editingCategory.id, name)
          : categoryService.createCategory(name),
      editingCategory?.id ? "Categoria atualizada com sucesso." : "Categoria criada com sucesso.",
    );

    if (success) {
      setEditingCategory(null);
      setCurrentPage(1);
    }
  }

  async function handleDelete(category) {
    if (!window.confirm(`Excluir a categoria "${category.name}"?`)) return;

    await runAction(
      () => categoryService.deleteCategory(category.id),
      "Categoria removida com sucesso.",
    );

    setCurrentPage((page) => Math.min(page, Math.max(1, Math.ceil((categories.length - 1) / itemsPerPage))));
  }

  if (sessionLoading) return <Layout><p role="status">Validando sessão…</p></Layout>;
  if (!user) return <Navigate to="/" replace />;
  if (user.role !== "ADMIN") return <Navigate to="/dashboard" replace />;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const visibleCategories = categories.slice(startIndex, startIndex + itemsPerPage);

  return (
    <Layout>
      <header className="page-header users-header">
        <div>
          <h1 className="page-title">Categorias do Fórum</h1>
          <p className="page-subtitle">Gerencie as tags disponíveis para os tópicos do fórum.</p>
        </div>
        <Button className="btn--primary" onClick={() => setEditingCategory({})}>
          Nova categoria
        </Button>
      </header>

      {successMessage && <p role="status">{successMessage}</p>}
      {actionError && <p role="alert">{actionError}</p>}
      {error && <p role="alert">{error}</p>}

      <section className="card users-panel">
        <div className="categories-table-head">
          <span>Categoria</span>
          <span>Ações</span>
        </div>

        {loading ? (
          <p role="status">Carregando categorias…</p>
        ) : categories.length === 0 ? (
          <p className="modal-message">Nenhuma categoria cadastrada.</p>
        ) : (
          <div className="list-divider">
            {visibleCategories.map((category) => (
              <article className="categories-table-row" key={category.id}>
                <div className="user-identity">
                  <span className="chip">{category.name}</span>
                </div>
                <div className="users-actions">
                  <Button className="btn--small" onClick={() => setEditingCategory(category)} disabled={actionLoading}>
                    Editar
                  </Button>
                  <Button className="btn--small btn--danger" onClick={() => handleDelete(category)} disabled={actionLoading}>
                    Excluir
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalItems={categories.length}
          itemsPerPage={itemsPerPage}
          itemLabel="categorias"
          onPageChange={setCurrentPage}
        />
      </section>

      {editingCategory && (
        <CategoryFormModal
          category={editingCategory}
          onClose={() => {
            setEditingCategory(null);
            setActionError("");
          }}
          onSubmit={handleSave}
          error={actionError}
          loading={actionLoading}
        />
      )}
    </Layout>
  );
}
