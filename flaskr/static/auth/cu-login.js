const LoginView = Vue.component('loginview', {
    template: `
    <section class="content">
      <header>
          <h1>Log In</h1>
      </header>       
        <form @submit.prevent="login">
          <label for="username">Username</label>
          <input v-model="username" type="text" id="username" required>
          
          <label for="password">Password</label>
          <input v-model="password" type="password" id="password" required>
          
          <input type="submit" value="login"></input>
        </form>
      </form>
    </section>    
    `,
    data() {
      return {
          username: null,
          password: null,
      };
    },
    methods: {
      async login() {
        try {
          const apiUrl = 'http://127.0.0.1:5000/auth/api/login';
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              "username": this.username,
              "password": this.password
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
          sessionStorage.setItem("name", this.username);
          alert('Login success!');
          sessionStorage.setItem("email", data['email']);
      
          if (data['type'] === 'user') {
            sessionStorage.setItem("type", "user");
            sessionStorage.setItem("id", data['id']);
            this.$router.push('/user/dashboard');
          } else if (data['type'] === 'creator') {
            sessionStorage.setItem("type", "creator");
            sessionStorage.setItem("id", data['id']);
            this.$router.push('/creator/dashboard');
          }
        } catch (error) {
          console.error('Fetch error:', error);
          // Optionally, notify the user or perform other error-handling actions
        }
      }
      
      
    }
  });
  
  export default LoginView; 
  