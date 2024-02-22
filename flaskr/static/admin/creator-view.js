const CreatorsIndexView = Vue.component('creatorsindexview', {
    template: `
    <article class="post">
      <form method="GET">
      <input @input="fetchData" v-model="search" required>
      </form>
        <a class="action" style="cursor:pointer" @click="goBack">Go back</a>
        <header>
          <table>
            <tr>
              <th>ID</th>
              <th>Username</th>
            </tr>
            <tr v-for="creator in creators" :key="creator.id">
              <td>{{ creator.id }}</td>
              <td>{{ creator.username }}</td>
              <td v-if="creator.isblocked === 0">
                  <a class="action" style="cursor:pointer; color: red;" @click="blockUser(creator.id)">block</a>
              </td>
              <td v-else>
                  <a class="action" style="cursor:pointer; color: green;" @click="unblockUser(creator.id)">unblock</a>
              </td>
            </tr>
          </table>
        </header>
      </article>
    `,
    data(){
      return {
        creators:[],
        search:''
      }
    },
    methods: {
      goBack() {
        // Implement go back logic
        this.$router.go(-1)
      },
      fetchData() {
        const apiUrl = 'http://127.0.0.1:5000/api/creators?search='+this.search;
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
            this.creators = data
          })
          .catch(error => {
            // Handle errors
            console.error('Fetch error:', error);
            // Optionally, notify the user or perform other error-handling actions
          });
      },
      unblockUser(userId) {
        const apiUrl = 'http://127.0.0.1:5000/auth/api/creator/unblock/'+userId;
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
        const apiUrl = 'http://127.0.0.1:5000/auth/api/creator/block/'+userId;
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
export default CreatorsIndexView