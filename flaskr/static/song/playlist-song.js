const PlaylistSong = Vue.component('songlist', {
    template: `
    <section class="content">
        <header>
            <h1>{{ playlist.title }}</h1>

            <a class="action" style="cursor:pointer" @click="goBack">Go back</a>
        </header>
        <div v-if="songs.length > 0">
            <article v-for="song in songs" :key="song.song_id" class="post">
                <header>
                    <div>
                        <h1>{{ song.title }}</h1>
                        <div class="about">by {{ song.username }} on {{ formatDate(song.created) }}</div>
                        <router-link v-if="type=='user'" class="action"
                            :to="'/user/dashboard/playing/song/' + song.song_id">Play</router-link>
                        <router-link v-else-if="type=='creator'" class="action"
                            :to="'/creator/dashboard/playing/song/' + song.song_id">Play</router-link>
                        <router-link v-else class="action"
                            :to="'/playing/song/' + song.song_id">Play</router-link>
                    </div>
                    <router-link v-if="type=='creator' && id==song.creator_id" class="action" :to="'/creator/update/song/' + song.song_id">Edit</router-link>
                    <a style="cursor:pointer; color: red;" class="action" @click="removeFrom(song.song_id,playlist.playlist_id)">remove</a>
                </header>
            </article>
            <hr>
        </div>
        <h1 v-else>No songs available</h1>
    </section>
    `,
    data() {
      return {
        search: '',
        songs: [],
        playlist: null,
        type:'',
        id:''
      };
    },
    methods: {
      goBack() {
        this.$router.go(-1);
      },
      async removeFrom(sid, pid) {
        const apiUrl = 'http://127.0.0.1:5000/api/songs/'+ sid +'/remove/from/'+pid;
  
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
            // Do something with the data, such as updating a component property
            alert(data['message'])// Assuming you have a data property in your component
          })
          .catch(error => {
            // Handle errors
            console.error('Fetch error:', error);
            // Optionally, notify the user or perform other error-handling actions
          });
      },
      async fetchData() {
        const apiUrl = 'http://127.0.0.1:5000/api/'+ this.$route.params.id +'/songs/playlist';
  
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
            // Do something with the data, such as updating a component property
            this.songs = data.songs; // Assuming you have a data property in your component
            this.playlist = data.playlist;
            this.type = sessionStorage.getItem('type') // Assuming you have a data property in your component
            this.id = sessionStorage.getItem('id') // Assuming you have a data property in your component
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
    }
  });

export default PlaylistSong;