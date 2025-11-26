import express from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController';
import { auth, requireProvider } from '../middleware/auth';
import { requireAdmin } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Protected routes - Allow both admin and provider
// Custom middleware to check for admin or provider
const requireAdminOrProvider = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const isAdmin = req.header('X-Admin') === 'true';
  if (isAdmin) {
    // Admin requests - use requireAdmin which handles its own auth
    return requireAdmin(req, res, next);
  }
  // Provider requests - use standard auth + requireProvider
  // First authenticate, then check provider
  return auth(req, res, () => {
    return requireProvider(req, res, next);
  });
};

router.post('/', requireAdminOrProvider, createService);
router.put('/:id', auth, requireProvider, updateService);
router.delete('/:id', auth, requireProvider, deleteService);

export default router; 