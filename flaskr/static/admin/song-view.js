const SongIndexView = Vue.component('songindexview', {
    template: `
      <article class="post">
      <form method="GET">
        <input @input="fetchData" v-model="search" required>
      </form>      
        <a class="action" @click="goBack">Go back</a>
        <header>
          <table>
            <tr>
              <th>song_id</th>
              <th>title</th>
              <th>created</th>
              <th>Created by</th>
              <th>play</th>
              <th>lyrics</th>
              <th>remove</th>
            </tr>
            <tr v-for="song in songs" :key="song.song_id">
              <td>{{ song.song_id }}</td>
              <td>{{ song.title }}</td>
              <td>{{ song.created }}</td>
              <td>{{ song.username }}</td>
              <td><router-link class="action"
              :to="'/admin/dashboard/playing/song/' + song.song_id">Play</router-link></td>
              <td>{{ song.lyrics }}</td>
              <td>
              <a class="action" style="cursor:pointer; color:red;" @click="deleteSong(song.song_id)">remove</a>
              </td>
            </tr>
          </table>
        </header>
      </article>
    `,
    data() {
      return {
        songs: [],
        search:'' // Initialize with the appropriate data
      };
    },
    methods: {
      goBack() {
        // Implement go back logic
        this.$router.go(-1)
      },
      fetchData() {
        const apiUrl = 'http://127.0.0.1:5000/api/songs?search='+this.search;
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
            this.songs = data
          })
          .catch(error => {
            // Handle errors
            console.error('Fetch error:', error);
            // Optionally, notify the user or perform other error-handling actions
          });
      },
      async deleteSong(id) {
        const apiUrl = 'http://127.0.0.1:5000/api/'+ id + '/delete';
  
        await fetch(apiUrl, {
          method: "GET",
          headers: {'Content-Type': 'application/json'}
        })
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
            // Do something with the data, such as updating a component property
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
  export default SongIndexView