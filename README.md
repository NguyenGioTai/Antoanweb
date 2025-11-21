KỊCH BẢN DEMO: SECURE PASSWORD STORAGE

1. Mở đầu: Giới thiệu Kiến trúc (1 phút)
(Thao tác: Mở VS Code, show cấu trúc thư mục server/)

Lời nói: "Thưa thầy, thay vì viết code gộp, em đã xây dựng dự án theo mô hình MVC (Model-View-Controller) chuẩn công nghiệp và sử dụng MongoDB thật để lưu trữ dữ liệu.

Model (User.js): Định nghĩa cấu trúc User lưu trữ đồng thời 3 loại hash: MD5, Bcrypt và Argon2 để tiện so sánh.

Controller (hashController.js): Nơi chứa toàn bộ logic xử lý thuật toán và giả lập tấn công mà em sẽ demo ngay sau đây."


Shutterstock
2. Phần 1: Benchmark - Sự chênh lệch tốc độ (3 phút)
(Thao tác: Mở Web -> Nhập 123456 -> Bấm "Chạy & Lưu DB") (Thao tác: Khi biểu đồ hiện ra, chỉ chuột vào từng cột)

Lời nói: "Đầu tiên, em thực hiện Benchmark quá trình tạo mật khẩu (Hashing).

Thầy có thể thấy MD5 (cột đỏ) có thời gian xử lý cực thấp (~0.005ms).

Trong khi đó, Argon2 (cột xanh) mất khoảng 300ms - 400ms để tạo ra một mã băm."

(Thao tác: Mở Code hashController.js - Hàm benchmark)


// server/controllers/hashController.js
----------------------------------------------------------------------------------
// MD5: Dùng process.hrtime (đo nano giây) vì nó quá nhanh
let start = process.hrtime();
const md5Hash = crypto.createHash('md5').update(password).digest('hex');
// ... Kết quả ra ngay lập tức

// Argon2: Cấu hình Memory Hardness
const argon2Hash = await argon2.hash(password, { 
    type: argon2.argon2id, // Chống Side-channel attack
    memoryCost: 2**16,     // Yêu cầu 64MB RAM cho mỗi lần băm
    timeCost: 3,           // Bắt buộc CPU chạy 3 vòng lặp
    parallelism: 1 
});
----------------------------------------------------------------------------------


Giải thích Code: "Ở đây, sự khác biệt nằm ở cấu hình memoryCost: 2**16 của Argon2. Em bắt buộc Server phải cấp phát 64MB RAM để tính toán xong 1 mật khẩu.

Điều này làm MD5 rất nhanh (tốt cho checksum file nhưng tệ cho mật khẩu) và Argon2 rất chậm (tốt cho bảo mật). Em đã lưu các hash này vào MongoDB để dùng cho bước tiếp theo."

3. Phần 2: Giả lập Tấn công Brute-force (Phần quan trọng nhất - 5 phút)
(Thao tác: Chuyển xuống phần "3. Mô phỏng Tấn công")

Lời nói: "Thưa thầy, để chứng minh độ an toàn thực tế, em đã viết một module Attack Simulation. Kịch bản ở đây là: Hacker có danh sách 100 mật khẩu phổ biến và hắn thử liên tục vào hệ thống để dò tìm mật khẩu đúng."

3.1. Demo tấn công MD5
(Thao tác: Bấm nút "Tấn công MD5" -> Kết quả hiện ra ngay lập tức)

Phân tích: "Thầy thấy đó, Server giải mã 100 mật khẩu trong tích tắc (khoảng 5ms - 10ms). Tức là 1 giây, Hacker có thể thử hàng chục nghìn, thậm chí hàng triệu mật khẩu. Nếu Database MD5 bị lộ, coi như mất trắng."

3.2. Demo tấn công Argon2
(Thao tác: Bấm nút "Tấn công Argon2" -> Web sẽ hiển thị "Đang thực hiện...")

Lời nói: "Bây giờ em tấn công vào Argon2. Thầy sẽ thấy hệ thống phải chờ rất lâu..." (Chờ khoảng 30-40 giây) "... Server đang phải gồng mình xử lý từng mật khẩu một."

(Thao tác: Khi kết quả hiện ra)

Phân tích: "Kết quả: Để thử 100 mật khẩu, Argon2 mất tới 30.000ms (30 giây). Trung bình 300ms/mật khẩu. Sự chậm trễ này là ác mộng với Hacker."

3.3. Giải thích Code Tấn công (Quan trọng)
(Thao tác: Mở code hashController.js - Hàm attack)

JavaScript

// server/controllers/hashController.js - Hàm attack
---------------------------------------------------------------------------------
exports.attack = async (req, res) => {
    // 1. Tạo danh sách 100 mật khẩu giả để tấn công
    const attackList = Array.from({length: 100}, (_, i) => `wrong_pass_${i}`);
    
    let start = Date.now();
    
    // 2. Vòng lặp tấn công (Brute-force Loop)
    for (const pass of attackList) {
        if (algo === 'MD5') {
            // MD5: Chỉ cần so sánh chuỗi hash (Cực nhanh)
            const h = crypto.createHash('md5').update(pass).digest('hex');
            if (h === user.md5Hash) break; 
        } 
        else if (algo === 'Argon2') {
            // Argon2: Phải chạy hàm verify tốn tài nguyên (Cực lâu)
            try { 
                // Hàm này tốn 300ms và 64MB RAM mỗi lần gọi
                await argon2.verify(user.argon2Hash, pass); 
            } catch(e){}
        }
    }
    // ... Trả về tổng thời gian
};
---------------------------------------------------------------------------------


Giải thích sâu với thầy: "Thưa thầy, bí mật nằm ở vòng lặp for này:

Với MD5: Phép so sánh chuỗi h === user.md5Hash chỉ tốn vài nano-giây. CPU thực hiện việc này nhẹ như lông hồng.

Với Argon2: Hàm argon2.verify() không chỉ so sánh chuỗi. Nó phải thực hiện lại quy trình băm (Re-hashing) với cùng Salt và Cost (64MB RAM).

Toán học chứng minh:

MD5: 0.001 giây / 100 pass. => Hacker thử 1 tỷ pass mất ~10 giây.

Argon2: 30 giây / 100 pass. => Hacker thử 1 tỷ pass mất ~10 năm.

=> Đây chính là lý do Argon2 id được gọi là Memory Hard Function (Hàm yêu cầu bộ nhớ), khắc tinh của GPU/ASIC Crack."

4. Kết luận
(Thao tác: Quay lại màn hình chính)

Lời nói: "Tổng kết lại, Demo của em chứng minh rằng:

Không nên dùng các hàm băm nhanh (MD5/SHA1) cho mật khẩu.

Phải dùng các thuật toán có Work Factor (Hệ số công việc) như Bcrypt hoặc Argon2.

Việc làm chậm Server 300ms là sự đánh đổi xứng đáng để bảo vệ người dùng trước các cuộc tấn công Brute-force hàng loạt."

Mẹo nhỏ khi trình bày:
Khi chạy Argon2 attack, khoảng thời gian chờ 30 giây rất dễ bị "chết" không khí (awkward silence). Hãy tranh thủ lúc đó để nói về cấu hình RAM: "Trong lúc chờ đợi, em xin giải thích là máy em đang bị chiếm dụng RAM khá nhiều vì Argon2 yêu cầu bộ nhớ..."

Hãy mở Task Manager lên nếu có thể, cho thầy thấy CPU/RAM nhích lên khi chạy Argon2 (nếu máy bạn đủ nhạy). Điều này cực kỳ thuyết phục.