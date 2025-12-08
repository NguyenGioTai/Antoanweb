const crypto = require('crypto');
const bcrypt = require('bcrypt');
const argon2 = require('argon2');
const User = require('../models/User');

// Helper to extract salt from hash
const extractSalt = (hash, algo) => {
    if (algo === 'Bcrypt') {
        return hash.substring(0, 29); // Bcrypt salt is part of the hash ($2b$12$salt...)
    }
    if (algo === 'Argon2') {
        const parts = hash.split('$');
        return parts.length > 4 ? parts[4] : 'N/A'; // $argon2id$v=19$m=65536,t=3,p=1$salt$hash
    }
    return 'N/A';
};


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
            status: 'Rất nguy hiểm', 
            hash: md5Hash, 
            time: (end[0]*1000 + end[1]/1e6),
            salt: 'N/A',
            iterations: 'N/A',
            memoryCost: 'N/A',
            parallelism: 'N/A',
        });

        // --- 2. SHA-1 ---
        start = process.hrtime();
        const sha1Hash = crypto.createHash('sha1').update(password).digest('hex');
        end = process.hrtime(start);
        results.push({ 
            algo: 'SHA-1', 
            status: 'Nguy hiểm', 
            hash: sha1Hash, 
            time: (end[0]*1000 + end[1]/1e6),
            salt: 'N/A',
            iterations: 'N/A',
            memoryCost: 'N/A',
            parallelism: 'N/A',
        });

        // --- 3. Bcrypt ---
        const bcryptSaltRounds = 12;
        const startBcrypt = Date.now();
        const bcryptHash = await bcrypt.hash(password, bcryptSaltRounds);
        results.push({ 
            algo: 'Bcrypt', 
            status: 'Rất an toàn', 
            hash: bcryptHash, 
            time: Date.now() - startBcrypt,
            salt: extractSalt(bcryptHash, 'Bcrypt'),
            iterations: `2^${bcryptSaltRounds}`,
            memoryCost: 'N/A',
            parallelism: 'N/A',
        });

        // --- 4. Argon2 ---
        const argonOptions = { 
            type: argon2.argon2id, 
            memoryCost: 2**16, 
            timeCost: 3, 
            parallelism: 1 
        };
        const startArgon = Date.now();
        const argon2Hash = await argon2.hash(password, argonOptions);
        
        results.push({ 
            algo: 'Argon2', 
            status: 'Khuyến nghị', 
            hash: argon2Hash, 
            time: Date.now() - startArgon,
            salt: extractSalt(argon2Hash, 'Argon2'),
            iterations: argonOptions.timeCost,
            memoryCost: `${argonOptions.memoryCost / 1024} KB`,
            parallelism: argonOptions.parallelism,
        });

        // --- LƯU VÀO DB ---
        await User.deleteMany({});
        const newUser = new User({ 
            username: 'admin', 
            md5Hash, 
            sha1Hash,
            bcryptHash, 
            argon2Hash 
        });
        await newUser.save();
        
        const savedUser = await User.findById(newUser._id);
        console.log("🔍 Dữ liệu vừa được lưu vào DB:", savedUser);


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
        else if (algo === 'SHA-1') {
            const inputHash = crypto.createHash('sha1').update(password).digest('hex');
            isValid = (inputHash === user.sha1Hash);
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
        if (!user) {
            console.log("Attack user not found");
            return res.status(400).json({ msg: "Chưa có dữ liệu trong DB! Hãy chạy Benchmark trước." });
        }

        const attackList = Array.from({ length: 100 }, (_, i) => `wrong_password_${i}`);
        const start = Date.now();

        for (const pass of attackList) {
            if (algo === 'MD5') {
                const h = crypto.createHash('md5').update(pass).digest('hex');
                if (h === user.md5Hash) break;
            } else if (algo === 'SHA-1') {
                const h = crypto.createHash('sha1').update(pass).digest('hex');
                if (h === user.sha1Hash) break;
            } else if (algo === 'Bcrypt') {
                await bcrypt.compare(pass, user.bcryptHash);
            } else if (algo === 'Argon2') {
                try {
                    await argon2.verify(user.argon2Hash, pass);
                } catch (e) {
                    // Verification fails by throwing an error, so we catch it and continue
                }
            }
        }

        const totalTime = Date.now() - start;
        const hashesPerSecond = totalTime > 0 ? Math.round(attackList.length / (totalTime / 1000)) : Infinity;

        // --- Detailed Crack Time Estimation ---
        const dictionarySize = 1_000_000_000; // 1 billion
        let timeToCrackSeconds = Infinity;
        if (hashesPerSecond > 0) {
            timeToCrackSeconds = dictionarySize / hashesPerSecond;
        }

        const formatTime = (seconds) => {
            if (seconds === Infinity) return "Gần như tức thì";
            if (seconds < 60) return `${seconds.toFixed(2)} giây`;
            if (seconds < 3600) return `${(seconds / 60).toFixed(2)} phút`;
            if (seconds < 86400) return `${(seconds / 3600).toFixed(2)} giờ`;
            if (seconds < 31536000) return `${(seconds / 86400).toFixed(2)} ngày`;
            return `${(seconds / 31536000).toFixed(2)} năm`;
        };

        const estimatedTime = formatTime(timeToCrackSeconds);

        console.log(`Tấn công ${algo}: ${hashesPerSecond} hashes/giây. Ước tính thời gian crack: ${estimatedTime}`);

        res.json({
            algo,
            attempts: attackList.length,
            totalTime,
            avgTime: totalTime / attackList.length,
            hashesPerSecond: hashesPerSecond,
            estimatedTimeToCrack: `~ ${estimatedTime} (với từ điển 1 tỉ mật khẩu)`,
        });

    } catch (error) {
        console.error(`Lỗi Attack (${algo}):`, error);
        res.status(500).json({ msg: "Lỗi Server trong quá trình mô phỏng tấn công." });
    }
};