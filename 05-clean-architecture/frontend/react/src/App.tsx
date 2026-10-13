import { useState } from 'react'
import './App.css'

function App() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [document, setDocument] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  async function signup() {
    const input = {
      name,
      email,
      document,
      password
    }
    const responseSignup = await fetch("http://localhost:3000/signup", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify(input)
    });
    const outputSignup = await responseSignup.json();
    if (outputSignup.accountId)
      setMessage("Conta criada com sucesso! ID da conta: ${outputSignup.accountId}");
    else
      setMessage("Erro ao criar conta: ${outputSignup.error}");
  }

  return (
    <>
      <div className="App">
        <h1>Automação de Testes</h1>

        <input className="input-name" onChange={(e) => setName(e.target.value)} placeholder="Digite seu nome" />
        <input className="input-email" onChange={(e) => setEmail(e.target.value)} placeholder="Digite seu email" />
        <input className="input-document" onChange={(e) => setDocument(e.target.value)} placeholder="Digite seu cpf" />
        <input className="input-password" onChange={(e) => setPassword(e.target.value)} placeholder="Digite sua senha" />
        <button className="button-signup" onClick={() => signup()}>Criar Conta</button>
        {message && <span className="message">{message}</span>}
      </div>
    </>
  )
}

export default App
