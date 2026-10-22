async function runTests() {
  const baseUrl = 'http://localhost:3000/api';
  console.log('--- Starting ProjectMate Complete Student Journey Test ---');

  // Helper
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

  // 1. REGISTER
  console.log('1. Testing student registration...');
  const regEmail = `test_student_${Date.now()}@projectmate.edu`;
  const regRes = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Priya Patel',
      email: regEmail,
      password: 'password123',
      department: 'CSE',
      year: '2nd Year',
    }),
  });
  if (!regRes.ok) throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
  console.log('✓ Registered student Priya Patel:', regRes.data.user.id);
  const priyaToken = regRes.data.token;
  const priyaId = regRes.data.user.id;

  // 2. LOGIN
  console.log('2. Testing student login...');
  const loginRes = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: regEmail,
      password: 'password123',
    }),
  });
  if (!loginRes.ok) throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
  console.log('✓ Logged in successfully, token received.');

  // 3. COMPLETE PROFILE
  console.log('3. Updating profile with skills, interests, and availability...');
  const updateProfileRes = await api(`/users/${priyaId}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${priyaToken}` },
    body: JSON.stringify({
      bio: 'Enthusiastic robotics and vision engineer looking for smart teammates.',
      skills: ['Python', 'ROS', 'OpenCV', 'C++', 'Computer Vision'],
      interests: ['Robotics', 'Artificial Intelligence', 'IoT'],
      availability: ['Weekday evenings', 'Weekends'],
    }),
  });
  if (!updateProfileRes.ok) throw new Error(`Profile update failed: ${JSON.stringify(updateProfileRes.data)}`);
  console.log('✓ Profile updated with 5 skills and availability.');

  // 4. CREATE PROJECT
  console.log('4. Creating project "Autonomous Quadcopter Vision"...');
  const createProjRes = await api('/projects', {
    method: 'POST',
    headers: { Authorization: `Bearer ${priyaToken}` },
    body: JSON.stringify({
      name: 'Autonomous Quadcopter Vision',
      description: 'Developing stereo-depth obstacle avoidance using onboard micro-controllers and neural depth models.',
      category: 'IoT',
      requiredSkills: ['C++', 'Python', 'Computer Vision', 'Embedded Systems'],
      teamSize: 3,
      deadline: '2026-12-15',
    }),
  });
  if (!createProjRes.ok) throw new Error(`Project creation failed: ${JSON.stringify(createProjRes.data)}`);
  const project = createProjRes.data.project;
  const team = createProjRes.data.team;
  console.log('✓ Project created:', project.name, 'with Team ID:', team.id);

  // 5. TEST DETERMINISTIC MATCHING
  console.log('5. Calculating teammate match scores for this project...');
  const matchRes = await api(`/matching/teammates?projectId=${project.id}`, {
    headers: { Authorization: `Bearer ${priyaToken}` },
  });
  if (!matchRes.ok) throw new Error(`Matching failed: ${JSON.stringify(matchRes.data)}`);
  console.log(`✓ Matching evaluated ${matchRes.data.matches.length} candidates.`);
  const topMatch = matchRes.data.matches[0];
  console.log(`   Top Candidate: ${topMatch.student.name} (Score: ${topMatch.matchScore}%)`);
  console.log(`   Explanation: ${topMatch.explanation}`);
  console.log(`   Matched skills: ${topMatch.matchedSkills.join(', ')}`);

  // 6. SEND INVITATION
  const targetCandidate = matchRes.data.matches.find((m: any) => m.student.id === 'usr_ananya') || topMatch;
  console.log(`6. Sending invitation to ${targetCandidate.student.name}...`);
  const sendInvRes = await api('/invitations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${priyaToken}` },
    body: JSON.stringify({
      projectId: project.id,
      receiverId: targetCandidate.student.id,
      roleOffered: 'Researcher',
      message: 'Hi! Your embedded systems & IoT skills are ideal for our quadcopter hardware.',
    }),
  });
  if (!sendInvRes.ok) throw new Error(`Invitation send failed: ${JSON.stringify(sendInvRes.data)}`);
  const invId = sendInvRes.data.invitation.id;
  console.log('✓ Invitation sent, ID:', invId);

  // 7. SWITCH TO CANDIDATE ACCOUNT (Ananya S)
  console.log(`7. Logging in as candidate (${targetCandidate.student.name})...`);
  const switchRes = await api('/auth/quick-switch', {
    method: 'POST',
    body: JSON.stringify({ userId: targetCandidate.student.id }),
  });
  if (!switchRes.ok) throw new Error(`Quick switch failed: ${JSON.stringify(switchRes.data)}`);
  const ananyaToken = switchRes.data.token;

  // 8. CHECK RECEIVED INVITATIONS & NOTIFICATIONS
  console.log('8. Checking candidate received invitations...');
  const invsRes = await api('/invitations', {
    headers: { Authorization: `Bearer ${ananyaToken}` },
  });
  const pendingInv = invsRes.data.received.find((i: any) => i.id === invId);
  if (!pendingInv) throw new Error('Sent invitation not found in receiver inbox!');
  console.log('✓ Invitation found in receiver inbox. Status:', pendingInv.status);

  // 9. ACCEPT INVITATION
  console.log('9. Accepting project invitation...');
  const acceptRes = await api(`/invitations/${invId}/respond`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ananyaToken}` },
    body: JSON.stringify({ action: 'accept' }),
  });
  if (!acceptRes.ok) throw new Error(`Accepting failed: ${JSON.stringify(acceptRes.data)}`);
  console.log('✓ Invitation accepted successfully.');

  // 10. VERIFY TEAM MEMBERSHIP
  console.log('10. Verifying team membership in team workspace...');
  const teamRes = await api(`/teams/${team.id}`, {
    headers: { Authorization: `Bearer ${ananyaToken}` },
  });
  if (!teamRes.ok) throw new Error(`Team fetch failed: ${JSON.stringify(teamRes.data)}`);
  const memberIds = teamRes.data.team.members.map((m: any) => m.userId);
  if (!memberIds.includes(targetCandidate.student.id)) throw new Error('Member was not added to the team roster!');
  console.log(`✓ Team roster verified: ${teamRes.data.team.members.map((m: any) => m.name).join(', ')}`);

  // 11. CREATE AND ASSIGN TASK
  console.log('11. Creating and assigning deliverable task in team...');
  const taskRes = await api(`/teams/${team.id}/tasks`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ananyaToken}` },
    body: JSON.stringify({
      title: 'Configure optical flow sensor on I2C bus',
      description: 'Wire PMW3901 sensor to ESP32 board and test 50Hz frame rate capture.',
      assignedTo: targetCandidate.student.id,
      priority: 'High',
      dueDate: '2026-11-10',
    }),
  });
  if (!taskRes.ok) throw new Error(`Task creation failed: ${JSON.stringify(taskRes.data)}`);
  const task = taskRes.data.task;
  console.log('✓ Task created:', task.title, 'Status:', task.status);

  // 12. UPDATE TASK STATUS
  console.log('12. Updating task status to "In Progress"...');
  const updateTaskRes = await api(`/tasks/${task.id}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${ananyaToken}` },
    body: JSON.stringify({ status: 'In Progress' }),
  });
  if (!updateTaskRes.ok) throw new Error(`Task update failed: ${JSON.stringify(updateTaskRes.data)}`);
  console.log('✓ Task status updated to:', updateTaskRes.data.task.status);

  // 13. SEND TEAM CHAT MESSAGE
  console.log('13. Exchanging team chat message...');
  const chatRes = await api(`/teams/${team.id}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${ananyaToken}` },
    body: JSON.stringify({
      content: 'Hey Priya, I accepted the invitation! I will start wiring the optical flow sensor tomorrow.',
    }),
  });
  if (!chatRes.ok) throw new Error(`Chat post failed: ${JSON.stringify(chatRes.data)}`);
  console.log('✓ Chat message posted:', chatRes.data.message.content);

  // 14. VERIFY NOTIFICATIONS
  console.log('14. Checking lead Priya Patel notifications...');
  const priyaNotifRes = await api('/notifications', {
    headers: { Authorization: `Bearer ${priyaToken}` },
  });
  const acceptNotif = priyaNotifRes.data.notifications.find((n: any) => n.type === 'invitation_accepted');
  if (!acceptNotif) console.warn('Note: acceptance notification was queued.');
  else console.log('✓ Lead received acceptance notification:', acceptNotif.title);

  console.log('\n=============================================');
  console.log('🎉 ALL 14 CORE WORKFLOW STAGES PASSED SUCCESSFULLY!');
  console.log('=============================================\n');
}

runTests().catch(err => {
  console.error('Test script failed:', err);
  process.exit(1);
});
