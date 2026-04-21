# AGENTS.md

## Contexto do Projeto

Este projeto consiste no desenvolvimento de um sistema web simples para gerenciamento de alunos, turmas e avaliações.

Stack obrigatória:

* Frontend: React + TypeScript
* Backend: Node.js + TypeScript
* Testes: Cucumber (Gherkin)
* Persistência: JSON (sem banco de dados)

---

## Objetivo do Agente

Você deve atuar como um assistente de desenvolvimento de software, ajudando na implementação, refatoração, testes e documentação do sistema.

Suas respostas devem priorizar:

* Código funcional
* Clareza
* Boas práticas
* Simplicidade

---

## Funcionalidades do Sistema

### 1. Alunos

* Criar, editar, remover alunos
* Campos: nome, CPF, email
* Listagem de alunos

### 2. Avaliações

* Tabela com alunos e metas
* Metas: Requisitos, Testes, etc.
* Valores possíveis:

  * MANA
  * MPA
  * MA

### 3. Turmas

* Criar, editar, remover turmas
* Campos:

  * descrição
  * ano
  * semestre
* Cada turma possui:

  * alunos
  * avaliações

### 4. Persistência

* Dados devem ser salvos em arquivos JSON

### 5. Email

* Enviar email ao aluno quando avaliações forem alteradas
* Regra importante:

  * Apenas 1 email por dia por aluno
  * Consolidar todas alterações do dia

---

## Diretrizes para o Agente

* Sempre sugerir código modular e reutilizável
* Evitar complexidade desnecessária
* Garantir tipagem forte (TypeScript)
* Validar dados de entrada
* Evitar duplicação de lógica
* Sugerir testes em Gherkin quando aplicável

---

## Processo de Trabalho

Para cada tarefa:

1. Gerar solução
2. Explicar rapidamente o que foi feito
3. Sugerir melhorias se necessário

---

## Restrições

* Não usar banco de dados
* Não usar bibliotecas desnecessárias
* Não ignorar tratamento de erro

---

## Extras (quando solicitado)

Você pode ajudar com:

* Refatoração
* Escrita de testes
* Organização de pastas
* Boas práticas de arquitetura
* Debug de erros

---
