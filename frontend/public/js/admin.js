// Admin page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    loadPendingVerifications();
    loadAllAlumni();
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
            let html = `<p class="mb-3">Total Alumni: ${data.count}</p><div class="table-responsive"><table class="table"><thead><tr><th>Name</th><th>Email</th><th>Branch</th><th>Company</th><th>Status</th></tr></thead><tbody>`;
            data.alumni.forEach(alumni => {
                const status = alumni.verified ? 
                    '<span class="badge bg-success">Verified</span>' : 
                    '<span class="badge bg-warning">Pending</span>';
                html += `
                    <tr>
                        <td>${alumni.name}</td>
                        <td>${alumni.email}</td>
                        <td>${alumni.branch}</td>
                        <td>${alumni.company || 'N/A'}</td>
                        <td>${status}</td>
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
                        <h6>${event.name}</h6>
                        <p class="mb-1">${formatDate(event.event_date)} - ${event.location}</p>
                        <p class="mb-1">${event.participants_count} participants</p>
                    </div>
                `;
            });
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p class="text-muted">No events</p>';
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

async function loadReports() {
    try {
        const response = await fetch('/api/admin/reports/queries');
        const data = await response.json();
        
        const container = document.getElementById('reportsContainer');
        
        if (data.success) {
            let html = '<div class="row">';
            
            // Alumni by branch
            html += '<div class="col-md-6 mb-4"><div class="content-card"><h6>Alumni by Branch</h6>';
            html += '<div class="table-responsive"><table class="table table-sm"><thead><tr><th>Branch</th><th>Count</th></tr></thead><tbody>';
            data.reports.alumni_by_branch.forEach(row => {
                html += `<tr><td>${row.branch}</td><td>${row.count}</td></tr>`;
            });
            html += '</tbody></table></div></div></div>';
            
            // Mentorship stats
            html += '<div class="col-md-6 mb-4"><div class="content-card"><h6>Mentorship Statistics</h6>';
            html += '<div class="table-responsive"><table class="table table-sm"><thead><tr><th>Status</th><th>Count</th></tr></thead><tbody>';
            data.reports.mentorship_stats.forEach(row => {
                html += `<tr><td>${row.status}</td><td>${row.count}</td></tr>`;
            });
            html += '</tbody></table></div></div></div>';
            
            html += '</div>';
            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Load reports error:', error);
    }
}
