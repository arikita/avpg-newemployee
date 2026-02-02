<template>
  <div class="portal-wrapper">
    <div class="container">
      <a href="https://arikita.github.io/avpg-portal/" class="back-btn" title="Quay lại">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="19" y1="12" x2="5" y2="12"></line>
          <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
      </a>
      <div class="form-content">
        <h1>NHẬP THÔNG TIN NHÂN VIÊN</h1>
        <form @submit.prevent="generateImage">
          
          <input type="text" v-model="employee.name" placeholder="Họ và tên" required />
          <input type="text" v-model="employee.position" placeholder="Chức vụ" required />
          <input type="text" v-model="employee.department" placeholder="Phòng ban" required />
          <input type="text" v-model="employee.phone" placeholder="Số điện thoại" required />
          
          <div class="input-group">
            <span class="input-label">Ngày bắt đầu</span>
            <input type="date" v-model="employee.startDate" required />
          </div>

          <select v-model="employee.gender" required>
            <option value="Nam">Anh</option>
            <option value="Nữ">Chị</option>
          </select>

          <div class="file-upload-section">
            <span class="input-label">Ảnh đại diện (Kéo để căn chỉnh)</span>
            <input type="file" @change="setImage" required class="file-input" accept="image/*" />
            
            <div v-if="imgSrc" class="cropper-wrapper">
              <vue-cropper
                ref="cropper"
                :src="imgSrc"
                alt="Source Image"
                :aspect-ratio="1"
                :view-mode="1"
                drag-mode="move"
                :auto-crop-area="1"
                class="cropper-instance"
              >
              </vue-cropper>
              <small>* Bạn hãy kéo ảnh để canh đúng khung hình tròn</small>
            </div>
          </div>

          <button type="submit" :disabled="loading">
            {{ loading ? 'Đang xử lý...' : 'TẠO HÌNH ẢNH' }}
          </button>
        </form>
      </div>
    </div>

    <div v-if="imageUrl" class="container result-container">
      <h3>THÔNG TIN NHÂN SỰ MỚI</h3>
      <img :src="imageUrl" alt="Preview" class="preview-image" />
      <a :href="imageUrl" download="welcome.png" class="download-btn">TẢI VỀ HÌNH ẢNH</a>
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

        const response = await axios.post("https://avpg-newemployee.onrender.com/generate", formData, {
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
@import url('https://fonts.googleapis.com/css?family=Poppins:300,400,600,700&display=swap');

.portal-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  font-family: 'Poppins', sans-serif;
  min-height: 100vh;
  margin: 0;
  background: linear-gradient(to right, #ece9e6, #ffffff);
  padding: 20px;
}

.container {
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22);
  position: relative;
  overflow: hidden;
  width: 850px;
  max-width: 100%;
  padding: 40px 0;
  margin-bottom: 20px;
}

.back-btn {
  position: absolute;
  top: 15px;
  left: 15px;
  color: #666;
  transition: all 0.3s ease;
  padding: 8px;
  border-radius: 50%;
  display: flex;
}

.back-btn:hover {
  background-color: #f0f0f0;
  color: #333;
}

h1, h3 {
  font-weight: 700;
  margin: 0 0 20px;
  color: #333;
  text-align: center;
}

form {
  background-color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 0 50px;
  width: 100%;
}

input, select {
  background-color: transparent;
  border: none;
  border-bottom: 2px solid #ddd;
  padding: 12px 15px;
  margin: 8px 0;
  width: 100%;
  font-family: 'Poppins', sans-serif;
  transition: border-color 0.3s;
  font-size: 14px;
  color: #333;
}

input:focus, select:focus {
  outline: none;
  border-bottom-color: #6a11cb;
}

input::placeholder {
  color: #aaa;
}

button, .download-btn {
  border-radius: 50px;
  border: none;
  background: linear-gradient(to right, #6a11cb 0%, #2575fc 100%);
  color: #FFFFFF;
  font-size: 12px;
  font-weight: bold;
  padding: 12px 45px;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: transform 80ms ease-in, box-shadow 0.3s;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
  text-decoration: none;
  display: inline-block;
}

button:hover, .download-btn:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

button:active {
  transform: scale(0.95);
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.input-group {
  width: 100%;
  text-align: left;
  margin: 8px 0;
}

.input-label {
  font-size: 12px;
  color: #666;
  display: block;
  margin-left: 15px;
  margin-bottom: -5px;
}

.file-upload-section {
  width: 100%;
  margin-top: 10px;
  text-align: left;
}

.cropper-wrapper {
  margin-top: 10px;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 10px;
  background: #f9f9f9;
}

.cropper-instance {
  height: 300px; 
  width: 100%; 
  background: #ddd;
}

.result-container {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-image {
  max-width: 100%;
  max-height: 500px;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  margin: 20px 0;
}

</style>
