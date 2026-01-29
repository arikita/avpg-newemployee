import { createRouter, createWebHistory } from "vue-router";
import EmployeeForm from "../views/EmployeeForm.vue";

const routes = [
  { path: "/", name: "EmployeeForm", component: EmployeeForm }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
