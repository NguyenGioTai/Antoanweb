"Thưa thầy, demo này mô phỏng quá trình đăng ký user. Khi user nhập mật khẩu, Server sẽ thực hiện băm.

Thầy có thể thấy MD5 và SHA1 (cột đỏ/cam) có thời gian thực thi gần như bằng 0 (~0.005ms). Điều này có nghĩa là nếu Hacker lấy được database, hắn có thể dùng GPU để thử hàng tỷ mật khẩu mỗi giây (Brute-force) và tìm ra mật khẩu gốc ngay lập tức.

Ngược lại, Bcrypt và Argon2 (cột xanh) em đã cấu hình Cost Factor. Server mất khoảng 200ms - 400ms để băm xong 1 password.

Với người dùng bình thường, chậm 0.4s khi login là không đáng kể.

Nhưng với Hacker, việc chậm hơn 1 triệu lần so với MD5 khiến việc tấn công Brute-force trở nên bất khả thi về mặt thời gian và chi phí điện năng. Đó là lý do Argon2 là chuẩn an toàn nhất hiện nay."