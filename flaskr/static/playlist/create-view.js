const NewPlaylistView = Vue.component('newplaylistview', {
    template: `
      <section class="content">
        <header>
        <h1>New Playlist</h1>
        </header>
        
        <form @submit.prevent="savePlaylist">
          <label for="title">Title</label>
          <input v-model="title" type="text" id="title" required>
          <input type="submit" value="Save">
        </form>
      </section>
    `,
    data() {
      return {
        title: '',
      };
    },
    methods: {
      async savePlaylist() {
        try {
          const apiUrl = 'http://127.0.0.1:5000/api/create/playlist';
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              "title": this.title
            }),
          });
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
          }
          const data = await response.json();
          console.log('Fetched data:', data);
          alert(data.message);
          this.goBack()
        } catch (error) {
          console.error('Fetch error:', error);
          // Optionally, notify the user or perform other error-handling actions
        }
      },
      goBack() {
        this.$router.go(-1);
      },      
    },
  });
  export default NewPlaylistView