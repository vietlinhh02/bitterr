const puppeteer = require('puppeteer');
const fs = require('fs-extra');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

// Cấu hình nén ảnh mặc định
const IMAGE_COMPRESSION = {
  enabled: true,
  quality: 70,
  mozjpeg: true
};

// Thiết lập browser Puppeteer
async function setupBrowser() {
  return await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
}

// Nén ảnh sử dụng sharp
async function compressImage(inputPath, options = {}) {
  // Nếu tính năng nén ảnh bị tắt, trả về ngay
  if (!IMAGE_COMPRESSION.enabled && !options.force) {
    return { success: false, skipped: true, reason: 'Image compression disabled' };
  }

  try {
    // Kiểm tra xem file có tồn tại không
    if (!(await fs.pathExists(inputPath))) {
      console.log(`    File không tồn tại: ${inputPath}`);
      return { success: false, skipped: true, reason: 'File does not exist' };
    }

    const outputPath = inputPath; // Ghi đè lên file gốc
    const quality = options.quality || IMAGE_COMPRESSION.quality;
    const useMozjpeg = options.mozjpeg !== undefined ? options.mozjpeg : IMAGE_COMPRESSION.mozjpeg;
    
    // Đọc thông tin ảnh trước khi nén
    const originalStats = await fs.stat(inputPath);
    const originalSize = originalStats.size / 1024; // Kích thước KB
    
    try {
      // Xử lý nén ảnh với sharp
      await sharp(inputPath)
        .jpeg({ quality, mozjpeg: useMozjpeg }) // Sử dụng mozjpeg để nén tốt hơn
        .toFile(inputPath + ".tmp");
      
      // Xóa file gốc và đổi tên file đã nén
      await fs.remove(inputPath);
      await fs.move(inputPath + ".tmp", outputPath);
    } catch (sharpError) {
      console.error(`    Lỗi khi xử lý ảnh với sharp: ${sharpError.message}`);
      return { 
        success: false,
        error: `Sharp error: ${sharpError.message}` 
      };
    }
    
    // Đọc thông tin ảnh sau khi nén
    const compressedStats = await fs.stat(outputPath);
    const compressedSize = compressedStats.size / 1024; // Kích thước KB
    
    // Tính tỷ lệ nén
    const compressionRatio = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
    
    console.log(`    Đã nén ảnh: ${path.basename(outputPath)} (${originalSize.toFixed(2)}KB → ${compressedSize.toFixed(2)}KB, giảm ${compressionRatio}%)`);
    
    return {
      success: true,
      originalSize,
      compressedSize,
      compressionRatio
    };
  } catch (error) {
    console.error(`    Lỗi khi nén ảnh: ${error.message}`);
    return { 
      success: false,
      error: error.message 
    };
  }
}

// Tải ảnh
async function downloadImage(url, outputPath) {
  // Kiểm tra xem ảnh đã tồn tại chưa 
  try {
    if (await fs.pathExists(outputPath)) {
      console.log(`    Ảnh đã tồn tại: ${path.basename(outputPath)}`);
      return { downloaded: false, exists: true };
    }
  } catch (error) {
    // Nếu có lỗi khi kiểm tra, tiếp tục tải về
    console.warn(`    Lỗi khi kiểm tra sự tồn tại của ảnh: ${error.message}`);
  }
  
  return new Promise((resolve, reject) => {
    // Thêm timeout cho yêu cầu tải ảnh
    const request = https.get(url, { timeout: 30000 }, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }
      
      const fileStream = fs.createWriteStream(outputPath);
      response.pipe(fileStream);
      
      fileStream.on('finish', () => {
        fileStream.close();
        resolve({ downloaded: true, exists: false });
      });
      
      fileStream.on('error', err => {
        fs.unlink(outputPath, () => reject(err));
      });
    }).on('error', reject);
    
    // Thêm timeout handler
    request.on('timeout', () => {
      request.destroy();
      reject(new Error(`Image download timed out for: ${url}`));
    });
  });
}

// Scrape thông tin chi tiết sản phẩm
async function scrapeProduct(slug, outputDir) {
  console.log(`Đang thu thập dữ liệu sản phẩm: ${slug}`);
  const browser = await setupBrowser();
  
  try {
    const page = await browser.newPage();
    const productUrl = `https://www.pharmacity.vn/${slug}.html`;
    
    await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Đợi nội dung tải xong
    await page.waitForSelector('h1.line-clamp-3', { timeout: 5000 }).catch(() => {});
    
    // Trích xuất dữ liệu sản phẩm
    const productData = await page.evaluate(() => {
      const data = {};
      
      // Thông tin cơ bản
      data.name = document.querySelector('h1.line-clamp-3')?.textContent.trim() || 'Not found';
      data.price = document.querySelector('div[class*="text-xl"][class*="font-bold"][class*="text-primary-500"]')?.textContent.trim() || 'Not found';
      
      // Lấy giá gốc nếu có (giá trước khi giảm)
      const originalPriceEl = document.querySelector('del[class*="text-sm"][class*="font-semibold"][class*="text-neutral-600"]');
      data.originalPrice = originalPriceEl ? originalPriceEl.textContent.trim() : null;
      
      // Lấy thông tin giảm giá nếu có
      const discountEl = document.querySelector('span[class*="bg-pink-600"][class*="px-1"][class*="text-white"]');
      data.discount = discountEl ? discountEl.textContent.trim() : null;
      
      data.sku = document.querySelector('p.text-sm.leading-5.text-neutral-600')?.textContent.trim() || 'Not found';
      data.brand = document.querySelector('a.text-sm.leading-5.text-primary-500')?.textContent.replace('Thương hiệu: ', '').trim() || 'Not found';
      
      // Lấy thông tin chi tiết từ grid
      const gridDetails = {};
      const gridItems = document.querySelectorAll('.grid.grid-cols-1.gap-1\\.5');
      
      gridItems.forEach(item => {
        const label = item.querySelector('p.text-\\[14px\\].leading-\\[20px\\].font-semibold')?.textContent.trim();
        const value = item.querySelector('div.\\[\\&_a\\:not\\(\\.ignore-css_a\\)\\]\\:text-hyperLink')?.textContent.trim();
        
        if (label && value) {
          // Chuyển đổi nhãn thành key hợp lệ
          const key = label.toLowerCase()
            .replace('tên sản phẩm', 'fullName')
            .replace('danh mục', 'category')
            .replace('công dụng', 'purpose')
            .replace('nhà sản xuất', 'manufacturer')
            .replace('quy cách', 'specification')
            .replace('lưu ý', 'notice')
            .replace(/\s+/g, '_');
          
          gridDetails[key] = value;
        }
      });
      
      // Gộp thông tin chi tiết vào dữ liệu chính
      data.details = gridDetails;
      
      // Thêm thông tin về xếp hạng và số lượng bán
      const ratingEl = document.querySelector('.flex.items-center.justify-start');
      if (ratingEl) {
        const likesText = ratingEl.textContent.match(/(\d+\.?\d*k?)/);
        const soldText = ratingEl.textContent.match(/Đã bán\s+(\d+\.?\d*k?)/);
        
        data.likes = likesText ? likesText[1] : null;
        data.sold = soldText ? soldText[1] : null;
      }
      
      // Lấy mã SKU của sản phẩm (thường có dạng PXXXXX)
      const skuMatch = data.sku.match(/(P\d+)/i);
      const productSku = skuMatch ? skuMatch[1] : '';
      
      // Xử lý ảnh sản phẩm
      const images = [];
      
      if (productSku) {
        // Chỉ lấy ảnh có chứa mã SKU trong URL
        document.querySelectorAll('img[src*="pharmacity.io"]').forEach(img => {
          // Kiểm tra xem img.src hoặc srcset có chứa mã SKU không
          const isProductImage = (img.src && img.src.includes(productSku)) || 
                                (img.srcset && img.srcset.includes(productSku));
          
          if (isProductImage) {
            // Lấy đường dẫn ảnh từ thuộc tính srcset nếu có (ưu tiên ảnh độ phân giải cao)
            if (img.srcset) {
              const srcsetUrls = img.srcset.split(',')
                .map(s => s.trim().split(' ')[0])
                .filter(url => url.includes(productSku));
              
              // Lấy ảnh có độ phân giải cao nhất (thường là cuối cùng trong srcset)
              if (srcsetUrls.length > 0) {
                const highResImg = srcsetUrls[srcsetUrls.length - 1];
                if (!images.includes(highResImg)) {
                  images.push(highResImg);
                }
              }
            }
            
            // Nếu không có srcset hoặc không tìm thấy ảnh phù hợp, sử dụng src
            if (img.src && img.src.includes(productSku) && !images.includes(img.src)) {
              images.push(img.src);
            }
          }
        });
        
        // Loại bỏ các ảnh trùng lặp hoặc các kích thước khác nhau của cùng một ảnh
        // Ưu tiên giữ lại ảnh có độ phân giải lớn nhất (1080x1080)
        const uniqueImages = [];
        const imageBaseNames = new Set();
        
        // Sắp xếp để ưu tiên ảnh có độ phân giải cao
        const sortedImages = [...images].sort((a, b) => {
          const resA = a.includes('1080x1080') ? 2 : (a.includes('828x828') ? 1 : 0);
          const resB = b.includes('1080x1080') ? 2 : (b.includes('828x828') ? 1 : 0);
          return resB - resA;
        });
        
        sortedImages.forEach(url => {
          // Trích xuất tên cơ bản của file
          const fileNameMatch = url.match(/([^\/]+)(?:\.\w+)(?:\?.*)?$/);
          const baseName = fileNameMatch ? fileNameMatch[1].replace(/(_\d+)?$/, '') : '';
          
          if (baseName && !imageBaseNames.has(baseName)) {
            imageBaseNames.add(baseName);
            uniqueImages.push(url);
          }
        });
        
        data.images = uniqueImages;
      } else {
        data.images = [];
      }
      
      // Chi tiết sản phẩm
      const detailsSection = Array.from(document.querySelectorAll('div[id^="radix-"]')).find(el => el.id.startsWith('radix-'));
      
      if (detailsSection) {
        // Mô tả
        const moTa = detailsSection.querySelector('#mo-ta');
        data.description = moTa?.querySelector('p')?.textContent.trim();
        
        // Lấy nội dung HTML từ các phần
        data.moTaHtml = moTa?.innerHTML;
        
        // Thành phần
        const thanhPhan = detailsSection.querySelector('#thanh-phan');
        data.thanhPhanHtml = thanhPhan?.innerHTML;
        
        // Lấy bảng thành phần nếu có
        const tableEl = thanhPhan?.querySelector('table');
        if (tableEl) {
          const ingredients = [];
          const rows = tableEl.querySelectorAll('tbody tr');
          rows.forEach(row => {
            const nameTd = row.querySelector('td:first-child');
            const valueTd = row.querySelector('td:last-child');
            
            if (nameTd && valueTd) {
              const name = nameTd.textContent.trim();
              const value = valueTd.textContent.trim();
              ingredients.push(`${name}: ${value}`);
            }
          });
          
          data.ingredients = ingredients;
        } else {
          data.ingredients = Array.from(thanhPhan?.querySelectorAll('li') || []).map(li => li.textContent.trim());
        }
        
        // Chỉ định/Công dụng
        const chiDinh = detailsSection.querySelector('#chi-dinh');
        data.chiDinhHtml = chiDinh?.innerHTML;
        data.usage = Array.from(chiDinh?.querySelectorAll('li') || []).map(li => li.textContent.trim());
        
        // Hướng dẫn sử dụng
        const huongDan = detailsSection.querySelector('#huong-dan-su-dung');
        data.huongDanHtml = huongDan?.innerHTML;
        data.usageInstructions = Array.from(huongDan?.querySelectorAll('li') || []).map(li => li.textContent.trim());
        data.usageMethod = Array.from(huongDan?.querySelectorAll('p') || [])
          .find(p => p.textContent.includes('Dùng'))?.textContent.trim() || 'Not found';
        
        // Thận trọng, Tác dụng phụ, Chống chỉ định
        const thanTrong = detailsSection.querySelector('#than-trong');
        data.thanTrongHtml = thanTrong?.innerHTML;
        
        if (thanTrong) {
          // Xử lý từng phần
          const headings = Array.from(thanTrong.querySelectorAll('h2, h3'));
          
          headings.forEach(heading => {
            let nextList = heading.nextElementSibling;
            while (nextList && nextList.tagName !== 'UL') {
              nextList = nextList.nextElementSibling;
            }
            
            const items = Array.from(nextList?.querySelectorAll('li') || []).map(li => li.textContent.trim());
            
            if (heading.textContent.includes('Tác dụng phụ')) {
              data.sideEffects = items;
            } else if (heading.textContent.includes('Chống chỉ định')) {
              data.contraindications = items;
            } else if (heading.textContent.includes('Thận trọng') || heading.textContent.includes('Lưu ý')) {
              data.precautions = items;
            }
          });
        }
        
        // Nếu không tìm thấy dữ liệu từ các heading
        if (!data.precautions) {
          data.precautions = Array.from(thanTrong?.querySelectorAll('li') || []).map(li => li.textContent.trim());
        }
        
        // Thông tin sản xuất
        const thongTinSanXuat = detailsSection.querySelector('#thong-tin-san-xuat');
        data.thongTinSanXuatHtml = thongTinSanXuat?.innerHTML;
        
        // Câu hỏi thường gặp
        const cauHoiThuongGap = detailsSection.querySelector('#cau-hoi-thuong-gap');
        data.cauHoiThuongGapHtml = cauHoiThuongGap?.innerHTML;
      }
      
      return data;
    });
    
    // Xử lý và lưu dữ liệu
    if (outputDir) {
      // Tạo thư mục lưu trữ và lưu dữ liệu
      const productDir = path.join(outputDir, slug);
      await fs.ensureDir(productDir);
      
      await fs.writeFile(
        path.join(productDir, 'data.json'),
        JSON.stringify(productData, null, 2)
      );
      
      // Tải và lưu ảnh
      if (productData.images && productData.images.length > 0) {
        const imagesDir = path.join(productDir, 'images');
        await fs.ensureDir(imagesDir);
        
        console.log(`  Đang tải ${productData.images.length} ảnh sản phẩm...`);
        
        let successCount = 0;
        let skipCount = 0;
        let failCount = 0;
        
        for (let i = 0; i < productData.images.length; i++) {
          const imageUrl = productData.images[i];
          const imagePath = path.join(imagesDir, `image_${i}.jpg`);
          
          try {
            // Tải ảnh
            const downloadResult = await downloadImage(imageUrl, imagePath);
            
            // Nếu ảnh được tải mới, tiến hành nén
            if (downloadResult.downloaded) {
              await compressImage(imagePath);
              successCount++;
            } else if (downloadResult.exists) {
              skipCount++;
            }
          } catch (error) {
            console.error(`    Lỗi khi tải ảnh ${i}: ${error.message}`);
            failCount++;
          }
          
          // Thêm delay giữa các lần tải ảnh
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        
        console.log(`  Kết quả tải ảnh: ${successCount} thành công, ${skipCount} bỏ qua, ${failCount} thất bại`);
      }
    }
    
    return productData;
  } catch (error) {
    console.error(`Lỗi khi thu thập dữ liệu ${slug}:`, error.message);
    return null;
  } finally {
    await browser.close();
  }
}

module.exports = { scrapeProduct, downloadImage }; 