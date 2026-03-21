import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { createServiceClient } from './supabase';

// ─── Types ───────────────────────────────────────────────────
export interface PomPomTokenPayload {
  client_id: string;
  client_name: string;
  user_id: string;
  user_name: string;
  user_role: string;
  iat?: number;
  exp?: number;
}

export interface SessionUser {
  id: string;
  tenant_id: string;
  external_user_id: string;
  name: string;
  role: string;
  email: string | null;
}

export interface SessionTenant {
  id: string;
  client_id: string;
  client_name: string;
}

export interface SessionData {
  user: SessionUser;
  tenant: SessionTenant;
}

// ─── Constants ───────────────────────────────────────────────
const SESSION_DURATION_HOURS = 24;
const IDLE_TIMEOUT_HOURS = 1;

// ─── JWT Validation ──────────────────────────────────────────

/**
 * Validate a PomPom JWT handoff token.
 * Uses HS256 with FLEET_JWT_SECRET env var.
 */
export function validatePomPomToken(token: string): PomPomTokenPayload {
  const secret = process.env.FLEET_JWT_SECRET;
  if (!secret) {
    throw new Error('FLEET_JWT_SECRET environment variable is not set');
  }

  try {
    const decoded = jwt.verify(token, secret, {
      algorithms: ['HS256'],
    }) as PomPomTokenPayload;

    // Validate required fields
    if (!decoded.client_id || !decoded.user_id || !decoded.user_name || !decoded.user_role) {
      throw new Error('Token missing required fields');
    }

    return decoded;
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    }
    if (err instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token signature');
    }
    throw err;
  }
}

// ─── Tenant Management ───────────────────────────────────────

/**
 * Get or create a tenant by PomPom client_id.
 * Upserts into the tenants table.
 */
export async function getOrCreateTenant(
  clientId: string,
  clientName: string
): Promise<SessionTenant> {
  const supabase = createServiceClient();

  // Try to find existing tenant
  const { data: existing, error: findError } = await supabase
    .from('tenants')
    .select('id, client_id, client_name')
    .eq('client_id', clientId)
    .single();

  if (existing && !findError) {
    // Update client_name if changed
    if (existing.client_name !== clientName) {
      await supabase
        .from('tenants')
        .update({ client_name: clientName, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    }
    return existing;
  }

  // Create new tenant
  const { data: created, error: createError } = await supabase
    .from('tenants')
    .insert({
      client_id: clientId,
      client_name: clientName,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id, client_id, client_name')
    .single();

  if (createError || !created) {
    throw new Error(`Failed to create tenant: ${createError?.message}`);
  }

  return created;
}

// ─── User Management ─────────────────────────────────────────

/**
 * Get or create a user by tenant_id + external_user_id.
 * Upserts into the users table, updates last_login.
 */
export async function getOrCreateUser(
  tenantId: string,
  externalUserId: string,
  name: string,
  role: string
): Promise<SessionUser> {
  const supabase = createServiceClient();
  const now = new Date().toISOString();

  // Try to find existing user
  const { data: existing, error: findError } = await supabase
    .from('users')
    .select('id, tenant_id, external_user_id, name, role, email')
    .eq('tenant_id', tenantId)
    .eq('external_user_id', externalUserId)
    .single();

  if (existing && !findError) {
    // Update name, role, and last_login
    await supabase
      .from('users')
      .update({ name, role, last_login: now })
      .eq('id', existing.id);

    return { ...existing, name, role };
  }

  // Create new user
  const { data: created, error: createError } = await supabase
    .from('users')
    .insert({
      tenant_id: tenantId,
      external_user_id: externalUserId,
      name,
      role,
      last_login: now,
      created_at: now,
    })
    .select('id, tenant_id, external_user_id, name, role, email')
    .single();

  if (createError || !created) {
    throw new Error(`Failed to create user: ${createError?.message}`);
  }

  return created;
}

// ─── Session Management ──────────────────────────────────────

/**
 * Create a new session for a user.
 * Generates a random token, inserts into sessions with 24hr expiry.
 */
export async function createSession(
  userId: string,
  tenantId: string
): Promise<string> {
  const supabase = createServiceClient();
  const token = crypto.randomBytes(32).toString('hex');
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

  const { error } = await supabase
    .from('sessions')
    .insert({
      user_id: userId,
      tenant_id: tenantId,
      token,
      expires_at: expiresAt.toISOString(),
      last_activity: now.toISOString(),
      created_at: now.toISOString(),
    });

  if (error) {
    throw new Error(`Failed to create session: ${error.message}`);
  }

  return token;
}

/**
 * Validate a session token.
 * Checks expires_at and last_activity (1hr idle timeout).
 * Updates last_activity if valid.
 * Returns user + tenant info.
 */
export async function validateSession(
  token: string
): Promise<SessionData | null> {
  const supabase = createServiceClient();
  const now = new Date();

  // Look up session
  const { data: session, error } = await supabase
    .from('sessions')
    .select('id, user_id, tenant_id, expires_at, last_activity')
    .eq('token', token)
    .single();

  if (error || !session) {
    return null;
  }

  // Check absolute expiry (24hr)
  if (new Date(session.expires_at) < now) {
    // Session expired — clean it up
    await supabase.from('sessions').delete().eq('id', session.id);
    return null;
  }

  // Check idle timeout (1hr)
  if (session.last_activity) {
    const lastActivity = new Date(session.last_activity);
    const idleMs = now.getTime() - lastActivity.getTime();
    if (idleMs > IDLE_TIMEOUT_HOURS * 60 * 60 * 1000) {
      // Idle too long — clean it up
      await supabase.from('sessions').delete().eq('id', session.id);
      return null;
    }
  }

  // Update last_activity
  await supabase
    .from('sessions')
    .update({ last_activity: now.toISOString() })
    .eq('id', session.id);

  // Fetch user
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id, tenant_id, external_user_id, name, role, email')
    .eq('id', session.user_id)
    .single();

  if (userError || !user) {
    return null;
  }

  // Fetch tenant
  const { data: tenant, error: tenantError } = await supabase
    .from('tenants')
    .select('id, client_id, client_name')
    .eq('id', session.tenant_id)
    .single();

  if (tenantError || !tenant) {
    return null;
  }

  return { user, tenant };
}

/**
 * Destroy a session by token.
 */
export async function destroySession(token: string): Promise<void> {
  const supabase = createServiceClient();
  await supabase.from('sessions').delete().eq('token', token);
}

// ─── Password Helpers ────────────────────────────────────────

/**
 * Hash a password using bcrypt.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify a password against a bcrypt hash.
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Authenticate a user by email + password (standalone login).
 * Returns user record if valid, null otherwise.
 */
export async function authenticateByEmail(
  email: string,
  password: string
): Promise<SessionUser | null> {
  const supabase = createServiceClient();

  const { data: user, error } = await supabase
    .from('users')
    .select('id, tenant_id, external_user_id, name, role, email, password_hash')
    .eq('email', email)
    .single();

  if (error || !user || !user.password_hash) {
    return null;
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return null;
  }

  // Update last_login
  await supabase
    .from('users')
    .update({ last_login: new Date().toISOString() })
    .eq('id', user.id);

  // Return without password_hash
  return {
    id: user.id,
    tenant_id: user.tenant_id,
    external_user_id: user.external_user_id,
    name: user.name,
    role: user.role,
    email: user.email,
  };
}
