import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

async function runMigrations() {
  // Credentials must come from the environment. Never hardcode database passwords.
  const dbHost = process.env.SUPABASE_DB_HOST;
  const dbPassword = process.env.SUPABASE_DB_PASSWORD;
  if (!dbHost || !dbPassword) {
    console.error('Refusing to run: set SUPABASE_DB_HOST and SUPABASE_DB_PASSWORD in the environment.');
    process.exit(1);
  }

  const client = new Client({
    host: dbHost,
    port: 5432,
    database: 'postgres',
    user: 'postgres',
    password: dbPassword,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log(`Connecting to Supabase PostgreSQL at ${dbHost}...`);
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Migration failed:', message);
    try { await client.end(); } catch {}
    process.exit(1);
  }
}

runMigrations();
