const CreatorView = Vue.component('creatorview', {
    template: `
      <div>
      <nav>
        <h1>BS Music</h1>
        <ul>
            <li><span>Creator: {{ name }}</span></li>
            <li><a style="cursor:pointer" @click="goHome">Home</a></li>
            <li><a style="cursor:pointer" @click="addAlbum">Add Album</a></li>
            <li><a style="cursor:pointer" @click="allAlbum">Albums</a></li>
            <li><a style="cursor:pointer" @click="addPlaylist">Add Playlist</a></li>
            <li><a style="cursor:pointer" @click="allPlaylist">My Playlist</a></li>
            <li><a style="cursor:pointer" @click="logout">logout</a></li>
        </ul>
      </nav>
      <router-view :iam="iam"></router-view>
      </div>
    `,
    data() {
      return {
        search: '',
        songs: [],
        isAdmin: false,
        isCreator: false,
        playlist: ['bollywood'],
        iam:"creatorPage",
        name:''
      };
    },
    methods: {
      logout() {
        const apiUrl = 'http://127.0.0.1:5000/auth/logout';
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
            sessionStorage.clear();
            this.$router.push('/')
            // Do something with the data, such as updating a component property
            this.songs = data; // Assuming you have a data property in your component
          })
          .catch(error => {
            // Handle errors
            console.error('Fetch error:', error);
            // Optionally, notify the user or perform other error-handling actions
          });
      },
      goHome(){
        this.$router.push('/creator/dashboard')
      },
      addAlbum(){
        this.$router.push('/creator/add/album')
      },
      allAlbum(){
        this.$router.push('/creator/all/albums')
      },
      addPlaylist(){
        this.$router.push('/creator/add/playlist')
      },
      allPlaylist(){
        this.$router.push('/creator/all/playlist')
      },
      formatDate(dateString) {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
      },
    },
    mounted() {
      this.name=sessionStorage.getItem('name')
      const source = new EventSource("/stream");
      source.addEventListener(sessionStorage.getItem('email'), event => {
        let data = JSON.parse(event.data);
        alert(data.message)
      }, false);
    }
  });
export default CreatorView; 
  