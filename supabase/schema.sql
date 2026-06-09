-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  ¿Qué comemos? — esquema de base de datos para Supabase            ║
-- ║  Copia TODO este archivo en: Supabase → SQL Editor → New query     ║
-- ║  y pulsa "Run". Crea las tablas, los permisos y datos de ejemplo.  ║
-- ║                                                                    ║
-- ║  Modelo: HOGAR COMPARTIDO SIN LOGIN. Una sola base de datos que    ║
-- ║  todos comparten (acceso anónimo de lectura/escritura).            ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ── Tablas ────────────────────────────────────────────────────────────

create table if not exists public.meals (
  id            bigint generated always as identity primary key,
  name          text    not null,
  category      text    not null,
  ingredients   text[]  not null default '{}',
  favorite      boolean not null default false,
  times_eaten   int     not null default 0,
  last_eaten_on date,                       -- null = nunca
  created_at    timestamptz not null default now()
);

create table if not exists public.complements (
  id          bigint generated always as identity primary key,
  name        text    not null,
  ingredients text[]  not null default '{}',
  favorite    boolean not null default false,
  created_at  timestamptz not null default now()
);

create table if not exists public.plan_entries (
  day            date primary key,           -- una fila por fecha planeada
  meal_id        bigint references public.meals(id) on delete set null,
  eaten          boolean  not null default false,
  complement_ids bigint[] not null default '{}',  -- varios complementos por día
  eaten_locked   boolean  not null default false  -- true = el usuario decidió a mano
);

-- Si plan_entries ya existía sin estas columnas, agrégalas (no rompe datos):
alter table public.plan_entries
  add column if not exists complement_ids bigint[] not null default '{}';
alter table public.plan_entries
  add column if not exists eaten_locked boolean not null default false;

create table if not exists public.manual_items (
  id   bigint generated always as identity primary key,
  text text    not null,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.checked_ingredients (
  name text primary key                      -- presencia = "ya comprado"
);

-- ── Permisos (RLS) ────────────────────────────────────────────────────
-- Acceso compartido sin login: el rol anónimo puede leer y escribir todo.

alter table public.meals               enable row level security;
alter table public.complements         enable row level security;
alter table public.plan_entries        enable row level security;
alter table public.manual_items        enable row level security;
alter table public.checked_ingredients enable row level security;

do $$
declare t text;
begin
  foreach t in array array['meals','complements','plan_entries','manual_items','checked_ingredients']
  loop
    execute format('drop policy if exists "acceso compartido" on public.%I;', t);
    execute format(
      'create policy "acceso compartido" on public.%I for all to anon, authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;

-- ── Datos de ejemplo (recetario) ──────────────────────────────────────
-- Solo se insertan si la tabla está vacía. last_eaten_on = hoy - "días".

insert into public.meals (name, category, ingredients, favorite, times_eaten, last_eaten_on)
select * from (values
  ('Tinga de pollo',           'Pollo',       array['Pechuga de pollo','Jitomate','Cebolla','Chile chipotle','Tostadas'], true,  9,  current_date - 12),
  ('Enchiladas verdes',        'Pollo',       array['Tortillas','Pollo deshebrado','Tomate verde','Crema','Queso fresco'], false, 6,  current_date - 8),
  ('Albóndigas en chipotle',   'Res',         array['Carne molida','Arroz','Chipotle','Jitomate','Huevo'],               true,  7,  current_date - 5),
  ('Milanesa con papas',       'Res',         array['Bistec de res','Pan molido','Huevo','Papas','Limón'],               false, 11, current_date - 3),
  ('Espagueti a la boloñesa',  'Pasta',       array['Espagueti','Carne molida','Jitomate','Cebolla','Ajo'],              true,  8,  current_date - 2),
  ('Sopa de fideo',            'Pasta',       array['Fideo','Jitomate','Caldo de pollo','Cebolla'],                      false, 10, current_date - 6),
  ('Caldo de pollo con verduras','Pollo',     array['Pollo','Zanahoria','Calabaza','Chayote','Arroz'],                   false, 5,  current_date - 14),
  ('Pescado empapelado',       'Pescado',     array['Filete de pescado','Jitomate','Cebolla','Limón','Mantequilla'],     false, 3,  current_date - 20),
  ('Chiles rellenos',          'Res',         array['Chile poblano','Queso','Huevo','Jitomate','Harina'],                false, 4,  current_date - 18),
  ('Tacos dorados de papa',    'Pollo',       array['Tortillas','Papa','Lechuga','Crema','Queso'],                       true,  6,  current_date - 9),
  ('Fajitas de pollo',         'Pollo',       array['Pechuga de pollo','Pimiento','Cebolla','Tortillas'],                false, 7,  current_date - 4),
  ('Calabacitas con queso',    'Pollo',       array['Calabaza','Elote','Jitomate','Queso','Cebolla'],                    false, 5,  current_date - 11),
  ('Bistec encebollado',       'Res',         array['Bistec de res','Cebolla','Papa','Salsa de soya'],                   false, 6,  current_date - 7),
  ('Lentejas',                 'Res',         array['Lentejas','Tocino','Plátano macho','Jitomate'],                     false, 4,  current_date - 16),
  ('Pollo al horno',           'Pollo',       array['Pollo entero','Papa','Romero','Limón','Ajo'],                       true,  5,  current_date - 10),
  ('Mole con arroz',           'Pollo',       array['Pollo','Mole','Ajonjolí','Arroz'],                                  false, 3,  current_date - 22),
  ('Tostadas de atún',         'Pescado',     array['Atún','Mayonesa','Jitomate','Aguacate','Tostadas'],                 false, 4,  current_date - 13),
  ('Sopa de tortilla',         'Pollo',       array['Tortilla','Jitomate','Chile pasilla','Aguacate','Queso'],           false, 5,  current_date - 15),
  ('Pizza a domicilio',        'Restaurante', array[]::text[],                                                           false, 4,  current_date - 9),
  ('Sushi para llevar',        'Restaurante', array[]::text[],                                                           true,  3,  current_date - 17),
  ('Hamburguesas',             'Restaurante', array[]::text[],                                                           false, 2,  current_date - 24)
) as seed
where not exists (select 1 from public.meals);

-- Complementos de ejemplo (solo si la tabla está vacía)
insert into public.complements (name, ingredients, favorite)
select * from (values
  ('Arroz',               array['Arroz','Cebolla','Ajo'],                true),
  ('Frijoles de la olla', array['Frijol','Cebolla','Epazote'],           false),
  ('Ensalada verde',      array['Lechuga','Jitomate','Pepino','Limón'],  false),
  ('Verduras al vapor',   array['Zanahoria','Calabaza','Chícharo'],      false)
) as seed(name, ingredients, favorite)
where not exists (select 1 from public.complements);

-- ── (Opcional) Realtime: ver cambios en vivo entre dispositivos ───────
-- Descomenta si quieres sincronización instantánea sin recargar:
-- alter publication supabase_realtime add table public.meals, public.complements, public.plan_entries, public.manual_items, public.checked_ingredients;
