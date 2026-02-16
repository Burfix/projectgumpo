import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { logError } from "@/lib/errors";

/**
 * POST /api/onboarding/pilot-school
 * Complete onboarding for a pilot school with all required data
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const body = await request.json();

    const {
      schoolName,
      schoolType,
      city,
      principalEmail,
      principalName,
      principalPhone,
      teachers = [],
      classrooms = [],
      skipSampleData = false,
    } = body;

    // Validate required fields
    if (!schoolName || !principalEmail || !principalName) {
      return NextResponse.json(
        { error: "Missing required fields: schoolName, principalEmail, principalName" },
        { status: 400 }
      );
    }

    const results: any = {
      school: null,
      principal: null,
      teachers: [],
      classrooms: [],
      sampleChildren: [],
      sampleParents: [],
      errors: [],
    };

    // Step 1: Create school
    try {
      const { data: school, error: schoolError } = await supabase
        .from("schools")
        .insert({
          name: schoolName,
        })
        .select()
        .single();

      if (schoolError) {
        throw new Error(`School creation failed: ${schoolError.message}`);
      }
      results.school = school;
    } catch (error: any) {
      results.errors.push({ step: "school", error: error.message });
      return NextResponse.json(results, { status: 500 });
    }

    const schoolId = results.school.id;

    // Step 2: Create principal account
    try {
      // Check if user already exists in profiles table
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("email", principalEmail)
        .single();

      if (existingUser) {
        results.principal = { ...existingUser, temporaryPassword: "PilotSchool2026!" };
      } else {
        // Try to get existing auth user by email first
        const { data: { users: authUsers }, error: listError } = await supabase.auth.admin.listUsers();
        const existingAuthUser = authUsers?.find(u => u.email === principalEmail);

        let authUserId: string;
        
        if (existingAuthUser) {
          authUserId = existingAuthUser.id;
        } else {
          // Create new auth user
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: principalEmail,
            password: "PilotSchool2026!",
            email_confirm: true,
          });

          if (authError) throw new Error(`Principal auth failed: ${authError.message}`);
          authUserId = authData.user.id;
        }

        // Upsert the profile (insert or update if exists)
        const { data: principal, error: profileError } = await supabase
          .from("users")
          .upsert({
            id: authUserId,
            email: principalEmail,
            name: principalName,
            role: "PRINCIPAL",
            school_id: schoolId,
            phone: principalPhone,
          }, {
            onConflict: 'id'
          })
          .select()
          .single();

        if (profileError) throw new Error(`Principal profile failed: ${profileError.message}`);
        results.principal = { ...principal, temporaryPassword: "PilotSchool2026!" };
      }
    } catch (error: any) {
      results.errors.push({ step: "principal", error: error.message });
    }

    // Step 3: Create classrooms
    if (classrooms.length > 0) {
      for (const classroom of classrooms) {
        try {
          const { data, error } = await supabase
            .from("classrooms")
            .insert({
              school_id: schoolId,
              name: classroom.name,
              capacity: classroom.capacity || 20,
              age_group: classroom.age_group || "3-4 years",
            })
            .select()
            .single();

          if (error) throw error;
          results.classrooms.push(data);
        } catch (error: any) {
          results.errors.push({ step: "classroom", name: classroom.name, error: error.message });
        }
      }
    }

    // Step 4: Create teacher accounts
    if (teachers.length > 0) {
      // Get all auth users once to avoid multiple API calls
      const { data: { users: authUsers } } = await supabase.auth.admin.listUsers();
      
      for (const teacher of teachers) {
        try {
          // Check if user already exists in profiles table
          const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .eq("email", teacher.email)
            .single();

          let teacherId: string;
          let teacherProfile: any;

          if (existingUser) {
            teacherId = existingUser.id;
            teacherProfile = existingUser;
          } else {
            // Check if auth user already exists
            const existingAuthUser = authUsers?.find(u => u.email === teacher.email);
            let authUserId: string;

            if (existingAuthUser) {
              authUserId = existingAuthUser.id;
            } else {
              const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: teacher.email,
                password: "Teacher2026!",
                email_confirm: true,
              });

              if (authError) throw authError;
              authUserId = authData.user.id;
            }

            // Upsert the profile
            const { data: profile, error: profileError } = await supabase
              .from("users")
              .upsert({
                id: authUserId,
                email: teacher.email,
                name: teacher.name,
                role: "TEACHER",
                school_id: schoolId,
              }, {
                onConflict: 'id'
              })
              .select()
              .single();

            if (profileError) throw profileError;
            teacherId = authUserId;
            teacherProfile = profile;
          }

          // Assign to classroom if specified
          if (teacher.classroom_id || teacher.classroom_name) {
            const classroomId = teacher.classroom_id ||
              results.classrooms.find((c: any) => c.name === teacher.classroom_name)?.id;

            if (classroomId) {
              // Check if assignment already exists
              const { data: existingAssignment } = await supabase
                .from("teacher_classroom")
                .select("*")
                .eq("teacher_id", teacherId)
                .eq("classroom_id", classroomId)
                .single();

              if (!existingAssignment) {
                await supabase.from("teacher_classroom").insert({
                  teacher_id: teacherId,
                  classroom_id: classroomId,
                });
              }
            }
          }

          results.teachers.push({ ...teacherProfile, temporaryPassword: "Teacher2026!" });
        } catch (error: any) {
          results.errors.push({ step: "teacher", email: teacher.email, error: error.message });
        }
      }
    }

    // Step 5: Create sample data (if requested)
    if (!skipSampleData && results.classrooms.length > 0) {
      const sampleChildren = [
        { first_name: "Emma", last_name: "Johnson", date_of_birth: "2020-05-15", classroom_id: results.classrooms[0].id },
        { first_name: "Liam", last_name: "Smith", date_of_birth: "2020-08-22", classroom_id: results.classrooms[0].id },
        { first_name: "Olivia", last_name: "Brown", date_of_birth: "2019-12-10", classroom_id: results.classrooms[0].id },
      ];

      for (const child of sampleChildren) {
        try {
          const { data, error } = await supabase
            .from("children")
            .insert({
              ...child,
              school_id: schoolId,
              status: "active",
            })
            .select()
            .single();

          if (error) throw error;
          results.sampleChildren.push(data);
        } catch (error: any) {
          results.errors.push({ step: "sample_child", error: error.message });
        }
      }

      // Create sample parents
      const sampleParents = [
        { email: "parent1@example.com", name: "Sarah Johnson", child_index: 0 },
        { email: "parent2@example.com", name: "Michael Smith", child_index: 1 },
        { email: "parent3@example.com", name: "Jennifer Brown", child_index: 2 },
      ];

      for (const parent of sampleParents) {
        try {
          // Check if user already exists
          const { data: existingUser } = await supabase
            .from("users")
            .select("*")
            .eq("email", parent.email)
            .single();

          let parentId: string;
          let parentProfile: any;

          if (existingUser) {
            parentId = existingUser.id;
            parentProfile = existingUser;
          } else {
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
              email: parent.email,
              password: "Parent2026!",
              email_confirm: true,
            });

            if (authError) {
              if (authError.message.includes("already been registered")) {
                const { data: profile } = await supabase
                  .from("users")
                  .select("*")
                  .eq("email", parent.email)
                  .single();
                if (profile) {
                  parentId = profile.id;
                  parentProfile = profile;
                } else {
                  throw authError;
                }
              } else {
                throw authError;
              }
            } else {
              const { data: profile, error: profileError } = await supabase
                .from("users")
                .insert({
                  id: authData.user.id,
                  email: parent.email,
                  name: parent.name,
                  role: "PARENT",
                  school_id: schoolId,
                })
                .select()
                .single();

              if (profileError) throw profileError;
              parentId = authData.user.id;
              parentProfile = profile;
            }
          }

          // Link parent to child
          const child = results.sampleChildren[parent.child_index];
          if (child) {
            // Check if link already exists
            const { data: existingLink } = await supabase
              .from("parent_child")
              .select("*")
              .eq("parent_id", parentId)
              .eq("child_id", child.id)
              .single();

            if (!existingLink) {
              await supabase.from("parent_child").insert({
                parent_id: parentId,
                child_id: child.id,
              });
            }
          }

          results.sampleParents.push({ ...parentProfile, temporaryPassword: "Parent2026!" });
        } catch (error: any) {
          results.errors.push({ step: "sample_parent", email: parent.email, error: error.message });
        }
      }
    }

    // Return response based on whether critical steps succeeded
    const hasErrors = results.errors.length > 0;
    const hasCriticalErrors = !results.school || !results.principal;

    if (hasCriticalErrors) {
      return NextResponse.json(
        { 
          success: false,
          error: "Failed to create school or principal",
          details: results 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: hasErrors 
        ? "Pilot school onboarding completed with some warnings" 
        : "Pilot school onboarding completed successfully",
      data: results,
    });
  } catch (error: any) {
    logError(
      error instanceof Error ? error : new Error(String(error)),
      { context: "POST /api/onboarding/pilot-school" }
    );
    return NextResponse.json(
      { error: error.message || "Failed to onboard pilot school" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/onboarding/pilot-school
 * Get pilot school onboarding status
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get("school_id");

    if (!schoolId) {
      return NextResponse.json({ error: "School ID required" }, { status: 400 });
    }

    // Get school details
    const { data: school } = await supabase
      .from("schools")
      .select("*")
      .eq("id", schoolId)
      .single();

    // Get counts
    const [
      { count: principalCount },
      { count: teacherCount },
      { count: classroomCount },
      { count: childCount },
      { count: parentCount },
    ] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("role", "PRINCIPAL"),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("role", "TEACHER"),
      supabase.from("classrooms").select("*", { count: "exact", head: true }).eq("school_id", schoolId),
      supabase.from("children").select("*", { count: "exact", head: true }).eq("school_id", schoolId),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("school_id", schoolId).eq("role", "PARENT"),
    ]);

    return NextResponse.json({
      school,
      stats: {
        principals: principalCount || 0,
        teachers: teacherCount || 0,
        classrooms: classroomCount || 0,
        children: childCount || 0,
        parents: parentCount || 0,
      },
    });
  } catch (error: any) {
    logError(
      error instanceof Error ? error : new Error(String(error)),
      { context: "GET /api/onboarding/pilot-school" }
    );
    return NextResponse.json(
      { error: error.message || "Failed to get onboarding status" },
      { status: 500 }
    );
  }
}
