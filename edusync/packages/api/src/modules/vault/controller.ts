import { Request, Response } from 'express';
import { ResourceModel, StudentModel } from '@edusync/db';
import { KarmaService } from '../karma/service';

export const listResources = async (req: Request, res: Response) => {
  try {
    const { campus, query, type } = req.query;
    let filter: any = {};
    
    if (campus) filter.campus = campus;
    if (type) filter.fileType = type;
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { tags: { $in: [new RegExp(query as string, 'i')] } }
      ];
    }

    const resources = await ResourceModel.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: 'Vault Retrieval Error' });
  }
};

export const uploadResource = async (req: Request, res: Response) => {
  try {
    const student = req.student;
    if (!student) return res.status(401).json({ error: 'Auth Required' });

    const newResource = new ResourceModel({
      ...req.body,
      ownerUid: student.uid,
      campus: student.campus,
      verified: false // Admin must verify for "Premium" status
    });

    await newResource.save();
    
    // Reward user with small Karma for contribution
    await KarmaService.recordTransaction({
      fromUid: 'NEXUS_TREASURY',
      toUid: student.uid,
      amount: 10,
      reason: `Resource Contribution: ${newResource.title}`
    });

    res.status(201).json(newResource);
  } catch (error) {
    res.status(400).json({ error: 'Vault Upload Failure' });
  }
};

export const purchaseResource = async (req: Request, res: Response) => {
  try {
    const student = req.student;
    if (!student) return res.status(401).json({ error: 'Auth Required' });

    const { resourceId } = req.params;
    const resource = await ResourceModel.findById(resourceId);
    
    if (!resource) return res.status(404).json({ error: 'Resource Not Found' });
    if (resource.ownerUid === student.uid) return res.json({ fileUrl: resource.fileUrl });

    // Check Karma Balance
    const balance = await KarmaService.getBalance(student.uid);
    if (balance < resource.karmaCost) {
      return res.status(403).json({ error: 'Insufficient Karma for this Knowledge Asset' });
    }

    // Process Transaction
    await KarmaService.recordTransaction({
      fromUid: student.uid,
      toUid: resource.ownerUid,
      amount: resource.karmaCost,
      reason: `Vault Purchase: ${resource.title}`
    });

    // Increment Download Count
    await ResourceModel.findByIdAndUpdate(resourceId, { $inc: { downloads: 1 } });

    res.json({ fileUrl: resource.fileUrl, message: 'Nexus Purchase Successful' });
  } catch (error) {
    res.status(500).json({ error: 'Nexus Transaction Failure' });
  }
};
