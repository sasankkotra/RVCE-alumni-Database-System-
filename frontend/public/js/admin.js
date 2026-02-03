// Admin page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    loadPendingVerifications();
    loadAllAlumni();
    loadAllJobs();
    loadAllEvents();
    loadReports();
    
    document.getElementById('createEventForm')?.addEventListener('submit', createEvent);
});

async function loadPendingVerifications() {
    try {
        const response = await fetch('/api/admin/alumni?verified=false');
        const data = await response.json();
        
        const container = document.getElementById('verificationsContainer');
        
        if (data.success && data.alumni.length > 0) {
            let html = '<div class="table-responsive"><table class="table"><thead><tr><th>Name</th><th>Email</th><th>Branch</th><th>Year</th><th>Action</th></tr></thead><tbody>';
            data.alumni.forEach(alumni => {
                html += `
                    <tr>
                        <td>${alumni.name}</td>
                        <td>${alumni.email}</td>
                        <td>${alumni.branch}</td>
                        <td>${alumni.graduation_year}</td>
                        <td>
                            <button class="btn btn-sm btn-success" onclick="verifyAlumni(${alumni.alumni_id}, true)">Verify</button>
                        </td>
                    </tr>
                `;
            });
            html += '</tbody></table></div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p class="text-muted">No pending verifications</p>';
        }
    } catch (error) {
        console.error('Load verifications error:', error);
    }
}

async function verifyAlumni(alumniId, verified) {
    try {
        const response = await fetch(`/api/admin/alumni/${alumniId}/verify`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ verified })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Alumni verified successfully!');
            loadPendingVerifications();
            loadAllAlumni();
        } else {
            alert(data.message || 'Failed to verify');
        }
    } catch (error) {
        console.error('Verify alumni error:', error);
    }
}

async function loadAllAlumni() {
    try {
        const response = await fetch('/api/admin/alumni');
        const data = await response.json();
        
        const container = document.getElementById('alumniContainer');
        
        if (data.success && data.alumni.length > 0) {
            let html = `<p class="mb-3" style="font-weight: 600; font-size: 1.1rem; color: #212529;">Total Alumni: ${data.count}</p><div class="table-responsive"><table class="table"><thead><tr><th>Name</th><th>Email</th><th>Branch</th><th>Company</th><th>Status</th><th>Actions</th></tr></thead><tbody>`;
            data.alumni.forEach(alumni => {
                const status = alumni.verified ? 
                    '<span class="badge bg-success">Verified</span>' : 
                    '<span class="badge bg-warning">Pending</span>';
                html += `
                    <tr>
                        <td style="font-weight: 500; color: #212529;">${alumni.name}</td>
                        <td style="color: #495057;">${alumni.email}</td>
                        <td style="font-weight: 500; color: #212529;">${alumni.branch}</td>
                        <td style="color: #495057;">${alumni.company || 'N/A'}</td>
                        <td>${status}</td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="deleteAlumni(${alumni.alumni_id}, '${alumni.name}')">
                                <i class="fas fa-trash me-1"></i>Delete
                            </button>
                        </td>
                    </tr>
                `;
            });
            html += '</tbody></table></div>';
            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Load alumni error:', error);
    }
}

async function loadAllEvents() {
    try {
        const response = await fetch('/api/events');
        const data = await response.json();
        
        const container = document.getElementById('eventsContainer');
        
        if (data.success && data.events.length > 0) {
            let html = '';
            data.events.forEach(event => {
                html += `
                    <div class="content-card mb-3">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <h5 style="font-weight: 600; color: #212529; margin-bottom: 0.5rem;">${event.name}</h5>
                                <p class="mb-1" style="font-weight: 500; color: #495057;"><i class="fas fa-calendar me-2"></i>${formatDate(event.event_date)}</p>
                                <p class="mb-1" style="font-weight: 500; color: #495057;"><i class="fas fa-map-marker-alt me-2"></i>${event.location}</p>
                                <p class="mb-0" style="font-weight: 500; color: #495057;"><i class="fas fa-users me-2"></i>${event.participants_count} participants</p>
                            </div>
                            <button class="btn btn-danger btn-sm" onclick="deleteEvent(${event.event_id}, '${event.name}')">
                                <i class="fas fa-trash me-1"></i>Delete
                            </button>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p style="font-weight: 500; color: #6c757d; font-size: 1rem;">No events</p>';
        }
    } catch (error) {
        console.error('Load events error:', error);
    }
}

async function createEvent(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch('/api/admin/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            bootstrap.Modal.getInstance(document.getElementById('createEventModal')).hide();
            e.target.reset();
            alert('Event created successfully!');
            loadAllEvents();
        } else {
            alert(result.message || 'Failed to create event');
        }
    } catch (error) {
        console.error('Create event error:', error);
    }
}

async function loadAllJobs() {
    try {
        const response = await fetch('/api/admin/jobs');
        const data = await response.json();
        
        const container = document.getElementById('jobsContainer');
        
        if (data.success && data.jobs.length > 0) {
            let html = `<p class="mb-3" style="font-weight: 600; font-size: 1.1rem; color: #212529;">Total Jobs: ${data.count}</p><div class="table-responsive"><table class="table"><thead><tr><th>Title</th><th>Company</th><th>Location</th><th>Posted By</th><th>Status</th><th>Actions</th></tr></thead><tbody>`;
            data.jobs.forEach(job => {
                const statusBadge = job.status === 'active' ? 
                    '<span class="badge bg-success">Active</span>' : 
                    '<span class="badge bg-secondary">Closed</span>';
                html += `
                    <tr>
                        <td style="font-weight: 500; color: #212529;">${job.title}</td>
                        <td style="font-weight: 500; color: #212529;">${job.company}</td>
                        <td style="color: #495057;">${job.location}</td>
                        <td style="color: #495057;">${job.posted_by_name}</td>
                        <td>${statusBadge}</td>
                        <td>
                            <button class="btn btn-sm btn-danger" onclick="deleteJob(${job.job_id}, '${job.title}')">
                                <i class="fas fa-trash me-1"></i>Delete
                            </button>
                        </td>
                    </tr>
                `;
            });
            html += '</tbody></table></div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p style="font-weight: 500; color: #6c757d; font-size: 1rem;">No jobs</p>';
        }
    } catch (error) {
        console.error('Load jobs error:', error);
    }
}

async function deleteAlumni(alumniId, name) {
    if (!confirm(`Are you sure you want to delete alumni "${name}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/alumni/${alumniId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Alumni deleted successfully!');
            loadAllAlumni();
            loadPendingVerifications();
        } else {
            alert(data.message || 'Failed to delete alumni');
        }
    } catch (error) {
        console.error('Delete alumni error:', error);
        alert('Error deleting alumni');
    }
}

async function deleteJob(jobId, title) {
    if (!confirm(`Are you sure you want to delete job "${title}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/jobs/${jobId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Job deleted successfully!');
            loadAllJobs();
        } else {
            alert(data.message || 'Failed to delete job');
        }
    } catch (error) {
        console.error('Delete job error:', error);
        alert('Error deleting job');
    }
}

async function deleteEvent(eventId, name) {
    if (!confirm(`Are you sure you want to delete event "${name}"? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/events/${eventId}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Event deleted successfully!');
            loadAllEvents();
        } else {
            alert(data.message || 'Failed to delete event');
        }
    } catch (error) {
        console.error('Delete event error:', error);
        alert('Error deleting event');
    }
}

async function loadReports() {
    try {
        const response = await fetch('/api/admin/reports/queries');
        const data = await response.json();
        
        const container = document.getElementById('reportsContainer');
        
        if (data.success) {
            let html = '<div class="row">';
            
            // Alumni by branch
            html += '<div class="col-md-6 mb-4"><div class="content-card"><h5 style="font-weight: 600; color: #212529; margin-bottom: 1rem;">Alumni by Branch</h5>';
            html += '<div class="table-responsive"><table class="table table-sm"><thead><tr><th>Branch</th><th>Count</th></tr></thead><tbody>';
            data.reports.alumni_by_branch.forEach(row => {
                html += `<tr><td style="font-weight: 500; color: #212529;">${row.branch}</td><td style="font-weight: 500; color: #212529;">${row.count}</td></tr>`;
            });
            html += '</tbody></table></div></div></div>';
            
            // Mentorship stats
            html += '<div class="col-md-6 mb-4"><div class="content-card"><h5 style="font-weight: 600; color: #212529; margin-bottom: 1rem;">Mentorship Statistics</h5>';
            html += '<div class="table-responsive"><table class="table table-sm"><thead><tr><th>Status</th><th>Count</th></tr></thead><tbody>';
            data.reports.mentorship_stats.forEach(row => {
                html += `<tr><td style="font-weight: 500; color: #212529;">${row.status}</td><td style="font-weight: 500; color: #212529;">${row.count}</td></tr>`;
            });
            html += '</tbody></table></div></div></div>';
            
            html += '</div>';
            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Load reports error:', error);
    }
}
