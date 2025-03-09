import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Breadcrumbs,
  Link,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

function Privacy() {
  const lastUpdated = "01/03/2025";

  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        {/* Tiêu đề trang */}
        <Typography 
          variant="h3" 
          component="h1" 
          align="center" 
          gutterBottom
          sx={{ 
            fontWeight: 700,
            mb: 2,
            background: 'linear-gradient(90deg, #009688 0%, #4db6ac 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Chính Sách Bảo Mật
        </Typography>
        
        <Typography 
          variant="subtitle1" 
          align="center" 
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          Cập nhật lần cuối: {lastUpdated}
        </Typography>

        {/* Breadcrumbs */}
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 4 }}
        >
          <Link underline="hover" color="inherit" href="/">
            Trang chủ
          </Link>
          <Typography color="text.primary">Chính sách bảo mật</Typography>
        </Breadcrumbs>

        {/* Giới thiệu */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            Giới thiệu
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            BiiterNCKH ("chúng tôi", "của chúng tôi") cam kết bảo vệ quyền riêng tư của bạn. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, tiết lộ, và bảo vệ thông tin cá nhân của bạn khi bạn sử dụng trang web, ứng dụng di động và các dịch vụ trực tuyến khác của chúng tôi (gọi chung là "Dịch vụ").
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Chúng tôi tuân thủ các quy định về bảo vệ dữ liệu cá nhân của Việt Nam và các tiêu chuẩn quốc tế về bảo mật thông tin. Bằng cách sử dụng Dịch vụ của chúng tôi, bạn đồng ý với việc thu thập và sử dụng thông tin theo Chính sách bảo mật này.
          </Typography>
          <Typography variant="body1">
            Vui lòng đọc kỹ Chính sách bảo mật này để hiểu cách chúng tôi xử lý thông tin của bạn. Nếu bạn không đồng ý với Chính sách bảo mật này, vui lòng không sử dụng Dịch vụ của chúng tôi.
          </Typography>
        </Paper>

        {/* Nội dung chính sách */}
        <Box sx={{ mb: 6 }}>
          <Accordion defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                1. Thông tin chúng tôi thu thập
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                1.1. Thông tin bạn cung cấp cho chúng tôi
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Chúng tôi thu thập thông tin mà bạn cung cấp trực tiếp cho chúng tôi khi bạn:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ mb: 2, pl: 4 }}>
                <li>Tạo tài khoản (họ tên, email, số điện thoại, mật khẩu)</li>
                <li>Cập nhật thông tin hồ sơ (tuổi, giới tính, địa chỉ, thông tin sức khỏe)</li>
                <li>Sử dụng các tính năng của Dịch vụ (tìm kiếm thuốc, lưu lịch sử tìm kiếm)</li>
                <li>Liên hệ với bộ phận hỗ trợ khách hàng</li>
                <li>Tham gia khảo sát hoặc nghiên cứu</li>
                <li>Đăng ký nhận thông tin cập nhật qua email</li>
              </Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                1.2. Thông tin chúng tôi thu thập tự động
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Khi bạn sử dụng Dịch vụ của chúng tôi, chúng tôi có thể thu thập tự động một số thông tin, bao gồm:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ mb: 2, pl: 4 }}>
                <li>Thông tin thiết bị (loại thiết bị, hệ điều hành, phiên bản trình duyệt)</li>
                <li>Địa chỉ IP và dữ liệu vị trí</li>
                <li>Thông tin sử dụng (trang đã xem, thời gian truy cập, hành vi tìm kiếm)</li>
                <li>Cookie và công nghệ theo dõi tương tự</li>
              </Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                1.3. Thông tin từ bên thứ ba
              </Typography>
              <Typography variant="body1">
                Chúng tôi có thể nhận thông tin về bạn từ các nguồn bên thứ ba, chẳng hạn như đối tác kinh doanh, nhà cung cấp dịch vụ phân tích, và khi bạn đăng nhập thông qua dịch vụ của bên thứ ba (như Google hoặc Facebook). Chúng tôi có thể kết hợp thông tin này với thông tin khác mà chúng tôi có về bạn.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                2. Cách chúng tôi sử dụng thông tin
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Chúng tôi sử dụng thông tin thu thập được để:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ mb: 2, pl: 4 }}>
                <li>Cung cấp, duy trì và cải thiện Dịch vụ của chúng tôi</li>
                <li>Tạo và quản lý tài khoản của bạn</li>
                <li>Xử lý các giao dịch và gửi thông báo liên quan</li>
                <li>Cá nhân hóa trải nghiệm của bạn và cung cấp nội dung phù hợp</li>
                <li>Gửi thông tin cập nhật, thông báo kỹ thuật, cảnh báo bảo mật</li>
                <li>Phản hồi các yêu cầu, câu hỏi và phản hồi của bạn</li>
                <li>Giám sát và phân tích xu hướng, việc sử dụng và hoạt động liên quan đến Dịch vụ của chúng tôi</li>
                <li>Phát hiện, điều tra và ngăn chặn các giao dịch gian lận và các hoạt động bất hợp pháp khác</li>
                <li>Bảo vệ quyền, tài sản hoặc sự an toàn của BiiterNCKH, người dùng của chúng tôi và những người khác</li>
                <li>Tuân thủ các nghĩa vụ pháp lý</li>
              </Typography>
              <Typography variant="body1">
                Chúng tôi có thể kết hợp thông tin chúng tôi thu thập về bạn từ các nguồn khác nhau để cải thiện Dịch vụ của chúng tôi và trải nghiệm của bạn.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                3. Chia sẻ thông tin
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Chúng tôi có thể chia sẻ thông tin của bạn trong các trường hợp sau:
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                3.1. Với sự đồng ý của bạn
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Chúng tôi có thể chia sẻ thông tin cá nhân của bạn khi bạn đồng ý hoặc chỉ đạo chúng tôi làm như vậy.
              </Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                3.2. Với nhà cung cấp dịch vụ
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Chúng tôi có thể chia sẻ thông tin của bạn với các nhà cung cấp dịch vụ bên thứ ba đáng tin cậy, những người thực hiện các dịch vụ thay mặt chúng tôi, chẳng hạn như lưu trữ, phân tích dữ liệu, xử lý thanh toán, gửi email, và cung cấp dịch vụ khách hàng. Các nhà cung cấp dịch vụ này chỉ có quyền truy cập vào thông tin cần thiết để thực hiện chức năng của họ và không được phép sử dụng thông tin cho các mục đích khác.
              </Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                3.3. Vì lý do pháp lý
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Chúng tôi có thể chia sẻ thông tin của bạn nếu chúng tôi tin rằng việc tiết lộ là cần thiết để:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ mb: 2, pl: 4 }}>
                <li>Tuân thủ luật pháp, quy định, quy trình pháp lý hoặc yêu cầu của chính phủ</li>
                <li>Bảo vệ quyền, tài sản hoặc sự an toàn của BiiterNCKH, người dùng của chúng tôi hoặc công chúng</li>
                <li>Phát hiện, ngăn chặn hoặc điều tra gian lận, vi phạm bảo mật hoặc các vấn đề kỹ thuật</li>
              </Typography>

              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                3.4. Trong trường hợp chuyển nhượng kinh doanh
              </Typography>
              <Typography variant="body1">
                Nếu BiiterNCKH tham gia vào việc sáp nhập, mua lại, bán tài sản hoặc chuyển giao dịch vụ cho một công ty khác, thông tin của bạn có thể là một phần của tài sản được chuyển nhượng. Trong trường hợp đó, chúng tôi sẽ thông báo cho bạn trước khi thông tin của bạn được chuyển giao và trở thành đối tượng của một chính sách bảo mật khác.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                4. Cookie và công nghệ tương tự
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Chúng tôi và các đối tác của chúng tôi sử dụng cookie và các công nghệ tương tự để thu thập và lưu trữ thông tin khi bạn truy cập Dịch vụ của chúng tôi. Cookie là các tệp văn bản nhỏ được lưu trữ trên thiết bị của bạn khi bạn truy cập trang web.
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                4.1. Loại cookie chúng tôi sử dụng
              </Typography>
              <Typography variant="body1" component="ul" sx={{ mb: 2, pl: 4 }}>
                <li><strong>Cookie cần thiết:</strong> Cần thiết cho hoạt động của Dịch vụ và không thể tắt trong hệ thống của chúng tôi.</li>
                <li><strong>Cookie phân tích/hiệu suất:</strong> Cho phép chúng tôi đếm lượt truy cập và nguồn lưu lượng để đo lường và cải thiện hiệu suất của Dịch vụ.</li>
                <li><strong>Cookie chức năng:</strong> Cho phép Dịch vụ cung cấp chức năng và cá nhân hóa nâng cao.</li>
                <li><strong>Cookie quảng cáo/theo dõi:</strong> Có thể được đặt bởi các đối tác quảng cáo của chúng tôi để xây dựng hồ sơ về sở thích của bạn và hiển thị quảng cáo phù hợp.</li>
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                4.2. Kiểm soát cookie
              </Typography>
              <Typography variant="body1">
                Hầu hết các trình duyệt web cho phép bạn kiểm soát cookie thông qua cài đặt trình duyệt của bạn. Tuy nhiên, nếu bạn từ chối cookie, bạn vẫn có thể sử dụng Dịch vụ của chúng tôi, nhưng khả năng sử dụng một số tính năng hoặc khu vực của Dịch vụ có thể bị hạn chế.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                5. Bảo mật dữ liệu
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Chúng tôi thực hiện các biện pháp bảo mật hợp lý để bảo vệ thông tin cá nhân của bạn khỏi mất mát, truy cập trái phép, tiết lộ, thay đổi và phá hủy. Các biện pháp bảo mật của chúng tôi bao gồm:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ mb: 2, pl: 4 }}>
                <li>Mã hóa dữ liệu nhạy cảm sử dụng công nghệ SSL/TLS</li>
                <li>Hạn chế quyền truy cập vào thông tin cá nhân chỉ cho nhân viên, nhà thầu và đại lý có nhu cầu kinh doanh</li>
                <li>Duy trì các biện pháp bảo vệ vật lý, điện tử và thủ tục phù hợp với các tiêu chuẩn ngành</li>
                <li>Thường xuyên xem xét và cập nhật các biện pháp bảo mật của chúng tôi</li>
              </Typography>
              <Typography variant="body1">
                Mặc dù chúng tôi nỗ lực bảo vệ thông tin cá nhân của bạn, không có phương thức truyền qua internet hoặc phương thức lưu trữ điện tử nào là an toàn 100%. Do đó, chúng tôi không thể đảm bảo an ninh tuyệt đối.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                6. Quyền của bạn
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Tùy thuộc vào luật pháp hiện hành, bạn có thể có các quyền sau liên quan đến thông tin cá nhân của bạn:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ mb: 2, pl: 4 }}>
                <li><strong>Quyền truy cập:</strong> Bạn có quyền yêu cầu bản sao thông tin cá nhân mà chúng tôi lưu giữ về bạn.</li>
                <li><strong>Quyền sửa đổi:</strong> Bạn có quyền yêu cầu chúng tôi sửa đổi thông tin cá nhân không chính xác hoặc không đầy đủ.</li>
                <li><strong>Quyền xóa:</strong> Bạn có quyền yêu cầu chúng tôi xóa thông tin cá nhân của bạn trong một số trường hợp nhất định.</li>
                <li><strong>Quyền hạn chế xử lý:</strong> Bạn có quyền yêu cầu chúng tôi hạn chế xử lý thông tin cá nhân của bạn trong một số trường hợp nhất định.</li>
                <li><strong>Quyền phản đối xử lý:</strong> Bạn có quyền phản đối việc xử lý thông tin cá nhân của bạn trong một số trường hợp nhất định.</li>
                <li><strong>Quyền di chuyển dữ liệu:</strong> Bạn có quyền nhận thông tin cá nhân của mình ở định dạng có cấu trúc, thường được sử dụng và có thể đọc được bằng máy.</li>
                <li><strong>Quyền rút lại sự đồng ý:</strong> Bạn có quyền rút lại sự đồng ý của mình bất kỳ lúc nào khi chúng tôi dựa vào sự đồng ý để xử lý thông tin cá nhân của bạn.</li>
              </Typography>
              <Typography variant="body1">
                Để thực hiện bất kỳ quyền nào trong số này, vui lòng liên hệ với chúng tôi theo thông tin liên hệ được cung cấp bên dưới. Chúng tôi sẽ phản hồi yêu cầu của bạn trong thời gian hợp lý và phù hợp với luật pháp hiện hành.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                7. Lưu giữ dữ liệu
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                Chúng tôi sẽ lưu giữ thông tin cá nhân của bạn miễn là cần thiết để đáp ứng các mục đích được nêu trong Chính sách bảo mật này, trừ khi thời gian lưu giữ lâu hơn được yêu cầu hoặc cho phép bởi luật pháp. Khi chúng tôi không còn cần thông tin cá nhân của bạn cho các mục đích được nêu trong Chính sách bảo mật này, chúng tôi sẽ xóa hoặc ẩn danh hóa thông tin đó.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                8. Thông tin trẻ em
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                Dịch vụ của chúng tôi không dành cho người dưới 18 tuổi. Chúng tôi không cố ý thu thập thông tin cá nhân từ trẻ em dưới 18 tuổi. Nếu bạn là phụ huynh hoặc người giám hộ và bạn biết rằng con bạn đã cung cấp cho chúng tôi thông tin cá nhân, vui lòng liên hệ với chúng tôi. Nếu chúng tôi biết rằng chúng tôi đã thu thập thông tin cá nhân từ trẻ em dưới 18 tuổi mà không có sự xác minh về sự đồng ý của phụ huynh, chúng tôi sẽ thực hiện các bước để xóa thông tin đó khỏi máy chủ của chúng tôi.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                9. Thay đổi đối với Chính sách bảo mật này
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian để phản ánh, ví dụ, những thay đổi đối với thực tiễn của chúng tôi hoặc vì các lý do hoạt động, pháp lý hoặc quy định khác. Chúng tôi sẽ đăng bất kỳ thay đổi nào đối với Chính sách bảo mật này trên trang web của chúng tôi và, nếu những thay đổi đó quan trọng, chúng tôi sẽ cung cấp thông báo nổi bật hơn.
              </Typography>
              <Typography variant="body1">
                Chúng tôi khuyến khích bạn xem lại Chính sách bảo mật này thường xuyên để biết thông tin về cách chúng tôi bảo vệ thông tin của bạn.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Liên hệ */}
        <Paper elevation={3} sx={{ p: 4, mb: 6, textAlign: 'center' }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            Bạn có câu hỏi về Chính sách bảo mật?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Nếu bạn có bất kỳ câu hỏi hoặc quan ngại nào về Chính sách bảo mật của chúng tôi, vui lòng liên hệ với chúng tôi qua:
          </Typography>
          <Typography variant="body1" sx={{ mb: 1 }}>
            Email: privacy@biiterr.com
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Địa chỉ: 123 Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh, Việt Nam
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            size="large"
            href="/contact"
          >
            Liên hệ với chúng tôi
          </Button>
        </Paper>

        {/* Chấp nhận chính sách */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Bằng cách sử dụng Dịch vụ của chúng tôi, bạn xác nhận rằng bạn đã đọc và hiểu Chính sách bảo mật này và đồng ý với việc thu thập, sử dụng và tiết lộ thông tin cá nhân của bạn như được mô tả trong đây.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Privacy; 