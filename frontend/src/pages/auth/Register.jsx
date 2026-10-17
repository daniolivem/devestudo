import { Link } from "react-router-dom";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function Register() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Criar Conta</h1>
        <p className="auth-subtitle">Preencha os dados de novo usuário</p>

        <form className="auth-form">
          <Input label="E-mail" type="email" placeholder="seu@email.com" />
          <Input label="Nome" placeholder="Nome" />
          <Input label="Telefone" placeholder="(00) 0000-0000" />
          <Input label="Senha" type="password" placeholder="••••••••" />
          <Input label="Confirmar Senha" type="password" placeholder="••••••••" />

          <Button className="btn--primary" type="submit">
            Cadastrar
          </Button>
        </form>

        <div className="auth-actions auth-actions--center">
          <Link to="/">Voltar ao login</Link>
        </div>
      </div>
    </div>
  );
}
