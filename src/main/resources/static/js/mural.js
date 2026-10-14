"use strict";

/* Protótipo interativo de mural. Regras apenas na interface; backend e autenticação pendentes. */
(() => {
  const roleSelect = document.getElementById("muralRole");
  const roleHelp = document.getElementById("muralRoleHelp");
  const composer = document.getElementById("muralPostForm");
  const composerLocked = document.getElementById("muralComposerClosed");
  const postTitle = document.getElementById("muralPostTitle");
  const postText = document.getElementById("muralPostText");
  const commentsAllowed = document.getElementById("muralCommentsAllowed");
  const feed = document.getElementById("muralFeed");
  const feedback = document.getElementById("muralFeedback");
  if (!roleSelect || !composer || !feed || !feedback) return;

  let role = "colaborador";
  let nextId = 2;
  let nextCommentId = 1;
  const openThreads = new Set();
  const replyTargets = new Map();
  let posts = [{
    id: 1,
    title: "Conheça o espaço de publicações",
    content: "Este é um conteúdo de demonstração para testar como colaboradores podem comentar, responder e marcar uma publicação como útil. Não representa um aviso oficial da instituição.",
    category: "Exemplo",
    author: "Equipe de demonstração",
    commentsAllowed: true,
    likes: new Set(),
    comments: [],
    isExample: true
  }];

  const identities = {
    responsavel: {label: "Responsável de teste", initial: "R", mayPost: true, mayComment: true},
    colaborador: {label: "Colaborador de teste", initial: "C", mayPost: false, mayComment: true},
    leitor: {label: "Leitor de teste", initial: "L", mayPost: false, mayComment: false}
  };
  // Somente demonstração. Não protege endpoints, usuários reais ou dados.
  const canPost = () => role === "responsavel";
  const canComment = () => role !== "leitor";
  const currentName = () => identities[role].label;

  // Filtro de demonstração. A moderação definitiva deve ser feita no backend.
  const forbiddenWords = ["idiota", "imbecil", "burro"];
  const normalize = text => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const invalidText = text => {
    if (/https?:\/\/|www\.|\b\S+@\S+\.\S+/i.test(text)) return "Links e endereços de e-mail estão bloqueados neste teste.";
    const clean = normalize(text);
    if (forbiddenWords.some(word => new RegExp("(^|[^a-z])" + word + "([^a-z]|$)").test(clean))) {
      return "O texto contém um termo bloqueado para demonstração.";
    }
    return "";
  };

  const el = (tag, className, content) => {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (content !== undefined) n.textContent = String(content);
    return n;
  };
  const button = (text, action, attrs={}) => {
    const b = el("button", "mural-action", text);
    b.type = "button";
    b.dataset.action = action;
    Object.entries(attrs).forEach(([k,v]) => b.dataset[k] = String(v));
    return b;
  };
  const showFeedback = (message, isError = false) => {
    feedback.textContent = message;
    feedback.style.color = isError ? "#b04436" : "#265f46";
  };

  function renderComment(comment, post) {
    if (comment.hidden) {
      const p = el("p", "mural-comment-hidden", "Comentário ocultado pela moderação (simulação).");
      const holder = el("div", "mural-comment");
      holder.appendChild(p);
      if (canPost()) holder.appendChild(button("Restaurar", "restore-comment", {post:post.id, comment:comment.id}));
      return holder;
    }
    const row = el("div", "mural-comment" + (comment.replyTo ? " mural-reply" : ""));
    row.appendChild(el("span", "mural-avatar mural-avatar-neutral", comment.author.charAt(0)));
    const content = el("div", "mural-comment-content");
    const bubble = el("div", "mural-comment-bubble");
    bubble.appendChild(el("strong", "", comment.author));
    if (comment.replyTo) bubble.appendChild(el("small", "", "Resposta a um comentário"));
    bubble.appendChild(el("p", "", comment.text));
    content.appendChild(bubble);
    const actions = el("div", "mural-comment-buttons");
    if (canComment() && post.commentsAllowed && !comment.replyTo) {
      const reply = button("Responder", "reply", {post:post.id, comment:comment.id});
      actions.appendChild(reply);
    }
    if (canPost()) actions.appendChild(button("Ocultar", "hide-comment", {post:post.id, comment:comment.id}));
    content.appendChild(actions);
    row.appendChild(content);
    return row;
  }

  function renderPost(post) {
    const card = el("article", "mural-post");
    card.dataset.postId = String(post.id);

    const header = el("div", "mural-post-header");
    header.appendChild(el("span", "mural-avatar", post.author.charAt(0)));
    const author = el("div", "mural-post-author");
    author.appendChild(el("strong", "", post.author));
    author.appendChild(el("small", "", post.isExample ? "Publicação fictícia · Exemplo" : "Criado nesta sessão de teste"));
    header.appendChild(author);
    header.appendChild(el("span", "mural-post-kind", post.isExample ? "EXEMPLO" : "TESTE"));
    card.appendChild(header);

    card.appendChild(el("h3", "", post.title));
    card.appendChild(el("p", "mural-post-body", post.content));

    const visibleComments = post.comments.filter(c => !c.hidden).length;
    const stats = el("div", "mural-post-stats");
    stats.appendChild(el("span", "", `${post.likes.size} útil${post.likes.size === 1 ? "" : "s"}`));
    stats.appendChild(el("span", "", `${visibleComments} comentário${visibleComments === 1 ? "" : "s"}`));
    card.appendChild(stats);

    const actions = el("div", "mural-post-actions");
    const liked = post.likes.has(role);
    const useful = button(liked ? "✓ Útil" : "♡ Útil", "like", {post:post.id});
    useful.disabled = !canComment();
    if (liked) useful.classList.add("is-active");
    useful.setAttribute("aria-pressed", String(liked));
    useful.title = canComment() ? "Marcar publicação como útil" : "Perfil de leitura não pode reagir";
    actions.appendChild(useful);
    if (post.commentsAllowed) {
      const comment = button("▤ Comentários", "thread", {post:post.id});
      if (openThreads.has(post.id)) comment.classList.add("is-active");
      comment.setAttribute("aria-expanded", String(openThreads.has(post.id)));
      actions.appendChild(comment);
    } else {
      const off = button("🔒 Comentários fechados", "thread", {post:post.id});
      off.disabled = true;
      actions.appendChild(off);
    }
    card.appendChild(actions);

    if (canPost()) {
      const mod = el("div", "mural-mod-tools");
      mod.appendChild(button(post.commentsAllowed ? "Desativar comentários" : "Permitir comentários",
        "toggle-comments", {post:post.id}));
      if (!post.isExample) mod.appendChild(button("Excluir publicação", "remove-post", {post:post.id}));
      card.appendChild(mod);
    }

    if (!post.commentsAllowed) {
      card.appendChild(el("div", "mural-comments-blocked", "🔒 Os comentários estão desativados nesta publicação."));
    } else if (openThreads.has(post.id)) {
      const thread = el("div", "mural-thread");
      if (post.comments.length === 0) thread.appendChild(el("p", "mural-feed-empty", "Ainda não há comentários."));

      // Exibe as respostas diretamente após o comentário original.
      post.comments.filter(c => !c.replyTo).forEach(parent => {
        thread.appendChild(renderComment(parent, post));
        post.comments.filter(c => c.replyTo === parent.id).forEach(reply => thread.appendChild(renderComment(reply, post)));
      });

      if (canComment()) {
        const replyId = replyTargets.get(post.id);
        const form = el("form", "mural-comment-form");
        form.dataset.post = String(post.id);
        if (replyId) {
          const note = el("div", "mural-reply-note");
          note.appendChild(el("span", "", "Respondendo a um comentário"));
          const cancel = button("Cancelar", "cancel-reply", {post:post.id});
          note.appendChild(cancel);
          form.appendChild(note);
        }
        const label = el("label", "", replyId ? "Sua resposta" : "Seu comentário");
        const textareaId = "mural-comment-" + post.id;
        label.htmlFor = textareaId;
        form.appendChild(label);
        const field = el("textarea");
        field.id = textareaId;
        field.name = "text";
        field.required = true;
        field.maxLength = 350;
        field.rows = 2;
        field.placeholder = "Escreva com respeito e objetividade…";
        form.appendChild(field);
        const footer = el("div", "mural-comment-form-footer");
        footer.appendChild(el("small", "", "Sem links e termos ofensivos"));
        const send = el("button", "mural-publish", replyId ? "Enviar resposta" : "Comentar");
        send.type = "submit";
        footer.appendChild(send);
        form.appendChild(footer);
        thread.appendChild(form);
      } else {
        thread.appendChild(el("p", "mural-comments-blocked", "Este perfil pode apenas visualizar os comentários."));
      }
      card.appendChild(thread);
    }

    return card;
  }

  function render() {
    composer.hidden = !canPost();
    composerLocked.hidden = canPost();
    roleHelp.textContent = canPost()
      ? "Pode publicar, comentar e moderar. Todas as ações são simuladas."
      : canComment()
        ? "Pode comentar e reagir apenas quando a publicação permitir."
        : "Pode visualizar publicações, sem comentar ou reagir.";

    feed.replaceChildren();
    if (!posts.length) {
      feed.appendChild(el("p", "mural-feed-empty", "Nenhuma publicação no protótipo."));
      return;
    }
    posts.forEach(post => feed.appendChild(renderPost(post)));
  }

  roleSelect.addEventListener("change", () => {
    if (!identities[roleSelect.value]) return;
    role = roleSelect.value;
    replyTargets.clear();
    showFeedback("Perfil de " + currentName().toLowerCase() + " selecionado para teste.");
    render();
  });

  composer.addEventListener("submit", event => {
    event.preventDefault();
    if (!canPost()) return showFeedback("Somente responsáveis autorizados podem publicar.", true);
    const title = postTitle.value.trim(), content = postText.value.trim();
    if (title.length < 4 || content.length < 8) return showFeedback("Preencha o título e uma mensagem com pelo menos 8 caracteres.", true);
    const block = invalidText(title + " " + content);
    if (block) return showFeedback(block, true);
    posts.unshift({
      id:nextId++, title,content, category:"Comunicado",author:currentName(),
      commentsAllowed:commentsAllowed.checked,likes:new Set(),comments:[],isExample:false
    });
    composer.reset();
    openThreads.clear();
    showFeedback("Publicação criada nesta demonstração. Não foi enviada a nenhum servidor.");
    render();
  });

  feed.addEventListener("click", event => {
    const control = event.target.closest("button[data-action]");
    if (!control || !feed.contains(control)) return;
    const post = posts.find(p => p.id === Number(control.dataset.post));
    if (!post) return;

    switch (control.dataset.action) {
      case "like":
        if (!canComment()) return showFeedback("Este perfil não pode reagir.", true);
        if (post.likes.has(role)) post.likes.delete(role); else post.likes.add(role);
        showFeedback("Reação registrada somente nesta sessão de teste.");
        break;
      case "thread":
        if (!post.commentsAllowed) return;
        if (openThreads.has(post.id)) openThreads.delete(post.id);
        else openThreads.add(post.id);
        break;
      case "reply":
        if (!canComment() || !post.commentsAllowed) return;
        replyTargets.set(post.id,Number(control.dataset.comment));
        openThreads.add(post.id);
        break;
      case "cancel-reply":
        replyTargets.delete(post.id);
        break;
      case "toggle-comments":
        if (!canPost()) return showFeedback("Ação exclusiva do responsável autorizado.", true);
        post.commentsAllowed = !post.commentsAllowed;
        if (!post.commentsAllowed) {openThreads.delete(post.id);replyTargets.delete(post.id);}
        showFeedback(post.commentsAllowed ? "Comentários habilitados na demonstração." : "Comentários bloqueados na demonstração.");
        break;
      case "hide-comment":
      case "restore-comment": {
        if (!canPost()) return showFeedback("Moderação exclusiva do responsável autorizado.", true);
        const comment = post.comments.find(c => c.id === Number(control.dataset.comment));
        if (!comment) return;
        comment.hidden = control.dataset.action === "hide-comment";
        showFeedback(comment.hidden ? "Comentário ocultado neste teste." : "Comentário restaurado neste teste.");
        break;
      }
      case "remove-post":
        if (!canPost() || post.isExample) return;
        if (!window.confirm("Excluir esta publicação apenas da demonstração?")) return;
        posts = posts.filter(p=>p.id!==post.id);
        showFeedback("Publicação removida da demonstração.");
        break;
      default: return;
    }
    render();
    if (["reply", "cancel-reply"].includes(control.dataset.action)) {
      feed.querySelector(`[data-post-id="${post.id}"] textarea`)?.focus();
    }
  });

  feed.addEventListener("submit", event => {
    const form = event.target.closest("form.mural-comment-form");
    if (!form) return;
    event.preventDefault();
    const post = posts.find(p => p.id === Number(form.dataset.post));
    if (!post) return;
    if (!canComment() || !post.commentsAllowed) return showFeedback("Comentários não permitidos para este perfil ou publicação.", true);
    const field = form.querySelector("textarea");
    const text = field?.value.trim() || "";
    if (text.length < 3 || text.length > 350) return showFeedback("O comentário deve ter de 3 a 350 caracteres.", true);
    const block = invalidText(text);
    if (block) return showFeedback(block, true);
    if (post.comments.some(c => c.author === currentName() && normalize(c.text) === normalize(text))) {
      return showFeedback("Comentário repetido bloqueado na demonstração.", true);
    }
    post.comments.push({id:nextCommentId++,text,author:currentName(),replyTo:replyTargets.get(post.id)||null,hidden:false});
    replyTargets.delete(post.id);
    openThreads.add(post.id);
    showFeedback("Comentário registrado apenas nesta demonstração.");
    render();
  });

  render();
})();
