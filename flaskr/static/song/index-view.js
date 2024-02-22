const SongList = Vue.component('songlist', {
    template: `
    <section class="content">
        <header>
            <h1 v-if="search"> Searching for {{ search }} </h1>
            <h1 v-else >New Release</h1>
            <a class="action" v-if="iam=='creatorPage'"><router-link :to="'/creator/add/song'" >Add</router-link></a>
        </header>
        <form method="GET">
          <label for="search">Type for search</label>  
          <input v-model="search" id="search" @input="searchSongs">
        </form>
          <div v-if="search">
            <div v-if="songs.length > 0">
              <article v-for="song in search_data" :key="song.song_id" class="post">
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
                      <router-link v-if="type=='user'" class="action" :to="'/user/add/song/playlist/' + song.song_id">add to playlist</router-link>
                      <router-link v-else-if="type=='creator'" class="action" :to="'/creator/add/song/playlist/' + song.song_id">add to playlist</router-link>
                      <router-link v-else class="action" :to="'/login'">add to playlist</router-link>
                  </header>
              </article>
            </div>
            <h1 v-else>No songs available</h1>
          </div>
          <div v-else>
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
                      <router-link v-if="type=='user'" class="action" :to="'/user/add/song/playlist/' + song.song_id">add to playlist</router-link>
                      <router-link v-else-if="type=='creator'" class="action" :to="'/creator/add/song/playlist/' + song.song_id">add to playlist</router-link>
                      <router-link v-else class="action" :to="'/login'">add to playlist</router-link>
                  </header>
              </article>
            </div>
            <h1 v-else>No songs available</h1>
          </div>
          <hr>
    </section>
    `,
    props:['iam'],
    data() {
      return {
        search: '',
        songs: [],
        search_data: [],
        type:'',
        id:''
      };
    },
    computed: { 
      lastSong() {
        return this.songs[this.songs.length - 1];
      },
    },
    methods: {
      async fetchData() {
        const apiUrl = 'http://127.0.0.1:5000/api/songs';
  
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
            this.songs = data;
            this.type=sessionStorage.getItem("type") // Assuming you have a data property in your component
            this.id=sessionStorage.getItem("id") // Assuming you have a data property in your component
          })
          .catch(error => {
            // Handle errors
            console.error('Fetch error:', error);
            // Optionally, notify the user or perform other error-handling actions
          });
      },
      async searchSongs() {
        const apiUrl = 'http://127.0.0.1:5000/api/songs?search=' + this.search;
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
            this.search_data = data; // Assuming you have a data property in your component
          })
          .catch(error => {
            // Handle errors
            console.error('Fetch error:', error);
            // Optionally, notify the user or perform other error-handling actions
          });
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

export default SongList;