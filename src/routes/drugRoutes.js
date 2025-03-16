
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
const { protect } = require('../middleware/authMiddleware');

// Set up routes
router.get('/search', protect, searchDrug);
router.get('/search-history', protect, getDrugSearchHistory);
router.post('/save-search-history', protect, saveDrugSearchHistory);
router.delete('/search-history/:searchId', protect, deleteDrugSearchHistoryItem); // Add this route
router.get('/drug-events', protect, searchDrugEvents);

// ...existing code...

module.exports = router;
