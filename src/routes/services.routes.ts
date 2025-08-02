import express from 'express';
import {
  getAllServices,
  getServiceById,
  createService,
  updateService,
  deleteService
} from '../controllers/serviceController';
import { auth, requireProvider } from '../middleware/auth';

const router = express.Router();

// Public routes
router.get('/', getAllServices);
router.get('/:id', getServiceById);

// Protected routes (Admin/Provider only)
router.post('/', auth, requireProvider, createService);
router.put('/:id', auth, requireProvider, updateService);
router.delete('/:id', auth, requireProvider, deleteService);

export default router; 