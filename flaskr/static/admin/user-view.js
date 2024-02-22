const UserIndexView = Vue.component('userindexview', {
    template: `
      <article class="post">
      <form method="GET">
        <input @input="fetchData" v-model="search" required>
      </form>      
        <a class="action" style="cursor:pointer" @click="goBack">Go back</a>
        <header>
          <table v-if="search">
            <tr>
              <th>ID</th>
              <th>Username</th>
            </tr>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>
                <a class="action" style="cursor:pointer; color: red;" @click="removeUser(user.id)">remove</a>
              </td>
              <td v-if="user.isblocked === 0">
                  <a class="action" style="cursor:pointer;color: red;" @click="blockUser(user.id)">block</a>
              </td>
              <td v-else>
                  <a class="action" style="cursor:pointer;color: green;" @click="unblockUser(user.id)">unblock</a>
              </td>
            </tr>
          </table>
          <table v-else>
            <tr>
              <th>ID</th>
              <th>Username</th>
            </tr>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.username }}</td>
              <td>
                <a class="action" style="cursor:pointer; color: red;" @click="removeUser(user.id)">remove</a>
              </td>
              <td v-if="user.isblocked === 0">
                  <a class="action" style="cursor:pointer;color: red;" @click="blockUser(user.id)">block</a>
              </td>
              <td v-else>
                  <a class="action" style="cursor:pointer;color: green;" @click="unblockUser(user.id)">unblock</a>
              </td>
            </tr>
          </table>
        </header>
      </article>
    `,
    data() {
      return {
        users: [],
        search:'' // Initialize with the appropriate data
      };
    },
    methods: {
      goBack() {
        // Implement go back logic
        this.$router.go(-1)
      },
      fetchData() {
        const apiUrl = 'http://127.0.0.1:5000/api/users?search='+this.search;
        fetch(apiUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json(); // Parse JSON
          })
          .then(data => {
            // Handle the fetched data
            console.log('Fetched data:', data);
            this.users = data
          })
          .catch(error => {
            // Handle errors
            console.error('Fetch error:', error);
            // Optionally, notify the user or perform other error-handling actions
          });
      },
      unblockUser(userId) {
        const apiUrl = 'http://127.0.0.1:5000/auth/api/user/unblock/'+userId;
        fetch(apiUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json(); // Parse JSON
          })
          .then(data => {
            // Handle the fetched data
            console.log('Fetched data:', data);
            alert(data['message'])
          })
          .catch(error => {
            // Handle errors
            console.error('Fetch error:', error);
            // Optionally, notify the user or perform other error-handling actions
          });
      },
      blockUser(userId) {
        const apiUrl = 'http://127.0.0.1:5000/auth/api/user/block/'+userId;
        fetch(apiUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json(); // Parse JSON
          })
          .then(data => {
            // Handle the fetched data
            console.log('Fetched data:', data);
            alert(data['message'])
          })
          .catch(error => {
            // Handle errors
            console.error('Fetch error:', error);
            // Optionally, notify the user or perform other error-handling actions
          });
      },
      removeUser(userId) {
        const apiUrl = 'http://127.0.0.1:5000/auth/api/user/remove/'+userId;
        fetch(apiUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json(); // Parse JSON
          })
          .then(data => {
            // Handle the fetched data
            console.log('Fetched data:', data);
            alert(data['message'])
          })
          .catch(error => {
            // Handle errors
            console.error('Fetch error:', error);
            // Optionally, notify the user or perform other error-handling actions
          });
      },
    },
    mounted(){
      this.fetchData()
    }
  });
export default UserIndexView