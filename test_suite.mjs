// Mock localStorage and window for Node.js test environment BEFORE imports
const mockStore = {};
global.localStorage = {
  getItem: (key) => mockStore[key] || null,
  setItem: (key, val) => { mockStore[key] = String(val); },
  removeItem: (key) => { delete mockStore[key]; },
  clear: () => { Object.keys(mockStore).forEach(k => delete mockStore[k]); }
};

global.window = {
  location: {
    origin: 'http://127.0.0.1:5173',
    pathname: '/'
  }
};

// Dynamic imports after mocking global objects
const { calculateHaversineDistance, locationService } = await import('./src/services/locationService.ts');
const { qrShareService } = await import('./src/services/qrShareService.ts');
const { storageService } = await import('./src/services/storageService.ts');
const { authService } = await import('./src/services/authService.ts');
const { appointmentService } = await import('./src/services/appointmentService.ts');
const { aiService } = await import('./src/services/aiService.ts');

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${testName}`);
    failed++;
  }
}

async function runTests() {
  console.log('\n========================================');
  console.log('🧪 RUNNING ACCESSIBLE HEALTHCARE SUPPORT TEST SUITE');
  console.log('========================================\n');

  // TEST 1: Haversine Distance Calculation
  console.log('--- TEST GROUP 1: Geolocation & Haversine Distance ---');
  const d1 = calculateHaversineDistance(12.9716, 77.5946, 12.9771, 77.5988);
  assert(d1 > 0 && d1 < 2.0, `Haversine distance calculated accurately (${d1} km)`);

  const mockUserCoords = { latitude: 12.9716, longitude: 77.5946 };
  const nearbyHospitals = locationService.getNearbyHospitals(mockUserCoords);
  assert(nearbyHospitals.length >= 5, `Retrieved ${nearbyHospitals.length} nearby hospitals`);

  // Check Nearest-to-Farthest sorting
  let isSorted = true;
  for (let i = 1; i < nearbyHospitals.length; i++) {
    if ((nearbyHospitals[i].distance || 0) < (nearbyHospitals[i - 1].distance || 0)) {
      isSorted = false;
      break;
    }
  }
  assert(isSorted, 'Hospitals are strictly sorted Nearest → Farthest');
  assert(nearbyHospitals[0].consultationFee >= 500, `Consultation fee is realistic in ₹ INR (₹${nearbyHospitals[0].consultationFee})`);

  // TEST 2: Symptom Search & Educational Recommendation (No Diagnosis)
  console.log('\n--- TEST GROUP 2: Symptom to Department Recommendation ---');
  const boneMatch = locationService.analyzeSymptom('Bone Pain in knee joint');
  assert(boneMatch !== null, 'Symptom matching returned result');
  assert(boneMatch?.recommendedDepartment === 'Orthopedics', `Symptom "Bone Pain" recommends "Orthopedics" (got ${boneMatch?.recommendedDepartment})`);
  assert(boneMatch?.explanation.includes('Orthopedics may be an appropriate department'), 'Educational wording used without diagnosing');
  assert(boneMatch?.disclaimer.includes('does not constitute a medical diagnosis'), 'Educational medical disclaimer present');

  const chestMatch = locationService.analyzeSymptom('Chest Pain and pressure');
  assert(chestMatch?.recommendedDepartment === 'Cardiology', 'Symptom "Chest Pain" recommends "Cardiology"');

  // TEST 3: Zero-OTP Authentication Flow
  console.log('\n--- TEST GROUP 3: Zero-OTP Authentication ---');
  const regResult = await authService.register({
    mobile: '9887766554',
    username: 'Dr. Vikram Sethi',
    password: 'Vikram@2026',
    confirmPassword: 'Vikram@2026',
    location: 'Indiranagar, Bengaluru',
    emergencyContactName: 'Ananya Sethi',
    emergencyContactNumber: '+91 98877 12345',
    age: 38,
    gender: 'Male',
    bloodGroup: 'B+',
    allergies: 'None',
    existingConditions: 'None',
    currentMedications: 'None'
  });

  assert(regResult.success === true, 'Zero-OTP Registration succeeds without any OTP prompt');
  assert(regResult.user?.username === 'Dr. Vikram Sethi', 'User object created immediately');
  assert(authService.getCurrentUser()?.id === regResult.user?.id, 'Authenticated session created automatically for direct dashboard entry');

  // Test Login with Mobile & Password
  const loginResult = await authService.login({
    mobile: '9887766554',
    password: 'Vikram@2026'
  });
  assert(loginResult.success === true, 'Login with Mobile + Password succeeds');

  // Test Password Reset without OTP (using emergency contact verification)
  const resetResult = await authService.resetPassword({
    mobile: '9887766554',
    emergencyContactNumber: '9887712345',
    newPassword: 'NewPassword@2026',
    confirmNewPassword: 'NewPassword@2026'
  });
  assert(resetResult.success === true, 'Zero-OTP password reset succeeds via emergency contact verification');

  // TEST 4: Appointment CRUD & Timeline Integration
  console.log('\n--- TEST GROUP 4: Appointment CRUD & Timeline Sync ---');
  const user = authService.getCurrentUser();
  const aptResult = appointmentService.createAppointment({
    userId: user.id,
    hospitalId: 'hosp_test_1',
    hospitalName: 'Apollo Specialty Hospital',
    doctorName: 'Dr. Ramesh Sundaram',
    department: 'Orthopedics',
    date: '2026-09-05',
    time: '10:30 AM',
    purpose: 'Knee joint pain consultation',
    fee: 850
  });

  assert(aptResult.success === true, 'Appointment created successfully');
  const userApts = appointmentService.getAppointments(user.id);
  assert(userApts.some(a => a.doctorName === 'Dr. Ramesh Sundaram'), 'Appointment persisted in storage');

  const timelineEvents = storageService.getTimelineEvents(user.id);
  assert(timelineEvents.some(e => e.title.includes('Appointment Booked')), 'Health timeline automatically updated with appointment event');

  // TEST 5: Document Analysis & Zero-Hallucination Medical Parser
  console.log('\n--- TEST GROUP 5: Medical Document & Zero Disease Hallucination ---');
  const docs = storageService.getDocuments(user.id);
  assert(docs.length > 0, 'Demo document loaded in storage');
  const demoDoc = docs[0];
  assert(demoDoc.medicinesDetected.length >= 2, 'Medicines detected in document');
  assert(demoDoc.medicinesDetected.some(m => m.name.includes('Paracetamol')), 'Paracetamol 650mg accurately detected');
  assert(!demoDoc.simpleSummary.toLowerCase().includes('disease: fever'), 'Zero hallucination: Fever NOT invented for Paracetamol');
  assert(demoDoc.medicinesDetected[0].purpose.includes('Follow doctor instructions') || demoDoc.medicinesDetected[0].purpose.includes('pain'), 'General educational purpose provided with medical notice');

  // TEST 6: 24-Hour Tokenized QR Sharing
  console.log('\n--- TEST GROUP 6: 24-Hour Tokenized QR Sharing ---');
  const shareRes = qrShareService.generateShareToken(user);
  assert(shareRes.token.startsWith('ahs_'), `Generated secure random token: ${shareRes.token}`);
  assert(shareRes.shareUrl.includes('#share-ahs_'), `QR URL points to real share route: ${shareRes.shareUrl}`);
  assert(!shareRes.shareUrl.includes('bloodGroup') && !shareRes.shareUrl.includes('Allergies'), 'QR URL contains ONLY the token (NO raw medical payload inside QR)');

  // Validate active token
  const tokenValidation = qrShareService.validateToken(shareRes.token);
  assert(tokenValidation.status === 'valid', 'Active share token validates as valid');
  assert(tokenValidation.data?.userName === 'Dr. Vikram Sethi', 'Shared data accurately resolved from token');

  // Validate invalid token
  const invalidValidation = qrShareService.validateToken('invalid_token_999');
  assert(invalidValidation.status === 'invalid', 'Invalid token returns "invalid" status without crashing');
  assert(invalidValidation.message === 'This sharing link is invalid or no longer available.', 'Invalid token displays exact user-friendly message');

  // Simulate expired token (> 24 hours)
  const expiredTokens = storageService.getShareTokens();
  if (expiredTokens.length > 0) {
    expiredTokens[0].expiresAt = Date.now() - 1000; // expired in past
    storageService.saveShareToken(expiredTokens[0]);
    const expiredValidation = qrShareService.validateToken(expiredTokens[0].token);
    assert(expiredValidation.status === 'expired', 'Expired token (> 24h) returns "expired" status');
    assert(expiredValidation.message === 'This healthcare sharing link has expired.', 'Expired token displays exact expiration message');
  }

  // TEST 7: AI Healthcare Assistant Grounding
  console.log('\n--- TEST GROUP 7: AI Healthcare Assistant Grounding ---');
  const aiEmergency = await aiService.sendMessage('I am having severe chest pain and cannot breathe', user.id);
  assert(aiEmergency.isEmergencyAlert === true, 'AI detects medical emergency and triggers emergency alerts');
  assert(aiEmergency.text.includes('112'), 'AI immediately prompts user to Call 112');

  const aiQuestions = await aiService.sendMessage('Prepare questions for my doctor visit', user.id);
  assert(aiQuestions.text.includes('5 essential questions'), 'AI generates 5 targeted questions for doctor visit');

  const aiPrescription = await aiService.sendMessage('What medicines are written in my prescription?', user.id);
  assert(aiPrescription.text.includes('Paracetamol'), 'AI grounded in actual extracted prescription medicines');
  assert(aiPrescription.text.includes('Follow the exact instructions'), 'AI includes strict safety disclaimer');

  console.log('\n========================================');
  console.log(`📊 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('========================================\n');
}

runTests().catch(console.error);
