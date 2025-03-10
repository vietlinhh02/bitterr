// drug-app/backend/src/services/openDrugService.js
const axios = require('axios');
require('dotenv').config();
// Thêm hàm mới để tìm kiếm thuốc theo nhiều thành phần
const searchDrugByIngredients = async (ingredients) => {
    try {
        // Tạo query cho nhiều thành phần
        const ingredientQueries = ingredients.map(ingredient => 
            `openfda.active_ingredient:"${ingredient}"`
        );
        const drugapikey = process.env.DRUG_API_KEY;
        const searchQuery = ingredientQueries.join(' OR ');
        const encodedSearchQuery = encodeURIComponent(searchQuery);
        const response = await axios.get(`https://api.fda.gov/drug/label.json?search=${encodedSearchQuery}&limit=10`);

        if (response.data && response.data.results && response.data.results.length > 0) {
            const results = response.data.results;
            const simplifiedResults = results.map(result => ({
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
            }));
            return simplifiedResults;
        }
        return [];
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

        for (const query of queries) {
            const searchQuery = `openfda.generic_name:"${query}" OR openfda.brand_name:"${query}"`;
            const encodedSearchQuery = encodeURIComponent(searchQuery);
            const response = await axios.get(`https://api.fda.gov/drug/label.json?search=${encodedSearchQuery}&limit=1`);

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

module.exports = { searchDrug, searchDrugByIngredients };