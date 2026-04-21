Feature: Gerenciamento de Turmas

  Scenario: Criar uma turma
    When eu criar uma turma com descrição "Turma A", ano 2025 e semestre 1
    Then a turma deve ser retornada com id gerado e sem alunos

  Scenario: Adicionar aluno a uma turma
    Given que existe uma turma e um aluno cadastrados
    When eu adicionar o aluno à turma
    Then a turma deve listar o aluno

  Scenario: Impedir aluno duplicado na turma
    Given que um aluno já está em uma turma
    When eu tentar adicioná-lo novamente
    Then deve retornar erro de aluno já cadastrado

  Scenario: Remover aluno de uma turma
    Given que um aluno está em uma turma
    When eu remover o aluno da turma
    Then a turma não deve mais listar o aluno
