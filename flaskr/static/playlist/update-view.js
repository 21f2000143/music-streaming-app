const EditPlaylistView = Vue.component('editplaylistview', {
    template: `
      <section class="content">
        <header>
        <h1>Edit "{{ title }}"</h1>
        </header>
        
        <form @submit.prevent="saveChanges">
          <label for="title">Title</label>
          <input v-model="title" id="title" required>
          <input type="submit" value="Save">
        </form>
  
        <hr>
  
        <form @submit.prevent="deletePlaylist">
          <input class="danger" type="submit" value="Delete" onclick="confirm('are you sure?')">
        </form>
      </section>
    `,
    data() {
      return {
        title: "", // Assuming playlist is available in the component data
      };
    },
    created() {
      // Fetch the playlist data, e.g., using an API call
      this.fetchPlaylistData();
    },
    methods: {
      deletePlaylist() {
        const apiUrl = 'http://127.0.0.1:5000/api/'+this.$route.params.id+'/delete/playlist';
  
        fetch(apiUrl, {
          method:"DELETE",
          headers: {"Content-Type": "Application/json"}
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json(); // Parse JSON
          })
          .then(data => {
            alert(data['message'])
            this.goBack()
          })
          .catch(error => {
            // Handle errors
            console.error('Fetch error:', error);
          });
      },
      fetchPlaylistData() {
        
        const apiUrl = 'http://127.0.0.1:5000/api/'+this.$route.params.id+'/update/playlist';
  
        fetch(apiUrl, {
          method:"GET",
          headers: {"Content-Type": "Application/json"}
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
            // Do something with the data,  
            this.title = data['title']
            console.log(data['title'])
          })
          .catch(error => {
            // Handle errors
            console.error('Fetch error:', error);
            // Optionally, notify the user or perform other error-handling actions
          });
      },
      saveChanges() {
        
        const apiUrl = 'http://127.0.0.1:5000/api/'+this.$route.params.id+'/update/playlist';
  
        fetch(apiUrl, {
          method:"POST",
          headers: {"Content-Type": "Application/json"},
          body: JSON.stringify({
            'title':this.title
          })
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
            // Do something with the data,  
            alert("updated playlist")
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
    },
  });
  export default EditPlaylistView