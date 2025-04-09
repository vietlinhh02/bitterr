# Ứng Dụng Tra Cứu Thông Tin Thuốc FDA

Đây là phần frontend của ứng dụng tra cứu thông tin thuốc từ FDA, được xây dựng bằng React và Material-UI.

## Tính năng

- **Tìm kiếm thuốc** theo tên hoặc thành phần
- **Hiển thị danh sách** kết quả tìm kiếm
- **Xem chi tiết** thông tin thuốc
- **Chat với AI** về thông tin thuốc
- **Nhận diện thuốc** từ ảnh
- **Tìm kiếm sản phẩm** từ nhà thuốc Long Châu
- **Giao diện responsive**, thân thiện với người dùng

## Cài đặt

1. Cài đặt các dependencies:
   ```bash
   npm install
   ```

2. Chạy ứng dụng ở môi trường development:
   ```bash
   npm start
   ```

3. Build ứng dụng cho production:
   ```bash
   npm run build
   ```

## Cấu trúc dự án

```
src/
├── components/       # Chứa các component React
├── contexts/         # Context API để quản lý state
├── services/         # Service để gọi API
├── utils/            # Các utility function
├── App.js            # Component root
└── index.js          # Entry point
```

## API Backend

Ứng dụng sử dụng các API sau từ backend:

| Endpoint | Mô tả |
|----------|-------|
| `GET /api/drug/search?query=keyword` | Tìm kiếm thuốc theo tên |
| `GET /api/drug/:id` | Lấy thông tin chi tiết của thuốc |
| `GET /api/longchau/search?keyword=text` | Tìm kiếm sản phẩm Long Châu |
| `POST /api/gemini/ask` | Chat với AI về thuốc |
| `POST /api/detect/image` | Nhận diện thuốc từ ảnh |

## Công nghệ sử dụng

- **React**: Thư viện UI
- **Material-UI**: Component library
- **React Router**: Quản lý route
- **Axios**: Gọi API
- **React Markdown**: Hiển thị nội dung markdown
- **Remark GFM**: Hỗ trợ GitHub Flavored Markdown

## Mẫu Cấu Trúc Báo Cáo Nghiên Cứu

### LỜI MỞ ĐẦU
*Giới thiệu tổng quan về đề tài nghiên cứu và tầm quan trọng của nó*

### LỜI CẢM ƠN
*Bày tỏ lòng biết ơn đến các cá nhân, tổ chức đã hỗ trợ trong quá trình thực hiện*

### MỤC LỤC
*Liệt kê các phần và tiểu mục của báo cáo*

### DANH MỤC HÌNH ẢNH
*Liệt kê các hình ảnh sử dụng trong báo cáo*

### DANH MỤC BẢNG
*Liệt kê các bảng biểu sử dụng trong báo cáo*

### DANH MỤC VIẾT TẮT
*Giải thích các từ viết tắt sử dụng trong báo cáo*

### CHƯƠNG 1: TỔNG QUAN
#### 1. Giới thiệu đề tài

Trong thời đại số hóa hiện nay, việc tra cứu thông tin thuốc chính xác, nhanh chóng và đáng tin cậy trở thành nhu cầu thiết yếu của người dùng, đặc biệt là các chuyên gia y tế, dược sĩ và bệnh nhân. Đề tài "Ứng dụng Tra cứu Thông tin Thuốc FDA" được phát triển nhằm đáp ứng nhu cầu này, tập trung vào việc xây dựng một nền tảng toàn diện kết hợp công nghệ nhận diện hình ảnh, trí tuệ nhân tạo và dữ liệu từ Cơ quan Quản lý Thực phẩm và Dược phẩm Hoa Kỳ (FDA).

Ứng dụng được thiết kế với giao diện thân thiện người dùng, tích hợp các công nghệ tiên tiến như Computer Vision và AI để cung cấp trải nghiệm tra cứu thông tin thuốc toàn diện. Người dùng có thể tìm kiếm thuốc theo tên hoặc thành phần, xem chi tiết thông tin thuốc, nhận diện thuốc từ hình ảnh, tương tác với AI về thông tin thuốc và tìm kiếm sản phẩm tương ứng tại các nhà thuốc Việt Nam.

Một trong những tính năng nổi bật của ứng dụng là khả năng nhận diện thuốc từ hình ảnh, giúp người dùng nhanh chóng xác định thuốc khi không biết tên chính xác. Bên cạnh đó, tính năng chat với AI về thông tin thuốc mang đến trải nghiệm tương tác tự nhiên, giúp người dùng hiểu rõ hơn về tác dụng, liều lượng và các lưu ý khi sử dụng thuốc.

Đặc biệt, ứng dụng còn cung cấp tính năng liên kết với các nhà thuốc tại Việt Nam, giúp người dùng không chỉ tra cứu thông tin mà còn có thể tìm kiếm và mua sắm thuốc một cách thuận tiện. Điều này tạo nên một hệ sinh thái khép kín từ việc tra cứu thông tin đến mua sắm thuốc, nâng cao trải nghiệm người dùng và tiết kiệm thời gian.

Đề tài này mang ý nghĩa lớn trong việc nâng cao nhận thức về sử dụng thuốc an toàn, hiệu quả và tiếp cận thông tin thuốc chính xác từ nguồn dữ liệu uy tín của FDA. Với tầm nhìn dài hạn, ứng dụng hướng đến việc trở thành công cụ đáng tin cậy cho cộng đồng y tế và người dùng phổ thông trong việc tra cứu thông tin thuốc và sử dụng thuốc một cách an toàn.

   - 1.1 Những nét đặc trưng của hệ thống thương mại điện tử
   - 1.2 Một số ưu điểm nổi bật của Thương mại điện tử
     * Mở rộng phạm vi tiếp cận khách hàng toàn cầu không bị giới hạn bởi không gian địa lý
     * Giảm chi phí giao dịch và vận hành so với mô hình kinh doanh truyền thống
     * Hoạt động 24/7 không bị giới hạn về thời gian, tăng cơ hội bán hàng
     * Tăng khả năng thu thập và phân tích dữ liệu khách hàng để cá nhân hóa trải nghiệm
     * Tốc độ giao dịch nhanh chóng, rút ngắn quy trình mua bán

   - 1.3 Các mô hình kinh doanh trong thương mại điện tử
     * B2C (Business-to-Consumer): Doanh nghiệp bán hàng trực tiếp cho người tiêu dùng cuối
     * B2B (Business-to-Business): Giao dịch giữa các doanh nghiệp với nhau
     * C2C (Consumer-to-Consumer): Người tiêu dùng bán hàng cho người tiêu dùng khác
     * C2B (Consumer-to-Business): Người tiêu dùng cung cấp sản phẩm/dịch vụ cho doanh nghiệp
     * B2G (Business-to-Government): Doanh nghiệp cung cấp sản phẩm/dịch vụ cho chính phủ
     * O2O (Online-to-Offline): Kết hợp giữa kênh online và offline

#### 2. Tính khả thi của đề tài
#### 3. Phương pháp giải quyết đề tài

### CHƯƠNG 2: KHẢO SÁT ĐÁNH GIÁ HIỆN TRẠNG
#### 1. Tìm hiểu về thương mại điện tử
   - 1.1 Khái niệm về thương mại điện tử (TMĐT)
   - 1.2 Một số ưu điểm nổi bật của Thương mại điện tử
     * Mở rộng phạm vi tiếp cận khách hàng toàn cầu không bị giới hạn bởi không gian địa lý
     * Giảm chi phí giao dịch và vận hành so với mô hình kinh doanh truyền thống
     * Hoạt động 24/7 không bị giới hạn về thời gian, tăng cơ hội bán hàng
     * Tăng khả năng thu thập và phân tích dữ liệu khách hàng để cá nhân hóa trải nghiệm
     * Tốc độ giao dịch nhanh chóng, rút ngắn quy trình mua bán

   - 1.3 Các mô hình kinh doanh trong thương mại điện tử
     * B2C (Business-to-Consumer): Doanh nghiệp bán hàng trực tiếp cho người tiêu dùng cuối
     * B2B (Business-to-Business): Giao dịch giữa các doanh nghiệp với nhau
     * C2C (Consumer-to-Consumer): Người tiêu dùng bán hàng cho người tiêu dùng khác
     * C2B (Consumer-to-Business): Người tiêu dùng cung cấp sản phẩm/dịch vụ cho doanh nghiệp
     * B2G (Business-to-Government): Doanh nghiệp cung cấp sản phẩm/dịch vụ cho chính phủ
     * O2O (Online-to-Offline): Kết hợp giữa kênh online và offline

### CHƯƠNG 3: CƠ SỞ LÝ THUYẾT
#### 1. Một số khái niệm cơ bản về Web
   - 1.1 Internet
     Internet là mạng lưới toàn cầu kết nối hàng tỷ thiết bị trên toàn thế giới, cho phép giao tiếp và chia sẻ thông tin qua các giao thức tiêu chuẩn. Internet phát triển từ ARPANET (1960s) với mục đích ban đầu là kết nối các trường đại học và tổ chức nghiên cứu, đã trở thành nền tảng cho sự phát triển của thương mại điện tử.

   - 1.2 Một số khái niệm về Web
     * World Wide Web (WWW): Hệ thống thông tin siêu văn bản được truy cập qua Internet, do Tim Berners-Lee phát minh năm 1989
     * Website: Tập hợp các trang web được lưu trữ trên một máy chủ web, truy cập qua một tên miền
     * Trang web (Webpage): Tài liệu có thể hiển thị trên trình duyệt web, thường được viết bằng HTML
     * URL (Uniform Resource Locator): Địa chỉ duy nhất để định vị tài nguyên trên web
     * HTTP/HTTPS: Giao thức truyền tải siêu văn bản, cơ chế truyền tải dữ liệu giữa máy khách và máy chủ

   - 1.3 Phân loại Website
     * Website tĩnh: Nội dung ít thay đổi, được lập trình bằng HTML/CSS, không tương tác nhiều với người dùng
     * Website động: Nội dung thay đổi theo thời gian thực, có tương tác cao, thường sử dụng cơ sở dữ liệu
     * Website thương mại điện tử: Chuyên về bán hàng trực tuyến
     * Website tin tức/blog: Cung cấp nội dung thông tin, bài viết
     * Website doanh nghiệp: Giới thiệu thông tin về công ty, sản phẩm, dịch vụ
     * Website mạng xã hội: Kết nối người dùng, chia sẻ thông tin
     * Website ứng dụng web: Cung cấp các tính năng như ứng dụng desktop truyền thống

   - 1.4 Các bước phát triển một Website
     * Phân tích yêu cầu: Xác định mục tiêu, đối tượng người dùng và chức năng cần có
     * Thiết kế: Tạo wireframe, mockup và prototype cho giao diện người dùng
     * Phát triển front-end: Lập trình giao diện người dùng sử dụng HTML, CSS, JavaScript
     * Phát triển back-end: Xây dựng logic nghiệp vụ, cơ sở dữ liệu và API
     * Kiểm thử: Đảm bảo website hoạt động đúng trên nhiều trình duyệt và thiết bị
     * Triển khai: Đưa website lên môi trường thực tế để người dùng truy cập
     * Bảo trì: Cập nhật, sửa lỗi và cải tiến website sau khi ra mắt

#### 2. Tổng quan về Support Vector Regression
   - 2.1 Khái niệm và mô hình toán học
     Support Vector Regression (SVR) là một kỹ thuật học máy dựa trên nguyên lý của Support Vector Machine (SVM), nhưng được áp dụng cho bài toán hồi quy thay vì phân loại. SVR tìm cách xây dựng một hàm ước lượng f(x) sao cho sai số giữa giá trị dự đoán và giá trị thực không vượt quá một ngưỡng epsilon (ε) cho trước, đồng thời đảm bảo hàm f(x) càng phẳng càng tốt.

     Công thức toán học cơ bản của SVR:
     f(x) = w^T·x + b

     Trong đó:
     - w là vector trọng số
     - b là hệ số bias
     - x là vector đặc trưng đầu vào

     Bài toán tối ưu trong SVR:
     min (1/2)||w||^2 + C∑(ξ_i + ξ_i*)
     
     Với các ràng buộc:
     - y_i - (w^T·x_i + b) ≤ ε + ξ_i
     - (w^T·x_i + b) - y_i ≤ ε + ξ_i*
     - ξ_i, ξ_i* ≥ 0

     Trong đó:
     - ε là giá trị sai số cho phép (epsilon)
     - C là hệ số điều chỉnh
     - ξ_i, ξ_i* là các biến slack

   - 2.2 Kernel SVR và các hàm mất mát khác nhau
     * Kernel trong SVR: Kernel là kỹ thuật cho phép SVR xử lý dữ liệu phi tuyến bằng cách ánh xạ dữ liệu từ không gian đầu vào sang không gian có chiều cao hơn, nơi dữ liệu có thể tách biệt tuyến tính.
     
     * Các kernel phổ biến trong SVR:
       - Linear Kernel: K(x,y) = x^T·y
       - Polynomial Kernel: K(x,y) = (γ·x^T·y + r)^d
       - Radial Basis Function (RBF): K(x,y) = exp(-γ||x-y||^2)
       - Sigmoid: K(x,y) = tanh(γ·x^T·y + r)
     
     * Các hàm mất mát trong SVR:
       - Epsilon-Insensitive Loss: L(y,f(x)) = max(0, |y-f(x)|-ε)
       - Huber Loss: Kết hợp MSE cho sai số nhỏ và MAE cho sai số lớn
       - Quantile Loss: Cho phép ước lượng phân vị của phân phối xác suất

### CHƯƠNG 4: PHÂN TÍCH THIẾT KẾ HỆ THỐNG
#### 1. Mô tả hệ thống
   Hệ thống tra cứu thông tin thuốc FDA là một nền tảng web cho phép người dùng tìm kiếm, tra cứu thông tin về thuốc đã được FDA (Cơ quan Quản lý Thực phẩm và Dược phẩm Hoa Kỳ) phê duyệt. Hệ thống cung cấp giao diện thân thiện, dễ sử dụng, tích hợp trí tuệ nhân tạo để hỗ trợ người dùng hiểu rõ hơn về thông tin thuốc, nhận diện thuốc qua hình ảnh, và tìm kiếm sản phẩm tương tự trên thị trường Việt Nam.

#### 2. Chức năng chính của hệ thống
   - 2.1 Quản trị hệ thống
     * Quản lý tài khoản người dùng: Thêm, sửa, xóa, phân quyền
     * Quản lý cơ sở dữ liệu thuốc: Cập nhật, đồng bộ với nguồn dữ liệu FDA
     * Theo dõi hoạt động của hệ thống: Logs, monitoring
     * Sao lưu và phục hồi dữ liệu: Backup, restore
     * Cấu hình hệ thống: API keys, thông số kết nối

   - 2.2 Quản lý sản phẩm
     * Thêm mới, cập nhật, xóa thông tin thuốc
     * Phân loại thuốc theo nhóm, công dụng, thành phần
     * Quản lý thông tin chi tiết: liều dùng, tác dụng phụ, chống chỉ định
     * Liên kết với sản phẩm tương ứng tại nhà thuốc Long Châu
     * Quản lý hình ảnh và tài liệu liên quan đến thuốc

   - 2.3 Phần đặt hàng
     * Tìm kiếm sản phẩm thuốc tại nhà thuốc Long Châu
     * Thêm vào giỏ hàng, điều chỉnh số lượng
     * Nhập thông tin giao hàng
     * Chọn phương thức thanh toán
     * Xác nhận đơn hàng và theo dõi trạng thái

   - 2.4 Quản lý khách hàng
     * Đăng ký, đăng nhập tài khoản
     * Quản lý thông tin cá nhân
     * Lưu lịch sử tìm kiếm và tra cứu
     * Theo dõi lịch sử đơn hàng
     * Quản lý phản hồi và đánh giá của khách hàng

   - 2.5 Quản lý báo cáo thống kê
     * Thống kê lượt tìm kiếm, tra cứu phổ biến
     * Báo cáo đơn hàng: doanh số, số lượng, tỷ lệ chuyển đổi
     * Phân tích hành vi người dùng
     * Thống kê hiệu suất hệ thống
     * Xuất báo cáo theo nhiều định dạng khác nhau

#### 3. Phân tích hệ thống về mặt chức năng
   - 3.1 Sơ đồ Usecase
     Sơ đồ Usecase mô tả tương tác giữa người dùng (actors) và hệ thống, bao gồm:
     * Actor: Khách vãng lai, Người dùng đã đăng ký, Quản trị viên
     * Usecase chính:
       - Tìm kiếm thuốc
       - Xem thông tin chi tiết thuốc
       - Chat với AI về thuốc
       - Nhận diện thuốc qua ảnh
       - Mua sắm tại Long Châu
       - Đăng ký/Đăng nhập
       - Quản lý tài khoản
       - Quản lý hệ thống (Admin)

   - 3.2 Sơ đồ hoạt động
     Sơ đồ hoạt động mô tả luồng công việc của các chức năng chính:
     * Luồng tìm kiếm thuốc:
       - Người dùng nhập từ khóa
       - Hệ thống thực hiện tìm kiếm
       - Hiển thị kết quả tìm kiếm
       - Người dùng chọn thuốc để xem chi tiết
     
     * Luồng chat với AI:
       - Người dùng nhập câu hỏi
       - Hệ thống gửi yêu cầu đến API Gemini
       - AI xử lý và phản hồi
       - Hiển thị câu trả lời cho người dùng
     
     * Luồng nhận diện thuốc từ ảnh:
       - Người dùng tải lên ảnh thuốc
       - Hệ thống xử lý và phân tích ảnh
       - Nhận diện thuốc qua mô hình AI
       - Hiển thị kết quả nhận diện

   - 3.3 Sơ đồ trình tự
     Sơ đồ trình tự mô tả tương tác giữa các đối tượng theo thời gian:
     * Trình tự tìm kiếm thuốc:
       - Người dùng → Giao diện: Nhập từ khóa
       - Giao diện → Controller: Gửi yêu cầu tìm kiếm
       - Controller → Service: Gọi service tìm kiếm
       - Service → API: Gọi API tìm kiếm
       - API → Database: Truy vấn dữ liệu
       - Database → API → Service → Controller → Giao diện: Trả về kết quả
       - Giao diện → Người dùng: Hiển thị kết quả
     
     * Trình tự đặt hàng:
       - Người dùng → Giao diện: Chọn sản phẩm, thêm vào giỏ hàng
       - Giao diện → Shopping Cart: Cập nhật giỏ hàng
       - Người dùng → Giao diện: Nhập thông tin giao hàng
       - Giao diện → Order Service: Tạo đơn hàng
       - Order Service → Payment Gateway: Xử lý thanh toán
       - Payment Gateway → Order Service: Xác nhận thanh toán
       - Order Service → Database: Lưu thông tin đơn hàng
       - Order Service → Giao diện → Người dùng: Xác nhận đơn hàng thành công

   - 3.4 Xác định các thực thể
     * User (Người dùng):
       - Thuộc tính: id, username, password, email, fullName, phone, address, role, createdAt, updatedAt
       - Phương thức: register, login, updateProfile, changePassword
     
     * Drug (Thuốc):
       - Thuộc tính: id, name, activeIngredient, dosageForm, strength, manufacturer, approvalDate, indications, contraindications, sideEffects, imageUrl
       - Phương thức: search, getDetails, filterByCategory
     
     * Order (Đơn hàng):
       - Thuộc tính: id, userId, status, totalAmount, shippingAddress, paymentMethod, createdAt, updatedAt
       - Phương thức: create, update, cancel, getStatus
     
     * OrderItem (Chi tiết đơn hàng):
       - Thuộc tính: id, orderId, productId, quantity, price
       - Phương thức: add, update, remove
     
     * LongChauProduct (Sản phẩm Long Châu):
       - Thuộc tính: id, name, price, imageUrl, description, availability, drugId
       - Phương thức: search, getDetails, checkAvailability
     
     * SearchHistory (Lịch sử tìm kiếm):
       - Thuộc tính: id, userId, keyword, timestamp
       - Phương thức: add, getHistory, clear

   - 3.5 Lược đồ quan hệ giữa các thực thể (E-R)
     * User 1--n SearchHistory: Một người dùng có nhiều lịch sử tìm kiếm
     * User 1--n Order: Một người dùng có nhiều đơn hàng
     * Order 1--n OrderItem: Một đơn hàng có nhiều chi tiết đơn hàng
     * Drug 1--n LongChauProduct: Một thuốc có thể liên kết với nhiều sản phẩm Long Châu
     * LongChauProduct 1--n OrderItem: Một sản phẩm Long Châu có thể xuất hiện trong nhiều chi tiết đơn hàng
     * Drug m--n Category: Một thuốc có thể thuộc nhiều danh mục, một danh mục có nhiều thuốc

### CHƯƠNG 5: CÀI ĐẶT THỬ NGHIỆM WEB
#### 1. Giới thiệu công nghệ lựa chọn để cài đặt
   * **Frontend**:
     - React: Thư viện JavaScript để xây dựng giao diện người dùng, cho phép tạo các component tái sử dụng
     - Material-UI: Thư viện component dựa trên Material Design của Google, cung cấp các component đẹp và responsive
     - React Router: Quản lý điều hướng trong ứng dụng React
     - Axios: Thư viện HTTP client để gọi API từ backend
     - React Markdown: Hiển thị nội dung Markdown trong React
     - Redux Toolkit: Quản lý state toàn cục của ứng dụng
     - React Query: Quản lý, lưu cache và đồng bộ hóa dữ liệu từ server

   * **Backend**:
     - Node.js: Môi trường runtime JavaScript phía server
     - Express.js: Web framework cho Node.js
     - MongoDB: Cơ sở dữ liệu NoSQL lưu trữ dưới dạng document
     - Mongoose: ODM (Object Document Mapper) cho MongoDB
     - JWT (JSON Web Token): Xác thực và ủy quyền người dùng
     - Google Cloud Vision API: Nhận diện thuốc từ ảnh
     - Google Gemini API: Cung cấp khả năng AI chat về thông tin thuốc

   * **DevOps & Deployment**:
     - Docker: Containerization để đóng gói ứng dụng
     - Nginx: Web server và reverse proxy
     - GitHub Actions: CI/CD pipeline
     - Google Cloud Platform: Hosting và triển khai ứng dụng
     - MongoDB Atlas: Dịch vụ cơ sở dữ liệu đám mây

### CHƯƠNG 6: CÀI ĐẶT THỬ NGHIỆM HỆ DỰ ĐOÁN
#### 1. Ngôn ngữ sử dụng
   - 1.1 Lịch sử của Python
   - 1.2 Các tính năng của Python
#### 2. Dữ liệu thử nghiệm
#### 3. Hàm số kernel sử dụng
   - 3.1 Kernel Linear
   - 3.2 Kernel Polynomial
   - 3.3 Kernel Radial Basic Function
#### 4. Các bước thực hiện

### CHƯƠNG 7: KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN ĐỀ TÀI
#### 1. Đánh giá kết quả
   - 1.1 Công việc đã hoàn thành
   - 1.2 Công việc chưa hoàn thành
   - 1.3 Dự định phát triển

### TÀI LIỆU THAM KHẢO
*Liệt kê các nguồn tham khảo theo định dạng chuẩn*