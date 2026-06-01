const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const os = require("os");

// --- Cấu hình font tiếng Việt cho Sharp/librsvg ---
// Render không có sẵn font phủ đủ tiếng Việt nên dấu dễ vỡ / font xấu.
// Nhúng Be Vietnam Pro trong assets/fonts và trỏ fontconfig vào đó.
// PHẢI set FONTCONFIG_FILE TRƯỚC khi require("sharp").
const fontDir = path.join(__dirname, "assets", "fonts");
const fontConfigContent = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${fontDir}</dir>
  <cachedir>${path.join(os.tmpdir(), "avpg-fontconfig-cache")}</cachedir>
</fontconfig>`;
const fontConfigPath = path.join(os.tmpdir(), "avpg-fonts.conf");
fs.writeFileSync(fontConfigPath, fontConfigContent);
process.env.FONTCONFIG_FILE = fontConfigPath;

const sharp = require("sharp");

const app = express();
app.use(cors());
app.use(express.json());

// Cấu hình Multer
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Giới hạn file 5MB để tránh tràn RAM
});

// Hàm làm sạch chuỗi để tránh lỗi SVG (XML Injection)
function escapeXml(unsafe) {
    if (typeof unsafe !== 'string') return '';
    return unsafe.replace(/[<>&'"]/g, c => {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case '\'': return '&apos;';
            case '"': return '&quot;';
        }
    });
}

// API nhận thông tin và tạo ảnh
app.post("/generate", upload.single("image"), async (req, res) => {
    try {
        console.log("📥 Nhận request tạo ảnh...");

        // Load dữ liệu
        let { name, position, department, phone, startDate, gender } = req.body;

        // Làm sạch dữ liệu đầu vào (Sanitization)
        name = escapeXml(name);
        position = escapeXml(position);
        department = escapeXml(department);
        phone = escapeXml(phone);

        const userImage = req.file ? req.file.buffer : null;
        const bgPath = path.join(__dirname, "assets", "bg.jpg");
        const logoPath = path.join(__dirname, "assets", "logo.png");
        const prefix = (gender === "Nữ") ? "Chị" : "Anh";

        // Kiểm tra ảnh đại diện
        if (!userImage) {
            return res.status(400).json({ error: "Ảnh đại diện là bắt buộc!" });
        }

        // Xử lý ảnh đại diện
        const avatar = await sharp(userImage)
            .resize(200, 200, {
                fit: 'cover',
                position: 'center'
            })
            .png()
            .composite([{
                input: Buffer.from(`<svg width="200" height="200"><circle cx="100" cy="100" r="100" fill="white"/></svg>`),
                blend: 'dest-in'
            }])
            .toBuffer();

        // Load background và logo
        const bgImage = await sharp(bgPath).resize(1000, 700).toBuffer();
        const logo = await sharp(logoPath).resize(300).toBuffer();

        const width = 1000, height = 700;

        //Dinh dang ngay thang
        function formatDateYMDtoDMY(dateStr) {
            if (!dateStr) return '';
            const [yyyy, mm, dd] = dateStr.split('-');
            return `${dd}-${mm}-${yyyy}`;
        }

        const formStartDate = formatDateYMDtoDMY(startDate);

        // Tạo SVG chứa nền và thông tin
        const textSVG = `
   	   <svg width="${width}" height="${height}" >
        	<style>text, tspan { font-family: 'Be Vietnam Pro', sans-serif; }</style>
        	<rect width="100%" height="100%" fill="none" />
	        <text x="280" y="280" font-size="50" fill="#054256" font-weight="bold">WELCOME NEW STAFF</text>

        	<!-- Tiêu đề lớn phía trên -->
	        <text x="50%" y="350" font-size="30" fill="#000" text-anchor="middle" font-weight="bold">
        	   Đại gia đình An Việt Phát hân hoan chào đón thành viên mới!
	        </text>

        	<!-- Label bên trái -->
	        <text x="50" y="420" font-size="24" fill="#000">Họ và tên:</text>
	        <text x="50" y="450" font-size="24" fill="#000">Chức vụ:</text>
	        <text x="50" y="480" font-size="24" fill="#000">Phòng ban:</text>
	        <text x="50" y="510" font-size="24" fill="#000">Số điện thoại:</text>
	        <text x="50" y="540" font-size="24" fill="#000">Ngày bắt đầu:</text>

       		 <!-- Nội dung bên phải -->
	        <text x="250" y="420" font-size="24" fill="#ff0000" font-weight="bold">${name}</text>
	        <text x="250" y="450" font-size="24" fill="#000" font-weight="bold">${position}</text>
	        <text x="250" y="480" font-size="24" fill="#000" font-weight="bold">${department}</text>
	        <text x="250" y="510" font-size="24" fill="#000" font-weight="bold">${phone}</text>
	        <text x="250" y="540" font-size="24" fill="#000" font-weight="bold">${formStartDate}</text>

	        <!-- Dòng chữ dưới có wrap text -->
	        <text x="500" y="600" font-size="24" fill="#333" text-anchor="middle">
	           <tspan x="500" dy="0">An Việt Phát Group tin tưởng và kỳ vọng ${prefix} sẽ phát huy tối đa năng lực chuyên môn, không</tspan>
	           <tspan x="500" dy="1.4em">ngừng học hỏi, phát triển và gặt hái nhiều thành công trong quá trình đồng hành cùng Công ty.</tspan>
        	</text>
     	 </svg>
	`;

        // Chuyen SVG thanh PNG co nen trong suot
        const svgBuffer = await sharp(Buffer.from(textSVG))
            .ensureAlpha()
            .toBuffer();

        // Tạo ảnh kết quả
        const finalImage = await sharp(bgImage)
            .composite([
                { input: avatar, top: 100, left: 50 },
                { input: logo, top: 30, left: 520 },
                { input: svgBuffer, top: 0, left: 0 }
            ])
            .png()
            .toBuffer();

        res.set("Content-Type", "image/png");
        res.send(finalImage);
    } catch (error) {
        console.error("❌ Lỗi khi tạo ảnh:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server chạy tại port ${PORT}`));
