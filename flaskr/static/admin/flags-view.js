const FlagsIndexView = Vue.component('flagsindexview', {
    template: `
      <article class="post">
      <form method="GET">
        <input @input="fetchData" v-model="search"required>
      </form>      
      <a class="action" style="cursor:pointer" @click="goBack">Go back</a>
        <header>
          <table>
            <tr>
              <th>flag_id</th>
              <th>song_id</th>
              <th>creator_id</th>
              <th>type</th>
              <th>reason</th>
              <th>Action</th>
            </tr>
            <tr v-for="flag in flags" :key="flag.flag_id">
              <td>{{ flag.flag_id }}</td>
              <td>
                <template v-if="flag.song_id">
                  <a class="action" style="cursor:pointer" @click="goSong" >{{ flag.song_id }}</a>
                </template>
                <template v-else>
                  NA
                </template>
              </td>
              <td>
                <template v-if="flag.creator_id">
                  <a class="action" style="cursor:pointer" @click="goCreator" >{{ flag.creator_id }}</a>
                </template>
                <template v-else>
                  NA
                </template>
              </td>
              <td>{{ flag.type }}</td>
              <td>{{ flag.reason }}</td>
              <td>
                <a class="action" style="cursor:pointer; color: red;" @click="removeUser(flag.flag_id)">remove</a>
              </td>
            </tr>
          </table>
        </header>
      </article>
    `,
    data() {
      return {
        flags: [],
        search:'' // Initialize with the appropriate data
      };
    },
    methods: {
      goBack() {
        // Implement go back logic
        this.$router.go(-1)
      },
      goCreator(){
        this.$router.push('/creators')
      },
      goSong(){
        this.$router.push('/songs')
      },
      fetchData() {
        const apiUrl = 'http://127.0.0.1:5000/api/flags?search=' + this.search;
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
            this.flags = data
          })
          .catch(error => {
            // Handle errors
            console.error('Fetch error:', error);
            // Optionally, notify the user or perform other error-handling actions
          });
      },
      removeUser(userId) {
        const apiUrl = 'http://127.0.0.1:5000/remove/flag/'+userId;
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
            alert(data.message)
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
  export default FlagsIndexView
  