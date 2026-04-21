Feature: Gerenciamento de Alunos

  Scenario: Criar um aluno com dados válidos
    Given que não existe aluno com CPF "123.456.789-00"
    When eu criar um aluno com nome "Maria Silva", CPF "123.456.789-00" e email "maria@example.com"
    Then o aluno deve ser retornado com um id gerado
    And a lista de alunos deve conter "Maria Silva"

  Scenario: Rejeitar CPF duplicado
    Given que já existe um aluno com CPF "111.222.333-44"
    When eu tentar criar outro aluno com CPF "111.222.333-44"
    Then deve retornar erro de CPF duplicado

  Scenario: Editar um aluno existente
    Given que existe um aluno cadastrado
    When eu atualizar o email do aluno
    Then o aluno deve ter o novo email

  Scenario: Remover um aluno
    Given que existe um aluno cadastrado
    When eu excluir o aluno
    Then ele não deve aparecer na listagem
