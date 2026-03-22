import { Request, Response } from 'express';
import { StudentModel, SwapModel } from '@edusync/db';
import { nexusConnector } from '@edusync/db';
import { SkillSwapSchema } from '@edusync/shared';

export const listSkills = async (req: Request, res: Response) => {
  try {
    const { campus, query, wantSkill, minKarma } = req.query;
    let filter: any = {};
    
    // 1. Campus Proximity Filtering
    if (campus) filter.campus = campus;
    
    // 2. Skill Overlap Matching
    if (query) {
      filter.skills = { $in: [new RegExp(query as string, 'i')] };
    }
    
    // 3. Karma Thresholding (Guardian Protocol)
    if (minKarma) {
      filter.karma = { $gte: parseInt(minKarma as string) };
    }

    // 4. Weighted Scoring Algorithm
    // Priorities: Target Skill Match > High Karma (Gold/Platinum) > Reputation Score
    const matchingStudents = await StudentModel.find(filter)
      .sort({ 
        karma: -1, 
        reputationScore: -1,
        'profile.year': -1 
      })
      .limit(30)
      .select('name skills specialization campus karma avatarUrl reputationScore');

    // 5. Post-Process for Mutual Exchange (Nexus Logic)
    // In a real prod env, we'd use MongoDB $lookup or $graphLookup for complex matching
    const results = matchingStudents.map((s: any) => ({
      ...s.toObject(),
      matchScore: (s.karma / 100) + (s.reputationScore * 2) // Simple weighted formula
    }));

    res.json(results.sort((a: any, b: any) => b.matchScore - a.matchScore));
  } catch (error) {
    res.status(500).json({ error: 'Nexus Search Failure' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const student = await StudentModel.findOne({ firebaseUid: id });
    if (!student) return res.status(404).json({ error: 'Student Node Not Found' });
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: 'Profile Retrieval Failure' });
  }
};

export const proposeSwap = async (req: Request, res: Response) => {
  try {
    const student = req.student; // From auth middleware
    if (!student) return res.status(401).json({ error: 'Auth Required' });

    const validatedBody = SkillSwapSchema.parse({
      ...req.body,
      requesterUid: student.uid
    });

    // Verify requester has enough Karma
    const requester = await StudentModel.findOne({ firebaseUid: student.uid });
    if (!requester || requester.karma < validatedBody.karmaStaked) {
      return res.status(403).json({ error: 'Insufficient Karma Balance for Nexus Staking' });
    }

    const newSwap = new SwapModel(validatedBody);
    await newSwap.save();

    res.status(201).json({ 
      message: 'Nexus Swap Proposal Broadcasted',
      swapId: newSwap._id 
    });
  } catch (error) {
    res.status(400).json({ error: 'Invalid Swap Protocol parameters' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const student = req.student;
    if (!student) return res.status(401).json({ error: 'Auth Required' });

    const updated = await StudentModel.findOneAndUpdate(
      { firebaseUid: student.uid },
      { $set: req.body },
      { new: true, upsert: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Profile Sync Failure' });
  }
};
