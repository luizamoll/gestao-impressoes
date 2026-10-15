# Estratégias e tecnologias — Portal UNH

Atualizado em 2026-10-15. Diretriz permanente do projeto: **cada funcionalidade precisa ter uma estratégia de produto e uma justificativa técnica**, não apenas uma tela bonita. Aplicar tecnologias quando resolverem um problema real; não instalar por tendência.

## Critérios de decisão (ordem)

1. **Problema real e tarefa do usuário**: escrever a necessidade em linguagem comum ("quero conferir um PDF", não "abrir Perseus"). Colocar as ferramentas encontráveis por objetivo.
2. **Preservação dos motores existentes**: Portal UNH é uma entrada única; o módulo Gestão de Impressões permanece Java/Spring; Perseus mantém extração e exportação em Python. Integrar por rotas/serviços separados.
3. **Arquitetura da informação + navegação orientada a tarefa**: grupos como Gestão Documental, Impressões, Mural, Indicadores; pesquisa por palavras comuns e sinônimos, nunca falsa promessa de busca inteligente/IA.
4. **Design System e acessibilidade**: componentes consistentes, contraste, fontes legíveis, navegação por teclado, CSS responsivo, estados vazios/erro e mensagens acionáveis.
5. **Divulgação progressiva**: mostrar ação principal e resultado primeiro; detalhes técnicos, método de cálculo e histórico em painéis secundários.
6. **Governança de dados**: definir fonte, setor responsável, periodicidade, nível de visibilidade, prazo de retenção e auditoria. Indicador ausente não é indicador zero.
7. **Segurança por padrão**: autenticação/autorização pelo backend, limites e validação de uploads, armazenamento temporário fora da pasta pública, isolamento do processamento, expurgo de dados após período acordado.
8. **Confiabilidade e evolução**: versionamento por módulos, testes de regressão, monitoramento de falhas, logs sem dados pessoais, checklists de homologação e atualização reversível.
9. **Medição de valor**: taxa de sucesso na tarefa, tempo até encontrar ferramenta, erros de processamento, retrabalho evitado e feedback com consentimento/privacidade; não inventar métricas.

## SEO vs busca da intranet

Para a intranet interna, o que agrega valor é **busca por intenções**, com sinônimos e taxonomia: "enxugar relatório", "PDF de alunos", "conferir Perseus", "gerar planilha" devem levar à Conferência Perseus. Não precisamos otimizar o portal privado para aparecer no Google. SEO público só em páginas que devam ser públicas e autorizadas.

## Catálogo de tecnologias em avaliação

| Tecnologia | Papel útil | Decisão atual |
| --- | --- | --- |
| Java 21 + Spring Boot | Núcleo corporativo de gestão de impressões, API, autenticação futura | Manter |
| Python + pdfplumber/openpyxl | Motor de conferência e exportação Perseus | Reutilizar sem portar nem reescrever |
| PostgreSQL | Dados operacionais persistentes quando o backend e permissões estiverem preparados | Planejar, não simular integração |
| Docker / Portainer | Deploy interno modular com serviços isolados | Evolução posterior homologada pela TI |
| LDAP/AD | Identidade e autorização institucional | Aguardar definição da TI |
| **n8n** | Fluxos periféricos orientados a eventos, aprovações, avisos e integração entre APIs | **Candidato condicional**, não é motor de leitura de PDF |
| IA / busca semântica | Relevância da busca quando sinônimos determinísticos forem insuficientes | Avaliar após medir problemas reais |
| OCR | PDFs escaneados sem camada textual | Só após confirmar necessidade em arquivos reais |
| Embeds externos | Vídeos/manuais de ajuda aprovados, sem copiar mídia para o repositório | Somente conteúdo autorizado, evitando rastreamento desnecessário |

### Quando escolher n8n

Usar se um fluxo envolver 2+ serviços e eventos confiáveis, por exemplo: **conferência Perseus concluída → mensagem sem dados pessoais para equipe autorizada**, ou aprovação de publicação interna. Exigir controle de credenciais, SSL/TLS, auditoria e política de dados. Não enviar PDFs ou informações de alunos para automações externas sem análise e aprovação da TI/LGPD.

**Não adotar n8n agora:** integrar a navegação entre Portal e Perseus é mais simples e seguro sem orquestrador. Se a automação vier, ela deverá chamar APIs autorizadas; nunca receber credenciais do usuário ou depender de uma ação escondida no navegador.

## Fontes de pesquisa técnica

- Nielsen Norman Group — *Intranet Usability Guidelines* (2024): https://www.nngroup.com/articles/intranet-usability-guidelines/
- NN/g — *Intranet Portals UX Design*: https://www.nngroup.com/reports/intranet-portals-experiences-real-life-projects/
- OWASP — *File Upload Cheat Sheet*: https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html
- n8n Docs — segurança de hospedagem: https://docs.n8n.io/hosting/securing/overview/
- n8n Docs — documentação do produto: https://docs.n8n.io/

## Próxima revisão

Reavaliar escolhas após testes reais de busca, uso e processamento em Windows. Evitar mudanças decorativas que aumentem dívida técnica. Documentar o motivo de cada tecnologia adicionada.


## Nova diretriz: automações para equipes + GitHub obrigatório

Em 15/10/2026 ficou definido que as próximas automações são destinadas aos colaboradores autorizados da UNH. Todo código, documentação e script será versionado no GitHub, sem dados de alunos nem segredos. Ver docs/CENTRAL_AUTOMACOES.md.

## Uso compartilhado do Perseus: etapa concluída e dependências

A infraestrutura começou com uma API Python privada, mas sua execução permanece restrita a loopback. **Não implementar um link público, abrir portas, nem transferir chave de serviço para o navegador como atalho para multiusuário.** Necessários autenticação autorizada pelo setor de TI, gateway de backend, isolamento do processo, fila, retenção segura, auditoria e integração com a intranet. A automação n8n não substitui essas medidas.
