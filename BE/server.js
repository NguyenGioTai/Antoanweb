const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const argon2 = require('argon2');

const app = express();
app.use(cors()); // Cho phép React gọi API
app.use(bodyParser.json());

app.post('/api/benchmark', async (req, res) => {
    const { password } = req.body;
    const results = [];

    console.log(`--- Đang test password: ${password} ---`);

    // 1. MD5 (Cực nhanh - Kém an toàn)
    const startMD5 = process.hrtime();
    const md5Hash = crypto.createHash('md5').update(password).digest('hex');
    const endMD5 = process.hrtime(startMD5);
    const timeMD5 = (endMD5[0] * 1000) + (endMD5[1] / 1e6); // Chuyển sang milisecond
    
    results.push({
        algo: 'MD5',
        status: 'Rất nguy hiểm',
        hash: md5Hash,
        time: timeMD5,
        desc: 'Tốc độ băm quá nhanh, dễ bị tấn công Rainbow Table & Brute-force.'
    });

    // 2. SHA-1 (Nhanh - Kém an toàn)
    const startSHA1 = process.hrtime();
    const sha1Hash = crypto.createHash('sha1').update(password).digest('hex');
    const endSHA1 = process.hrtime(startSHA1);
    const timeSHA1 = (endSHA1[0] * 1000) + (endSHA1[1] / 1e6);

    results.push({
        algo: 'SHA-1',
        status: 'Nguy hiểm',
        hash: sha1Hash,
        time: timeSHA1,
        desc: 'Đã bị Google phá vỡ (collision attack) năm 2017.'
    });

    // 3. Bcrypt (Chậm - An toàn)
    // Salt round = 12 (Tiêu chuẩn hiện nay)
    const startBcrypt = Date.now();
    const bcryptHash = await bcrypt.hash(password, 12);
    const endBcrypt = Date.now();
    
    results.push({
        algo: 'Bcrypt',
        status: 'An toàn',
        hash: bcryptHash,
        time: endBcrypt - startBcrypt,
        desc: 'Sử dụng thuật toán Blowfish, có Salt mặc định, chống Rainbow Table.'
    });

    // 4. Argon2 (Rất chậm - Rất an toàn - RAM heavy)
    const startArgon = Date.now();
    const argonHash = await argon2.hash(password, {
        type: argon2.argon2id, // Khuyến nghị (chống cả GPU và Side-channel)
        memoryCost: 2 ** 16,   // Sử dụng 64MB RAM
        timeCost: 3,           // Lặp 3 vòng
        parallelism: 1
    });
    const endArgon = Date.now();

    results.push({
        algo: 'Argon2',
        status: 'Khuyến nghị (Best)',
        hash: argonHash,
        time: endArgon - startArgon,
        desc: 'Thắng giải PHC 2015. Tốn RAM để chống phần cứng chuyên dụng (ASIC/GPU) của hacker.'
    });

    res.json(results);
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server Backend đang chạy tại port ${PORT}`));