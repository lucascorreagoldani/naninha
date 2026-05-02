# 😴 Naninha da Momo

> Um app web fofo e personalizado para gerenciar o tempo de soninho da Momo.  
> Calcula automaticamente o horário de acordar, integra com o calendário do iOS e tem mais de um segredo escondido.

---

## 🌐 Acessar o site

O projeto está no ar e pode ser acessado de qualquer dispositivo (celular ou computador):

**[naninha.realmmc.com.br](https://naninha.realmmc.com.br)**

---

## ✨ Funcionalidades

### Modos de soninho
Escolha o nível de cansaço para calcular o horário exato de acordar:

| Opção | Duração |
|---|---|
| **Tô Soninho** | 3 horas |
| **Pouco Soninho** | 2,5 horas |
| **Só Quero Descansar** | 2 horas |

### Adicionais de cansaço
Combine modificadores para ajustar o tempo:

| Adicional | Tempo extra |
|---|---|
| Manhã difícil | +30 minutos |
| Aula muito chata | +1 hora |
| Briguei | +3 horas |

### Outros recursos
- **Integração com iOS / Calendário** — ao ativar o alarme, gera e baixa automaticamente um arquivo `.ics` para adicionar o evento nativamente no calendário do celular.
- **Modo escuro automático** — o fundo muda para tons escuros quando o alarme está ativo, poupando os olhos no escuro.
- **Som de chuva** — botão dedicado para tocar ruído branco de chuva em loop enquanto dorme.
- **Mensagens dinâmicas** — frases fofas que se alternam a cada 5 minutos com o alarme ativo.
- **Notificações nativas** — solicita permissão do navegador para disparar uma notificação quando o tempo acabar.
- **Persistência de dados** — o site lembra o estado do alarme via `localStorage`, mesmo se a página for atualizada acidentalmente.

---

## 🎁 Easter Eggs

O projeto está cheio de surpresas interativas. Tente encontrar todas:

### 1. O Título Apaixonado
Clique no texto **"Oii momo!"** no topo da tela. A mensagem muda temporariamente por 3 segundos.

### 2. Chuva de Corações
Clique **3 vezes seguidas** no emoji 😴 ao lado do título para ativar uma chuva de 30 corações caindo pela tela durante 8 segundos.

### 3. Mensagens Secretas de Amor
Durante a chuva de corações, **clique nos corações** para estourá-los. A cada **5 corações** estourados, um pop-up com uma declaração de amor surpresa aparece.

### 4. O Botão "Briguei"
Clique **3 vezes seguidas** no botão *Briguei* na área de adicionais de cansaço e veja o que o sistema acha disso.

### 5. Memória de Elefante
Calcule o horário de dormir, mas **não ative o alarme**. Atualize a página — o sistema te dá uma bronca fofa por ter esquecido de ativar!

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| [React 18](https://react.dev/) | Interface e gerenciamento de estado |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem estática |
| [Vite](https://vitejs.dev/) | Build e servidor de desenvolvimento |
| CSS3 | Animações, responsividade e variáveis de tema |
| [GitHub Pages](https://pages.github.com/) + domínio customizado | Hospedagem |

---

## 💻 Rodando localmente

### Pré-requisitos

- [Node.js](https://nodejs.org/) (v18 ou superior)
- [Git](https://git-scm.com/)

### Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/lucascorreagoldani/naninha.git

# 2. Entre na pasta do projeto
cd naninha

# 3. Instale as dependências
npm install

# 4. Suba o servidor de desenvolvimento
npm run dev
```

Abra o navegador no endereço exibido no terminal (normalmente `http://localhost:5173`).  
Edite `src/App.tsx` ou `src/App.css` e as mudanças aparecem em tempo real.

### Scripts disponíveis

| Comando | O que faz |
|---|---|
| `npm run dev` | Inicia o servidor de desenvolvimento com hot-reload |
| `npm run build` | Compila TypeScript e gera a pasta `dist/` para produção |
| `npm run preview` | Serve o build de produção localmente para testar |
| `npm run lint` | Roda o ESLint no projeto |
| `npm run deploy` | Faz build e publica no GitHub Pages via `gh-pages` |

---

## 🤝 Como contribuir

### Reportar bugs ou sugerir ideias (Issues)

1. Acesse a aba **[Issues](https://github.com/lucascorreagoldani/naninha/issues)** do repositório.
2. Clique em **New Issue**.
3. Escreva um título claro e descreva o bug ou a ideia em detalhes.
4. Adicione labels se quiser (`bug`, `enhancement`, `easter-egg`, etc).

### Enviar código (Pull Requests)

```bash
# 1. Faça um fork do projeto pelo botão no GitHub e clone o seu fork
git clone https://github.com/SEU_USUARIO/naninha.git

# 2. Crie uma branch descritiva para a sua mudança
git checkout -b feat/nova-mensagem-fofa

# 3. Faça suas alterações e commit
git add src/App.tsx
git commit -m "feat: adicionar novas mensagens de bom dia"

# 4. Envie para o seu fork
git push origin feat/nova-mensagem-fofa
```

5. Volte ao repositório original e abra um **Pull Request** descrevendo o que foi feito e por que.

### Ideias de contribuição

- Novas mensagens fofas em `cuteMessages` ou `secretLoveMessages` em [src/App.tsx](src/App.tsx)
- Novos easter eggs interativos
- Novos modos de soninho ou adicionais de cansaço
- Melhorias de acessibilidade (ARIA, contraste)
- Suporte a sons alternativos além da chuva
- Testes automatizados

---

Desenvolvido com muito amor (e TypeScript) ❤️
