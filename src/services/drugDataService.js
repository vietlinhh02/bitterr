const fs = require('fs-extra');
const path = require('path');
const { performance } = require('perf_hooks');
const axios = require('axios');

// Cấu hình
const config = {
  keywords: [
    'đau đầu', 'viêm họng', 'ho', 'sốt', 'cảm cúm', 'tiêu chảy',
    'đau bụng', 'nhức mỏi', 'dị ứng', 'vitamin', 'thuốc bổ'
  ],
  outputDir: path.join(__dirname, '..', 'data', 'drugs'),
  delay: 1000,
  maxRetries: 3
};

// Utility functions
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

// Hàm tìm kiếm thuốc từ FDA API
async function searchFDADrugs(keyword, limit = 100) {
  try {
    const response = await axios.get(`https://api.fda.gov/drug/label.json`, {
      params: {
        search: `openfda.brand_name:"${keyword}" OR openfda.generic_name:"${keyword}"`,
        limit
      }
    });
    return response.data.results;
  } catch (error) {
    console.error(`Error searching FDA drugs for "${keyword}":`, error.message);
    return [];
  }
}

// Hàm lấy chi tiết thuốc từ FDA API
async function getFDADrugDetails(id) {
  try {
    const response = await axios.get(`https://api.fda.gov/drug/label/${id}.json`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching FDA drug details for ${id}:`, error.message);
    return null;
  }
}

// Hàm xử lý và lưu dữ liệu thuốc
async function processDrug(drug) {
  try {
    // Tạo đối tượng dữ liệu thuốc chuẩn hóa
    const processedDrug = {
      id: drug.id || '',
      brand_name: drug.openfda?.brand_name?.[0] || '',
      generic_name: drug.openfda?.generic_name?.[0] || '',
      manufacturer: drug.openfda?.manufacturer_name?.[0] || '',
      dosage_form: drug.openfda?.dosage_form?.[0] || '',
      route: drug.openfda?.route?.[0] || '',
      active_ingredients: drug.active_ingredient || [],
      purpose: drug.purpose || [],
      warnings: drug.warnings || [],
      dosage_administration: drug.dosage_and_administration || [],
      pregnancy_warnings: drug.pregnancy || [],
      storage: drug.storage_and_handling || [],
      indications_usage: drug.indications_and_usage || [],
      contraindications: drug.contraindications || [],
      drug_interactions: drug.drug_interactions || [],
      adverse_reactions: drug.adverse_reactions || [],
      updated_at: new Date().toISOString()
    };

    // Lưu dữ liệu vào file
    const drugDir = path.join(config.outputDir, processedDrug.id);
    await fs.ensureDir(drugDir);
    await fs.writeFile(
      path.join(drugDir, 'data.json'),
      JSON.stringify(processedDrug, null, 2)
    );

    return processedDrug;
  } catch (error) {
    console.error(`Error processing drug:`, error.message);
    return null;
  }
}

// Hàm chính để thu thập dữ liệu
async function collectDrugData() {
  console.log('Bắt đầu thu thập dữ liệu thuốc...');
  const startTime = performance.now();

  // Tạo thư mục output
  await fs.ensureDir(config.outputDir);

  const collectedData = {
    drugs: [],
    search_results: {}
  };

  // Xử lý từng từ khóa
  for (const keyword of config.keywords) {
    console.log(`\nTìm kiếm thuốc với từ khóa: "${keyword}"...`);

    try {
      // Tìm kiếm thuốc
      const results = await searchFDADrugs(keyword);
      console.log(`Tìm thấy ${results.length} kết quả cho "${keyword}"`);

      collectedData.search_results[keyword] = {
        total_found: results.length,
        processed: 0
      };

      // Xử lý từng thuốc
      for (const drug of results) {
        console.log(`  Đang xử lý: ${drug.openfda?.brand_name?.[0] || 'Unknown Drug'}`);
        
        try {
          // Lấy chi tiết thuốc và xử lý
          const drugDetails = await getFDADrugDetails(drug.id);
          if (drugDetails) {
            const processedDrug = await processDrug(drugDetails);
            if (processedDrug) {
              collectedData.drugs.push(processedDrug);
              collectedData.search_results[keyword].processed++;
            }
          }
        } catch (error) {
          console.error(`  Lỗi khi xử lý thuốc:`, error.message);
        }

        // Delay giữa các request
        await sleep(config.delay);
      }
    } catch (error) {
      console.error(`Lỗi khi xử lý từ khóa "${keyword}":`, error);
    }
  }

  // Lưu tổng kết thu thập
  await fs.writeFile(
    path.join(config.outputDir, 'collection_summary.json'),
    JSON.stringify({
      metadata: {
        total_drugs: collectedData.drugs.length,
        keywords_processed: config.keywords.length,
        collection_date: new Date().toISOString(),
        execution_time_seconds: (performance.now() - startTime) / 1000
      },
      search_results: collectedData.search_results,
      drugs: collectedData.drugs.map(drug => ({
        id: drug.id,
        brand_name: drug.brand_name,
        generic_name: drug.generic_name,
        manufacturer: drug.manufacturer
      }))
    }, null, 2)
  );

  console.log(`\nHoàn thành thu thập dữ liệu!`);
  console.log(`Tổng số thuốc đã thu thập: ${collectedData.drugs.length}`);
  console.log(`Thời gian thực hiện: ${((performance.now() - startTime) / 1000).toFixed(2)} giây`);
  console.log(`Dữ liệu được lưu tại: ${config.outputDir}`);

  return collectedData;
}

module.exports = {
  collectDrugData,
  searchFDADrugs,
  getFDADrugDetails,
  processDrug
}; 