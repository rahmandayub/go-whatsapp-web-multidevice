export default {
    name: 'AppReconnect',
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
            $('#modalReconnect').modal({
                onApprove: () => {
                    this.handleSubmit();
                    return false;
                }
            }).modal('show');
        },
        async handleSubmit() {
            try {
                await this.submitApi()
                showSuccessInfo(`Reconnect success for session: ${this.session_id || 'default'}`)

                // fetch devices
                this.$emit('reload-devices')
                $('#modalReconnect').modal('hide');
            } catch (err) {
                showErrorInfo(err)
            }
        },
        async submitApi() {
            try {
                const sessionParam = this.session_id || this.getCurrentSession();
                const params = sessionParam && sessionParam !== 'default' ? { session: sessionParam } : {};
                await window.http.get(`/app/reconnect`, { params })
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
            <div class="header">Reconnect</div>
            <div class="description">
                Please reconnect to the WhatsApp service if your API doesn't work or if your app is down.
            </div>
        </div>
    </div>

    <!--  Modal Reconnect  -->
    <div class="ui small modal" id="modalReconnect">
        <i class="close icon"></i>
        <div class="header">
            Reconnect WhatsApp Session
        </div>
        <div class="content">
            <div class="ui form">
                <div class="field">
                    <label>Session ID</label>
                    <input v-model="session_id" type="text"
                           placeholder="Enter session ID to reconnect"
                           aria-label="session_id">
                    <small>Leave empty for default session. Current session: {{ getCurrentSession() }}</small>
                </div>
            </div>
            <div class="ui info message">
                <div class="header">Reconnect Information</div>
                <p>This will attempt to reconnect the specified WhatsApp session to the service.</p>
            </div>
        </div>
        <div class="actions">
            <div class="ui cancel button">
                Cancel
            </div>
            <div class="ui positive button" @click="handleSubmit">
                <i class="sync icon"></i>
                Reconnect
            </div>
        </div>
    </div>
    `
}