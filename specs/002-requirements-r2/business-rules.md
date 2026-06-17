# Documento de Regras de Negócio (Business Rules)
**Caminho:** `specs/002-requirements-r2/business-rules.md`
**Contexto:** Release 2 (Persistência, CRUD de Usuários e Agente de IA NLP)

Este documento define as regras de negócio essenciais que guiarão a implementação da Release 2. Estas regras garantem que o "Score de Qualidade Legislativa" seja calculado e armazenado de forma consistente, segura e alinhada aos objetivos do produto.

---

## 1. Regras de Autoria e Propriedade (Ownership)
Esta seção estabelece as permissões e o controle sobre os textos submetidos e as análises geradas.

* **Vinculação de Conta:** Apenas usuários autenticados (com perfil cadastrado) podem salvar o histórico de submissões. Usuários não logados podem realizar análises em uma cota limitada (ex: 3 análises por IP/dia), mas estas não serão persistidas em nenhum histórico.
* **Isolamento de Dados (Tenant-level):** Um usuário só pode visualizar, editar ou excluir leis e análises que ele mesmo submeteu. O acesso aos registros de outros usuários é estritamente proibido, garantindo a privacidade das pautas em estudo.
* **Edição de Perfil:** O usuário tem propriedade total sobre seus dados cadastrais (CRUD de perfil), podendo atualizar suas informações ou solicitar a exclusão de sua conta a qualquer momento.

## 2. Regras de Validação de Entrada
Para garantir a estabilidade do sistema e evitar custos excessivos ou falhas no processamento do Agente de IA, as entradas devem obedecer a critérios estritos antes de serem enviadas ao back-end.

* **Formatos Aceitos (R2):** O sistema aceitará apenas texto plano (`text/plain`) via campo de submissão (copy/paste). (Upload de PDF/Docx está restrito ao Roadmap futuro).
* **Limites de Caracteres:**
    * **Mínimo:** 300 caracteres. Textos menores não possuem contexto suficiente para uma análise estatística e semântica confiável pelo NLP.
    * **Máximo:** 50.000 caracteres por submissão. Textos que excederem esse limite devem retornar um erro de validação sugerindo o fracionamento da lei, evitando *timeouts* e limites de *tokens* na janela de contexto da IA.
* **Idioma:** O sistema validará e processará exclusivamente textos em Português do Brasil (PT-BR).

## 3. Regras de Scoring e Avaliação (Agente de IA)
O cálculo do "Score de Qualidade Legislativa" (escala de 0 a 100) deve ser determinístico a partir dos dados retornados pelo agente de inteligência artificial.

* **Pesos dos Critérios de Avaliação:**
    * **Clareza Textual e Legibilidade (40%):** Baseado em métricas como o Índice de Flesch-Kincaid adaptado para o português.
    * **Ambiguidade e Contradição (30%):** Penalização baseada na quantidade de trechos identificados pelo agente de IA com múltiplos sentidos ou falhas lógicas.
    * **Tamanho e Complexidade Estrutural (15%):** Avaliação da extensão de parágrafos e incisos.
    * **Uso de Referências (15%):** Verificação da formatação e coerência das citações legais.
* **Limites de Aceitação (Faixas de Score):**
    * **0 a 49 (Crítico):** Alta complexidade ou forte ambiguidade. Necessita reescrita severa.
    * **50 a 74 (Atenção):** Leitura moderadamente difícil. Requer ajustes em trechos específicos (destacados via *highlights*).
    * **75 a 100 (Adequado):** Alta clareza textual e aderência aos padrões legislativos.
* **Retorno Estruturado:** O Agente de IA está estritamente proibido de retornar texto livre para a interface. Todas as detecções de erro devem ser mapeadas em formato JSON, contendo a string original, a justificativa da ambiguidade e a posição (índice) para a renderização dos *highlights* no Front-end.

## 4. Regras de Retenção de Dados (Data Retention)
Políticas de ciclo de vida das análises e gestão do banco de dados (Prisma ORM).

* **Retenção de Histórico:** As análises salvas no perfil de um usuário ativo serão retidas por tempo indeterminado, até que o próprio usuário as exclua.
* **Direito ao Esquecimento:** Caso um usuário delete sua conta (CRUD de perfil), todos os textos submetidos, scores gerados e dados pessoais atrelados ao seu ID devem ser excluídos em cascata (Hard Delete) de todos os bancos de dados em um prazo máximo de 72 horas.
* **Logs de Inferência (Testes e Mitigação de Alucinação):** Para fins de evolução do motor de IA e validação do TDD, metadados genéricos de submissões (tamanho do texto, tempo de resposta, score gerado) poderão ser mantidos por até 90 dias em formato totalmente anonimizado.

## 5. Regras de Privacidade e Segurança
Requisitos de proteção para o tráfego e armazenamento das proposições legislativas em análise.

* **Criptografia de Senhas:** Todas as senhas de usuários devem ser obrigatoriamente hasheadas (ex: bcrypt ou Argon2) antes de serem salvas via Prisma no banco de dados. Senhas em texto plano são estritamente proibidas.
* **Privacidade no Processamento NLP:** É expressamente proibido o uso dos textos inseridos pelos usuários para o treinamento contínuo de modelos de fundação públicos (LLMs externos). O provedor do agente de IA deve garantir que os dados de inferência sejam efêmeros (Zero Data Retention API).
* **Proteção de Rotas:** Todos os endpoints do FastAPI relacionados ao CRUD de perfil e submissão de textos devem estar protegidos por tokens de autorização (ex: JWT) com tempo de expiração curto.

---

**Rastreabilidade:**
* **RFs Vinculados:** Submissão de leis, Dashboard de métricas, Autenticação, CRUD de perfil.
* **RNFs Vinculados:** Segurança (JWT, bcrypt), Desempenho (limite de caracteres), Confiabilidade (mitigação de alucinação de IA via testes).