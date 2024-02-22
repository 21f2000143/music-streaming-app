const EditAlbumView = Vue.component('editalbumview', {
    template: `
      <section class="content">
        <header>
        <h1>Edit "{{ title }}"</h1>
        </header>
        
        <form @submit.prevent="saveChanges">
          <label for="title">Title</label>
          <input v-model="title" type="text" id="title" required>
          
          <label for="genre">Genre</label>
          <input v-model="genre" type="text" id="genre" required>
          
          <input type="submit"></input>
        </form>
        
        <hr>
        
        <form @submit.prevent="deleteAlbum">
          <input class="danger" type="submit" value="Delete" onclick="return confirm('Are you sure?');">
        </form>
      </section>
    `,
    data() {
      return {
          title: '',
          genre: '',
      };
    },
    computed: {
      album() {
        // Assuming 'album' is a prop passed to this component
        return this.$props.album;
      },
    },
    methods: {
      async fetchData() {
        const apiUrl = 'http://127.0.0.1:5000/api/' + this.$route.params.id +'/update/album';
  
        await fetch(apiUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json(); // Parse JSON
          })
          .then(data => {
            console.log('Fetched data:', data);
            this.title = data['title']
            this.genre = data['genre']
          })
          .catch(error => {
            console.error('Fetch error:', error);
          });
      },
      async saveChanges() {
        try {
          const apiUrl = 'http://127.0.0.1:5000/api/' + this.$route.params.id +'/update/album';
          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              "title": this.title,
              "genre": this.genre
            }),
          });
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
          }
          const data = await response.json();
          console.log('Fetched data:', data);
          alert('Album updated');
          this.$router.push('/creator/dashboard');
        } catch (error) {
          console.error('Fetch error:', error);
          // Optionally, notify the user or perform other error-handling actions
        }
        console.log('Save album clicked with title:', this.title, 'and genre:', this.genre);
      },
      async deleteAlbum() {
        try {
          const apiUrl = 'http://127.0.0.1:5000/api/' + this.$route.params.id +'/delete/album';
          const response = await fetch(apiUrl, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              "title": this.title,
              "genre": this.genre
            }),
          });
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
          }
          const data = await response.json();
          console.log('Fetched data:', data);
          alert('login success!');
          this.$router.push('/creator/dashboard');
        } catch (error) {
          console.error('Fetch error:', error);
          // Optionally, notify the user or perform other error-handling actions
        }
        console.log('Save album clicked with title:', this.title, 'and genre:', this.genre);
      },
      confirmDelete() {
        // Display a confirmation dialog before deleting
        if (confirm('Are you sure?')) {
          this.deleteAlbum();
        }
      },
    },
    mounted() {
      this.fetchData()
    }
  });
  export default EditAlbumView