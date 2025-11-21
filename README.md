KỊCH BẢN THUYẾT TRÌNH: SECURE PASSWORD STORAGE
PHẦN 1: Đặt vấn đề & Lý thuyết (2-3 phút)
(Slide/Màn hình: Chỉ hiển thị tiêu đề dự án)

Lời nói:
 "Thưa thầy và các bạn. Trong bảo mật web, nguyên tắc vàng là: 'Không bao giờ tin tưởng đầu vào của người dùng và không bao giờ lưu mật khẩu dưới dạng văn bản thuần (plaintext)'.

Tuy nhiên, chỉ băm (hashing) mật khẩu thôi là chưa đủ. Rất nhiều hệ thống cũ vẫn dùng MD5 hoặc SHA1. Hôm nay, nhóm em sẽ chứng minh tại sao các thuật toán cũ lại 'chết' và tại sao Argon2 lại là vua của các thuật toán băm hiện nay, thông qua một mô hình thực nghiệm Fullstack."

PHẦN 2: Phân tích Code - "Show code" thông minh (5-7 phút)
Đây là phần bạn mở VS Code lên. Đừng chỉ cuộn chuột, hãy mở file server/server.js và highlight vào từng đoạn code sau để giải thích.

2.1. Phân tích sai lầm của MD5/SHA1
(Thao tác: Bôi đen đoạn code xử lý MD5 trong server.js)

JavaScript
---------------------------------------------------------------------
// 1. MD5 (Cực nhanh - Kém an toàn)
const startMD5 = process.hrtime();
const md5Hash = crypto.createHash('md5').update(password).digest('hex');
const endMD5 = process.hrtime(startMD5);
---------------------------------------------------------------------

Giải thích: "Đầu tiên, hãy nhìn vào đoạn code xử lý MD5. Em sử dụng thư viện crypto có sẵn của Node.js.

Vấn đề: MD5 được thiết kế cho tốc độ. Nó hoạt động dựa trên các phép toán bitwise cực nhanh trên CPU.

Tại sao em dùng process.hrtime()?: Vì MD5 nhanh đến mức nếu dùng Date.now() (đơn vị mili-giây) thì kết quả sẽ trả về 0. Em buộc phải dùng hrtime để đo nano-giây.

Hậu quả: Một Hacker dùng GPU RTX 4090 có thể thử 200 tỷ chuỗi MD5 mỗi giây. Nếu database lộ, toàn bộ mật khẩu user sẽ bị giải mã trong tích tắc."

2.2. Giải pháp tiêu chuẩn: Bcrypt
(Thao tác: Bôi đen đoạn code Bcrypt)

JavaScript
-----------------------------------------------------------------------------------
// 3. Bcrypt (An toàn - Cost 12)
const bcryptHash = await bcrypt.hash(password, 12); 
-----------------------------------------------------------------------------------

Giải thích: "Để chống lại tốc độ của GPU, chúng ta cần Work Factor (Hệ số công việc).

Ở đây em dùng bcrypt với saltRounds = 12.

Con số 12 này không phải tuyến tính, mà là hàm mũ (2^12). Nghĩa là mỗi lần tăng 1 đơn vị, thời gian băm sẽ lâu gấp đôi.

Cơ chế: Bcrypt tự động sinh ra một chuỗi Salt ngẫu nhiên và gộp vào password trước khi băm. Điều này triệt tiêu hoàn toàn kỹ thuật tấn công bằng Rainbow Table (Bảng cầu vồng - bảng tra cứu mã băm có sẵn)."

2.3. Giải pháp tối thượng: Argon2 (Điểm nhấn ăn điểm)
(Thao tác: Bôi đen đoạn code Argon2 - Đây là phần quan trọng nhất)

JavaScript
-----------------------------------------------------------------------------------
// 4. Argon2 (Memory Hardness)
const argonHash = await argon2.hash(password, {
    type: argon2.argon2id, 
    memoryCost: 2 ** 16,   // 64 MB RAM
    timeCost: 3,           // 3 vòng lặp
    parallelism: 1
});
----------------------------------------------------------------------------------

Giải thích: "Đây là phần quan trọng nhất của bài báo cáo. Tại sao Bcrypt vẫn chưa đủ? Vì hacker đã chế tạo ra phần cứng chuyên dụng (ASIC/FPGA) để crack Bcrypt.

Argon2 (người chiến thắng cuộc thi PHC 2015) đưa ra khái niệm Memory Hardness.

type: argon2id: Đây là chế độ lai, giúp chống lại cả tấn công GPU và tấn công kênh kề (Side-channel attack).

memoryCost: 2 ** 16: Dòng code này ép server phải cấp phát 64MB RAM cho mỗi lần băm.

Tại sao hacker sợ cái này?: GPU của hacker có hàng ngàn nhân tính toán nhưng bộ nhớ RAM lại rất bé. Việc bắt buộc dùng nhiều RAM khiến hacker không thể chạy song song hàng nghìn tác vụ trên GPU được nữa. Đây chính là chốt chặn an toàn nhất hiện nay."

PHẦN 3: Demo thực tế & Đọc biểu đồ (3-4 phút)
(Thao tác: Mở trình duyệt, nhập pass SuperSecretPassword, bấm chạy)

Lời nói: "Bây giờ em sẽ thực hiện tấn công thử nghiệm trên môi trường giả lập.

Khi em bấm nút, Request được gửi về Node.js server. Server sẽ thực hiện băm song song 4 thuật toán."

(Thao tác: Chỉ chuột vào biểu đồ khi kết quả hiện ra)

Phân tích kết quả:

Cột MD5/SHA1 (Màu đỏ): Thầy có thể thấy nó gần như vô hình trên biểu đồ. Thời gian xử lý ~0.005ms. Tốc độ này là "miếng mồi ngon" cho Hacker.

Cột Argon2 (Màu xanh): Thời gian vọt lên khoảng 200-300ms.

Đối với trải nghiệm người dùng: 300ms là hoàn toàn chấp nhận được (chưa đến nửa cái chớp mắt).

Đối với Hacker: Việc chậm hơn MD5 hàng triệu lần cộng với việc tốn RAM, khiến chi phí để crack 1 password tốn kém hơn giá trị của dữ liệu lấy được. => Hệ thống an toàn.

PHẦN 4: Câu hỏi mở rộng (Chuẩn bị sẵn để trả lời vấn đáp)
Nếu thầy hỏi, bạn hãy dùng những kiến thức này "phản đòn" để lấy điểm cộng:

Câu hỏi 1: Tại sao không để Salt Round (hoặc Cost) cao hơn nữa, ví dụ 20?

Trả lời: "Thưa thầy, bảo mật là sự đánh đổi với hiệu năng (Trade-off). Nếu để Cost quá cao, CPU server sẽ bị quá tải khi có nhiều người đăng nhập cùng lúc (DOS attack). Mức 12 cho Bcrypt hoặc 64MB cho Argon2 là điểm cân bằng tốt nhất hiện nay cho phần cứng thông thường."

Câu hỏi 2: Tại sao không dùng mã hóa 2 chiều (AES) để lưu password?

Trả lời: "Nếu dùng AES, chúng ta phải lưu trữ Key giải mã. Nếu Hacker hack được server và lấy được Key, hắn sẽ giải mã được toàn bộ password. Hàm băm (Hashing) là một chiều, không thể dịch ngược lại, nên dù mất dữ liệu, hacker cũng không biết password gốc là gì."

Câu hỏi 3: Bao lâu thì Argon2 lỗi thời?

Trả lời: "Argon2 được thiết kế để 'future-proof' (bền vững với tương lai). Khi máy tính mạnh lên, ta chỉ cần tăng tham số timeCost và memoryCost trong config lên là xong, không cần viết lại thuật toán."

PHẦN 5: Kết luận
"Qua phần trình bày và demo code, nhóm em kết luận rằng: Trong năm 2024-2025, việc sử dụng MD5/SHA1 cho mật khẩu là một lỗi bảo mật nghiêm trọng. Các nhà phát triển web bắt buộc phải chuyển sang Bcrypt hoặc tốt nhất là Argon2 để đảm bảo an toàn cho người dùng."

Mẹo nhỏ để trình bày ngầu hơn:
Mở Developer Tools (F12) trên trình duyệt: Tab Network. Khi bấm nút "Chạy Demo", hãy cho thầy thấy request gửi đi và response JSON trả về. Điều này chứng minh bạn hiểu rõ luồng đi của dữ liệu.
