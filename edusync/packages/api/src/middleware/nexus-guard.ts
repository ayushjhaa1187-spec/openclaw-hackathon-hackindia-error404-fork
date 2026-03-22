import { Request, Response, NextFunction } from 'express';
import { nexusConnector, StudentModel } from '@edusync/db';

/**
 * nexusGuard middleware:
 * 1. Verify req.student.nexus.crossCampusEnabled === true
 * 2. Extract target campus and verify it's different from requester's campus
 * 3. Run MOU validity check against PostgreSQL mou_handshake_log
 * 4. Attach active MOU metadata to req for downstream modules
 */
export const nexusGuard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const student = (req as any).student;

    // 1. Check if student has enabled Nexus features
    if (!student?.nexus?.crossCampusEnabled) {
      return res.status(403).json({
        success: false,
        code: 'NEXUS_NOT_ENABLED',
        error: 'Enable Nexus in your profile settings to access cross-campus features'
      });
    }

    // 2. Extract target campus (from params, query, or body)
    // For profile views: /nexus/profile/:uid (need to fetch student or pass campus in query)
    // For explore: /nexus/explore?query=...
    // For partners: /nexus/partners
    let targetCampus = req.query.targetCampus as string || req.params.campus;

    // Special case: If targeting a specific student profile, we might not have the campus yet.
    // However, the middleware is designed to guard the MAPPING, so the controller/service 
    // will need to provide the campus or the guard will handle it if possible.
    // In search/explore, the target is often implied by the result set.
    // For specific profile view/:uid, we might need to fetch the target student's campus first
    // if it's not provided in the request.
    
    if (req.params.uid && !targetCampus) {
        const targetStudent = await StudentModel.findOne({ firebaseUid: req.params.uid }).select('campus');
        if (targetStudent) {
            targetCampus = targetStudent.campus;
        }
    }

    if (!targetCampus) {
        // If no target campus and it's not a general partner discovery route
        if (req.path.includes('/profile') || req.path.includes('/propose')) {
             return res.status(400).json({ success: false, error: 'Target campus is required for this Nexus action' });
        }
        // For /explore or /partners, the guard might skip the MOU check here or perform a general validity check.
        // Actually, for /explore, we filter by ALL active MOUs.
        return next();
    }

    // 3. Prevent same-campus Nexus actions
    if (targetCampus === student.campus) {
      return res.status(400).json({
        success: false,
        code: 'SAME_CAMPUS',
        error: 'Use the local explore feature for same-campus students'
      });
    }

    // 4. MOU Validity Check (Postgres)
    const requesterCampus = student.campus;
    
    const mouQuery = `
      SELECT id, agreement_terms, valid_from, valid_until
      FROM mou_handshake_log
      WHERE (
        (initiating_campus = $1 AND accepting_campus = $2) OR
        (initiating_campus = $2 AND accepting_campus = $1)
      )
      AND "isActive" = true
      AND (valid_until IS NULL OR valid_until > NOW())
      LIMIT 1
    `;

    const result = await nexusConnector.pg.query(mouQuery, [requesterCampus, targetCampus]);

    if (result.rows.length === 0) {
      return res.status(403).json({
        success: false,
        code: 'NO_ACTIVE_MOU',
        error: `No active MOU exists between ${requesterCampus} and ${targetCampus}`
      });
    }

    // 5. Attach MOU to request
    (req as any).activeMOU = {
      id: result.rows[0].id,
      terms: result.rows[0].agreement_terms,
      validFrom: result.rows[0].valid_from,
      validUntil: result.rows[0].valid_until
    };

    next();
  } catch (err: any) {
    console.error('Nexus Guard Error:', err);
    res.status(500).json({ success: false, error: 'Internal Nexus Security Error' });
  }
};
