const SongDetail = Vue.component('songdetail', {
    template: `
  <section class="content">
        <article class="post">
          <a class="action" style="cursor:pointer" @click="goBack">Go back</a>
          <header>
            <div>
              <h1>
                {{ song.title }}
                <router-link v-if="type=='user'" :to="'/user/report/song/' + song.song_id" ><i style="color: red;">report</i></router-link>
                <router-link v-if="type=='creator'" :to="'/creator/report/song/' + song.song_id" ><i style="color: red;">report</i></router-link>
              </h1>
              <div class="about">by {{ song.username }} on {{ formatDate(song.created) }} <router-link :to="'#'"><i style="color: red;">report</i></router-link></div>
              <audio controls>
                <source :src="'/api/play/' + song.song_id" type="audio/mp3">
              </audio>
            </div>
            <router-link v-if="like" class="action" :to="'/'"><i class="fa-solid fa-heart"></i></router-link>
            <a v-else class="action" style="cursor: pointer" @click="likeSong(song.song_id)">
              <span class="fa-regular fa-heart"></span>
            </a>
            <router-link v-if="type=='user'" class="action" :to="'/user/add/song/playlist/' + song.song_id">add to playlist</router-link>
            <router-link v-else-if="type=='creator'" class="action" :to="'/creator/add/song/playlist/' + song.song_id">add to playlist</router-link>
            <router-link v-else class="action" :to="'/login'">add to playlist</router-link>
          </header>
            <i v-if="song.lyrics"><p>{{ song.lyrics }}</p></i>
        </article>
        </section>
    `,
    data() {
      return {
        song: null,
        like: null,
        type:''
      };
    },
    computed: {
      lastSong() {
        return this.songs[this.songs.length - 1];
      },
    },
    methods: {
      goBack() {
        this.$router.go(-1);
      },
      likeSong(id) {
        const apiUrl = 'http://127.0.0.1:5000/api/' + id + '/like';
      
        fetch(apiUrl)
          .then(response => {
            if (!response.ok) {
              if (response.status === 401) {
                // Handle 401 Unauthorized
                alert('Unauthorized access. Please log in.');
              } else {
                // Handle other errors
                throw new Error(`Network response was not ok: ${response.statusText}`);
              }
            }
            return response.json(); // Parse JSON
          })
          .then(data => {
            // Handle the fetched data
            console.log('Fetched data:', data);
            alert(data.message);
            // Do something with the data, such as updating a component property
          })
          .catch(error => {
            // Handle errors
            console.error('Fetch error:', error);
            // Optionally, notify the user or perform other error-handling actions
          });
      },      
      async fetchData() {
        const apiUrl = 'http://127.0.0.1:5000/api/current/song/'+this.$route.params.id;
  
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
            this.song=data['song']
            console.log(this.song['title'])
            this.like=data['like']
            // Do something with the data, such as updating a component property
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
    created() {
      this.fetchData()
      this.type = sessionStorage.getItem('type')
    }
  });
  export default SongDetail