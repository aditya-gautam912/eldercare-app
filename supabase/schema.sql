-- Run this in your Supabase project SQL editor
-- Complete reset of all policies - no recursion

-- 1. Drop all existing policies first
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;

DROP POLICY IF EXISTS "Family members can view elders" ON elders;
DROP POLICY IF EXISTS "Admins can insert elders" ON elders;
DROP POLICY IF EXISTS "Admins can update elders" ON elders;

DROP POLICY IF EXISTS "Family members can view family_members" ON family_members;
DROP POLICY IF EXISTS "Family members can view family members of their elders" ON family_members;
DROP POLICY IF EXISTS "Users can insert themselves" ON family_members;

DROP POLICY IF EXISTS "Family members can view medications" ON medications;
DROP POLICY IF EXISTS "Family members can insert medications" ON medications;
DROP POLICY IF EXISTS "Family members can delete medications" ON medications;

DROP POLICY IF EXISTS "Family members can view check_ins" ON check_ins;
DROP POLICY IF EXISTS "Family members can insert check_ins" ON check_ins;

DROP POLICY IF EXISTS "Family members can view emergency_contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Family members can insert emergency_contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Family members can delete emergency_contacts" ON emergency_contacts;

DROP POLICY IF EXISTS "Admins can view invite codes" ON invite_codes;
DROP POLICY IF EXISTS "Anyone can read valid invite codes by code" ON invite_codes;
DROP POLICY IF EXISTS "Admins can create invite codes" ON invite_codes;

-- 2. Create minimal non-recursive policies

-- Profiles: users can only see/edit their own
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Elders: anyone authenticated can create; only family members can view
CREATE POLICY "Anyone can insert elders"
  ON elders FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Family members can view elders"
  ON elders FOR SELECT
  USING (
    created_by = auth.uid()
    OR
    auth.uid() IN (
      SELECT user_id FROM family_members WHERE elder_id = elders.id
    )
  );

CREATE POLICY "Family members can update elders"
  ON elders FOR UPDATE
  USING (
    auth.uid() IN (
      SELECT user_id FROM family_members WHERE elder_id = elders.id AND role = 'admin'
    )
  );

-- Family members: user can see their own; can insert themselves
CREATE POLICY "Users can view their own memberships"
  ON family_members FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert themselves"
  ON family_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Medications: accessible by creator of elder or family members
CREATE POLICY "Family can view medications"
  ON medications FOR SELECT
  USING (
    auth.uid() IN (
      SELECT created_by FROM elders WHERE id = medications.elder_id
      UNION
      SELECT user_id FROM family_members WHERE elder_id = medications.elder_id
    )
  );

CREATE POLICY "Family can insert medications"
  ON medications FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT created_by FROM elders WHERE id = medications.elder_id
      UNION
      SELECT user_id FROM family_members WHERE elder_id = medications.elder_id
    )
  );

CREATE POLICY "Family can delete medications"
  ON medications FOR DELETE
  USING (
    auth.uid() IN (
      SELECT created_by FROM elders WHERE id = medications.elder_id
      UNION
      SELECT user_id FROM family_members WHERE elder_id = medications.elder_id
    )
  );

-- Check-ins: accessible by creator of elder or family members
CREATE POLICY "Family can view check_ins"
  ON check_ins FOR SELECT
  USING (
    auth.uid() IN (
      SELECT created_by FROM elders WHERE id = check_ins.elder_id
      UNION
      SELECT user_id FROM family_members WHERE elder_id = check_ins.elder_id
    )
  );

CREATE POLICY "Family can insert check_ins"
  ON check_ins FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT created_by FROM elders WHERE id = check_ins.elder_id
      UNION
      SELECT user_id FROM family_members WHERE elder_id = check_ins.elder_id
    )
  );

-- Emergency contacts: accessible by creator of elder or family members
CREATE POLICY "Family can view emergency_contacts"
  ON emergency_contacts FOR SELECT
  USING (
    auth.uid() IN (
      SELECT created_by FROM elders WHERE id = emergency_contacts.elder_id
      UNION
      SELECT user_id FROM family_members WHERE elder_id = emergency_contacts.elder_id
    )
  );

CREATE POLICY "Family can insert emergency_contacts"
  ON emergency_contacts FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT created_by FROM elders WHERE id = emergency_contacts.elder_id
      UNION
      SELECT user_id FROM family_members WHERE elder_id = emergency_contacts.elder_id
    )
  );

CREATE POLICY "Family can delete emergency_contacts"
  ON emergency_contacts FOR DELETE
  USING (
    auth.uid() IN (
      SELECT created_by FROM elders WHERE id = emergency_contacts.elder_id
      UNION
      SELECT user_id FROM family_members WHERE elder_id = emergency_contacts.elder_id
    )
  );

-- Invite codes: admins can manage; anyone can read by code
CREATE POLICY "Anyone can read invite codes"
  ON invite_codes FOR SELECT
  USING (code IS NOT NULL);

CREATE POLICY "Admins can create invite codes"
  ON invite_codes FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT user_id FROM family_members WHERE elder_id = invite_codes.elder_id AND role = 'admin'
    )
  );
