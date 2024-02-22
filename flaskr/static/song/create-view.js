const NewSongForm = Vue.component('newsongform', {
    template: `
    <section class="content">
      <header>
      <h1>New Song</h1>
      </header>       
      <form @submit.prevent="saveSong" enctype="multipart/form-data">
        <label for="title">Title</label>
        <input v-model="title" id="title" required>
        
        <label for="audio_file">Upload</label>
        <input type="file" ref="audioFileInput" @change="handleFileChange" id="audio_file" required>
        
        <label for="album">Choose an album:</label>
        <select v-model="selectedAlbum" id="album_id" required>
          <option v-for="album in albums" :key="album.album_id" :value="album.album_id">{{ album.title }}</option>
        </select>
        
        <label for="lyrics">Lyrics</label>
        <textarea v-model="lyrics" id="lyrics"></textarea>
        
        <input type="submit" value="Save">
      </form>
    </section>           
    `,
    data() {
      return {
        title: '',
        audioFile: null,
        selectedAlbum: '',
        lyrics: '',
        albums: [],
      };
    },
    methods: {
      handleFileChange(event) {
        this.audioFile = event.target.files[0];
      },
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
      async saveSong() {
        const formData = new FormData();
        formData.append('title', this.title);
        formData.append('audio_file', this.audioFile);
        formData.append('album_id', this.selectedAlbum);
        formData.append('lyrics', this.lyrics);
      
        try {
          // Any other error-prone code can go here
          console.log('Save song clicked with title:', this.title, 'and album:', this.selectedAlbum);
      
          // Fetch API call
          const response = await fetch('http://127.0.0.1:5000/api/add/song', {
            method: 'POST',
            body: formData,
          });
      
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
      
          const data = await response.json(); // Assuming your server returns JSON
      
          // Handle the successful response
          console.log('Success:', data);
          alert('Song added successfully!');
          this.$router.push('/creator/dashboard');
        } catch (error) {
          // Handle errors
          console.error('Error:', error);
          // Optionally, notify the user or perform other error-handling actions
        }
      }
      
    },
    mounted() {
      this.fetchData()
    },
  });
  export default NewSongForm