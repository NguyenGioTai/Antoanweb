const crypto = require('crypto');
const bcrypt = require('bcrypt');
const argon2 = require('argon2');
const User = require('../models/User');

// 1. Benchmark & Save
exports.benchmark = async (req, res) => {
    try {
        const { password } = req.body;
        const results = [];

        // --- 1. MD5 ---
        let start = process.hrtime();
        const md5Hash = crypto.createHash('md5').update(password).digest('hex');
        let end = process.hrtime(start);
        results.push({ 
            algo: 'MD5', 
            status: 'Nguy hiểm', 
            hash: md5Hash, 
            time: (end[0]*1000 + end[1]/1e6) 
        });

        // --- 2. SHA-1 ---
        start = process.hrtime();
        const sha1Hash = crypto.createHash('sha1').update(password).digest('hex');
        end = process.hrtime(start);
        results.push({ 
            algo: 'SHA-1', 
            status: 'Nguy hiểm', 
            hash: sha1Hash, 
            time: (end[0]*1000 + end[1]/1e6) 
        });

        // --- 3. Bcrypt ---
        const startBcrypt = Date.now();
        const bcryptHash = await bcrypt.hash(password, 12);
        results.push({ 
            algo: 'Bcrypt', 
            status: 'An toàn', 
            hash: bcryptHash, 
            time: Date.now() - startBcrypt 
        });

        // --- 4. Argon2 ---
        const startArgon = Date.now();
        // SỬA LỖI CHÍNH Ở DÒNG NÀY: Đặt tên biến là argon2Hash (có số 2)
        const argon2Hash = await argon2.hash(password, { 
            type: argon2.argon2id, 
            memoryCost: 2**16, 
            timeCost: 3, 
            parallelism: 1 
        });
        
        results.push({ 
            algo: 'Argon2', 
            status: 'Khuyến nghị', 
            hash: argon2Hash, 
            time: Date.now() - startArgon 
        });

        // --- LƯU VÀO DB ---
        // Xóa dữ liệu cũ
        await User.deleteMany({});
        
        // Tạo User mới
        // Vì tên biến ở trên đã là argon2Hash nên ở đây nó tự hiểu, không bị lỗi nữa
        await new User({ 
            username: 'admin', 
            md5Hash, 
            bcryptHash, 
            argon2Hash 
        }).save();

        console.log("✅ Đã lưu Hash vào MongoDB thành công!");
        res.json(results);

    } catch (error) {
        console.error("Lỗi Benchmark:", error);
        res.status(500).json({ msg: "Lỗi Server: " + error.message });
    }
};

// 2. Verify (Login)
exports.verify = async (req, res) => {
    try {
        const { password, algo } = req.body;
        const user = await User.findOne({ username: 'admin' });
        if (!user) return res.status(400).json({ msg: "Chưa có dữ liệu trong DB! Hãy chạy Benchmark trước." });

        let start = Date.now();
        let isValid = false;

        if (algo === 'MD5') {
            const inputHash = crypto.createHash('md5').update(password).digest('hex');
            isValid = (inputHash === user.md5Hash);
        } 
        else if (algo === 'Bcrypt') {
            isValid = await bcrypt.compare(password, user.bcryptHash);
        } 
        else if (algo === 'Argon2') {
            isValid = await argon2.verify(user.argon2Hash, password);
        }

        res.json({ 
            valid: isValid, 
            time: Date.now() - start, 
            msg: isValid ? "Đúng mật khẩu" : "Sai mật khẩu" 
        });
    } catch (e) {
        console.error(e);
        res.json({ valid: false, time: 0, msg: "Lỗi Verify" });
    }
};

// 3. Attack Simulation (100 Passwords)
exports.attack = async (req, res) => {
    try {
        const { algo } = req.body;
        const user = await User.findOne({ username: 'admin' });
        if (!user) return res.status(400).json({ msg: "Chưa có DB!" });

        // Tạo danh sách 100 mật khẩu ngẫu nhiên
        const attackList = Array.from({length: 100}, (_, i) => `wrong_password_${i}`);
        
        let start = Date.now();
        
        // Chạy vòng lặp 100 lần
        for (const pass of attackList) {
            if (algo === 'MD5') {
                const h = crypto.createHash('md5').update(pass).digest('hex');
                if (h === user.md5Hash) break; 
            } else if (algo === 'Bcrypt') {
                await bcrypt.compare(pass, user.bcryptHash);
            } else if (algo === 'Argon2') {
                try { await argon2.verify(user.argon2Hash, pass); } catch(e){}
            }
        }

        let totalTime = Date.now() - start;
        
        console.log(`Đã tấn công ${algo} xong trong ${totalTime}ms`);
        
        res.json({ 
            algo, 
            attempts: 100, 
            totalTime, 
            avgTime: totalTime / 100 
        });
    } catch (error) {
        console.error("Lỗi Attack:", error);
        res.status(500).json({ msg: "Lỗi Attack" });
    }
};