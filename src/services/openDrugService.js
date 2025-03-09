// drug-app/backend/src/services/openDrugService.js
const axios = require('axios');
require('dotenv').config();

// Cấu hình API key
const getFDAApiConfig = () => {
  const apiKey = process.env.DRUG_API_KEY;
  
  // Kiểm tra xem API key có tồn tại không
  if (!apiKey) {
    console.warn('FDA API key is not set. API calls may be rate limited.');
    return { baseURL: 'https://api.fda.gov', params: {} };
  }
  
  // Trả về cấu hình với API key
  return {
    baseURL: 'https://api.fda.gov',
    params: { api_key: apiKey }
  };
};

// Hàm tìm kiếm sự kiện thuốc từ API endpoint /drug/event.json
const searchDrugEvents = async (searchParams) => {
  try {
    // Lấy cấu hình API
    const apiConfig = getFDAApiConfig();
    
    // Tạo URL với API key
    const url = `${apiConfig.baseURL}/drug/event.json`;
    
    // Xây dựng tham số tìm kiếm
    let searchQuery = '';
    
    // Nếu có medicinalproduct (tên thuốc)
    if (searchParams.medicinalproduct) {
      searchQuery += `patient.drug.medicinalproduct:"${searchParams.medicinalproduct}"`;
    }
    
    // Nếu có reactionmeddrapt (phản ứng)
    if (searchParams.reactionmeddrapt) {
      if (searchQuery) searchQuery += ' AND ';
      searchQuery += `patient.reaction.reactionmeddrapt:"${searchParams.reactionmeddrapt}"`;
    }
    
    // Nếu có reportercountry (quốc gia báo cáo)
    if (searchParams.reportercountry) {
      if (searchQuery) searchQuery += ' AND ';
      searchQuery += `primarysource.reportercountry:"${searchParams.reportercountry}"`;
    }
    
    // Nếu có seriousness (mức độ nghiêm trọng)
    if (searchParams.serious) {
      if (searchQuery) searchQuery += ' AND ';
      searchQuery += `serious:"${searchParams.serious}"`;
    }
    
    // Tạo params với API key và các tham số khác
    const params = {
      ...apiConfig.params,
      limit: searchParams.limit || 10
    };
    
    // Thêm tham số search nếu có
    if (searchQuery) {
      params.search = searchQuery;
    }
    
    // Gọi API
    const response = await axios.get(url, { params });
    
    if (response.data && response.data.results && response.data.results.length > 0) {
      // Xử lý và đơn giản hóa kết quả
      const simplifiedResults = response.data.results.map(result => {
        return {
          safetyreportid: result.safetyreportid || 'N/A',
          receivedate: result.receivedate || 'N/A',
          serious: result.serious || 'N/A',
          seriousnessdeath: result.seriousnessdeath || 'N/A',
          reportercountry: result.primarysource?.reportercountry || 'N/A',
          drugs: result.patient?.drug?.map(drug => ({
            medicinalproduct: drug.medicinalproduct || 'N/A',
            drugindication: drug.drugindication || 'N/A',
            drugcharacterization: drug.drugcharacterization || 'N/A',
            drugadministrationroute: drug.drugadministrationroute || 'N/A',
            activesubstancename: drug.activesubstance?.activesubstancename || 'N/A'
          })) || [],
          reactions: result.patient?.reaction?.map(reaction => ({
            reactionmeddrapt: reaction.reactionmeddrapt || 'N/A',
            reactionoutcome: reaction.reactionoutcome || 'N/A'
          })) || []
        };
      });
      
      return {
        meta: response.data.meta,
        results: simplifiedResults
      };
    }
    
    return { meta: response.data.meta, results: [] };
  } catch (error) {
    console.error('Error calling OpenFDA API:', error);
    if (error.response) {
      console.error("OpenFDA API error:", error.response.status, error.response.data);
      throw new Error(`OpenFDA API error: ${error.response.status}`);
    } else if (error.request) {
      console.error("No response received from OpenFDA API");
      throw new Error('No response received from OpenFDA API');
    } else {
      console.error('Error setting up OpenFDA request:', error.message);
      throw new Error('Failed to call OpenFDA API');
    }
  }
};

// Cập nhật hàm searchDrug để hỗ trợ nhiều loại tên thuốc
const searchDrug = async (queries) => {
    try {
        const allResults = [];
        
        // Lấy cấu hình API
        const apiConfig = getFDAApiConfig();
        
        // Tạo URL với API key
        const url = `${apiConfig.baseURL}/drug/label.json`;

        for (const query of queries) {
            const searchQuery = `openfda.generic_name:"${query}" OR openfda.brand_name:"${query}"`;
            
            // Tạo params với API key và các tham số khác
            const params = {
              ...apiConfig.params,
              search: searchQuery,
              limit: 1
            };
            
            // Gọi API
            const response = await axios.get(url, { params });

            if (response.data && response.data.results && response.data.results.length > 0) {
                const result = response.data.results[0];
                const simplifiedResult = {
                    brand_name: result.openfda?.brand_name?.[0] || 'N/A',
                    generic_name: result.openfda?.generic_name?.[0] || 'N/A',
                    indications_and_usage: result.indications_and_usage?.[0] || 'N/A',
                    warnings: result.warnings?.[0] || 'N/A',
                    purpose: result.purpose?.[0] || 'N/A',
                    active_ingredient: result.active_ingredient?.[0] || 'N/A',
                    adverse_reactions: result.adverse_reactions ? result.adverse_reactions[0] : 'N/A',
                    do_not_use: result.do_not_use ? result.do_not_use[0] : 'N/A',
                    when_using: result.when_using ? result.when_using[0] : 'N/A',
                    stop_use: result.stop_use ? result.stop_use[0] : 'N/A',
                    overdosage: result.overdosage ? result.overdosage[0] : 'N/A',
                    dosage_and_administration: result.dosage_and_administration ? result.dosage_and_administration[0] : 'N/A'
                };
                allResults.push(simplifiedResult);
            }
        }
      return allResults;

    } catch (error) {
        console.error('Error calling OpenFDA API:', error);
        if (error.response) {
            console.error("OpenFDA API error:", error.response.status, error.response.data);
            throw new Error(`OpenFDA API error: ${error.response.status}`);
        } else if (error.request) {
            console.error("No response received from OpenFDA API");
            throw new Error('No response received from OpenFDA API');
        } else {
            console.error('Error setting up OpenFDA request:', error.message);
            throw new Error('Failed to call OpenFDA API');
        }
    }
};

module.exports = { searchDrug, searchDrugEvents };