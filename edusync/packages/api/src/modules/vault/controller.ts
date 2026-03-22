import { Request, Response } from 'express';
import { VaultService } from './service.js';
import { v2 as cloudinary } from 'cloudinary';

export class VaultController {
  static async uploadResource(req: Request, res: Response) {
    try {
      if (!req.file) throw new Error('No file uploaded');
      // institutionalAuth middleware attaches student profile to req.user
      const student = (req as any).user;

      // 1. Cloudinary Upload (using DataURI for buffer)
      const b64 = Buffer.from(req.file.buffer).toString("base64");
      let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
      
      const cldRes = await cloudinary.uploader.upload(dataURI, {
        resource_type: "auto",
        folder: "nexus_vault"
      });

      // 2. Call Service with Cloudinary URL
      const resource = await VaultService.uploadResource({
        ...req.body,
        ownerUid: student.uid,
        campusId: student.campus,
        fileUrl: cldRes.secure_url,
        fileType: req.body.fileType || 'PDF',
        karmaCost: parseInt(req.body.karmaCost || '0')
      });

      res.status(201).json({ success: true, data: resource });
    } catch (error: any) {
      console.error('Vault Upload Error:', error);
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async listResources(req: Request, res: Response) {
    try {
      const student = (req as any).user;
      const { search, fileType, limit, skip } = req.query;

      const resources = await VaultService.listResources({
        campusId: student.campus,
        collegeGroupId: student.collegeGroupId,
        hasCrossCampus: student.nexus?.crossCampusEnabled,
        search: search as string,
        fileType: fileType as string,
        limit: limit ? parseInt(limit as string) : 20,
        skip: skip ? parseInt(skip as string) : 0
      });
      res.json({ success: true, data: resources });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async purchaseResource(req: Request, res: Response) {
    try {
      const { resourceId } = req.params;
      const student = (req as any).user;
      const resource = await VaultService.purchaseResource(resourceId, student.uid, student.campus);
      res.json({ success: true, data: resource });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getResource(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const resource = await VaultService.getResourceById(id);
      if (!resource) return res.status(404).json({ success: false, error: 'Resource not found' });
      res.json({ success: true, data: resource });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async semanticSearch(req: Request, res: Response) {
    try {
      const { q } = req.query;
      if (!q) return res.status(400).json({ success: false, error: 'Query required' });
      const resources = await VaultService.searchResourcesSemantic(q as string);
      res.json({ success: true, data: resources });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async resubmitResource(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const student = (req as any).user;
      const resource = await VaultService.resubmitResource(id, student.uid, req.body);
      res.json({ success: true, data: resource });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
