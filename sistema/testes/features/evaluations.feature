Feature: Avaliações de Alunos

  Scenario: Registrar avaliação de um aluno em uma turma
    Given que existe uma turma com um aluno
    When eu registrar avaliação "Requisitos" com valor "MA" para o aluno
    Then a avaliação deve aparecer na listagem da turma

  Scenario: Atualizar avaliação existente
    Given que o aluno tem avaliação "Testes" com valor "MPA"
    When eu atualizar a avaliação "Testes" para "MA"
    Then a avaliação deve ter o novo valor "MA"

  Scenario: Registrar múltiplas metas para o mesmo aluno
    Given que existe uma turma com um aluno
    When eu registrar "Requisitos" como "MA" e "Testes" como "MPA"
    Then a turma deve ter 2 avaliações para o aluno
