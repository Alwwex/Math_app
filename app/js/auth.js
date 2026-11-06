// Profily a přihlášení (lokálně v zařízení). PIN se ukládá jen jako SHA-256 hash se solí.
import { store, setNamespace, loadProfile, profile, saveProfile, flushSaves } from './store.js';

let current = null;
export const AVATARS = ['fox', 'cat', 'panda', 'owl', 'unicorn', 'lion', 'frog', 'penguin', 'koala', 'tiger', 'rabbit', 'bear', 'octopus', 'turtle', 'butterfly', 'dog', 'alien', 'robot'];
export const COLORS = ['#007aff', '#34c759', '#ff9500', '#ff2d55', '#af52de', '#5856d6', '#30b0c7', '#ffcc00'];

export async function listUsers() { return (await store.get('global:users')) || []; }
async function saveUsers(u) { await store.set('global:users', u); }
export function currentUser() { return current; }

async function hashPin(pin, salt) {
  const data = new TextEncoder().encode(salt + ':' + pin);
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
const rid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

export async function createUser({ name, avatar, color, pin, lang }) {
  const users = await listUsers();
  const id = rid();
  const salt = rid();
  const u = { id, name: name.trim() || 'Já', avatar, color, salt, pin: pin ? await hashPin(pin, salt) : null, created: Date.now(), remember: !pin };
  users.push(u);
  await saveUsers(users);
  // first profile inherits data from the previous version of the app (no namespaces)
  if (users.length === 1) await migrateLegacy(id);
  await signIn(u);
  if (lang) { profile.lang = lang; }
  profile.name = u.name;
  saveProfile();
  await flushSaves();
  return u;
}
async function migrateLegacy(id) {
  const keys = await store.raw.keys();
  for (const k of keys) {
    if (k.startsWith('u:') || k.startsWith('global:')) continue;
    const v = await store.raw.get(k);
    await store.raw.set(`u:${id}:${k}`, v);
    await store.raw.del(k);
  }
}
export async function verifyPin(u, pin) { return !u.pin || (await hashPin(pin, u.salt)) === u.pin; }
export async function signIn(u) {
  await flushSaves();
  current = u;
  setNamespace(u.id);
  await loadProfile();
  profile.name = u.name;
  await store.set('global:lastUser', u.id);
}
export async function signOut() {
  await flushSaves();
  current = null;
  setNamespace(null);
}
export async function updateUser(id, patch) {
  const users = await listUsers();
  const u = users.find(x => x.id === id);
  if (!u) return null;
  if ('pin' in patch) { u.salt = rid(); u.pin = patch.pin ? await hashPin(patch.pin, u.salt) : null; delete patch.pin; }
  Object.assign(u, patch);
  await saveUsers(users);
  if (current?.id === id) current = u;
  return u;
}
export async function deleteUser(id) {
  const users = (await listUsers()).filter(u => u.id !== id);
  await saveUsers(users);
  for (const k of await store.raw.keys()) if (k.startsWith(`u:${id}:`)) await store.raw.del(k);
}
// Auto sign-in when the last user chose "remember me" and has no PIN
export async function autoSignIn() {
  const users = await listUsers();
  const last = await store.get('global:lastUser');
  const u = users.find(x => x.id === last);
  if (u && u.remember && !u.pin) { await signIn(u); return u; }
  return null;
}
