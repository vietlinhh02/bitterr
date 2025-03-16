const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const DrugSearch = require('../models/DrugSearch');

// Mock user authentication middleware
jest.mock('../middleware/auth', () => ({
  protect: (req, res, next) => {
    req.user = { id: '60d0fe4f5311236168a109ca' };
    next();
  }
}));

describe('Drug Controller Tests', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bitterr_test', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await DrugSearch.deleteMany({});
  });

  describe('Search Drug Tests', () => {
    test('should return drug search results', async () => {
      const res = await request(app)
        .get('/api/drug/search?keyword=paracetamol')
        .expect(200);

      expect(res.body).toHaveProperty('success', true);
      expect(res.body).toHaveProperty('data');
    });

    test('should handle empty search queries', async () => {
      const res = await request(app)
        .get('/api/drug/search?keyword=')
        .expect(400);

      expect(res.body).toHaveProperty('success', false);
    });

    test('should save search history', async () => {
      await request(app)
        .get('/api/drug/search?keyword=ibuprofen')
        .expect(200);

      const searchHistory = await DrugSearch.findOne({ query: 'ibuprofen' });
      expect(searchHistory).toBeTruthy();
      expect(searchHistory.userId).toBe('60d0fe4f5311236168a109ca');
    });
  });

  describe('Drug Events Tests', () => {
    test('should return drug events', async () => {
      const res = await request(app)
        .get('/api/drug/drug-events?medicinalproduct=paracetamol')
        .expect(200);

      expect(res.body).toHaveProperty('results');
    });
  });
});
