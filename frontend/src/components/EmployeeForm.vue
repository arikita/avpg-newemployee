<template>
  <div class="container my-5">
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
        <!-- Thẻ card Bootstrap -->
        <div class="card p-4 shadow-sm">
          <h2 class="mb-4 text-center">Nhập thông tin nhân viên</h2>
          <!-- Form -->
          <form @submit.prevent="generateImage">
            <div class="mb-3">
              <label class="form-label">Họ và tên</label>
              <input type="text" class="form-control" v-model="employee.name" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Chức danh</label>
              <input type="text" class="form-control" v-model="employee.position" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Phòng ban</label>
              <input type="text" class="form-control" v-model="employee.department" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Số điện thoại</label>
              <input type="text" class="form-control" v-model="employee.phone" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Ngày bắt đầu</label>
              <input type="date" class="form-control" v-model="employee.startDate" required />
            </div>
            <div class="mb-3">
              <label class="form-label">Ảnh đại diện</label>
              <input type="file" class="form-control" accept="image/*" @change="handleFileUpload" required />
            </div>

            <button type="submit" class="btn btn-primary w-100 mt-3">
              Tạo Hình Ảnh
            </button>
          </form>
        </div>

        <!-- Khu vực hiển thị ảnh kết quả -->
        <div v-if="imageUrl" class="card mt-4 p-3 text-center shadow-sm">
          <h3>Kết quả</h3>
          <img :src="imageUrl" alt="Employee Card Preview" class="img-fluid my-3" style="max-height: 400px;" />
          <a :href="imageUrl" download="employee_card.png" class="btn btn-success">
            Tải về
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "EmployeeForm",
  data() {
    return {
      employee: {
        name: "",
        position: "",
        department: "",
        phone: "",
        startDate: "",
      },
      file: null,
      imageUrl: null,
    };
  },
  methods: {
    handleFileUpload(e) {
      // Lấy file ảnh người dùng chọn
      this.file = e.target.files[0];
    },
    async generateImage() {
      const formData = new FormData();
      formData.append("name", this.employee.name);
      formData.append("position", this.employee.position);
      formData.append("department", this.employee.department);
      formData.append("phone", this.employee.phone);
      formData.append("startDate", this.employee.startDate);

      if (this.file) {
        formData.append("image", this.file);
      }

      try {
        // Gửi request tới backend
        const response = await axios.post(
          "http://10.10.100.125:3000/generate",
          formData,
          { responseType: "blob" }
        );
        // Tạo URL tạm cho ảnh kết quả
        this.imageUrl = URL.createObjectURL(response.data);
      } catch (error) {
        console.error("Lỗi khi tạo hình ảnh:", error);
        alert("Đã xảy ra lỗi khi tạo ảnh, vui lòng thử lại!");
      }
    },
  },
};
</script>

<style scoped>
/* Tuỳ chỉnh nhỏ nếu cần */
</style>
