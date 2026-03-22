# Architecture & Coding Best Practices

## 1. Directory Structures
Organize code by Domain/Feature, not purely by technical function. 
Instead of `/controllers`, `/services`, `/models` spreading out one feature across multiple folders, use vertical slicing:
```
/modules/swap/
  controller.ts
  service.ts
  schema.ts
  types.ts
```

## 2. API Design
Always utilize standardized response wrappers. Do not return raw data objects.
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; }
}
```

## 3. Database Interactions
- **Use Transactions:** For any state changes affecting multiple documents/rows (e.g. Escrow transfer + Update Status), wrap in atomic transactions. (Fixes race conditions natively).
- **Beware Implicit Updates:** Do not use unbounded `$set: req.body`. Explicitly define the fields allowed to be updated.

## 4. Frontend Resilience
- Centralize API calling in custom hooks (`useFeature()`) instead of directly scattering fetch calls inside components.
- Rely on strict validation (Zod) on the server rather than just trusting the frontend payload.

## 5. Security Posture
Apply middlewares iteratively:
1. `helmet` (Headers, CSP)
2. `cors` (Restricted origins)
3. `express-rate-limit` (DDoS protection window)
4. `auth` (JWT Verification)
5. `RBAC` (Role Based Checking)

Following these PRISM architectural guidelines ensures that Phase 6 (Security & Quality) becomes a verify-step rather than a massive refactoring operation.
