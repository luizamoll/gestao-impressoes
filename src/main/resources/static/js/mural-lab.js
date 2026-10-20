"use strict";
(() => {
 const $ = id => document.getElementById(id);
 const feed = $("feed"), info = $("feedback"), composer = $("composer"), currentRole = $("currentRole");
 const form = $("loginForm");
 let authorization = null, activeRole = null;
 const API = "/api/laboratorio/mural/posts";
 const me = () => activeRole === "responsavel-lab";
 const canComment = () => me() || activeRole === "colaborador-lab";
 const mk = (tag, content, css) => { const e = document.createElement(tag); if (content !== undefined) e.textContent = String(content); if (css) e.className=css; return e; };
 const btn = (caption, onClick, cls="secondary") => {
   const b=mk("button",caption,cls);b.type="button";b.addEventListener("click",onClick);return b;
 };
 const notice=(text,error=false)=>{info.textContent=text;info.setAttribute("role",error?"alert":"status");};
 function authHeader(user,password) {
   const data=new TextEncoder().encode(user+":"+password);
   return "Basic "+btoa(Array.from(data, b=>String.fromCharCode(b)).join(""));
 }
 async function request(path="",method="GET",body=null) {
   if (!authorization) throw Error("Entre com credenciais de laboratório.");
   const res=await fetch(API+path,{method,cache:"no-store",credentials:"omit",
     headers:{"Authorization":authorization,"Accept":"application/json",...(body!==null?{"Content-Type":"application/json"}:{})},
     body:body!==null?JSON.stringify(body):undefined});
   if(!res.ok) throw Error(res.status===401?"Usuário ou senha incorretos.":res.status===403?"Seu perfil não permite essa operação.":res.status===409?"Operação incompatível com o estado atual.":"Não foi possível executar a operação (HTTP "+res.status+").");
   return res.status===204?null:res.json();
 }
 const safe=fn=>async (...args)=>{ try{await fn(...args);}catch(e){notice(e.message,true);} };
 const refresh=safe(async()=>{const data=await request();render(data);notice("Publicações atualizadas.");});
 function commentBox(post,comment) {
   const el=mk("div",undefined,"comment");
   el.append(mk("small",comment.author+" · "+new Date(comment.createdAt).toLocaleString("pt-BR"),"meta"));
   el.append(mk("p",comment.hidden?"Comentário ocultado pela moderação.":comment.text));
   if(me())el.append(btn(comment.hidden?"Restaurar":"Ocultar",safe(async()=>{
      await request("/"+post.id+"/comments/"+comment.id+"/hidden","PATCH",{hidden:!comment.hidden});await refresh();
   })));
   return el;
 }
 function card(post) {
   const article=mk("article");
   const meta=mk("div",post.author+" · "+new Date(post.createdAt).toLocaleString("pt-BR"),"meta");article.append(meta);
   article.append(mk("h3",post.title),mk("p",post.content));
   article.append(mk("p",post.commentsAllowed?"Comentários permitidos":"Comentários encerrados","meta"));
   const actions=mk("div",undefined,"inline");
   if(me()){
     actions.append(
       btn(post.commentsAllowed?"Fechar comentários":"Abrir comentários",safe(async()=>{
         await request("/"+post.id+"/comments-open","PATCH",{allowed:!post.commentsAllowed});await refresh();
       })),
       btn("Excluir publicação",safe(async()=>{
         if(!window.confirm("Excluir esta publicação do laboratório?"))return;
         await request("/"+post.id,"DELETE");await refresh();
       }),"danger")
     );
   }
   article.append(actions);
   for(const c of post.comments)article.append(commentBox(post,c));
   if(canComment()&&post.commentsAllowed){
     const form=mk("form");form.style.marginTop="14px";
     const input=mk("textarea");input.required=true;input.maxLength=350;input.minLength=3;input.rows=2;input.placeholder="Comentar com informação fictícia...";
     const submit=mk("button","Enviar comentário");submit.type="submit";
     form.append(input,submit);form.addEventListener("submit",safe(async ev=>{
       ev.preventDefault();await request("/"+post.id+"/comments","POST",{text:input.value});await refresh();
     }));article.append(form);
   }
   return article;
 }
 function render(posts) {feed.replaceChildren();if(!posts.length){feed.append(mk("p","Nenhuma publicação ainda."));return;}posts.forEach(p=>feed.append(card(p)));}
 form.addEventListener("submit",safe(async ev=>{
    ev.preventDefault();
    const user=$("role").value,pass=$("password").value;
    authorization=authHeader(user,pass);$("password").value="";activeRole=user;
    try{const posts=await request();currentRole.textContent="Conectado: "+user;currentRole.hidden=false;composer.hidden=!me();$("logout").hidden=false;render(posts);notice("Conectado ao laboratório.")}
    catch(err){authorization=null;activeRole=null;throw err;}
 }));
 $("postForm").addEventListener("submit",safe(async ev=>{
   ev.preventDefault();await request("","POST",{title:$("postTitle").value,content:$("postBody").value,commentsAllowed:$("openComments").checked});
   ev.target.reset();await refresh();
 }));
 $("refresh").addEventListener("click",refresh);
 $("logout").addEventListener("click",()=>{
   authorization=null;activeRole=null;composer.hidden=true;currentRole.hidden=true;$("logout").hidden=true;
   feed.replaceChildren(mk("p","Acesso encerrado."));notice("Credenciais descartadas da memória da página.");
 });
})();
