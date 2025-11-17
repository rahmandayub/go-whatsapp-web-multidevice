export default {
    name: 'AppLogout',
    inject: ['getCurrentSession'],
    data() {
        return {
            session_id: '',
        }
    },
    methods: {
        openModal() {
            // Pre-fill with current session
            this.session_id = this.getCurrentSession();
            $('#modalLogout').modal({
                onApprove: () => {
                    this.handleSubmit();
                    return false;
                }
            }).modal('show');
        },
        async handleSubmit() {
            try {
                await this.submitApi()
                showSuccessInfo(`Logout success for session: ${this.session_id || 'default'}`)

                // fetch devices
                this.$emit('reload-devices')
                $('#modalLogout').modal('hide');
            } catch (err) {
                showErrorInfo(err)
            }
        },

        async submitApi() {
            try {
                const sessionParam = this.session_id || this.getCurrentSession();
                const params = sessionParam && sessionParam !== 'default' ? { session: sessionParam } : {};
                await http.get(`app/logout`, { params })
            } catch (error) {
                if (error.response) {
                    throw Error(error.response.data.message)
                }
                throw Error(error.message)
            }

        }
    },
    template: `
    <div class="green card" @click="openModal" style="cursor: pointer">
        <div class="content">
            <a class="ui teal right ribbon label">App</a>
            <div class="header">Logout</div>
            <div class="description">
                Remove your login session in application
            </div>
        </div>
    </div>

    <!--  Modal Logout  -->
    <div class="ui small modal" id="modalLogout">
        <i class="close icon"></i>
        <div class="header">
            Logout WhatsApp Session
        </div>
        <div class="content">
            <div class="ui form">
                <div class="field">
                    <label>Session ID</label>
                    <input v-model="session_id" type="text"
                           placeholder="Enter session ID to logout"
                           aria-label="session_id">
                    <small>Leave empty for default session. Current session: {{ getCurrentSession() }}</small>
                </div>
            </div>
            <div class="ui warning message">
                <div class="header">Warning</div>
                <p>This will logout the specified WhatsApp session. Make sure you want to logout from this session.</p>
            </div>
        </div>
        <div class="actions">
            <div class="ui cancel button">
                Cancel
            </div>
            <div class="ui negative button" @click="handleSubmit">
                <i class="sign out icon"></i>
                Logout
            </div>
        </div>
    </div>
    `
}