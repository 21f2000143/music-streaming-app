const ReportContentView = Vue.component('reportcontentview', {
    template: `
      <section class="content">
        <h1>{{ title }}</h1>
        <form @submit.prevent="submitReport">
          <label for="title">Title of song</label>
          <input v-model="songTitle" id="title" required>
          <textarea v-model="reason" id="reason"></textarea>
          <input type="submit">
        </form>
      </section>
    `,
    data() {
      return {
        title: 'Report Content',
        songTitle: '',
        reason: '',
      };
    },
    methods: {
      goBack() {
        this.$router.go(-1);
      },      
      async submitReport() {
        try {
          const response = await fetch('http://127.0.0.1:5000/api/report/content/'+this.$route.params.id, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              "title": this.songTitle,
              "reason": this.reason
            }),
          });
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
          }
          const data = await response.json();
          console.log('Fetched data:', data);
          alert(data.message);
          this.goBack();
        } catch (error) {
          console.error('Fetch error:', error);
          // Optionally, notify the user or perform other error-handling actions
        }
        console.log('Save album clicked with title:', this.title, 'and genre:', this.genre);
      },
    },
  });
export default ReportContentView
  