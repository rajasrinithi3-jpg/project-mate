async function runSecurityTests() {
  const baseUrl = 'http://localhost:3000/api';
  console.log('--- Starting ProjectMate Security & Authorization Audit ---');

  async function api(path: string, options: any = {}) {
    const res = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const text = await res.text();
    try {
      return { status: res.status, ok: res.ok, data: JSON.parse(text) };
    } catch {
      return { status: res.status, ok: res.ok, data: text };
    }
  }

  // Login as User A (Lokitha) and User B (Riya)
  const lokithaRes = await api('/auth/quick-switch', { method: 'POST', body: JSON.stringify({ userId: 'usr_lokitha' }) });
  const riyaRes = await api('/auth/quick-switch', { method: 'POST', body: JSON.stringify({ userId: 'usr_riya' }) });
  const arjunRes = await api('/auth/quick-switch', { method: 'POST', body: JSON.stringify({ userId: 'usr_arjun' }) });

  const lokithaToken = lokithaRes.data.token;
  const riyaToken = riyaRes.data.token;
  const arjunToken = arjunRes.data.token;

  // 1. Password/Hash Leak Check
  console.log('1. Checking for credential leaks in /api/users...');
  const usersRes = await api('/users');
  const leakedHash = usersRes.data.users.some((u: any) => u.passwordHash || u.salt);
  if (leakedHash) throw new Error('SECURITY FAILURE: passwordHash or salt leaked in user list!');
  console.log('✓ PASS: Zero credential or password hash leakage in public API.');

  // 2. Profile modification authorization
  console.log("2. Testing profile tampering: Can Riya edit Lokitha's profile?");
  const editProfileRes = await api('/users/usr_lokitha', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${riyaToken}` },
    body: JSON.stringify({ name: 'Hacked Name' }),
  });
  if (editProfileRes.status !== 403) throw new Error(`SECURITY FAILURE: Expected 403 Forbidden, got ${editProfileRes.status}`);
  console.log('✓ PASS: Blocked profile tampering with 403 Forbidden.');

  // 3. Project deletion authorization
  console.log("3. Testing project deletion: Can Riya delete Lokitha's project?");
  const deleteProjRes = await api('/projects/proj_disease_pred', {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${riyaToken}` },
  });
  if (deleteProjRes.status !== 403) throw new Error(`SECURITY FAILURE: Expected 403 Forbidden, got ${deleteProjRes.status}`);
  console.log('✓ PASS: Blocked unauthorized project deletion with 403 Forbidden.');

  // 4. Team Chat eavesdropping protection
  console.log("4. Testing chat privacy: Can Arjun eavesdrop on Lokitha's team chat (team_disease_pred)?");
  const chatRes = await api('/teams/team_disease_pred/messages', {
    headers: { Authorization: `Bearer ${arjunToken}` },
  });
  if (chatRes.status !== 403) throw new Error(`SECURITY FAILURE: Expected 403 Forbidden, got ${chatRes.status}`);
  console.log('✓ PASS: Blocked unauthorized team chat access with 403 Forbidden.');

  // 5. Task manipulation protection
  console.log("5. Testing task security: Can an outsider modify a team's task?");
  const taskRes = await api('/tasks/tsk_1', {
    method: 'PUT',
    headers: { Authorization: `Bearer ${arjunToken}` },
    body: JSON.stringify({ status: 'Completed' }),
  });
  if (taskRes.status !== 403) throw new Error(`SECURITY FAILURE: Expected 403 Forbidden, got ${taskRes.status}`);
  console.log('✓ PASS: Blocked outsider task modification with 403 Forbidden.');

  // 6. Invitation hijacking protection
  console.log("6. Testing invitation hijacking: Can an outsider accept someone else's invitation?");
  const invRes = await api('/invitations/inv_1/respond', {
    method: 'POST',
    headers: { Authorization: `Bearer ${arjunToken}` },
    body: JSON.stringify({ action: 'accept' }),
  });
  if (invRes.status !== 403) throw new Error(`SECURITY FAILURE: Expected 403 Forbidden, got ${invRes.status}`);
  console.log('✓ PASS: Blocked invitation hijacking with 403 Forbidden.');

  console.log('\n=============================================');
  console.log('🔒 ALL 6 SECURITY ENFORCEMENT AUDITS PASSED WITH ZERO VULNERABILITIES!');
  console.log('=============================================\n');
}

runSecurityTests().catch(err => {
  console.error('Security audit failed:', err);
  process.exit(1);
});
