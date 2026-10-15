import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

async function runMigrations() {
  const client = new Client({
    host: 'db.wedsiefskyzvnbooscuf.supabase.co',
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: '9mfb6j$$9X%ntpR',
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log('Connecting to Supabase PostgreSQL at db.wedsiefskyzvnbooscuf.supabase.co...');
    await client.connect();
    console.log('✓ Connected successfully!');

    const files = [
      'supabase/migrations/20261008000000_init_schema.sql',
      'supabase/migrations/20261008000001_rls_policies.sql',
      'supabase/seed.sql',
    ];

    for (const file of files) {
      console.log(`\nExecuting: ${file}...`);
      const fullPath = path.resolve(process.cwd(), file);
      const sql = fs.readFileSync(fullPath, 'utf8');

      await client.query(sql);
      console.log(`✓ Successfully executed ${file}`);
    }

    // Verify created tables
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log('\n--- Public Tables Created in Supabase ---');
    res.rows.forEach((r) => console.log('  •', r.table_name));

    // Verify seed count
    const turfsCount = await client.query('SELECT count(*) FROM turfs');
    console.log(`\n✓ Seeded Turfs Count: ${turfsCount.rows[0].count}`);

    await client.end();
    console.log('\n🎉 Supabase schema & seed data migration complete!');
  } catch (err: any) {
    console.error('Migration failed:', err.message);
    try { await client.end(); } catch {}
    process.exit(1);
  }
}

runMigrations();
