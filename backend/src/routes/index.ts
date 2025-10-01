/**
 * Routes Index
 * Aggregates all route modules
 */

import { Router } from 'express';
import reviewRoutes from './review.routes';
import authRoutes from './auth.routes';

const router = Router();

// Mount routes
router.use('/reviews', reviewRoutes);
router.use('/products', reviewRoutes); // Also mount under /products for convenience
router.use('/auth', authRoutes);

export default router;
