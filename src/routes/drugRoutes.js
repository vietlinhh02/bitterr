// Import router and controller
const express = require('express');
const router = express.Router();
const { 
  searchDrug, 
  getDrugSearchHistory, 
  saveDrugSearchHistory, 
  deleteDrugSearchHistoryItem,
  searchDrugEvents 
} = require('../controllers/drugController');
const { authMiddleware } = require('../middleware/auth');

// Set up routes
router.get('/search', authMiddleware, searchDrug);
router.get('/search-history', authMiddleware, getDrugSearchHistory);
router.post('/save-search-history', authMiddleware, saveDrugSearchHistory);
router.delete('/search-history/:searchId', authMiddleware, deleteDrugSearchHistoryItem);
router.get('/drug-events', authMiddleware, searchDrugEvents);

module.exports = router;
