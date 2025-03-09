import React from 'react';
import {
  Box,
  Container,
  Typography,
  Divider,
  Paper,
  Breadcrumbs,
  Link,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

function Terms() {
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
          Điều Khoản Sử Dụng
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
          <Typography color="text.primary">Điều khoản sử dụng</Typography>
        </Breadcrumbs>

        {/* Giới thiệu */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            Giới thiệu
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Chào mừng bạn đến với BiiterNCKH. Các Điều khoản sử dụng này ("Điều khoản") điều chỉnh việc truy cập và sử dụng trang web, ứng dụng di động và các dịch vụ trực tuyến khác của BiiterNCKH (gọi chung là "Dịch vụ").
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Bằng cách truy cập hoặc sử dụng Dịch vụ của chúng tôi, bạn đồng ý bị ràng buộc bởi các Điều khoản này. Nếu bạn không đồng ý với bất kỳ phần nào của các Điều khoản này, bạn không được phép truy cập hoặc sử dụng Dịch vụ của chúng tôi.
          </Typography>
          <Typography variant="body1">
            Chúng tôi có thể sửa đổi các Điều khoản này vào bất kỳ lúc nào bằng cách đăng phiên bản cập nhật lên trang web của chúng tôi. Việc bạn tiếp tục sử dụng Dịch vụ sau khi chúng tôi đăng bất kỳ sửa đổi nào đồng nghĩa với việc bạn chấp nhận các điều khoản sửa đổi.
          </Typography>
        </Paper>

        {/* Nội dung điều khoản */}
        <Box sx={{ mb: 6 }}>
          <Accordion defaultExpanded sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                1. Tài khoản người dùng
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ mb: 2 }}>
                1.1. Để sử dụng một số tính năng của Dịch vụ, bạn có thể cần phải tạo một tài khoản. Bạn đồng ý cung cấp thông tin chính xác, đầy đủ và cập nhật khi được yêu cầu trong quá trình đăng ký.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                1.2. Bạn chịu trách nhiệm duy trì tính bảo mật của tài khoản và mật khẩu của mình. Bạn đồng ý thông báo ngay cho chúng tôi về bất kỳ hành vi sử dụng trái phép tài khoản của bạn hoặc bất kỳ vi phạm bảo mật nào khác.
              </Typography>
              <Typography variant="body1">
                1.3. Bạn chịu trách nhiệm về tất cả các hoạt động diễn ra dưới tài khoản của mình, cho dù các hoạt động đó được bạn ủy quyền hay không.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                2. Quyền sở hữu trí tuệ
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ mb: 2 }}>
                2.1. Dịch vụ và tất cả nội dung, tính năng và chức năng của nó, bao gồm nhưng không giới hạn ở tất cả thông tin, phần mềm, văn bản, hình ảnh, âm thanh, video, đồ họa, giao diện người dùng, thiết kế và mã nguồn ("Nội dung"), đều thuộc sở hữu của BiiterNCKH hoặc các bên cấp phép của chúng tôi và được bảo vệ bởi luật sở hữu trí tuệ Việt Nam và quốc tế.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                2.2. Bạn không được sao chép, sửa đổi, phân phối, bán, cho thuê, chuyển nhượng, trưng bày công khai, thực hiện công khai, tái sản xuất, truyền tải hoặc tạo ra các tác phẩm phái sinh từ bất kỳ Nội dung nào mà không có sự cho phép trước bằng văn bản của chúng tôi.
              </Typography>
              <Typography variant="body1">
                2.3. BiiterNCKH và các logo liên quan là thương hiệu của chúng tôi. Bạn không được sử dụng các thương hiệu này mà không có sự cho phép trước bằng văn bản của chúng tôi.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                3. Nội dung người dùng
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ mb: 2 }}>
                3.1. Dịch vụ của chúng tôi có thể cho phép bạn đăng, liên kết, lưu trữ, chia sẻ và cung cấp thông tin, văn bản, đồ họa, video hoặc các tài liệu khác ("Nội dung người dùng").
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                3.2. Bạn chịu trách nhiệm về Nội dung người dùng mà bạn đăng lên Dịch vụ, bao gồm tính hợp pháp, độ tin cậy, tính phù hợp và quyền sở hữu trí tuệ của nó.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                3.3. Bằng cách đăng Nội dung người dùng lên Dịch vụ, bạn cấp cho chúng tôi quyền và giấy phép không độc quyền, có thể chuyển nhượng, có thể cấp phép lại, miễn phí bản quyền, vĩnh viễn, không thể thu hồi và toàn cầu để sử dụng, sao chép, sửa đổi, tạo các tác phẩm phái sinh, phân phối, thực hiện và hiển thị Nội dung người dùng đó trên và thông qua Dịch vụ.
              </Typography>
              <Typography variant="body1">
                3.4. Bạn đồng ý không đăng Nội dung người dùng vi phạm bất kỳ quyền nào của bên thứ ba, bao gồm quyền sở hữu trí tuệ, quyền riêng tư hoặc quyền công khai.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                4. Hành vi bị cấm
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ mb: 2 }}>
                4.1. Bạn đồng ý không sử dụng Dịch vụ của chúng tôi:
              </Typography>
              <Typography variant="body1" component="ul" sx={{ mb: 2, pl: 4 }}>
                <li>Theo bất kỳ cách nào vi phạm bất kỳ luật hoặc quy định hiện hành nào.</li>
                <li>Để gửi, cố ý nhận, tải lên, tải xuống, sử dụng hoặc tái sử dụng bất kỳ tài liệu nào không tuân thủ các tiêu chuẩn nội dung của chúng tôi.</li>
                <li>Để truyền tải hoặc mua bán bất kỳ tài liệu quảng cáo hoặc khuyến mãi nào, "thư rác", "spam" hoặc bất kỳ tài liệu tương tự nào khác.</li>
                <li>Để mạo danh hoặc cố gắng mạo danh BiiterNCKH, nhân viên của chúng tôi, người dùng khác hoặc bất kỳ cá nhân hoặc tổ chức nào khác.</li>
              </Typography>
              <Typography variant="body1">
                4.2. Chúng tôi có quyền chấm dứt hoặc đình chỉ quyền truy cập của bạn vào Dịch vụ ngay lập tức, mà không cần thông báo trước, nếu bạn vi phạm các Điều khoản này.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                5. Miễn trừ trách nhiệm
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ mb: 2 }}>
                5.1. Dịch vụ được cung cấp "nguyên trạng" và "như có sẵn" mà không có bất kỳ bảo đảm nào, dù rõ ràng hay ngụ ý.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                5.2. BiiterNCKH không đảm bảo rằng Dịch vụ sẽ không bị gián đoạn, kịp thời, an toàn hoặc không có lỗi.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                5.3. Bạn hiểu rằng bạn tải xuống từ, hoặc lấy nội dung hoặc dịch vụ thông qua, Dịch vụ của chúng tôi theo quyết định và rủi ro của riêng bạn.
              </Typography>
              <Typography variant="body1">
                5.4. Thông tin y tế và dược phẩm được cung cấp trên Dịch vụ chỉ nhằm mục đích thông tin chung và không thay thế cho lời khuyên y tế chuyên nghiệp. Bạn nên luôn tham khảo ý kiến của chuyên gia y tế có trình độ về bất kỳ vấn đề sức khỏe cụ thể nào.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                6. Giới hạn trách nhiệm
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ mb: 2 }}>
                6.1. Trong phạm vi tối đa được pháp luật cho phép, BiiterNCKH sẽ không chịu trách nhiệm đối với bất kỳ thiệt hại nào phát sinh từ việc sử dụng hoặc không thể sử dụng Dịch vụ của chúng tôi.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                6.2. Trong mọi trường hợp, trách nhiệm của chúng tôi đối với tất cả các thiệt hại, tổn thất và nguyên nhân hành động sẽ không vượt quá số tiền bạn đã trả cho BiiterNCKH, nếu có, trong sáu (6) tháng trước khi yêu cầu bồi thường phát sinh.
              </Typography>
              <Typography variant="body1">
                6.3. Một số khu vực pháp lý không cho phép loại trừ hoặc giới hạn trách nhiệm đối với các thiệt hại do hậu quả hoặc ngẫu nhiên, vì vậy một số giới hạn trên có thể không áp dụng cho bạn.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                7. Bồi thường
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1">
                Bạn đồng ý bồi thường, bảo vệ và giữ cho BiiterNCKH và các cán bộ, giám đốc, nhân viên, nhà thầu, đại lý, bên cấp phép và nhà cung cấp của chúng tôi không bị tổn hại từ và chống lại bất kỳ khiếu nại, trách nhiệm, thiệt hại, phán quyết, giải thưởng, tổn thất, chi phí, chi phí hoặc phí tổn nào (bao gồm cả phí luật sư hợp lý) phát sinh từ hoặc liên quan đến việc bạn vi phạm các Điều khoản này hoặc việc bạn sử dụng Dịch vụ.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                8. Luật áp dụng và giải quyết tranh chấp
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ mb: 2 }}>
                8.1. Các Điều khoản này sẽ được điều chỉnh và giải thích theo luật pháp của Việt Nam, mà không tính đến các nguyên tắc xung đột pháp luật.
              </Typography>
              <Typography variant="body1">
                8.2. Bất kỳ tranh chấp nào phát sinh từ hoặc liên quan đến các Điều khoản này hoặc Dịch vụ của chúng tôi sẽ được giải quyết thông qua thương lượng thiện chí. Nếu không thể giải quyết được tranh chấp thông qua thương lượng, tranh chấp sẽ được đưa ra giải quyết tại tòa án có thẩm quyền tại Việt Nam.
              </Typography>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                9. Điều khoản khác
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body1" sx={{ mb: 2 }}>
                9.1. Toàn bộ thỏa thuận: Các Điều khoản này cấu thành toàn bộ thỏa thuận giữa bạn và BiiterNCKH liên quan đến Dịch vụ của chúng tôi và thay thế tất cả các thông tin liên lạc và đề xuất trước đây hoặc đồng thời, dù là bằng lời nói hay bằng văn bản, giữa bạn và BiiterNCKH liên quan đến Dịch vụ.
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                9.2. Từ bỏ và tính tách biệt: Việc BiiterNCKH không thực thi bất kỳ quyền hoặc điều khoản nào trong các Điều khoản này sẽ không cấu thành sự từ bỏ quyền hoặc điều khoản đó. Nếu bất kỳ điều khoản nào của các Điều khoản này bị tòa án có thẩm quyền xét xử coi là không hợp lệ, các bên vẫn đồng ý rằng tòa án sẽ cố gắng thực hiện ý định của các bên như được phản ánh trong điều khoản đó, và các điều khoản khác của các Điều khoản này vẫn có đầy đủ hiệu lực và hiệu quả.
              </Typography>
              <Typography variant="body1">
                9.3. Không chuyển nhượng: Bạn không được chuyển nhượng các Điều khoản này hoặc bất kỳ quyền hoặc nghĩa vụ nào của bạn theo các Điều khoản này mà không có sự đồng ý trước bằng văn bản của BiiterNCKH. BiiterNCKH có thể chuyển nhượng các Điều khoản này hoặc bất kỳ quyền hoặc nghĩa vụ nào theo các Điều khoản này mà không cần sự đồng ý của bạn.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>

        {/* Liên hệ */}
        <Paper elevation={3} sx={{ p: 4, mb: 6, textAlign: 'center' }}>
          <Typography variant="h5" component="h2" sx={{ mb: 2, fontWeight: 600 }}>
            Bạn có câu hỏi về Điều khoản sử dụng?
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Nếu bạn có bất kỳ câu hỏi nào về Điều khoản sử dụng của chúng tôi, vui lòng liên hệ với chúng tôi qua email support@biiterr.com hoặc qua trang Liên hệ của chúng tôi.
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

        {/* Chấp nhận điều khoản */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Bằng cách sử dụng Dịch vụ của chúng tôi, bạn xác nhận rằng bạn đã đọc và hiểu các Điều khoản sử dụng này và đồng ý bị ràng buộc bởi chúng.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

export default Terms; 