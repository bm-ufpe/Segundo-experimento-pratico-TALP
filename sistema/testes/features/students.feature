Feature: Gerenciamento de Alunos
  Como professor ou coordenador
  Quero gerenciar os alunos do sistema
  Para poder associá-los a turmas e avaliações

  Background:
    Given que o sistema não possui alunos cadastrados

  Scenario: Listar alunos cadastrados
    Given que existem os seguintes alunos cadastrados:
      | nome         | cpf              | email              |
      | Maria Silva  | 111.111.111-11   | maria@ufpe.br      |
      | João Santos  | 222.222.222-22   | joao@ufpe.br       |
    When eu consultar a lista de alunos
    Then devo ver 2 alunos na listagem
    And a listagem deve conter "Maria Silva"
    And a listagem deve conter "João Santos"

  Scenario: Cadastrar um novo aluno com sucesso
    When eu cadastrar um aluno com nome "Ana Lima", CPF "333.333.333-33" e email "ana@ufpe.br"
    Then o aluno deve ser salvo com um id gerado
    And a listagem deve conter "Ana Lima"

  Scenario: Rejeitar cadastro com CPF já existente
    Given que existe um aluno com CPF "444.444.444-44"
    When eu tentar cadastrar outro aluno com o CPF "444.444.444-44"
    Then o sistema deve recusar com erro de "CPF já cadastrado"

  Scenario: Rejeitar cadastro com email inválido
    When eu tentar cadastrar um aluno com email "email-invalido"
    Then o sistema deve recusar com erro de "Email inválido"

  Scenario: Rejeitar cadastro com campos obrigatórios ausentes
    When eu tentar cadastrar um aluno sem informar o nome
    Then o sistema deve recusar com erro de "Campos obrigatórios ausentes"

  Scenario: Editar dados de um aluno existente
    Given que existe um aluno cadastrado com email "antigo@ufpe.br"
    When eu atualizar o email do aluno para "novo@ufpe.br"
    Then o aluno deve ter o email "novo@ufpe.br"
    And o aluno deve permanecer na listagem

  Scenario: Excluir um aluno cadastrado
    Given que existe um aluno cadastrado com nome "Carlos Souza"
    When eu excluir o aluno "Carlos Souza"
    Then ele não deve mais aparecer na listagem
