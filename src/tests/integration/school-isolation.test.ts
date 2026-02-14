import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';

/**
 * School Isolation Integration Tests
 * 
 * These tests verify that multi-tenant school isolation works correctly
 * and that users cannot access data from other schools.
 * 
 * CRITICAL: These tests must pass before any pilot deployment!
 */

// Test database connection
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!, // Use service role for testing
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

describe('School Isolation Tests', () => {
  let school1Id: number;
  let school2Id: number;
  let admin1Id: string;
  let admin2Id: string;
  let teacher1Id: string;
  let parent1Id: string;
  let parent2Id: string;
  let child1Id: string;
  let child2Id: string;

  beforeAll(async () => {
    // Create two test schools
    const { data: schools } = await supabase
      .from('schools')
      .insert([
        { name: 'Test School 1', school_type: 'Preschool' },
        { name: 'Test School 2', school_type: 'Preschool' },
      ])
      .select();

    school1Id = schools![0].id;
    school2Id = schools![1].id;

    // Create test users for each school
    const { data: auth1 } = await supabase.auth.admin.createUser({
      email: 'admin1@test.com',
      password: 'test123456',
      email_confirm: true,
    });
    admin1Id = auth1.user!.id;

    const { data: auth2 } = await supabase.auth.admin.createUser({
      email: 'admin2@test.com',
      password: 'test123456',
      email_confirm: true,
    });
    admin2Id = auth2.user!.id;

    const { data: authTeacher } = await supabase.auth.admin.createUser({
      email: 'teacher1@test.com',
      password: 'test123456',
      email_confirm: true,
    });
    teacher1Id = authTeacher.user!.id;

    const { data: authParent1 } = await supabase.auth.admin.createUser({
      email: 'parent1@test.com',
      password: 'test123456',
      email_confirm: true,
    });
    parent1Id = authParent1.user!.id;

    const { data: authParent2 } = await supabase.auth.admin.createUser({
      email: 'parent2@test.com',
      password: 'test123456',
      email_confirm: true,
    });
    parent2Id = authParent2.user!.id;

    // Insert user profiles
    await supabase.from('users').insert([
      { id: admin1Id, email: 'admin1@test.com', role: 'ADMIN', school_id: school1Id },
      { id: admin2Id, email: 'admin2@test.com', role: 'ADMIN', school_id: school2Id },
      { id: teacher1Id, email: 'teacher1@test.com', role: 'TEACHER', school_id: school1Id },
      { id: parent1Id, email: 'parent1@test.com', role: 'PARENT', school_id: school1Id },
      { id: parent2Id, email: 'parent2@test.com', role: 'PARENT', school_id: school2Id },
    ]);

    // Create test children
    const { data: children } = await supabase
      .from('children')
      .insert([
        { first_name: 'Child', last_name: 'One', school_id: school1Id, date_of_birth: '2020-01-01' },
        { first_name: 'Child', last_name: 'Two', school_id: school2Id, date_of_birth: '2020-01-01' },
      ])
      .select();

    child1Id = children![0].id;
    child2Id = children![1].id;
  });

  afterAll(async () => {
    // Cleanup test data
    await supabase.from('children').delete().in('id', [child1Id, child2Id]);
    await supabase.from('users').delete().in('id', [admin1Id, admin2Id, teacher1Id, parent1Id, parent2Id]);
    await supabase.auth.admin.deleteUser(admin1Id);
    await supabase.auth.admin.deleteUser(admin2Id);
    await supabase.auth.admin.deleteUser(teacher1Id);
    await supabase.auth.admin.deleteUser(parent1Id);
    await supabase.auth.admin.deleteUser(parent2Id);
    await supabase.from('schools').delete().in('id', [school1Id, school2Id]);
  });

  it('should prevent admin from viewing children in other schools', async () => {
    // Sign in as admin1
    const { data: session1 } = await supabase.auth.signInWithPassword({
      email: 'admin1@test.com',
      password: 'test123456',
    });

    const client1 = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${session1.session!.access_token}`,
          },
        },
      }
    );

    // Try to fetch child from school 2
    const { data, error } = await client1
      .from('children')
      .select('*')
      .eq('id', child2Id)
      .single();

    // Should not be able to see child from other school
    expect(error).toBeTruthy();
    expect(data).toBeNull();

    // Should be able to see own school's child
    const { data: ownChild, error: ownError } = await client1
      .from('children')
      .select('*')
      .eq('id', child1Id)
      .single();

    expect(ownError).toBeNull();
    expect(ownChild).toBeTruthy();
    expect(ownChild.school_id).toBe(school1Id);

    await supabase.auth.signOut();
  });

  it('should prevent teacher from accessing other schools data', async () => {
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'teacher1@test.com',
      password: 'test123456',
    });

    const teacherClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${session.session!.access_token}`,
          },
        },
      }
    );

    // Try to fetch children from school 2
    const { data } = await teacherClient
      .from('children')
      .select('*')
      .eq('school_id', school2Id);

    // Should return empty array, not other school's children
    expect(data).toEqual([]);

    await supabase.auth.signOut();
  });

  it('should prevent parents from seeing other parents children', async () => {
    // Link parent1 to child1
    await supabase.from('parent_child').insert({
      parent_id: parent1Id,
      child_id: child1Id,
    });

    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'parent1@test.com',
      password: 'test123456',
    });

    const parentClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${session.session!.access_token}`,
          },
        },
      }
    );

    // Try to access child2 (belongs to different school)
    const { data, error } = await parentClient
      .from('children')
      .select('*')
      .eq('id', child2Id)
      .single();

    expect(error).toBeTruthy();
    expect(data).toBeNull();

    await supabase.auth.signOut();
  });

  it('should prevent cross-school user queries', async () => {
    const { data: session } = await supabase.auth.signInWithPassword({
      email: 'admin1@test.com',
      password: 'test123456',
    });

    const client = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${session.session!.access_token}`,
          },
        },
      }
    );

    // Try to query users from school 2
    const { data } = await client
      .from('users')
      .select('*')
      .eq('school_id', school2Id);

    // Should not see users from other school
    expect(data).toEqual([]);

    await supabase.auth.signOut();
  });
});
