<template>
  <div class="full-screen-wrapper">
    <div class="row justify-content-center">
      <div class="neon-box shadow-lg">
        <h2 class="neon-title">NHẬP THÔNG TIN NHÂN VIÊN</h2>
        <form @submit.prevent="generateImage">
          <div class="user-box">
            <input type="text" v-model="employee.name" required />
            <label>Họ và tên</label>
          </div>
          <div class="user-box">
            <input type="text" v-model="employee.position" required />
            <label>Chức vụ</label>
          </div>
          <div class="user-box">
            <input type="text" v-model="employee.department" required />
            <label>Phòng ban</label>
          </div>
          <div class="user-box">
            <input type="text" v-model="employee.phone" required />
            <label>Số điện thoại</label>
          </div>
          <div class="user-box">
            <input type="date" v-model="employee.startDate" required class="date-input" />
            <label class="static-label">Ngày bắt đầu</label>
          </div>
          <div class="user-box">
            <select v-model="employee.gender" required>
           	  <option value="Nam">Anh</option>
              <option value="Nữ">Chị</option>
	        </select>
	        <label class="static-label">Giới tính</label>
	      </div>

          <div class="user-box">
            <input type="file" @change="setImage" required class="file-input" />
            <label class="static-label">Ảnh đại diện (Kéo để căn chỉnh)</label>
            <div v-if="imgSrc" class="cropper-container border rounded bg-light p-2">
              <vue-cropper
                ref="cropper"
                :src="imgSrc"
                alt="Source Image"
                :aspect-ratio="1"
                :view-mode="1"
                drag-mode="move"
                :auto-crop-area="1"
                style="height: 300px; width: 100%; background: #1a1a1a"
              >
              </vue-cropper>
              <small class="text-info mt-1 d-block italic text-center">* Bạn hãy kéo ảnh để canh đúng khung hình tròn</small>
            </div>
          </div>

          <button type="submit" class="neon-button" :disabled="loading">
            {{ loading ? 'Đang xử lý...' : 'TẠO HÌNH ẢNH' }}
          </button>
        </form>
      </div>

      <div v-if="imageUrl" class="neon-box shadow-lg mt-4 d-flex flex-column align-items-center">
        <h3 class="neon-title mb-3" style="font-size: 1.5rem;">THÔNG TIN NHÂN SỰ MỚI</h3>
        <img :src="imageUrl" alt="Preview" class="img-fluid my-3 rounded border border-info" style="max-height: 500px; width: auto;" />
        <a :href="imageUrl" download="welcome.png" class="neon-button mt-3 text-decoration-none">TẢI VỀ HÌNH ẢNH</a>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import VueCropper from "vue-cropperjs";

export default {
  name: "EmployeeForm",
  components: { VueCropper },
  data() {
    return {
      employee: { name: "", position: "", department: "", phone: "", startDate: "", gender: "Nam" },
      imgSrc: null, // Ảnh gốc để cắt
      imageUrl: null, // Ảnh kết quả từ backend
      loading: false
    };
  },
  methods: {
    setImage(e) {
      const file = e.target.files[0];
      if (!file.type.includes("image/")) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        this.imgSrc = event.target.result;
        // Reset lại cropper khi đổi ảnh
        if (this.$refs.cropper) {
          this.$refs.cropper.replace(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    },
    async generateImage() {
      if (!this.$refs.cropper) return alert("Vui lòng chọn ảnh!");
      
      this.loading = true;
      try {
        // Lấy dữ liệu ảnh đã cắt (dạng Blob)
        const croppedCanvas = this.$refs.cropper.getCroppedCanvas({
            width: 500, // Kích thước ảnh xuất ra để giữ độ nét
            height: 500
        });
        
        const blob = await new Promise(resolve => croppedCanvas.toBlob(resolve, 'image/jpeg', 0.9));

        const formData = new FormData();
        formData.append("name", this.employee.name);
        formData.append("position", this.employee.position);
        formData.append("department", this.employee.department);
        formData.append("phone", this.employee.phone);
        formData.append("startDate", this.employee.startDate);
	formData.append("gender", this.employee.gender);
        formData.append("image", blob, "avatar.jpg"); // Gửi ảnh đã cắt lên

        const response = await axios.post("http://10.10.100.125:3000/generate", formData, {
          responseType: "blob",
        });

        this.imageUrl = URL.createObjectURL(response.data);
      } catch (error) {
        console.error("Lỗi:", error);
        alert("Có lỗi xảy ra!");
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<style scoped>
.vue-cropper {
	max-width: 100%;
	margin: 0 auto;
}

.cropper-container {
  display: flex;
  flex-direction: column;
  align-items: center; /* Căn giữa theo chiều ngang */
  justify-content: center;
  background: #1a1a1a; /* Nền tối cho khu vực cắt */
  padding: 20px;
  border-radius: 8px;
  margin-top: 15px;
  overflow: hidden;
  width: 100%;
  
}

/* Xóa bỏ mọi khoảng trắng mặc định và phủ kín màn hình */
.full-screen-wrapper {
  background: #030a10; /* Màu nền tối sâu */
  min-height: 100vh;   /* Chiều cao tối thiểu 100% màn hình */
  width: 100%;        /* Chiều rộng 100% màn hình */
  margin: 0;
  padding: 40px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
}

.container {
  background: #030a10; /* Nền tối sâu */
  min-height: 100vh;
  padding: 40px 0;
}

/* Khung nhập liệu căn giữa và có hiệu ứng mờ */
.neon-box {
  width: 100%;
  max-width: 800px; /* Độ rộng của form nhập liệu */
  background: rgba(0, 0, 0, 0.9);
  padding: 40px;
  border-radius: 15px;
  border: 1px solid rgba(3, 233, 244, 0.3);
  box-shadow: 0 15px 25px rgba(0,0,0,.6);
}

/* Hiệu ứng tiêu đề phát sáng */
.neon-title {
  color: #fff;
  text-shadow: 0 0 10px #03e9f4, 0 0 20px #03e9f4;
  margin-bottom: 40px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 2px;
}

/* Tùy chỉnh các ô nhập liệu kiểu gạch chân (như mẫu bạn gửi) */
.user-box {
  position: relative;
  margin-bottom: 30px;
}

.user-box input, .user-box select {
  width: 100%;
  padding: 15px 0;
  font-size: 22px;
  color: #fff;
  border: none;
  border-bottom: 1px solid #fff;
  outline: none;
  background: transparent;
}

.user-box label {
  position: absolute;
  top: 0;
  left: 0;
  padding: 10px 0;
  font-size: 20px;
  color: #fff;
  pointer-events: none;
  transition: .5s;
}

/* Hiệu ứng Floating Label */
.user-box input:focus ~ label,
.user-box input:valid ~ label {
  top: -25px;
  left: 0;
  color: #03e9f4;
  font-size: 14px;
}

.static-label {
  top: -25px !important;
  color: #03e9f4 !important;
  font-size: 16px !important;
}

.neon-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 12px;
  background: transparent;
  color: #03e9f4;
  border: 1px solid #03e9f4;
  text-transform: uppercase;
  font-weight: bold;
  letter-spacing: 2px;
  text-decoration: none !important;
  transition: 0.5s;
  cursor: pointer;
}

.neon-button:hover {
  background: #03e9f4;
  color: #000;
  box-shadow: 0 0 10px #03e9f4, 0 0 40px #03e9f4;
}

/* Làm icon lịch hiện rõ và có hiệu ứng phát sáng */
input[type="date"]::-webkit-calendar-picker-indicator {
    filter: invert(1) sepia(100%) saturate(10000%) hue-rotate(170deg);
    cursor: pointer;
    border-radius: 3px;
    padding: 2px;
}

/* Ép màu nền tối cho danh sách lựa chọn */
.user-box select option {
  background-color: #030a10; /* Màu nền tối trùng với giao diện */
  color: #03e9f4 !important;           /* Màu chữ xanh neon để dễ nhìn */
  padding: 10px;
}

/* 1. Xử lý ô chọn (Select) - Thêm mũi tên và sửa nền trắng */
.user-box select {
    width: 100%;
    padding: 10px 30px 10px 0; /* Chừa chỗ cho mũi tên ở bên phải */
    font-size: 20px;
    color: #fff;
    background: transparent;
    border: none;
    border-bottom: 1px solid #fff;
    outline: none;
    appearance: none; /* Xóa mũi tên mặc định của trình duyệt */
    cursor: pointer;
    
    /* Thêm mũi tên Neon màu xanh */
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2303e9f4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 5px center;
    background-size: 18px;
}

/* Fix lỗi hiển thị trên một số trình duyệt di động */
.user-box select:focus {
  background-color: #030a10 !important;
  color: #03e9f4 !important;
}

</style>
