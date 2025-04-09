const { collectDrugData } = require('../services/drugDataService');

console.log('Bắt đầu quá trình thu thập dữ liệu thuốc...');

collectDrugData()
  .then(() => {
    console.log('Thu thập dữ liệu hoàn tất!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Lỗi khi thu thập dữ liệu:', error);
    process.exit(1);
  }); 