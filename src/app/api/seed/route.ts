import { type NextRequest } from 'next/server';
import { createServiceClient } from '@/lib/supabase';
import { hashPassword } from '@/lib/auth';

/**
 * GET /api/seed?secret=pompom2026
 *
 * Seeds a demo tenant, admin user, and initial master data.
 * Protected by a simple secret param.
 */
export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get('secret');
  if (secret !== 'pompom2026') {
    return Response.json({ error: 'unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();

  try {
    // --- 1. Create tenant ---
    const { data: tenant, error: tenantErr } = await supabase
      .from('tenants')
      .upsert(
        {
          client_id: 'pompom-demo',
          client_name: 'PomPom Demo',
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'client_id' }
      )
      .select()
      .single();

    if (tenantErr || !tenant) {
      return Response.json(
        { error: 'Failed to create tenant', detail: tenantErr?.message },
        { status: 500 }
      );
    }

    // --- 2. Create admin user ---
    const passwordHash = await hashPassword('admin123');

    const { data: user, error: userErr } = await supabase
      .from('users')
      .upsert(
        {
          tenant_id: tenant.id,
          external_user_id: 'admin-1',
          name: 'Piush Thakker',
          role: 'admin',
          email: 'admin@pompom.com',
          password_hash: passwordHash,
          last_login: new Date().toISOString(),
        },
        { onConflict: 'tenant_id,external_user_id' }
      )
      .select('id, name, email, role')
      .single();

    if (userErr || !user) {
      return Response.json(
        { error: 'Failed to create user', detail: userErr?.message },
        { status: 500 }
      );
    }

    // --- 3. Seed master data ---
    const tid = tenant.id;

    // Expense Heads
    const expenseHeads = ['Diesel', 'Repairs', 'Tyres', 'Insurance', 'Salary', 'Washing', 'Misc'];
    for (const name of expenseHeads) {
      await supabase
        .from('expense_heads')
        .upsert({ tenant_id: tid, name }, { onConflict: 'tenant_id,name' });
    }

    // Vehicle Makes
    const vehicleMakes = ['Tata', 'Force', 'Eicher', 'Ashok Leyland', 'BharatBenz', 'Mahindra'];
    for (const name of vehicleMakes) {
      await supabase
        .from('vehicle_makes')
        .upsert({ tenant_id: tid, name }, { onConflict: 'tenant_id,name' });
    }

    // Staff Roles
    const staffRoles = ['Driver', 'Assistant', 'Lady Attendant', 'Supervisor'];
    for (const name of staffRoles) {
      await supabase
        .from('staff_roles')
        .upsert({ tenant_id: tid, name }, { onConflict: 'tenant_id,name' });
    }

    // Vendor Categories
    const vendorCategories = [
      'Fuel Station',
      'Mechanic',
      'Towing',
      'Spare Parts',
      'Body Work',
      'Electrical',
      'Insurance Agent',
    ];
    for (const name of vendorCategories) {
      await supabase
        .from('vendor_categories')
        .upsert({ tenant_id: tid, name }, { onConflict: 'tenant_id,name' });
    }

    // Attendance Rules
    const rules = [
      { rule_key: 'Max CL per month', rule_value: '2' },
      { rule_key: 'HD counts as', rule_value: '0.5' },
      { rule_key: 'Week off day', rule_value: 'Sunday' },
      { rule_key: 'Late mark threshold', rule_value: '15 min' },
    ];
    for (const rule of rules) {
      await supabase
        .from('attendance_rules')
        .upsert(
          { tenant_id: tid, ...rule },
          { onConflict: 'tenant_id,rule_key' }
        );
    }

    // Classes
    const classNames = [
      'Nursery', 'LKG', 'UKG',
      '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12',
    ];
    for (const name of classNames) {
      await supabase
        .from('classes')
        .upsert({ tenant_id: tid, name }, { onConflict: 'tenant_id,name' });
    }

    // Sections
    const sectionNames = ['A', 'B', 'C', 'D'];
    for (const name of sectionNames) {
      await supabase
        .from('sections')
        .upsert({ tenant_id: tid, name }, { onConflict: 'tenant_id,name' });
    }

    // Areas
    const areaNames = [
      'Satellite', 'Vastrapur', 'Bodakdev', 'Thaltej', 'SG Highway',
      'Prahlad Nagar', 'Jodhpur', 'Navrangpura', 'Paldi', 'Maninagar',
      'Bopal', 'South Bopal', 'Ghuma', 'Shilaj', 'Science City',
    ];
    for (const name of areaNames) {
      await supabase
        .from('areas')
        .upsert({ tenant_id: tid, name }, { onConflict: 'tenant_id,name' });
    }

    return Response.json({
      message: 'Seed complete',
      tenant: { id: tenant.id, client_id: tenant.client_id, client_name: tenant.client_name },
      user: { id: user.id, name: user.name, email: user.email },
      login: 'Use email: admin@pompom.com, password: admin123',
      masters_seeded: {
        expense_heads: expenseHeads.length,
        vehicle_makes: vehicleMakes.length,
        staff_roles: staffRoles.length,
        vendor_categories: vendorCategories.length,
        attendance_rules: rules.length,
        classes: classNames.length,
        sections: sectionNames.length,
        areas: areaNames.length,
      },
    });
  } catch (err) {
    console.error('Seed error:', err);
    return Response.json(
      { error: 'Seed failed', detail: String(err) },
      { status: 500 }
    );
  }
}
