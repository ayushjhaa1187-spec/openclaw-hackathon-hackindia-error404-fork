import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Simulation of the OIDC Broker Login
router.post('/login', (req, res) => {
  const { email, campusId } = req.body;
  
  // In a real system, the IdP would redirect here with a code
  // and we would exchange it for user info.
  const mockUser = {
    id: '66d0f1... (ObjectId)',
    email,
    campusId,
    role: 'student',
    nexusPermissions: true
  };

  const token = jwt.sign(mockUser, process.env.JWT_SECRET || 'NexusProtocol_4.0', { expiresIn: '7d' });
  
  res.json({
    message: 'Federated Auth Successful',
    token,
    user: mockUser
  });
});

export default router;
