// Events page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
});

async function loadEvents() {
    try {
        const response = await fetch('/api/events');
        const data = await response.json();
        
        const container = document.getElementById('eventsContainer');
        
        if (data.success && data.events.length > 0) {
            let html = '';
            data.events.forEach(event => {
                const eventDate = new Date(event.event_date);
                const isUpcoming = eventDate >= new Date();
                const statusBadge = isUpcoming ? 
                    '<span class="badge badge-gold">Upcoming</span>' : 
                    '<span class="badge bg-secondary">Past</span>';
                    
                html += `
                    <div class="event-card">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <h5 class="mb-2">${event.name} ${statusBadge}</h5>
                                <p class="mb-1"><i class="fas fa-calendar me-2"></i>${formatDate(event.event_date)}</p>
                                <p class="mb-1"><i class="fas fa-map-marker-alt me-2"></i>${event.location}</p>
                                ${event.description ? `<p class="mt-2 text-muted">${event.description}</p>` : ''}
                                <p class="mb-0 mt-2">
                                    <i class="fas fa-users me-2"></i>${event.participants_count} participants
                                    <button class="btn btn-sm btn-outline-primary ms-2" onclick="viewParticipants(${event.event_id})">
                                        <i class="fas fa-eye me-1"></i>View
                                    </button>
                                </p>
                            </div>
                            <div>
                                ${isUpcoming ? `<button class="btn btn-sm btn-rvce-maroon" onclick="registerEvent(${event.event_id})">
                                    <i class="fas fa-check me-2"></i>Register
                                </button>` : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="alert alert-info">No events available</div>';
        }
    } catch (error) {
        console.error('Load events error:', error);
        document.getElementById('eventsContainer').innerHTML = 
            '<div class="alert alert-danger">Failed to load events</div>';
    }
}

async function registerEvent(eventId) {
    try {
        const response = await fetch(`/api/events/${eventId}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Successfully registered for event!');
            loadEvents();
        } else {
            alert(data.message || 'Failed to register');
        }
    } catch (error) {
        console.error('Register event error:', error);
        alert('Network error. Please try again.');
    }
}

async function createEvent() {
    try {
        const name = document.getElementById('eventName').value.trim();
        const description = document.getElementById('eventDescription').value.trim();
        const eventDate = document.getElementById('eventDate').value;
        const location = document.getElementById('eventLocation').value.trim();
        
        if (!name || !eventDate || !location) {
            alert('Please fill in all required fields');
            return;
        }
        
        const response = await fetch('/api/events', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, description, event_date: eventDate, location })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('Event created successfully!');
            document.getElementById('createEventForm').reset();
            bootstrap.Modal.getInstance(document.getElementById('createEventModal')).hide();
            loadEvents();
        } else {
            alert(data.message || 'Failed to create event');
        }
    } catch (error) {
        console.error('Create event error:', error);
        alert('Network error. Please try again.');
    }
}

async function viewParticipants(eventId) {
    try {
        const response = await fetch(`/api/events/${eventId}/participants`);
        const data = await response.json();
        
        if (data.success) {
            const participantsList = document.getElementById('participantsList');
            
            if (data.participants.length === 0) {
                participantsList.innerHTML = '<p class="text-muted text-center">No participants yet</p>';
            } else {
                participantsList.innerHTML = data.participants.map(p => `
                    <div class="card mb-3">
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-6">
                                    <h6 class="mb-2"><i class="fas fa-user me-2"></i>${p.name}</h6>
                                    <p class="mb-1 small text-muted">
                                        <i class="fas fa-graduation-cap me-2"></i>${p.branch} - Class of ${p.graduation_year}
                                    </p>
                                    ${p.company ? `<p class="mb-1 small text-muted"><i class="fas fa-briefcase me-2"></i>${p.company}</p>` : ''}
                                </div>
                                <div class="col-md-6">
                                    <p class="mb-1 small"><i class="fas fa-envelope me-2 text-gold"></i>${p.email}</p>
                                    ${p.phone ? `<p class="mb-1 small"><i class="fas fa-phone me-2 text-gold"></i>${p.phone}</p>` : ''}
                                    <p class="mb-0 small text-muted"><i class="fas fa-clock me-2"></i>Registered: ${new Date(p.registered_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
            
            new bootstrap.Modal(document.getElementById('participantsModal')).show();
        } else {
            alert(data.message || 'Failed to load participants');
        }
    } catch (error) {
        console.error('View participants error:', error);
        alert('Network error. Please try again.');
    }
}
