import axios from 'axios';

const API_BASE = 'http://localhost:3001/api/v1';

async function verifyNexus() {
  console.log('🧪 Starting EduSync Nexus Node Verification...');

  try {
    // 1. Health Check
    const health = await axios.get(`${API_BASE}/health`);
    console.log('✅ Health Check:', health.data.status);

    // 2. Skill Discovery
    const skills = await axios.get(`${API_BASE}/skills?query=Python`);
    console.log('✅ Skill Discovery:', skills.data.length, 'students found');

    // 3. Vault Discovery
    const vault = await axios.get(`${API_BASE}/vault`);
    console.log('✅ Knowledge Vault:', vault.data.length, 'resources found');

    // 4. Admin Telemetry
    // Note: This requires auth in production, but we test the endpoint existence
    try {
      await axios.get(`${API_BASE}/admin/stats`);
    } catch (err: any) {
      if (err.response?.status === 401) {
        console.log('✅ Admin Hub: Protected as expected');
      } else {
        console.log('❌ Admin Hub: Unexpected error', err.response?.status);
      }
    }

    console.log('✨ All Segments Verified Structurally.');
  } catch (error) {
    console.error('❌ Verification Failed:', error.message);
  }
}

// verifyNexus(); // Execution deferred to terminal
