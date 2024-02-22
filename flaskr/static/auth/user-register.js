const RegisterView = Vue.component('registerview', {
    template: `
    <section class="content">
      <header>
          <h1>Register</h1>
      </header>
      <form @submit.prevent="register">
        <label for="username">Username</label>
        <input v-model="username" type="text" id="username" required>

        <label for="email">email</label>
        <input v-model="email" type="email" id="email" required>
        
        <label for="password">Password</label>
        <input v-model="password" type="password" id="password" required>
        
        <input type="submit" value="register"></input>
      </form>
    </section>
    `,
    data() {
      return {
          username: null,
          password: null,
          email:''
      };
    },
    methods: {
      async register() {
        try {
          const apiUrl = 'http://127.0.0.1:5000/auth/api/register';
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              "username": this.username,
              "password": this.password,
              'email': this.email
            }),
          });
          if (!response.ok) {
            const data = await response.json();
            if (response.status === 404) {
              alert(data.error);
            } else if (response.status === 401) {
              alert(data.error);
            } else if (response.status===403) {
              alert(data.error)
            }
            else {
              alert(`An error occurred: ${response.statusText}`);
            }
            throw new Error(`Network response was not ok: ${response.statusText}`);
          }
          const data = await response.json();
          console.log('Fetched data:', data);
          alert('Registration success!');
          this.$router.push('/login');
        } catch (error) {
          console.error('Fetch error:', error);
          // Optionally, notify the user or perform other error-handling actions
        }
      }
      
    }
  });
  export default RegisterView; 
  