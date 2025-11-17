export default {
    name: 'SessionSelector',
    data() {
        return {
            sessions: [],
            loading: false,
            refreshInterval: null,
        }
    },
    methods: {
        async loadSessions() {
            try {
                this.loading = true;
                const response = await window.http.get('/sessions');
                this.sessions = response.data.results.sessions || [];
            } catch (error) {
                console.error('Failed to load sessions:', error);
                showErrorInfo(error);
            } finally {
                this.loading = false;
            }
        },
        selectSession(sessionId) {
            this.$emit('session-changed', sessionId);
            showSuccessInfo(`Switched to session: ${sessionId}`);
        },
        async setDefault(sessionId) {
            try {
                await window.http.post(`/sessions/${sessionId}/set-default`);
                showSuccessInfo(`Set ${sessionId} as default session`);
                await this.loadSessions();
            } catch (error) {
                console.error('Failed to set default session:', error);
                showErrorInfo(error);
            }
        },
        async getStatus(sessionId) {
            try {
                const response = await window.http.get(`/sessions/${sessionId}/status`);
                return response.data.results;
            } catch (error) {
                console.error('Failed to get session status:', error);
                return null;
            }
        },
        getSessionClass(session) {
            if (session.is_default) return 'green';
            if (session.is_connected) return 'blue';
            return 'grey';
        },
        formatDeviceId(deviceId) {
            if (!deviceId) return 'Not logged in';
            // Shorten long device IDs
            if (deviceId.length > 30) {
                return deviceId.substring(0, 27) + '...';
            }
            return deviceId;
        }
    },
    mounted() {
        this.loadSessions();
        // Auto-refresh sessions every 10 seconds
        this.refreshInterval = setInterval(() => {
            this.loadSessions();
        }, 10000);
    },
    beforeUnmount() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    },
    template: `
    <div class="ui segment">
        <div class="ui top attached label">
            <i class="users icon"></i>
            WhatsApp Sessions
            <div class="ui right floated">
                <button class="ui mini icon button" @click="loadSessions" :class="{loading: loading}">
                    <i class="refresh icon"></i>
                </button>
            </div>
        </div>

        <div v-if="loading && sessions.length === 0" class="ui active centered inline loader"></div>

        <div v-else-if="sessions.length === 0" class="ui warning message">
            <div class="header">No Active Sessions</div>
            <p>Please login to create your first session.</p>
        </div>

        <div v-else class="ui cards" style="margin-top: 1em;">
            <div v-for="session in sessions"
                 :key="session.session_id"
                 class="card"
                 :class="getSessionClass(session)">
                <div class="content">
                    <div class="header">
                        <i class="mobile alternate icon"></i>
                        {{ session.session_id }}
                        <span v-if="session.is_default" class="ui mini green label" style="float: right;">
                            <i class="star icon"></i> Default
                        </span>
                    </div>
                    <div class="meta" style="margin-top: 0.5em;">
                        <span v-if="session.is_connected" class="ui mini green label">
                            <i class="circle icon"></i> Connected
                        </span>
                        <span v-else-if="session.is_logged_in" class="ui mini orange label">
                            <i class="circle outline icon"></i> Logged In (Disconnected)
                        </span>
                        <span v-else class="ui mini red label">
                            <i class="times circle icon"></i> Not Logged In
                        </span>
                    </div>
                    <div class="description" style="margin-top: 0.8em;">
                        <div class="ui list">
                            <div class="item">
                                <i class="phone icon"></i>
                                <div class="content">
                                    <div class="header" style="font-size: 0.9em;">Device ID</div>
                                    <div class="description" style="font-size: 0.85em; word-break: break-all;">
                                        {{ formatDeviceId(session.device_id) }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="extra content">
                    <div class="ui two buttons">
                        <button class="ui button"
                                @click="selectSession(session.session_id)"
                                :class="{primary: $parent.currentSession === session.session_id}">
                            <i class="hand pointer icon"></i>
                            {{ $parent.currentSession === session.session_id ? 'Selected' : 'Select' }}
                        </button>
                        <button class="ui button"
                                @click="setDefault(session.session_id)"
                                v-if="!session.is_default"
                                :disabled="!session.is_connected">
                            <i class="star icon"></i>
                            Set Default
                        </button>
                        <button class="ui button disabled" v-else>
                            <i class="star icon"></i>
                            Default
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `
}
