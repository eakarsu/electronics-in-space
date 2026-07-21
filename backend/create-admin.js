'use strict';

const bcrypt = require('bcrypt');
const pool = require('./db');

async function main() {
  const email = String(process.env.ADMIN_EMAIL || process.env.BOOTSTRAP_ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || process.env.BOOTSTRAP_ADMIN_PASSWORD || '');
  const tenantSlug = String(process.env.BOOTSTRAP_TENANT_SLUG || 'default').trim().toLowerCase();
  const tenantName = String(process.env.BOOTSTRAP_TENANT_NAME || 'Default Space Electronics Tenant').trim();
  if (!email || !email.includes('@')) throw new Error('ADMIN_EMAIL must be a valid email address.');
  if (password.length < 12 || password.length > 72) throw new Error('ADMIN_PASSWORD must contain 12-72 characters.');
  if (!/^[a-z0-9][a-z0-9-]{1,78}[a-z0-9]$/.test(tenantSlug)) throw new Error('BOOTSTRAP_TENANT_SLUG must be a valid slug.');
  if (!tenantName) throw new Error('BOOTSTRAP_TENANT_NAME is required.');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const tenant = (await client.query(
      `INSERT INTO tenants(slug,name) VALUES($1,$2)
       ON CONFLICT(slug) DO UPDATE SET name=EXCLUDED.name RETURNING id`,
      [tenantSlug, tenantName],
    )).rows[0];
    if ((await client.query('SELECT id FROM users WHERE email=$1', [email])).rowCount) {
      await client.query('COMMIT');
      console.log(`Administrator ${email} already exists; no changes made.`);
      return;
    }
    await client.query(
      `INSERT INTO users(email,password_hash,name,role,tenant_id) VALUES($1,$2,$3,'admin',$4)`,
      [email, await bcrypt.hash(password, 12), String(process.env.BOOTSTRAP_ADMIN_NAME || 'Runtime Administrator'), tenant.id],
    );
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
  console.log(`Created administrator ${email}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => pool.end());
