// Dashboard JavaScript

document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
});

async function loadDashboard() {
    try {
        const userResponse = await fetch('/api/auth/me');
        const userData = await userResponse.json();
        
        if (!userData.success) {
            window.location.href = '/login';
            return;
        }
        
        const user = userData.user;
        
        if (user.role === 'admin') {
            await loadAdminDashboard();
        } else {
            await loadAlumniDashboard();
        }
    } catch (error) {
        console.error('Dashboard error:', error);
        showAlert('alert-container', 'danger', 'Failed to load dashboard');
    }
}

async function loadAdminDashboard() {
    try {
        const response = await fetch('/api/admin/dashboard');
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('stat-alumni').textContent = data.stats.verified_alumni;
            document.getElementById('stat-jobs').textContent = data.stats.active_jobs;
            document.getElementById('stat-events').textContent = data.stats.upcoming_events;
            document.getElementById('stat-messages').textContent = data.stats.pending_verifications;
            
            // Load pending verifications
            const pendingContainer = document.getElementById('pendingVerifications');
            if (data.recent_registrations.length === 0) {
                pendingContainer.innerHTML = '<p class="text-muted">No pending verifications</p>';
            } else {
                let html = '<div class="table-responsive"><table class="table"><thead><tr><th>Name</th><th>Email</th><th>Branch</th><th>Year</th><th>Status</th></tr></thead><tbody>';
                data.recent_registrations.slice(0, 5).forEach(alumni => {
                    const status = alumni.verified ? 
                        '<span class="badge bg-success">Verified</span>' : 
                        '<span class="badge bg-warning">Pending</span>';
                    html += `<tr>
                        <td>${alumni.name}</td>
                        <td>${alumni.email}</td>
                        <td>${alumni.branch}</td>
                        <td>${alumni.graduation_year}</td>
                        <td>${status}</td>
                    </tr>`;
                });
                html += '</tbody></table></div>';
                pendingContainer.innerHTML = html;
            }
        }
    } catch (error) {
        console.error('Admin dashboard error:', error);
    }
}

async function loadAlumniDashboard() {
    try {
        // Load stats
        const [jobsRes, eventsRes, messagesRes] = await Promise.all([
            fetch('/api/jobs'),
            fetch('/api/events'),
            fetch('/api/messages/unread/count')
        ]);
        
        const jobsData = await jobsRes.json();
        const eventsData = await eventsRes.json();
        const messagesData = await messagesRes.json();
        
        document.getElementById('stat-alumni').textContent = '1000+';
        document.getElementById('stat-jobs').textContent = jobsData.count || 0;
        document.getElementById('stat-events').textContent = eventsData.count || 0;
        document.getElementById('stat-messages').textContent = messagesData.unread_count || 0;
        
        // Load recent jobs
        if (jobsData.success && jobsData.jobs.length > 0) {
            let jobsHtml = '';
            jobsData.jobs.slice(0, 5).forEach(job => {
                jobsHtml += `
                    <div class="job-card">
                        <h6 class="mb-2">${job.title}</h6>
                        <p class="mb-1 text-muted"><i class="fas fa-building me-2"></i>${job.company}</p>
                        <p class="mb-1 text-muted"><i class="fas fa-map-marker-alt me-2"></i>${job.location}</p>
                        <small class="text-muted">Posted by ${job.posted_by_name}</small>
                        <a href="/jobs" class="btn btn-sm btn-outline-maroon float-end">View Details</a>
                    </div>
                `;
            });
            document.getElementById('recentJobs').innerHTML = jobsHtml;
        } else {
            document.getElementById('recentJobs').innerHTML = '<p class="text-muted">No jobs available</p>';
        }
        
        // Load upcoming events
        if (eventsData.success && eventsData.events.length > 0) {
            let eventsHtml = '';
            eventsData.events.slice(0, 3).forEach(event => {
                eventsHtml += `
                    <div class="event-card">
                        <h6 class="mb-2">${event.name}</h6>
                        <p class="mb-1 text-muted"><i class="fas fa-calendar me-2"></i>${formatDate(event.event_date)}</p>
                        <p class="mb-1 text-muted"><i class="fas fa-map-marker-alt me-2"></i>${event.location}</p>
                        <a href="/events" class="btn btn-sm btn-outline-maroon">View Details</a>
                    </div>
                `;
            });
            document.getElementById('upcomingEvents').innerHTML = eventsHtml;
        } else {
            document.getElementById('upcomingEvents').innerHTML = '<p class="text-muted">No upcoming events</p>';
        }
    } catch (error) {
        console.error('Alumni dashboard error:', error);
    }
}
