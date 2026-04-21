Feature: Notificações por Email de Avaliações

  Scenario: Email enviado ao registrar a primeira avaliação do dia
    Given que existe uma turma com um aluno matriculado para email
    When eu registrar avaliação "Requisitos" com valor "MA" nessa turma
    Then o aluno deve ter o email marcado como enviado hoje

  Scenario: Segunda avaliação do dia acumula sem disparar novo envio
    Given que existe uma turma com um aluno matriculado para email
    And que o aluno já recebeu email hoje
    When eu registrar avaliação "Testes" com valor "MPA" nessa turma
    Then o log deve acumular 1 mudança pendente para o aluno

  Scenario: Avaliações de múltiplas turmas acumulam no mesmo registro diário
    Given que o aluno está matriculado em duas turmas para email
    And que o aluno já recebeu email hoje
    When eu registrar avaliação na primeira turma de email
    And eu registrar avaliação na segunda turma de email
    Then o aluno deve ter 2 mudanças pendentes de turmas diferentes
