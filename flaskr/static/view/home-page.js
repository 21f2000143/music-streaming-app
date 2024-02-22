const GuestView = Vue.component('guestview', {
  template: `
  <div>
    <nav>
      <h1>BS Music</h1>
      <ul>
          <li><a style="cursor:pointer" @click="register">Register</a></li>
          <li><a style="cursor:pointer" @click="creator">Become Creator</a></li>
          <li><a style="cursor:pointer" @click="login">Log In</a></li>
          <li><a style="cursor:pointer" @click="adminLogin">Admin Log In</a></li>
      </ul>
    </nav>
    <router-view :iam="iam"></router-view>
  </div>
  `,
  data(){
    return {
      iam:"welcomePage"
    }
  },
  methods: {
    login(){
      this.$router.push('/login')
    },
    register(){
      this.$router.push('/register')
    },
    creator(){
      this.$router.push('/creator')
    },
    adminLogin(){
      this.$router.push('/admin/login')
    }
  },
});

export default GuestView; 
