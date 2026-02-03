// Mentorship page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    searchMentors(); // Auto-load mentors on page load
    loadSentRequests();
    loadReceivedRequests();
});

async function searchMentors() {
    const branch = document.getElementById('mentorBranch').value;
    const field = document.getElementById('mentorField').value;
    const container = document.getElementById('mentorsContainer');
    
    // Show loading
    container.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-maroon"></div><p class="mt-2">Loading mentors...</p></div>';
    
    let url = '/api/mentorship/mentors?';
    if (branch) url += `branch=${branch}&`;
    if (field) url += `field=${field}&`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success && data.mentors && data.mentors.length > 0) {
            let html = '<div class="row">';
            data.mentors.forEach(mentor => {
                html += `
                    <div class="col-md-6 mb-3">
                        <div class="content-card h-100">
                            <div class="d-flex justify-content-between align-items-start mb-3">
                                <div class="flex-grow-1">
                                    <h5 class="mb-2" style="font-weight: 600; color: #212529;">${mentor.name}</h5>
                                    <p class="mb-1" style="font-weight: 500; color: #495057;">
                                        <i class="fas fa-graduation-cap me-2 text-maroon"></i>
                                        ${mentor.branch} '${String(mentor.graduation_year).slice(-2)}
                                    </p>
                                    ${mentor.company ? `
                                        <p class="mb-1" style="font-weight: 500; color: #212529;">
                                            <i class="fas fa-building me-2 text-gold"></i>
                                            ${mentor.company}
                                        </p>
                                    ` : ''}
                                    ${mentor.field ? `
                                        <p class="mb-1" style="font-weight: 500; color: #495057;">
                                            <i class="fas fa-code me-2"></i>
                                            ${mentor.field}
                                        </p>
                                    ` : ''}
                                    ${mentor.city ? `
                                        <p class="mb-0" style="font-weight: 500; color: #495057;">
                                            <i class="fas fa-map-marker-alt me-2"></i>
                                            ${mentor.city}${mentor.country ? ', ' + mentor.country : ''}
                                        </p>
                                    ` : ''}
                                </div>
                            </div>
                            <button class="btn btn-rvce-maroon w-100" onclick="requestMentorship(${mentor.alumni_id})">
                                <i class="fas fa-paper-plane me-2"></i>Request Mentorship
                            </button>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-user-friends fa-3x text-muted mb-3"></i>
                    <p class="text-muted">No mentors found. Try adjusting your filters.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Search mentors error:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Error loading mentors. Please try again.
            </div>
        `;
    }
}

async function requestMentorship(mentorId) {
    try {
        const response = await fetch('/api/mentorship/request', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mentor_id: mentorId })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Mentorship request sent successfully!');
            loadSentRequests();
        } else {
            alert(data.message || 'Failed to send request');
        }
    } catch (error) {
        console.error('Request mentorship error:', error);
        alert('Network error');
    }
}

async function loadSentRequests() {
    const container = document.getElementById('sentRequestsContainer');
    container.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-maroon"></div><p class="mt-2">Loading requests...</p></div>';
    
    try {
        const response = await fetch('/api/mentorship/requests/sent');
        const data = await response.json();
        
        if (data.success && data.requests && data.requests.length > 0) {
            let html = '<div class="row">';
            data.requests.forEach(req => {
                const statusClass = req.status === 'accepted' ? 'success' : 
                                  req.status === 'rejected' ? 'danger' : 'warning';
                const statusIcon = req.status === 'accepted' ? 'check-circle' : 
                                 req.status === 'rejected' ? 'times-circle' : 'clock';
                html += `
                    <div class="col-md-6 mb-3">
                        <div class="content-card h-100">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="mb-0" style="font-weight: 600; color: #212529;">${req.mentor_name}</h5>
                                <span class="badge bg-${statusClass}">
                                    <i class="fas fa-${statusIcon} me-1"></i>${req.status.toUpperCase()}
                                </span>
                            </div>
                            ${req.company ? `<p class="mb-1" style="font-weight: 500; color: #212529;"><i class="fas fa-building me-2 text-gold"></i>${req.company}</p>` : ''}
                            ${req.field ? `<p class="mb-1" style="font-weight: 500; color: #495057;"><i class="fas fa-code me-2"></i>${req.field}</p>` : ''}
                            <p class="mb-1" style="font-weight: 500; color: #6c757d; font-size: 0.9rem;">
                                <i class="fas fa-calendar me-1"></i>
                                Requested: ${formatDate(req.requested_at)}
                            </p>
                            ${req.status === 'accepted' ? `
                                <div class="alert alert-success mt-2 mb-0" style="padding: 8px;">
                                    <strong style="font-weight: 600;"><i class="fas fa-check-circle me-1"></i>Connection Established!</strong><br>
                                    ${req.mentor_email ? `<small style="font-weight: 500;"><i class="fas fa-envelope me-1"></i>${req.mentor_email}</small><br>` : ''}
                                    ${req.mentor_phone ? `<small style="font-weight: 500;"><i class="fas fa-phone me-1"></i>${req.mentor_phone}</small>` : ''}
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-paper-plane fa-3x text-muted mb-3"></i>
                    <p class="text-muted">No mentorship requests sent yet.</p>
                    <p class="text-muted small">Go to "Find Mentors" tab to send requests.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Load sent requests error:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Error loading requests. Please try again.
            </div>
        `;
    }
}

async function loadReceivedRequests() {
    const container = document.getElementById('receivedRequestsContainer');
    container.innerHTML = '<div class="text-center py-4"><div class="spinner-border text-maroon"></div><p class="mt-2">Loading requests...</p></div>';
    
    try {
        const response = await fetch('/api/mentorship/requests/received');
        const data = await response.json();
        
        if (data.success && data.requests && data.requests.length > 0) {
            let html = '<div class="row">';
            data.requests.forEach(req => {
                const statusClass = req.status === 'accepted' ? 'success' : 
                                  req.status === 'rejected' ? 'danger' : 'warning';
                const statusIcon = req.status === 'accepted' ? 'check-circle' : 
                                 req.status === 'rejected' ? 'times-circle' : 'clock';
                html += `
                    <div class="col-md-6 mb-3">
                        <div class="content-card h-100">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="mb-0" style="font-weight: 600; color: #212529;">${req.mentee_name}</h5>
                                <span class="badge bg-${statusClass}">
                                    <i class="fas fa-${statusIcon} me-1"></i>${req.status.toUpperCase()}
                                </span>
                            </div>
                            <p class="mb-1" style="font-weight: 500; color: #495057;">
                                <i class="fas fa-graduation-cap me-2 text-maroon"></i>
                                ${req.branch} '${String(req.graduation_year).slice(-2)}
                            </p>
                            ${req.company ? `<p class="mb-1" style="font-weight: 500; color: #212529;"><i class="fas fa-building me-2 text-gold"></i>${req.company}</p>` : ''}
                            <p class="mb-2" style="font-weight: 500; color: #6c757d; font-size: 0.9rem;">
                                <i class="fas fa-calendar me-1"></i>
                                Requested: ${formatDate(req.requested_at)}
                            </p>
                            ${req.status === 'pending' ? `
                                <div class="btn-group w-100 mt-2" role="group">
                                    <button class="btn btn-success" onclick="respondRequest(${req.mentorship_id}, 'accepted')">
                                        <i class="fas fa-check me-1"></i>Accept
                                    </button>
                                    <button class="btn btn-danger" onclick="respondRequest(${req.mentorship_id}, 'rejected')">
                                        <i class="fas fa-times me-1"></i>Reject
                                    </button>
                                </div>
                            ` : req.status === 'accepted' ? `
                                <div class="alert alert-success mt-2 mb-0" style="padding: 8px;">
                                    <strong style="font-weight: 600;"><i class="fas fa-check-circle me-1"></i>Connection Established!</strong><br>
                                    ${req.mentee_email ? `<small style="font-weight: 500;"><i class="fas fa-envelope me-1"></i>${req.mentee_email}</small><br>` : ''}
                                    ${req.mentee_phone ? `<small style="font-weight: 500;"><i class="fas fa-phone me-1"></i>${req.mentee_phone}</small>` : ''}
                                </div>
                            ` : `
                                <p class="mb-0" style="font-weight: 500; color: #6c757d; font-size: 0.9rem;">
                                    <i class="fas fa-info-circle me-1"></i>
                                    You ${req.status} this request
                                </p>
                            `}
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-inbox fa-3x text-muted mb-3"></i>
                    <p class="text-muted">No mentorship requests received yet.</p>
                    <p class="text-muted small">Other alumni can request mentorship from you.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Load received requests error:', error);
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-triangle me-2"></i>
                Error loading requests. Please try again.
            </div>
        `;
    }
}

async function respondRequest(mentorshipId, status) {
    try {
        const response = await fetch(`/api/mentorship/${mentorshipId}/respond`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`Request ${status}!`);
            loadReceivedRequests();
        } else {
            alert(data.message || 'Failed to respond');
        }
    } catch (error) {
        console.error('Respond request error:', error);
    }
}
