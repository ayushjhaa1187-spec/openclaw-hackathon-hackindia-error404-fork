import { Request, Response } from 'express';
import { StudentModel, SwapModel } from '@edusync/db';
import { nexusConnector } from '@edusync/db';
import { SkillSwapSchema, encrypt, decrypt } from '@edusync/shared';

export const listSkills = async (req: Request, res: Response) => {
  try {
    const { campus, query, wantSkill, minKarma } = req.query;
    let filter: any = {};
    
    if (campus) filter.campus = campus;
    
    if (query) {
      filter.skills = { $in: [new RegExp(query as string, 'i')] };
    }
    
    if (minKarma) {
      filter.karma = { $gte: parseInt(minKarma as string) };
    }

    const matchingStudents = await StudentModel.find(filter)
      .sort({ 
        karma: -1, 
        reputationScore: -1,
        'profile.year': -1 
      })
      .limit(30)
      .select('name skills specialization campus karma avatarUrl reputationScore');

    const results = matchingStudents.map((s: any) => ({
      ...s.toObject(),
      matchScore: (s.karma / 100) + (s.reputationScore * 2)
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
    
    // Mask sensitive firebaseUid in public profile response
    const profile = student.toObject();
    profile.firebaseUid = encrypt(profile.firebaseUid); // Masking for transit
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ error: 'Profile Retrieval Failure' });
  }
};

export const proposeSwap = async (req: Request, res: Response) => {
  try {
    const student = (req as any).student;
    if (!student) return res.status(401).json({ error: 'Auth Required' });

    const validatedBody = SkillSwapSchema.parse({
      ...req.body,
      requesterUid: student.uid
    });

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
    const student = (req as any).student;
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
