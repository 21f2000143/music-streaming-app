const AlbumIndexView = Vue.component('albumindexview', {
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
              <th>title</th>
              <th>genre</th>
              <th>creator_id</th>
              <th>created</th>
            </tr>
            <tr v-for="album in albums" :key="album.album_id">
              <td>{{ album.album_id }}</td>
              <td>{{ album.title }}</td>
              <td>{{ album.genre }}</td>
              <td>{{ album.creator_id }}</td>
              <td>{{ album.created }}</td>
              <td>
                <a class="action" style="cursor:pointer; color: red;" @click="removeUser(album.album_id)">remove</a>
              </td>
            </tr>
          </table>
        </header>
      </article>
    `,
    data() {
      return {
        albums: [],
        search:'' // Initialize with the appropriate data
      };
    },
    methods: {
      goBack() {
        // Implement go back logic
        this.$router.go(-1)
      },
      fetchData() {
        const apiUrl = 'http://127.0.0.1:5000/api/albums?search='+this.search;
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
            this.albums = data
          })
          .catch(error => {
            // Handle errors
            console.error('Fetch error:', error);
            // Optionally, notify the user or perform other error-handling actions
          });
      },
      removeUser(userId) {
        const apiUrl = 'http://127.0.0.1:5000/api/'+userId + '/delete/album';
        fetch(apiUrl, {
          method: 'DELETE',
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

export default AlbumIndexView