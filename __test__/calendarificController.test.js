const axios = require('axios');
const NodeCache = require('node-cache');
const { getHolidays, getCountries } = require('../controllers/calendarificController.js');

jest.mock('axios');

describe('Calendarific Controller', () => {
  const mockCache = new NodeCache();
  const mockReq = { query: { country: 'US', year: '2024' } };
  const mockRes = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCache.flushAll();
  });

  it('should fetch supported countries from the API and cache it', async () => {
    axios.get.mockResolvedValue({ data: { response: { countries: [{ name: 'United States', 'iso-3166': 'US' }] } } });

    await getCountries(mockReq, mockRes);

    expect(axios.get).toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ data: [{ name: 'United States', 'iso-3166': 'US' }] });
  });

  it('should return cached supported countries', async () => {
    mockCache.set('supported_countries', [{ name: 'United States', 'iso-3166': 'US' }]);

    await getCountries(mockReq, mockRes);

    expect(axios.get).not.toHaveBeenCalled();
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ data: [{ name: 'United States', 'iso-3166': 'US' }] });
  });

  it('should return holidays for a valid country and year', async () => {
    mockCache.set('supported_countries', [{ name: 'United States', 'iso-3166': 'US' }]);
    axios.get.mockResolvedValue({ data: { response: { holidays: [{ name: 'New Year', date: '2024-01-01' }] } } });

    await getHolidays(mockReq, mockRes);

    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/holidays'), expect.any(Object));
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ data: [{ name: 'New Year', date: '2024-01-01' }] });
  });

  it('should return 400 for an invalid country', async () => {
    mockReq.query.country = 'ZZ';
    mockCache.set('supported_countries', [{ name: 'United States', 'iso-3166': 'US' }]);

    await getHolidays(mockReq, mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({ error: 'Invalid country' });
  });
});