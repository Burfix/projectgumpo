import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST() {
  try {
    const supabase = await createAdminClient();
    
    // Drop existing constraint
    const { error: dropError } = await supabase.rpc('exec_sql', {
      query: `
        DO $$ 
        BEGIN
            IF EXISTS (
                SELECT 1 FROM information_schema.table_constraints 
                WHERE constraint_name = 'schools_school_type_check' 
                AND table_name = 'schools'
                AND table_schema = 'public'
            ) THEN
                ALTER TABLE public.schools DROP CONSTRAINT schools_school_type_check;
            END IF;
        END $$;
        
        ALTER TABLE public.schools 
        ADD CONSTRAINT schools_school_type_check 
        CHECK (school_type IN ('Preschool', 'Crèche', 'Primary', 'Other'));
        
        UPDATE public.schools 
        SET school_type = 'Other' 
        WHERE school_type NOT IN ('Preschool', 'Crèche', 'Primary', 'Other');
      `
    });
    
    if (dropError) {
      console.error("Error fixing constraint:", dropError);
      return NextResponse.json({ error: dropError.message }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, message: "Constraint fixed successfully" });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
