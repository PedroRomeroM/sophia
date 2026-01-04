begin;

-- Trail
insert into trails (id, slug, title, objective, order_index, is_published)
values (
  '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f001',
  'sao-tomas-de-aquino',
  'Sao Tomas de Aquino',
  'Caminho progressivo pelos fundamentos da filosofia ate Sao Tomas de Aquino.',
  1,
  true
)
on conflict (id) do nothing;

insert into trail_translations (trail_id, locale, title, objective)
values (
  '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f001',
  'pt-BR',
  'Sao Tomas de Aquino',
  'Caminho progressivo pelos fundamentos da filosofia ate Sao Tomas de Aquino.'
)
on conflict (trail_id, locale) do nothing;

-- Blocks (2 free + 1 paid)
insert into blocks (id, trail_id, title, description, order_index, is_free, is_published)
values
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f101',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f001',
    'Socrates',
    'Metodo socratico, etica e formacao do pensamento critico.',
    1,
    true,
    true
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f102',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f001',
    'Platao',
    'Teoria das Ideias, alegoria da caverna e vida politica.',
    2,
    true,
    true
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f103',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f001',
    'Aristoteles',
    'Logica, metafisica e etica das finalidades.',
    3,
    false,
    true
  )
on conflict (id) do nothing;

insert into block_translations (block_id, locale, title, description)
values
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f101',
    'pt-BR',
    'Socrates',
    'Metodo socratico, etica e formacao do pensamento critico.'
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f102',
    'pt-BR',
    'Platao',
    'Teoria das Ideias, alegoria da caverna e vida politica.'
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f103',
    'pt-BR',
    'Aristoteles',
    'Logica, metafisica e etica das finalidades.'
  )
on conflict (block_id, locale) do nothing;

-- Phases
insert into phases (id, block_id, title, description, order_index, is_published)
values
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f201',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f101',
    'Contexto e metodo',
    'Introducao ao metodo socratico e ao dialogo filosofico.',
    1,
    true
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f202',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f101',
    'Virtude e conhecimento',
    'A relacao entre saber e vida etica.',
    2,
    true
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f203',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f102',
    'Mundo sensivel e Ideias',
    'A base da teoria das Ideias e seus exemplos.',
    1,
    true
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f204',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f102',
    'Alma e polis',
    'A estrutura da alma e a organizacao politica.',
    2,
    true
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f205',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f103',
    'Logica e categorias',
    'Fundamentos da logica e da classificacao do ser.',
    1,
    true
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f206',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f103',
    'Ato e potencia',
    'Explicacao da mudanca e das causas.',
    2,
    true
  )
on conflict (id) do nothing;

insert into phase_translations (phase_id, locale, title, description)
values
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f201',
    'pt-BR',
    'Contexto e metodo',
    'Introducao ao metodo socratico e ao dialogo filosofico.'
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f202',
    'pt-BR',
    'Virtude e conhecimento',
    'A relacao entre saber e vida etica.'
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f203',
    'pt-BR',
    'Mundo sensivel e Ideias',
    'A base da teoria das Ideias e seus exemplos.'
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f204',
    'pt-BR',
    'Alma e polis',
    'A estrutura da alma e a organizacao politica.'
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f205',
    'pt-BR',
    'Logica e categorias',
    'Fundamentos da logica e da classificacao do ser.'
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f206',
    'pt-BR',
    'Ato e potencia',
    'Explicacao da mudanca e das causas.'
  )
on conflict (phase_id, locale) do nothing;

-- Challenges
insert into challenges (id, phase_id, type, payload, order_index, is_final, is_published)
values
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f301',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f201',
    'quiz',
    $${
      "prompt": "Qual e a ideia central do metodo socratico?",
      "choices": ["Argumento de autoridade", "Dialogo e refutacao", "Memorizacao", "Meditacao silenciosa"],
      "answer_index": 1,
      "explanation": "Socrates usa dialogo e refutacao para revelar inconsistencias."
    }$$::jsonb,
    1,
    false,
    true
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f302',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f201',
    'true_false',
    $${
      "prompt": "Para Socrates, admitir a ignorancia e o inicio da busca pela verdade.",
      "answer": true,
      "explanation": "Reconhecer limites abre caminho para investigar."
    }$$::jsonb,
    2,
    false,
    true
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f303',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f202',
    'match',
    $${
      "prompt": "Relacione termo e significado.",
      "pairs": [
        {"left": "Maieutica", "right": "Arte de ajudar a nascer ideias"},
        {"left": "Ironia", "right": "Refutacao para expor contradicoes"},
        {"left": "Dialogo", "right": "Busca conjunta da verdade"}
      ]
    }$$::jsonb,
    1,
    false,
    true
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f304',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f202',
    'quiz',
    $${
      "prompt": "Para Socrates, a virtude se aprende?",
      "choices": ["Nao, e inata", "Sim, e ligada ao conhecimento", "Depende da classe social", "Somente pela religiao"],
      "answer_index": 1,
      "explanation": "Socrates associa virtude ao saber."
    }$$::jsonb,
    2,
    false,
    true
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f305',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f202',
    'quiz',
    $${
      "prompt": "Qual a relacao entre virtude e conhecimento em Socrates?",
      "choices": ["Sao coisas separadas", "Virtude e conhecimento sao equivalentes", "Virtude e opiniao", "Virtude depende de sorte"],
      "answer_index": 1,
      "min_score": 80,
      "explanation": "Agir bem depende de conhecer o bem."
    }$$::jsonb,
    3,
    true,
    true
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f306',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f203',
    'true_false',
    $${
      "prompt": "Para Platao, o mundo sensivel e copia imperfeita do mundo das Ideias.",
      "answer": true,
      "explanation": "O sensivel participa das Ideias, mas nao as esgota."
    }$$::jsonb,
    1,
    false,
    true
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f307',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f203',
    'quiz',
    $${
      "prompt": "A alegoria da caverna trata de:",
      "choices": ["Tecnicas de guerra", "Conhecimento e passagem das sombras para a verdade", "Origem da matematica", "Astronomia pratica"],
      "answer_index": 1,
      "explanation": "Mostra a passagem do engano ao conhecimento."
    }$$::jsonb,
    2,
    false,
    true
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f308',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f204',
    'match',
    $${
      "prompt": "Relacione conceito e definicao.",
      "pairs": [
        {"left": "Ideia", "right": "Realidade imutavel e inteligivel"},
        {"left": "Sensivel", "right": "Mundo de mudanca e opiniao"},
        {"left": "Dialetica", "right": "Caminho racional para o conhecimento"}
      ]
    }$$::jsonb,
    1,
    false,
    true
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f309',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f204',
    'quiz',
    $${
      "prompt": "Na Republica, quem deve governar?",
      "choices": ["Mercadores", "Guerreiros", "Filosofos", "Artistas"],
      "answer_index": 2,
      "explanation": "Platao defende os filosofos como governantes."
    }$$::jsonb,
    2,
    false,
    true
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f30a',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f204',
    'quiz',
    $${
      "prompt": "Segundo Platao, a alma possui:",
      "choices": ["Uma parte unica", "Duas partes", "Tres partes", "Quatro partes"],
      "answer_index": 2,
      "min_score": 80,
      "explanation": "Racional, irascivel e concupiscivel."
    }$$::jsonb,
    3,
    true,
    true
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f30b',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f205',
    'quiz',
    $${
      "prompt": "Qual a funcao do silogismo?",
      "choices": ["Gerar opinioes", "Deducao logica a partir de premissas", "Criar mitos", "Observar a natureza"],
      "answer_index": 1,
      "explanation": "O silogismo organiza inferencias dedutivas."
    }$$::jsonb,
    1,
    false,
    true
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f30c',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f205',
    'true_false',
    $${
      "prompt": "Categorias sao modos de ser e de predicacao.",
      "answer": true,
      "explanation": "Aristoteles descreve modos basicos de dizer o ser."
    }$$::jsonb,
    2,
    false,
    true
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f30d',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f206',
    'match',
    $${
      "prompt": "Relacione termo e definicao.",
      "pairs": [
        {"left": "Ato", "right": "Realizacao da potencia"},
        {"left": "Potencia", "right": "Capacidade de vir a ser"},
        {"left": "Causa final", "right": "Finalidade de algo"}
      ]
    }$$::jsonb,
    1,
    false,
    true
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f30e',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f206',
    'quiz',
    $${
      "prompt": "Ato e potencia explicam:",
      "choices": ["A origem dos numeros", "Mudanca e devir", "Apenas opiniao", "A existencia de mitos"],
      "answer_index": 1,
      "min_score": 80,
      "explanation": "A passagem da potencia ao ato explica a mudanca."
    }$$::jsonb,
    2,
    true,
    true
  )
on conflict (id) do nothing;

insert into challenge_translations (challenge_id, locale, payload)
values
  ('9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f301', 'pt-BR', $${
    "prompt": "Qual e a ideia central do metodo socratico?",
    "choices": ["Argumento de autoridade", "Dialogo e refutacao", "Memorizacao", "Meditacao silenciosa"],
    "answer_index": 1,
    "explanation": "Socrates usa dialogo e refutacao para revelar inconsistencias."
  }$$::jsonb),
  ('9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f302', 'pt-BR', $${
    "prompt": "Para Socrates, admitir a ignorancia e o inicio da busca pela verdade.",
    "answer": true,
    "explanation": "Reconhecer limites abre caminho para investigar."
  }$$::jsonb),
  ('9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f303', 'pt-BR', $${
    "prompt": "Relacione termo e significado.",
    "pairs": [
      {"left": "Maieutica", "right": "Arte de ajudar a nascer ideias"},
      {"left": "Ironia", "right": "Refutacao para expor contradicoes"},
      {"left": "Dialogo", "right": "Busca conjunta da verdade"}
    ]
  }$$::jsonb),
  ('9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f304', 'pt-BR', $${
    "prompt": "Para Socrates, a virtude se aprende?",
    "choices": ["Nao, e inata", "Sim, e ligada ao conhecimento", "Depende da classe social", "Somente pela religiao"],
    "answer_index": 1,
    "explanation": "Socrates associa virtude ao saber."
  }$$::jsonb),
  ('9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f305', 'pt-BR', $${
    "prompt": "Qual a relacao entre virtude e conhecimento em Socrates?",
    "choices": ["Sao coisas separadas", "Virtude e conhecimento sao equivalentes", "Virtude e opiniao", "Virtude depende de sorte"],
    "answer_index": 1,
    "min_score": 80,
    "explanation": "Agir bem depende de conhecer o bem."
  }$$::jsonb),
  ('9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f306', 'pt-BR', $${
    "prompt": "Para Platao, o mundo sensivel e copia imperfeita do mundo das Ideias.",
    "answer": true,
    "explanation": "O sensivel participa das Ideias, mas nao as esgota."
  }$$::jsonb),
  ('9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f307', 'pt-BR', $${
    "prompt": "A alegoria da caverna trata de:",
    "choices": ["Tecnicas de guerra", "Conhecimento e passagem das sombras para a verdade", "Origem da matematica", "Astronomia pratica"],
    "answer_index": 1,
    "explanation": "Mostra a passagem do engano ao conhecimento."
  }$$::jsonb),
  ('9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f308', 'pt-BR', $${
    "prompt": "Relacione conceito e definicao.",
    "pairs": [
      {"left": "Ideia", "right": "Realidade imutavel e inteligivel"},
      {"left": "Sensivel", "right": "Mundo de mudanca e opiniao"},
      {"left": "Dialetica", "right": "Caminho racional para o conhecimento"}
    ]
  }$$::jsonb),
  ('9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f309', 'pt-BR', $${
    "prompt": "Na Republica, quem deve governar?",
    "choices": ["Mercadores", "Guerreiros", "Filosofos", "Artistas"],
    "answer_index": 2,
    "explanation": "Platao defende os filosofos como governantes."
  }$$::jsonb),
  ('9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f30a', 'pt-BR', $${
    "prompt": "Segundo Platao, a alma possui:",
    "choices": ["Uma parte unica", "Duas partes", "Tres partes", "Quatro partes"],
    "answer_index": 2,
    "min_score": 80,
    "explanation": "Racional, irascivel e concupiscivel."
  }$$::jsonb),
  ('9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f30b', 'pt-BR', $${
    "prompt": "Qual a funcao do silogismo?",
    "choices": ["Gerar opinioes", "Deducao logica a partir de premissas", "Criar mitos", "Observar a natureza"],
    "answer_index": 1,
    "explanation": "O silogismo organiza inferencias dedutivas."
  }$$::jsonb),
  ('9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f30c', 'pt-BR', $${
    "prompt": "Categorias sao modos de ser e de predicacao.",
    "answer": true,
    "explanation": "Aristoteles descreve modos basicos de dizer o ser."
  }$$::jsonb),
  ('9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f30d', 'pt-BR', $${
    "prompt": "Relacione termo e definicao.",
    "pairs": [
      {"left": "Ato", "right": "Realizacao da potencia"},
      {"left": "Potencia", "right": "Capacidade de vir a ser"},
      {"left": "Causa final", "right": "Finalidade de algo"}
    ]
  }$$::jsonb),
  ('9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f30e', 'pt-BR', $${
    "prompt": "Ato e potencia explicam:",
    "choices": ["A origem dos numeros", "Mudanca e devir", "Apenas opiniao", "A existencia de mitos"],
    "answer_index": 1,
    "min_score": 80,
    "explanation": "A passagem da potencia ao ato explica a mudanca."
  }$$::jsonb)
on conflict (challenge_id, locale) do nothing;

-- Readings
insert into readings (id, block_id, title, author, url, notes, order_index)
values
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f401',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f101',
    'Apologia de Socrates',
    'Platao',
    null,
    'Leitura recomendada para contextualizar o julgamento de Socrates.',
    1
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f402',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f102',
    'A Republica',
    'Platao',
    null,
    'Leitura recomendada para a teoria politica e das Ideias.',
    1
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f403',
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f103',
    'Metafisica',
    'Aristoteles',
    null,
    'Leitura recomendada para ato, potencia e causas.',
    1
  )
on conflict (id) do nothing;

insert into reading_translations (reading_id, locale, title, notes)
values
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f401',
    'pt-BR',
    'Apologia de Socrates',
    'Leitura recomendada para contextualizar o julgamento de Socrates.'
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f402',
    'pt-BR',
    'A Republica',
    'Leitura recomendada para a teoria politica e das Ideias.'
  ),
  (
    '9b6c1ef6-4c8b-4e3b-a1f4-1dbacb46f403',
    'pt-BR',
    'Metafisica',
    'Leitura recomendada para ato, potencia e causas.'
  )
on conflict (reading_id, locale) do nothing;

commit;
