-- Eliminar políticas existentes que pueden estar causando conflictos
DROP POLICY IF EXISTS "users_insert_policy" ON users;
DROP POLICY IF EXISTS "users_select_policy" ON users;
DROP POLICY IF EXISTS "users_update_policy" ON users;

-- Crear políticas RLS mejoradas para la tabla users
-- Política para permitir inserción durante el registro
CREATE POLICY "users_insert_policy" ON users
  FOR INSERT 
  WITH CHECK (true); -- Permite a cualquiera insertar durante el registro

-- Política para permitir lectura de su propio perfil
CREATE POLICY "users_select_policy" ON users
  FOR SELECT 
  USING (auth.uid() = id OR auth.uid() IS NULL); -- Permite leer su propio perfil o durante registro

-- Política para permitir actualización de su propio perfil
CREATE POLICY "users_update_policy" ON users
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Políticas para la tabla psychologists
DROP POLICY IF EXISTS "psychologists_insert_policy" ON psychologists;
DROP POLICY IF EXISTS "psychologists_select_policy" ON psychologists;
DROP POLICY IF EXISTS "psychologists_update_policy" ON psychologists;

CREATE POLICY "psychologists_insert_policy" ON psychologists
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "psychologists_select_policy" ON psychologists
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "psychologists_update_policy" ON psychologists
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas para la tabla children
DROP POLICY IF EXISTS "children_insert_policy" ON children;
DROP POLICY IF EXISTS "children_select_policy" ON children;
DROP POLICY IF EXISTS "children_update_policy" ON children;

CREATE POLICY "children_insert_policy" ON children
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "children_select_policy" ON children
  FOR SELECT 
  USING (
    auth.uid() = user_id OR 
    auth.uid() = assigned_psychologist OR
    auth.uid() IN (
      SELECT user_id FROM psychologists WHERE id = assigned_psychologist
    )
  );

CREATE POLICY "children_update_policy" ON children
  FOR UPDATE 
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM psychologists WHERE id = assigned_psychologist
    )
  )
  WITH CHECK (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM psychologists WHERE id = assigned_psychologist
    )
  );