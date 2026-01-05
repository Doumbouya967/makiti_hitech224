-- 1. Nettoyer user_roles existants
DELETE FROM public.user_roles;

-- 2. Supprimer l'utilisateur doumbouyasekou@gmail.com (garder seulement doumbouyasekou967@gmail.com)
-- Note: On ne peut pas supprimer directement depuis auth.users via SQL, on va utiliser l'Edge Function

-- 3. Assigner le rôle propriétaire à l'utilisateur racine existant
INSERT INTO public.user_roles (user_id, role) 
VALUES ('906ac1bd-b9bb-4e8a-8e7f-7632ee2e561a', 'proprietaire');

-- 4. Ajouter politique RLS pour permettre au propriétaire de gérer les rôles
DROP POLICY IF EXISTS "Users can insert their own role" ON public.user_roles;
DROP POLICY IF EXISTS "Proprietaires can manage all roles" ON public.user_roles;

CREATE POLICY "Proprietaires can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'proprietaire'))
WITH CHECK (public.has_role(auth.uid(), 'proprietaire'));

-- 5. Ajouter politique pour permettre aux utilisateurs de voir leur propre rôle
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;

CREATE POLICY "Users can view own role" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);