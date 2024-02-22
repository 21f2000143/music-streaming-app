const AllAlbumsView = Vue.component('allalbumsview', {
    template: `
      <section class="content">
        <header>
        <h1>All albums</h1>
        
        <a class="action" href="#"><router-link to="/add/album">Add</router-link></a>
        </header>
        <template v-if="albums.length > 0">
          <article v-for="(album, index) in albums" :key="index" class="post">
            <header>
              <div>
                <h2>{{ album.title }}</h2>
                <h3>{{ album.genre }}</h3>
                <div class="about">by {{ album.username }} on {{ formatDate(album.created) }}</div>
                <router-link v-if="type=='user'" :to="'/user/album/song/' + album.album_id">See songs</router-link>
                <router-link v-if="type=='creator'" :to="'/creator/album/song/' + album.album_id">See songs</router-link>
              </div>
        
              <router-link :to="'/creator/update/album/' + album.album_id">Edit</router-link>
            </header>
              <hr>
          </article>
        </template>
        <template v-else>
          <h2>No album is there</h2>
        </template>
      </section>
    `,
    data() {
      return {
        searchQuery: '',
        albums:[],
        type:''
      };
    },
    methods: {
      async fetchData() {
        const apiUrl = 'http://127.0.0.1:5000/api/album';
  
        await fetch(apiUrl)
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
      searchSongs() {
        // Implement the logic to search songs
        console.log('Searching for songs:', this.search);
      },
      formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
      },
    },
    mounted() {
      this.fetchData()
      this.type=sessionStorage.getItem('type')
    }
  });
  
  export default AllAlbumsView