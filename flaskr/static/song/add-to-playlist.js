const SongPlaylistsView = Vue.component('songplaylistsview', {
    template: `
      <section class="content">
       <header>
        <h1>{{ song.title }}</h1>
       </header>
        <div v-if="playlists.length > 0">
          <article class="post" v-for="(playlist, index) in playlists" :key="index">
            <header>
              <div>
                <h2>{{ playlist.title }}</h2>
                <a style="cursor: pointer" class="action" @click="addToPlaylist(playlist.playlist_id)">Add here</a>
              </div>
            </header>
          </article>
          <hr>
        </div>
        <div v-else>
          <h2>No playlist is there</h2>
        </div>
      </section>
    `,
    data() {
      return {
        song: [],
        playlists: []
      };
    },
    computed: {
      lastSong() {
        return this.songs[this.songs.length - 1];
      },
    },
    methods: {
      fetchData() {
        const apiUrl = 'http://127.0.0.1:5000/'+this.$route.params.id+'/add/to/playlist';
  
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
            // Do something with the data,  
            this.song = data['song']; //  
            this.playlists = data['playlists']; //
          })
          .catch(error => {
            // Handle errors
            console.error('Fetch error:', error);
            // Optionally, notify the user or perform other error-handling actions
          });
      },
      addToPlaylist(playlist_id) {
        
        const apiUrl = 'http://127.0.0.1:5000//api/songs/'+this.song.song_id+'/add/here/'+ playlist_id;
  
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
            // Do something with the data,  
            alert("success") //
            this.goBack()
          })
          .catch(error => {
            // Handle errors
            console.error('Fetch error:', error);
            // Optionally, notify the user or perform other error-handling actions
          });
      },
      goBack() {
        this.$router.go(-1);
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
    }
  });
  export default SongPlaylistsView
  