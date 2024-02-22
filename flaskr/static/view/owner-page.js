const OwnerView = Vue.component('ownerview', {
    template: `
      <div>
      <nav>
        <h1>BS Music</h1>
        <ul>
        <li><span>Creator: iamadmin </span></li>
        <li><a style="cursor:pointer" @click="goHome">Home</a></li>
        <li><a style="cursor:pointer" @click="logout">logout</a></li>
        </ul>
      </nav>
      <section class="content">
      <header>
      <h1>Admin Dashboard</h1>
      </header>
      <article class="post">
      <header>
        <a class="action" style="cursor:pointer" @click="goUser" >Users</a>
        <a class="action" style="cursor:pointer" @click="goCreator" >Creators</a>
        <a class="action" style="cursor:pointer" @click="goSong" >Songs</a>
        <a class="action" style="cursor:pointer" @click="goAlbum" >Albums</a>
        <a class="action" style="cursor:pointer" @click="goFlag" >Flagged Content</a>
        <a class="action" style="cursor:pointer" @click="report" >Get Report</a>
      </header>
      </article>
      <router-view :iam="iam"></router-view>
      </section>
      </div>
    `,
    data() {
      return {
        search: '',
        iam:'adminPage'
      };
    },
    methods: {
      goHome(){
        this.$router.push('/admin/dashboard')
      },
      goUser(){
        this.$router.push('/users')
      },
      goCreator(){
        this.$router.push('/creators')
      },
      goAlbum(){
        this.$router.push('/albums')
      },
      goSong(){
        this.$router.push('/songs')
      },
      goFlag(){
        this.$router.push('/flags')
      },
      goBack(){
        this.$router.go(-1)
      },
      report() {
        const apiUrl = 'http://127.0.0.1:5000/get/report/data';
        fetch(apiUrl)
          .then(response => {
            if (!response.ok) {
              alert("something went wrong please try again")
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
      const source = new EventSource("/stream");
      source.addEventListener('notifyadmin', event => {
        let data = JSON.parse(event.data);
        alert(data.message)
      }, false);
    }
  });
export default OwnerView; 
  