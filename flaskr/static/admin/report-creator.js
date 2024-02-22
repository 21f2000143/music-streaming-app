const ReportCreatorView = Vue.component('reportcreatorview', {
    template: `
      <div>
        <h1>{{ title }}</h1>
        <form @submit.prevent="submitReport" :action="'/report/creator/' + id">
          <label for="username">Username</label>
          <input v-model="username" id="username" required>
          <textarea v-model="reason" id="reason"></textarea>
          <button type="submit">Submit</button>
        </form>
      </div>
    `,
    data() {
      return {
        title: 'Report Creator',
        id: null, // Initialize id with appropriate value
        username: '',
        reason: '',
      };
    },
    methods: {
      submitReport() {
        // Implement report submission logic using this.id, this.username, and this.reason
        console.log('Submitting report...', this.id, this.username, this.reason);
      },
    },
  });
  export default ReportCreatorView