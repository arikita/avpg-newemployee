<template>
   <v-app>
     <router-view />
   </v-app>
</template>

<script>
import EmployeeForm from './views/EmployeeForm.vue'

export default {
   components: { EmployeeForm }
}
</script>
