// Tiếng Việt FAQ — 30 câu hỏi
import { type Faq } from "@/data/seed-faqs";

export const faqVi: Faq[] = [
  // ─── Tổng quát (General) ──────────────────────────────────────────────
  {
    id: "vi-faq-001",
    category: "general",
    question: "Tại sao mọi người đến Hàn Quốc để thực hiện các thủ thuật y tế?",
    answer:
      "Hàn Quốc là quốc gia dẫn đầu thế giới về du lịch y tế vì một số lý do thuyết phục. Thứ nhất, các bác sĩ phẫu thuật Hàn Quốc — đặc biệt trong lĩnh vực phẫu thuật thẩm mỹ và da liễu — đã phát triển các kỹ thuật chuyên biệt cao được trau dồi qua nhiều thập kỷ, thường đạt được kết quả khó có thể tái tạo ở nơi khác. Thứ hai, chi phí thường thấp hơn 40–70% so với Mỹ, Canada hoặc Úc với chất lượng tương đương. Thứ ba, Hàn Quốc có yêu cầu cấp phép nghiêm ngặt và các cơ sở hiện đại được công nhận. Cuối cùng, sự kết hợp giữa công nghệ tiên tiến và văn hóa đề cao thẩm mỹ đã tạo nên một hệ sinh thái chuyên môn độc đáo và tập trung cao ở Gangnam, Seoul.",
    tags: ["tại sao Hàn Quốc", "du lịch y tế", "tổng quan", "chất lượng"],
  },
  {
    id: "vi-faq-002",
    category: "general",
    question: "Hàn Quốc có an toàn cho khách du lịch y tế không?",
    answer:
      "Hàn Quốc luôn được xếp hạng là một trong những quốc gia an toàn nhất thế giới với tỷ lệ tội phạm bạo lực chống lại khách du lịch cực kỳ thấp. Hệ thống y tế được quản lý tốt: tất cả các bác sĩ hành nghề phải được cấp phép bởi Hiệp hội Y khoa Hàn Quốc, và các bệnh viện được kiểm tra định kỳ. Đối với các thủ thuật y tế, Hàn Quốc có hệ thống Hòa giải Tranh chấp Y tế xử lý khiếu nại từ cả bệnh nhân trong nước và quốc tế. Như với bất kỳ chuyến du lịch y tế nào, rủi ro chính là chọn phòng khám chưa được xác minh — luôn xác minh chứng chỉ bác sĩ phẫu thuật, đọc đánh giá độc lập và nhận tất cả các điều khoản bằng văn bản trước khi tiến hành.",
    tags: ["an toàn", "quy định", "công nhận", "tiêu chuẩn y tế"],
  },
  {
    id: "vi-faq-003",
    category: "general",
    question: "Tôi nên đặt chỗ chuyến du lịch y tế đến Hàn Quốc trước bao lâu?",
    answer:
      "Đối với các thủ thuật tùy chọn không khẩn cấp, đặt trước 6–12 tuần là lý tưởng. Khoảng thời gian này cho phép bạn: (1) tư vấn video với nhiều phòng khám, (2) chuẩn bị hồ sơ y tế và ảnh, (3) mua bảo hiểm du lịch, và (4) sắp xếp chỗ ở và vé máy bay. Đối với các ca phẫu thuật lớn như tạo hình khuôn mặt hoặc gói chăm sóc toàn bộ khuôn mặt, một số phòng khám hàng đầu ở Gangnam có danh sách chờ 3–6 tháng. Đối với các điều trị nhỏ như liệu pháp laser hoặc Botox, thường đặt trước 2–4 tuần là đủ. Không mua vé máy bay cho đến khi bạn có cuộc hẹn đã xác nhận với phòng khám bạn chọn.",
    tags: ["đặt chỗ", "lên kế hoạch", "thời gian biểu", "đặt trước"],
  },
  {
    id: "vi-faq-004",
    category: "general",
    question: "Những thủ thuật y tế nào phổ biến nhất ở Hàn Quốc?",
    answer:
      "Những thủ thuật y tế phổ biến nhất đối với bệnh nhân quốc tế ở Hàn Quốc là: (1) Phẫu thuật thẩm mỹ — nâng mũi, phẫu thuật mí mắt đôi, tạo hình khuôn mặt (hàm V-line, thu nhỏ gò má) và nâng ngực; (2) Da liễu — điều trị laser da, Ultherapy, nâng chỉ và điều trị sẹo mụn; (3) Nha khoa — cấy ghép implant, veneer, Invisalign và các giải pháp toàn hàm; (4) Điều chỉnh thị lực — LASIK, LASEK và cấy ghép ICL. Hàn Quốc đặc biệt nổi trội trong các ca phẫu thuật tạo hình xương mặt đòi hỏi bác sĩ phẫu thuật chuyên sâu, vì các thủ thuật này được thực hiện thường xuyên hơn nhiều ở Hàn Quốc so với bất kỳ nơi nào khác trên thế giới.",
    tags: ["thủ thuật", "điều trị phổ biến", "phẫu thuật thẩm mỹ", "da liễu", "nha khoa", "lasik"],
  },
  {
    id: "vi-faq-005",
    category: "general",
    question: "Làm thế nào để tìm được phòng khám uy tín ở Hàn Quốc?",
    answer:
      "Tìm phòng khám uy tín đòi hỏi nghiên cứu từ nhiều nguồn: (1) Kiểm tra cơ sở dữ liệu Hiệp hội Y khoa Hàn Quốc (kma.org) để xác minh giấy phép bác sĩ phẫu thuật; (2) Đọc đánh giá trên các nền tảng quốc tế (RealSelf, diễn đàn du lịch y tế quốc tế) cũng như các nền tảng tiếng Hàn (Naver Blog, Kakao) — sử dụng công cụ dịch thuật; (3) Tìm các phòng khám có bộ phận bệnh nhân quốc tế chuyên dụng và điều phối viên nói tiếng Anh; (4) Thực hiện tư vấn video với ít nhất 3 phòng khám trước khi quyết định; (5) Yêu cầu ảnh trước và sau của bệnh nhân thực tế, không phải ảnh stock; (6) Yêu cầu báo giá bằng văn bản và kế hoạch phẫu thuật trước khi cam kết. Tránh các phòng khám thúc ép bạn đặt chỗ ngay lập tức hoặc đưa ra giá thấp hơn đáng kể so với giá thị trường.",
    tags: ["tìm phòng khám", "xác minh", "nghiên cứu", "phòng khám uy tín"],
  },

  // ─── Thị thực (Visa) ─────────────────────────────────────────────────
  {
    id: "vi-faq-006",
    category: "visa",
    question: "Tôi có cần thị thực để đến Hàn Quốc cho du lịch y tế không?",
    answer:
      "Hàn Quốc cung cấp nhập cảnh miễn thị thực cho công dân hơn 100 quốc gia với thời gian lưu trú từ 30 đến 90 ngày. Hầu hết các quốc gia phương Tây (Mỹ, Anh, các nước EU, Canada, Úc) không yêu cầu thị thực cho các chuyến thăm du lịch y tế ngắn hạn. Công dân từ các quốc gia không có trong danh sách miễn thị thực có thể đăng ký Thị thực Du lịch Y tế C-3-M, có thể được cấp cho thời gian lưu trú đến 90 ngày. Ngoài ra, nếu thời gian lưu trú phải vượt quá giai đoạn miễn thị thực do điều trị hoặc phục hồi kéo dài, bạn có thể đăng ký thị thực G-1 (lưu trú điều trị y tế) cho phép lưu trú lên đến 1 năm. Luôn xác minh các yêu cầu thị thực hiện tại qua Đại sứ quán Hàn Quốc hoặc trang web chính phủ điện tử Hi Korea vì chính sách có thể thay đổi.",
    tags: ["thị thực", "miễn thị thực", "C-3-M", "G-1 visa", "yêu cầu nhập cảnh"],
  },
  {
    id: "vi-faq-007",
    category: "visa",
    question: "Thị thực Du lịch Y tế C-3-M là gì và ai cần nó?",
    answer:
      "Thị thực Du lịch Y tế C-3-M là thị thực ngắn hạn được thiết kế đặc biệt cho công dân nước ngoài đến Hàn Quốc điều trị y tế từ các quốc gia không có thỏa thuận miễn thị thực với Hàn Quốc. Thị thực cho phép nhập cảnh một lần với thời gian lưu trú đến 90 ngày. Để đăng ký, bạn thường cần: (1) hộ chiếu hợp lệ, (2) thư mời hoặc xác nhận cuộc hẹn từ cơ sở y tế Hàn Quốc, (3) bằng chứng khả năng tài chính trang trải chi phí y tế, (4) mẫu đơn đã điền đầy đủ. Thị thực được xử lý tại đại sứ quán hoặc lãnh sự quán Hàn Quốc ở nước bạn. Thời gian xử lý thường là 5–10 ngày làm việc. Du khách từ các quốc gia miễn thị thực không cần thị thực này và có thể nhập cảnh theo miễn thị thực du lịch tiêu chuẩn.",
    tags: ["visa C-3-M", "thị thực y tế", "đăng ký thị thực", "yêu cầu thị thực"],
  },
  {
    id: "vi-faq-008",
    category: "visa",
    question: "Tôi có thể gia hạn thời gian lưu trú ở Hàn Quốc nếu quá trình phục hồi lâu hơn dự kiến không?",
    answer:
      "Có, hoàn toàn có thể gia hạn thời gian lưu trú ở Hàn Quốc nếu cần thiết về mặt y tế. Các lựa chọn phụ thuộc vào tình trạng thị thực hiện tại của bạn: (1) Nếu bạn nhập cảnh theo miễn thị thực, trong hầu hết các trường hợp bạn có thể đăng ký gia hạn một lần 30 ngày tại văn phòng xuất nhập cảnh địa phương (hikorea.go.kr); (2) Nếu bạn nhập cảnh theo thị thực C-3-M, bạn có thể đăng ký đổi sang thị thực G-1 (lưu trú y tế) tại văn phòng xuất nhập cảnh, cho phép lưu trú đến 1 năm với thư giới thiệu của bác sĩ; (3) Bạn sẽ cần tài liệu hỗ trợ từ phòng khám Hàn Quốc xác nhận sự cần thiết y tế của việc lưu trú kéo dài. Lên kế hoạch trước — đăng ký gia hạn trước khi trạng thái hiện tại của bạn hết hạn. Văn phòng xuất nhập cảnh có ở các thành phố lớn và Sân bay Incheon.",
    tags: ["gia hạn thị thực", "lưu trú dài hạn", "xuất nhập cảnh", "thị thực phục hồi"],
  },
  {
    id: "vi-faq-009",
    category: "visa",
    question: "Tôi có thể đưa người đi cùng theo thị thực du lịch y tế không?",
    answer:
      "Có, người đi cùng (người chăm sóc hoặc thành viên gia đình) đi cùng khách du lịch y tế thường có thể nhận thị thực đi kèm C-3-M. Người đi cùng phải đăng ký riêng và nộp bằng chứng mối quan hệ với bệnh nhân (giấy chứng nhận kết hôn, sổ hộ khẩu gia đình, v.v.) cùng với đơn thị thực của bệnh nhân. Nếu bạn đến từ quốc gia miễn thị thực, người đi cùng của bạn cũng có thể nhập cảnh miễn thị thực theo miễn thị thực du lịch tiêu chuẩn. Lưu ý rằng người đi cùng lưu trú ở Hàn Quốc lâu hơn giai đoạn miễn thị thực của họ cũng cần đăng ký gia hạn hoặc đổi thị thực phù hợp. Hầu hết các phòng khám có thể cung cấp thư mời cho người đi cùng nếu được yêu cầu.",
    tags: ["thị thực đi kèm", "người chăm sóc", "gia đình", "người đi cùng"],
  },

  // ─── Chi phí (Cost) ──────────────────────────────────────────────────
  {
    id: "vi-faq-010",
    category: "cost",
    question: "Chi phí phẫu thuật thẩm mỹ ở Hàn Quốc so với các quốc gia khác như thế nào?",
    answer:
      "Hàn Quốc thường mang lại khoản tiết kiệm 40–70% so với giá Mỹ và 30–50% so với giá Anh/Úc với chất lượng tương đương. Phạm vi giá tham khảo (USD): Nâng mũi 2.000–5.000 (Mỹ: 7.000–15.000); Phẫu thuật mí mắt đôi 700–1.800 (Mỹ: 3.000–6.000); Tạo hình hàm V-line 5.000–10.000 (Mỹ: 12.000–25.000); Nâng ngực 3.000–6.000 (Mỹ: 8.000–15.000). Đây là phạm vi rộng vì chi phí thay đổi đáng kể theo cấp độ phòng khám, kinh nghiệm bác sĩ phẫu thuật và độ phức tạp của thủ thuật. Khi lập ngân sách, hãy cộng thêm 1.500–3.000 USD cho vé máy bay và chỗ ở, và tính đến giá trị 10–14 ngày nghỉ phép. Ngay cả với những chi phí này, thường vẫn còn khoản tiết kiệm đáng kể.",
    tags: ["chi phí", "giá cả", "so sánh", "bao nhiêu tiền", "ngân sách"],
  },
  {
    id: "vi-faq-011",
    category: "cost",
    question: "Chi phí thủ thuật ở Hàn Quốc thường bao gồm những gì?",
    answer:
      "Giá được phòng khám Hàn Quốc báo giá cho các thủ thuật phẫu thuật thường bao gồm: phí bác sĩ phẫu thuật, gây mê, sử dụng phòng mổ, chăm sóc điều dưỡng cơ bản và tư vấn theo dõi tiêu chuẩn trong thời gian lưu trú. Những gì thường KHÔNG bao gồm: xét nghiệm y tế trước phẫu thuật (nếu cần), thuốc theo toa mang về nhà, băng áp lực, chỗ ở và dịch thuật tài liệu mang về nhà. Luôn yêu cầu báo giá chi tiết bằng văn bản. Một số phòng khám cung cấp gói du lịch y tế trọn gói bao gồm chỗ ở, đưa đón sân bay và dịch vụ điều phối — điều này có thể tiện lợi nhưng hãy so sánh tổng giá với việc đặt các thành phần riêng lẻ.",
    tags: ["bao gồm gì", "phân tích chi phí", "báo giá", "gói dịch vụ"],
  },
  {
    id: "vi-faq-012",
    category: "cost",
    question: "Tôi nên lập ngân sách bao nhiêu cho chuyến du lịch nha khoa đến Hàn Quốc?",
    answer:
      "Chi phí thủ thuật nha khoa ở Hàn Quốc (mỗi răng/đơn vị, xấp xỉ USD): Cấy ghép implant đơn 900–1.800 (Mỹ: 3.500–6.000); Veneer sứ 280–450 (Mỹ: 900–2.500); Mão răng gốm 280–400 (Mỹ: 900–2.000); Điều trị Invisalign toàn bộ 2.500–4.000 (Mỹ: 5.000–8.000); Tẩy trắng răng 120–250 (Mỹ: 400–800). Đối với chuyến du lịch nha khoa, hãy lập ngân sách thêm: vé máy bay + chỗ ở (800–2.000 cho 1–2 tuần), chuyến đi thứ hai tiềm năng cho implant (tích hợp xương cần 3–6 tháng) và bảo hiểm du lịch. Hầu hết du khách nha khoa cần 2–4 implant thấy tổng chi phí chuyến đi vẫn thấp hơn 40–60% so với giá ở quê nhà.",
    tags: ["chi phí nha khoa", "giá implant", "giá veneer", "ngân sách du lịch nha khoa"],
  },
  {
    id: "vi-faq-013",
    category: "cost",
    question: "Cách tốt nhất để thanh toán tại các phòng khám Hàn Quốc là gì?",
    answer:
      "Phương thức thanh toán phổ biến nhất và thường tiết kiệm nhất là tiền mặt Won Hàn Quốc. Bạn có thể đổi tiền tại Sân bay Incheon (tỷ giá cạnh tranh), sử dụng ATM (KEB Hana Bank và Woori Bank có dịch vụ thẻ nước ngoài đáng tin cậy) hoặc sử dụng các điểm đổi tiền ở Myeongdong và Gangnam. Hầu hết các phòng khám lớn chấp nhận thẻ tín dụng Visa và Mastercard nhưng có thể tính thêm phí giao dịch quốc tế 1–3%. Đối với các thủ thuật lớn hơn, các phòng khám thường yêu cầu đặt cọc trước qua chuyển khoản ngân hàng quốc tế — hãy yêu cầu thông tin tài khoản ngân hàng và số tham chiếu. Tiền điện tử không được chấp nhận rộng rãi tại các phòng khám y tế. Giữ tất cả biên lai vì một số quốc gia cho phép khấu trừ thuế một phần chi phí y tế.",
    tags: ["thanh toán", "tiền mặt", "thẻ tín dụng", "chuyển khoản", "tiền tệ"],
  },
  {
    id: "vi-faq-014",
    category: "cost",
    question: "Bảo hiểm y tế ở quê nhà có chi trả cho việc điều trị ở Hàn Quốc không?",
    answer:
      "Hầu hết các kế hoạch bảo hiểm y tế ở quê nhà không chi trả cho các thủ thuật thẩm mỹ tùy chọn bất kể được thực hiện ở đâu. Bảo hiểm y tế tiêu chuẩn hiếm khi hoàn trả các thủ thuật như nâng mũi, nâng ngực hoặc nha khoa thẩm mỹ ở Hàn Quốc. Tuy nhiên, có các ngoại lệ: (1) Một số điều chỉnh thị lực (LASIK/ICL) có thể được chi trả một phần tùy thuộc vào kế hoạch và chẩn đoán của bạn; (2) Nha khoa cần thiết về mặt y tế (như implant sau chấn thương) có thể đủ điều kiện; (3) Một số quỹ tài khoản chi tiêu linh hoạt (FSA) hoặc tài khoản tiết kiệm sức khỏe (HSA) ở Mỹ có thể được sử dụng cho một số thủ thuật y tế nhất định. Trước khi đi, hãy liên hệ nhà cung cấp bảo hiểm của bạn với mã CPT/ICD của thủ thuật để xác minh phạm vi bảo hiểm. Ngoài ra, hãy cân nhắc mua bảo hiểm du lịch y tế chuyên biệt bao gồm các biến chứng từ các thủ thuật tùy chọn.",
    tags: ["bảo hiểm", "phạm vi bảo hiểm", "bảo hiểm trong nước", "FSA", "HSA"],
  },

  // ─── Thủ thuật (Procedure) ─────────────────────────────────────────
  {
    id: "vi-faq-015",
    category: "procedure",
    question: "Phẫu thuật mí mắt đôi là gì và được thực hiện như thế nào ở Hàn Quốc?",
    answer:
      "Phẫu thuật mí mắt đôi (tạo hình mí mắt) tạo ra một nếp gấp rõ ràng trên mí mắt trên, tự nhiên không có ở khoảng 50% người Đông Á. Ở Hàn Quốc, đây là thủ thuật thẩm mỹ được thực hiện phổ biến nhất. Có hai kỹ thuật chính: (1) Phương pháp không mổ (khâu) — các mũi khâu nhỏ tạo nếp gấp mà không cần rạch, mất 30–45 phút, phục hồi tối thiểu, tốt nhất cho bệnh nhân trẻ hơn với mí mắt mỏng hơn; (2) Phương pháp mổ — một vết rạch nhỏ loại bỏ da và mỡ thừa, thời gian phục hồi lâu hơn nhưng kết quả lâu bền hơn, tốt hơn cho bệnh nhân có mí mắt phồng hoặc lớn tuổi hơn. Các bác sĩ phẫu thuật Hàn Quốc được công nhận trên toàn cầu về chuyên môn trong thủ thuật này. Chi phí dao động từ 700 USD (không mổ) đến 1.800 USD (mổ) tại các phòng khám uy tín ở Gangnam.",
    tags: ["mí mắt đôi", "tạo hình mí mắt", "phẫu thuật mắt", "phương pháp mổ", "phương pháp không mổ"],
  },
  {
    id: "vi-faq-016",
    category: "procedure",
    question: "Nâng mũi ở Hàn Quốc như thế nào? Cách tiếp cận có khác với các nước phương Tây không?",
    answer:
      "Các bác sĩ phẫu thuật nâng mũi Hàn Quốc nổi tiếng trên toàn thế giới, đặc biệt vì khả năng tạo ra kết quả tinh tế, trông tự nhiên bổ sung cho các đặc điểm khuôn mặt châu Á. Cách tiếp cận Hàn Quốc thường nhấn mạnh sự tinh tế — nâng cao và tạo hình sống mũi, tinh chỉnh đầu mũi và cải thiện sự hài hòa khuôn mặt tổng thể — thay vì biến đổi đáng kể. Về mặt kỹ thuật, các bác sĩ phẫu thuật Hàn Quốc thường sử dụng sụn tự thân (từ tai hoặc xương sườn của bệnh nhân) để hỗ trợ cấu trúc, tạo ra kết quả tự nhiên và lâu bền hơn so với implant tổng hợp đơn thuần. Các thủ thuật dao động từ tinh chỉnh đầu mũi đơn giản (1,5–2 giờ) đến nâng mũi sửa chữa phức tạp (3–5 giờ). Sưng mất 3–6 tháng để giải quyết hoàn toàn, vì vậy kết quả không hiển thị ngay lập tức.",
    tags: ["nâng mũi", "phẫu thuật mũi", "nâng mũi Hàn Quốc"],
  },
  {
    id: "vi-faq-017",
    category: "procedure",
    question: "Phẫu thuật hàm V-line là gì và quá trình phục hồi như thế nào?",
    answer:
      "Phẫu thuật V-line (hoặc phẫu thuật tạo hình khuôn mặt) là một loạt thủ thuật định hình lại phần dưới mặt — bao gồm hàm, góc hàm dưới và cằm — để tạo ra vẻ ngoài khuôn mặt thon gọn hơn, hình oval hơn. Có thể bao gồm: thu nhỏ hàm vuông (mài hoặc cắt góc hàm dưới), cắt xương cằm (định hình lại xương cằm) và đôi khi thu nhỏ gò má. Đây là phẫu thuật xương hàm mặt thực sự được thực hiện dưới gây mê toàn thân, kéo dài 2–4 giờ. Quá trình phục hồi đáng kể: chế độ ăn chất lỏng/mềm trong 4–8 tuần, sưng mặt trong 3–6 tháng, kết quả đầy đủ nhìn thấy sau 6–12 tháng. Đây là một trong những thủ thuật thẩm mỹ phức tạp nhất được thực hiện ở Hàn Quốc và đòi hỏi bác sĩ phẫu thuật có kinh nghiệm cao. Không được khuyến nghị cho bệnh nhân phẫu thuật lần đầu. Chi phí: 5.000–12.000 USD tùy thuộc vào phạm vi.",
    tags: ["V-line", "phẫu thuật hàm", "tạo hình khuôn mặt", "thu nhỏ hàm", "phẫu thuật cằm"],
  },
  {
    id: "vi-faq-018",
    category: "procedure",
    question: "Những điều trị da không phẫu thuật nào phổ biến nhất ở Hàn Quốc?",
    answer:
      "Hàn Quốc là quốc gia dẫn đầu thế giới về y học thẩm mỹ không phẫu thuật. Các điều trị da không phẫu thuật phổ biến nhất cho bệnh nhân quốc tế bao gồm: (1) Ultherapy/HIFU — nâng da bằng siêu âm, không thời gian nghỉ, 800–1.500 USD; (2) Thermage FLX — làm săn chắc bằng tần số vô tuyến, không thời gian nghỉ, 700–1.200 USD; (3) Toning laser pico — sắc tố da, lỗ chân lông và trẻ hóa, 150–300 USD/buổi; (4) Tiêm skin booster (Restylane Vital, Juvederm) — cấp ẩm sâu, vi tiêm trên toàn mặt, 300–600 USD; (5) Nâng chỉ (chỉ PDO) — hiệu ứng nâng cơ học, 2–3 ngày bầm tím nhẹ, 800–2.000 USD; (6) Botox và filler — có sẵn rộng rãi, giá rất cạnh tranh. Nhiều du khách kết hợp 2–3 điều trị này trong một chuyến đi.",
    tags: ["không phẫu thuật", "laser", "Ultherapy", "Thermage", "skin booster", "nâng chỉ"],
  },
  {
    id: "vi-faq-019",
    category: "procedure",
    question: "Mất bao lâu để thực hiện LASIK ở Hàn Quốc và quy trình tổng thể là gì?",
    answer:
      "LASIK ở Hàn Quốc hiệu quả và được tổ chức tốt cho bệnh nhân quốc tế. Quy trình đầy đủ từ khi đến đến khi được phép xuất viện thường mất 3–5 ngày: Ngày 1 — kiểm tra mắt toàn diện (lập bản đồ giác mạc, đo độ dày, phân tích đơn thuốc), mất 2–3 giờ; không đeo kính áp tròng trong 1–2 tuần trước. Ngày 2 (hoặc cùng ngày nếu kiểm tra đạt) — bản thân ca phẫu thuật mất 10–15 phút tổng cộng cho cả hai mắt. Ngày 3–4 — kiểm tra hậu phẫu sau 24 giờ. Một số phòng khám cung cấp tư vấn y tế từ xa sau 1 tuần cho bệnh nhân về nước sớm hơn. Tổng chi phí cho cả hai mắt: 1.500–2.200 USD tại các phòng khám mắt Hàn Quốc uy tín, thấp hơn đáng kể so với các phòng khám tương đương ở Mỹ, Anh hoặc Úc.",
    tags: ["LASIK", "điều chỉnh thị lực", "phẫu thuật mắt", "quy trình", "thời gian biểu"],
  },
  {
    id: "vi-faq-020",
    category: "procedure",
    question: "Tôi cần mang gì đến buổi tư vấn ở Hàn Quốc?",
    answer:
      "Để tận dụng tối đa buổi tư vấn tại phòng khám Hàn Quốc, hãy mang theo: (1) Ảnh — ảnh rõ ràng, ánh sáng tốt của vùng bạn đang xem xét điều trị, cả ảnh cận và nhiều góc độ; (2) Ảnh tham khảo — ví dụ về kết quả bạn thích (và kết quả bạn muốn tránh); (3) Tóm tắt tiền sử bệnh — bất kỳ tình trạng liên quan, phẫu thuật trước đây, dị ứng và thuốc đang dùng bằng tiếng Anh; (4) Danh sách câu hỏi — chuẩn bị câu hỏi của bạn trước vì thời gian tư vấn có hạn; (5) Hộ chiếu hoặc CMND; (6) Dịch thuật bất kỳ báo cáo y tế hiện có. Đối với tư vấn nha khoa, hãy mang phim X-quang nha khoa gần đây nếu có. Đối với tư vấn mắt, hãy mang đơn thuốc kính hiện tại và lịch sử đeo kính áp tròng. Hầu hết các phòng khám nói tiếng Anh chấp nhận tài liệu qua email trước, giúp tiết kiệm thời gian.",
    tags: ["tư vấn", "cần mang gì", "chuẩn bị", "ảnh", "tiền sử bệnh"],
  },

  // ─── Phục hồi (Recovery) ──────────────────────────────────────────────
  {
    id: "vi-faq-021",
    category: "recovery",
    question: "Tôi cần ở lại Hàn Quốc bao lâu sau phẫu thuật thẩm mỹ?",
    answer:
      "Thời gian lưu trú tối thiểu được khuyến nghị phụ thuộc nhiều vào thủ thuật: Mí mắt đôi (không mổ) — 5–7 ngày; Nâng mũi — 10–14 ngày (cần tháo nẹp vào ngày 7–10); Nâng ngực — 7–10 ngày; Phẫu thuật hàm/tạo hình khuôn mặt — tối thiểu 14–21 ngày; Hút mỡ — 7–10 ngày; Điều trị da bằng laser — 3–5 ngày. Những mức tối thiểu này giả định rằng thủ thuật diễn ra suôn sẻ. Hãy lên kế hoạch cho ít nhất một lần kiểm tra hậu phẫu trước khi về nhà. Các chuyến bay đường dài (hơn 8 giờ) có thể cần thêm vài ngày nghỉ ngơi trước khi bay vì thay đổi độ cao và áp suất có thể ảnh hưởng đến quá trình lành thương. Luôn nhận được sự cho phép cụ thể từ bác sĩ phẫu thuật của bạn trước khi lên máy bay về nhà.",
    tags: ["thời gian phục hồi", "cần ở lại bao lâu", "hậu phẫu", "thời gian lưu trú tối thiểu"],
  },
  {
    id: "vi-faq-022",
    category: "recovery",
    question: "Có an toàn để bay về nhà sau phẫu thuật không? Khi nào thì an toàn để bay?",
    answer:
      "Bay quá sớm sau phẫu thuật mang những rủi ro thực sự: huyết khối tĩnh mạch sâu (DVT) do bất động trên các chuyến bay dài, tăng sưng từ thay đổi áp suất cabin và nguy cơ nhiễm trùng từ du lịch hàng không công cộng. Hướng dẫn chung: (1) Thủ thuật nhỏ (Botox, filler, laser) — có thể bay ngày hôm sau; (2) Nâng mũi — thường được phép sau khi tháo nẹp (ngày 7–10), nhưng nhiều bác sĩ phẫu thuật thích 10–14 ngày; (3) Nâng ngực hoặc hút mỡ — thường 7–10 ngày; (4) Phẫu thuật xương mặt — tối thiểu 14 ngày, thích hơn 21 ngày; (5) Implant nha khoa (sau nhổ răng) — 3–5 ngày. Trên các chuyến bay dài sau phẫu thuật: đi bộ mỗi giờ, giữ đủ nước, mang vớ nén, tránh rượu bia. Luôn nhận được giấy phép y tế bằng văn bản từ bác sĩ phẫu thuật Hàn Quốc trước khi bay.",
    tags: ["bay sau phẫu thuật", "khi nào bay được", "DVT", "an toàn bay", "giấy phép"],
  },
  {
    id: "vi-faq-023",
    category: "recovery",
    question: "Chỗ ở nào phù hợp nhất để phục hồi y tế ở Seoul?",
    answer:
      "Chỗ ở tốt nhất để phục hồi sau phẫu thuật ở Seoul phụ thuộc vào thủ thuật của bạn: (1) Nhà khách gần phòng khám — nhiều nhà khách chuyên về du lịch y tế ở khu vực Apgujeong và Sinsa-dong cung cấp phòng phục hồi với giường điều chỉnh được, lễ tân 24 giờ và nhân viên quen với nhu cầu hậu phẫu. Chi phí: 50–120 USD/đêm; (2) Căn hộ dịch vụ — không gian rộng hơn, bếp để chuẩn bị thức ăn mềm, riêng tư. Được khuyến nghị cho lưu trú 2+ tuần. Chi phí: 80–200 USD/đêm; (3) Phòng phục hồi tại bệnh viện — một số phòng khám lớn cung cấp phòng phục hồi trong bệnh viện cho 1–3 đêm đầu sau phẫu thuật, lý tưởng cho các thủ thuật lớn; (4) Khách sạn gần phòng khám — lựa chọn tiêu chuẩn, đảm bảo cho phép nhận phòng sớm vì bạn sẽ đến từ phẫu thuật trong trạng thái mơ hồ. Tìm kiếm chỗ ở phục hồi y tế Seoul trên Naver Map hoặc Airbnb để có các lựa chọn chuyên biệt.",
    tags: ["chỗ ở", "khách sạn phục hồi", "nhà khách", "nơi ở", "căn hộ phục hồi"],
  },
  {
    id: "vi-faq-024",
    category: "recovery",
    question: "Tôi nên ăn gì trong quá trình phục hồi ở Seoul?",
    answer:
      "Chế độ ăn sau phẫu thuật phụ thuộc vào thủ thuật của bạn, nhưng hướng dẫn chung: (1) Phẫu thuật xương mặt (hàm, V-line) — chế độ ăn chất lỏng/xay nhuyễn trong 4–8 tuần. Hàn Quốc có các nhà hàng cháo (juk) ở khắp nơi; cũng có canh tương đậu (doenjang jjigae, phục vụ mềm) và các món canh Hàn Quốc dễ xay nhuyễn; (2) Nâng mũi — không có hạn chế ăn uống nhưng tránh xì mũi; ăn thức ăn mềm trong vài ngày đầu khi bị sưng; (3) Thủ thuật nha khoa — thức ăn mềm trong 1–2 tuần. Cửa hàng tiện lợi Hàn Quốc (CU, GS25) có đậu phụ mềm, sữa chua và bánh pudding 24/7; (4) Điều trị laser/da — không có hạn chế ăn uống nhưng tăng lượng nước uống và ăn thực phẩm giàu chất chống oxy hóa; (5) Tất cả bệnh nhân nên tránh rượu bia trong ít nhất 2–4 tuần sau phẫu thuật vì nó làm tăng sưng và làm chậm quá trình lành. Ứng dụng giao hàng Coupang Eats và Baemin có giao diện tiếng Anh.",
    tags: ["chế độ ăn", "thức ăn phục hồi", "ăn gì", "chế độ ăn hậu phẫu", "thức ăn mềm"],
  },
  {
    id: "vi-faq-025",
    category: "recovery",
    question: "Làm thế nào để kiểm soát sưng và bầm tím sau phẫu thuật thẩm mỹ?",
    answer:
      "Kiểm soát sưng sau phẫu thuật là mối quan tâm phổ biến. Các phương pháp dựa trên bằng chứng: (1) Nâng cao — giữ vùng phẫu thuật cao hơn mức tim, đặc biệt khi ngủ (dùng thêm gối); (2) Chườm lạnh — áp dụng lạnh (không trực tiếp đá) trong 15–20 phút mỗi lần trong 48 giờ đầu; sau 72 giờ, chuyển sang chườm ấm để hỗ trợ dẫn lưu bạch huyết; (3) Arnica — thực phẩm chức năng arnica uống và gel arnica bôi ngoài được sử dụng rộng rãi (và thường được các bác sĩ phẫu thuật Hàn Quốc khuyến nghị) để giảm bầm tím; có bán tại các hiệu thuốc Hàn Quốc; (4) Tránh muối — natri dư thừa làm tăng đáng kể sưng sau phẫu thuật; (5) Massage bạch huyết nhẹ nhàng — một số phòng khám Hàn Quốc cung cấp massage bạch huyết sau phẫu thuật, giúp giảm đáng kể thời gian sưng; (6) Kiên nhẫn — một số sưng (đặc biệt sau phẫu thuật mũi và hàm) là bình thường trong vài tháng. Đừng đánh giá kết quả trong 4–8 tuần đầu.",
    tags: ["sưng", "bầm tím", "mẹo phục hồi", "arnica", "massage bạch huyết", "chườm lạnh"],
  },

  // ─── Ngôn ngữ (Language) ──────────────────────────────────────────────
  {
    id: "vi-faq-026",
    category: "language",
    question: "Tôi có cần biết tiếng Hàn để được điều trị y tế ở Hàn Quốc không?",
    answer:
      "Không — bạn không cần nói tiếng Hàn để nhận điều trị y tế ở Hàn Quốc. Các phòng khám lớn ở Gangnam và các khu du lịch y tế khác duy trì các bộ phận bệnh nhân quốc tế chuyên dụng với điều phối viên nói tiếng Anh xử lý mọi thứ từ lên lịch và phiên dịch đến hướng dẫn chăm sóc hậu phẫu. Đối với các phòng khám không có nhân viên nói tiếng Anh, có thể sắp xếp phiên dịch y tế chuyên nghiệp (thường với chi phí bổ sung). Ứng dụng hữu ích để điều hướng bên ngoài phòng khám: Papago (phiên dịch Hàn-Anh, chính xác hơn Google Translate cho tiếng Hàn), Naver Map (điều hướng bằng tiếng Anh) và KakaoTalk (nhiều phòng khám giao tiếp qua ứng dụng này). Hầu hết các hiệu thuốc lớn gần Gangnam quen với bệnh nhân quốc tế — chỉ cần xuất trình đơn thuốc, không cần giải thích bằng tiếng Hàn.",
    tags: ["ngôn ngữ", "tiếng Anh", "tiếng Hàn", "phiên dịch", "rào cản ngôn ngữ"],
  },
  {
    id: "vi-faq-027",
    category: "language",
    question: "Các phòng khám Hàn Quốc hỗ trợ những ngôn ngữ nào ngoài tiếng Anh?",
    answer:
      "Các phòng khám du lịch y tế Hàn Quốc, đặc biệt ở Gangnam, đã đầu tư mạnh vào dịch vụ đa ngôn ngữ để thu hút bệnh nhân quốc tế. Các ngôn ngữ được hỗ trợ phổ biến ngoài tiếng Anh: Tiếng Trung (phổ thông/giản thể) là ngôn ngữ sẵn có rộng rãi nhất — Hàn Quốc nhận nhiều khách du lịch y tế Trung Quốc hơn bất kỳ quốc tịch nào khác; Tiếng Nhật (nhiều phòng khám ở Gangnam có điều phối viên nói tiếng Nhật); Tiếng Thái (phổ biến tại các phòng khám chuyên về thủ thuật mặt); Tiếng Việt (nhu cầu ngày càng tăng từ Đông Nam Á); Tiếng Ả Rập (có tại một số phòng khám phục vụ bệnh nhân Trung Đông); Tiếng Nga (có tại một số lượng nhỏ phòng khám). Ít phổ biến hơn: Tiếng Pháp, Tây Ban Nha, Đức, Bồ Đào Nha. Khi liên hệ phòng khám, hãy chỉ định ngôn ngữ ưu tiên của bạn và hỏi cụ thể liệu họ có điều phối viên nói thành thạo (không chỉ là ứng dụng dịch thuật).",
    tags: ["ngôn ngữ", "tiếng Trung", "tiếng Nhật", "tiếng Ả Rập", "đa ngôn ngữ", "phiên dịch"],
  },
  {
    id: "vi-faq-028",
    category: "language",
    question: "Ứng dụng dịch thuật nào hoạt động tốt nhất ở Hàn Quốc cho du lịch y tế?",
    answer:
      "Các ứng dụng dịch thuật tốt nhất để điều hướng Hàn Quốc với tư cách là khách du lịch y tế: (1) Papago (của Naver) — tiêu chuẩn vàng cho dịch thuật Hàn-Anh, chính xác hơn đáng kể so với Google Translate cho tiếng Hàn; có sẵn miễn phí trên iOS và Android; chế độ camera dịch thực đơn và biển hiệu theo thời gian thực; (2) Google Translate — ít chính xác hơn cho tiếng Hàn nhưng hữu ích cho dịch thuật camera/ảnh của văn bản; (3) DeepL — xuất sắc cho dịch thuật tài liệu cấp đoạn; hữu ích để hiểu các biểu mẫu đồng ý y tế (vẫn cần phiên dịch người thật cho bất cứ điều gì bạn ký); (4) KakaoTalk — ứng dụng nhắn tin thống trị của Hàn Quốc, nhiều phòng khám sử dụng để cập nhật và chia sẻ ảnh. Lưu ID KakaoTalk của phòng khám trước khi bạn đến. Lưu ý: Luôn xác minh thông tin y tế quan trọng (liều lượng, chẩn đoán, hướng dẫn) thông qua phiên dịch người thật đủ năng lực thay vì chỉ dựa vào dịch thuật ứng dụng.",
    tags: ["Papago", "Google Translate", "ứng dụng dịch thuật", "KakaoTalk", "công cụ ngôn ngữ"],
  },
  {
    id: "vi-faq-029",
    category: "language",
    question: "Làm thế nào để nhận hướng dẫn chăm sóc hậu phẫu nếu tôi không nói tiếng Hàn?",
    answer:
      "Trước khi rời bất kỳ phòng khám y tế Hàn Quốc nào, hãy đảm bảo bạn đã nhận được: (1) Hướng dẫn hậu phẫu bằng văn bản bằng tiếng Anh — yêu cầu điều này một cách rõ ràng; các phòng khám uy tín phục vụ bệnh nhân quốc tế sẽ đã chuẩn bị sẵn những điều này; (2) Danh sách thuốc bằng tiếng Anh với tên, liều lượng, tần suất và bất kỳ hạn chế nào của mỗi loại thuốc; (3) Số liên lạc khẩn cấp có nhân viên nói tiếng Anh sẵn có sau giờ làm việc; (4) Lịch trình của bất kỳ cuộc hẹn theo dõi hoặc tư vấn y tế từ xa nào cần thiết. Đối với thuốc kê đơn, các dược sĩ Hàn Quốc gần Gangnam quen với bệnh nhân quốc tế — nhãn đơn thuốc thường hiển thị cả tên tiếng Hàn và tên thuốc gốc chung. Nếu bạn không thể nhận tài liệu tiếng Anh từ phòng khám, hãy chụp ảnh mọi tài liệu tiếng Hàn và sử dụng chế độ camera dịch thuật của Papago làm bản sao lưu. Luôn xác nhận rằng bạn hiểu chăm sóc hậu phẫu trước khi xuất viện.",
    tags: ["hướng dẫn hậu phẫu", "thuốc", "xuất viện", "giao tiếp", "ngôn ngữ"],
  },
  {
    id: "vi-faq-030",
    category: "language",
    question: "Có phiên dịch y tế chuyên nghiệp ở Hàn Quốc cho những bệnh nhân cần không?",
    answer:
      "Có — phiên dịch y tế chuyên nghiệp có sẵn ở Hàn Quốc qua nhiều kênh: (1) Phiên dịch viên tại phòng khám — hầu hết các bộ phận bệnh nhân quốc tế tại các phòng khám lớn ở Gangnam có phiên dịch viên nhân viên; xác nhận tính khả dụng bằng ngôn ngữ cụ thể của bạn khi đặt lịch; (2) Hiệp hội Du lịch Y tế Hàn Quốc (KMTA) — duy trì danh mục phiên dịch y tế được chứng nhận; (3) Dịch vụ phiên dịch y tế tư nhân — đặt theo giờ, chi phí khoảng 30–80 USD/giờ; (4) Dịch vụ du lịch sức khỏe của chính phủ — Viện Phát triển Công nghiệp Y tế Hàn Quốc (KHIDI) điều hành dịch vụ Hỗ trợ Du lịch Sức khỏe có sẵn tại một số bệnh viện miễn phí hoặc chi phí thấp; (5) Trung tâm Quốc tế của Bệnh viện — các bệnh viện lớn như Samsung Medical Center và Asan Medical Center có văn phòng Dịch vụ Y tế Quốc tế chuyên dụng với hỗ trợ đa ngôn ngữ. Đối với các thủ thuật phức tạp, rất nên đầu tư vào một phiên dịch viên chuyên nghiệp riêng thay vì chỉ dựa vào nhân viên phòng khám.",
    tags: ["phiên dịch y tế", "dịch vụ phiên dịch", "KMTA", "KHIDI", "phiên dịch chuyên nghiệp"],
  },
];
