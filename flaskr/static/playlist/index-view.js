const AllPlaylistsView = Vue.component('allplaylistsview', {
    template: `
    <section class="content">
      <header>
      <h1>All Playlists</h1>
      <router-link v-if="type=='user'" :to="'/user/add/playlist'" >Add</router-link>
      <router-link v-if="type=='creator'" :to="'/creator/add/playlist'" >Add</router-link>
      </header>
          <div v-if="playlists.length>0">
          <article class="post" v-for="playlist in playlists" :key="playlist.playlist_id">
            <header>
              <div>
                <h2>{{ playlist.title }}</h2>
                <router-link v-if="type=='user'" :to="'/user/playlist/song/' + playlist.playlist_id ">See songs</router-link>
                <router-link v-if="type=='creator'" :to="'/creator/playlist/song/' + playlist.playlist_id ">See songs</router-link>
              </div>
              <router-link v-if="type=='user'" :to="'/user/update/playlist/'+ playlist.playlist_id">Edit</router-link>
              <router-link v-if="type=='creator'" :to="'/creator/update/playlist/'+ playlist.playlist_id">Edit</router-link>
            </header>
          </article>
          <hr>
        </div>
        <h1 v-else> No playlist for you.</h1>
        </section>
    `,
    data() {
      return {
        playlists: [],
        type:'' // Assuming playlists is available in the component data
      };
    },
    methods: {
      fetchData() {
        
        const apiUrl = 'http://127.0.0.1:5000/api/playlist';
  
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
            this.playlists = data.playlists
            console.log(data.playlists)
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
    },
    mounted() {
      this.fetchData()
      this.type=sessionStorage.getItem('type')
    }
  });
export default AllPlaylistsView