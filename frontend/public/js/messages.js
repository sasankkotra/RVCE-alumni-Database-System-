// Messages page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    loadInbox();
    loadSent();
    
    document.getElementById('composeForm').addEventListener('submit', sendMessage);
});

async function loadInbox() {
    try {
        const response = await fetch('/api/messages/inbox');
        const data = await response.json();
        
        const container = document.getElementById('inboxContainer');
        
        if (data.success && data.messages.length > 0) {
            let html = '<div class="list-group">';
            data.messages.forEach(msg => {
                const readClass = msg.read_status ? '' : 'fw-bold';
                html += `
                    <div class="list-group-item ${readClass}">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <h6 class="mb-1">${msg.subject}</h6>
                                <p class="mb-1 text-muted">From: ${msg.sender_name}</p>
                                <p class="mb-0">${msg.body.substring(0, 100)}...</p>
                            </div>
                            <div>
                                <small class="text-muted">${formatDateTime(msg.sent_at)}</small>
                                ${!msg.read_status ? '<span class="badge badge-gold ms-2">New</span>' : ''}
                            </div>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p class="text-muted">No messages in inbox</p>';
        }
    } catch (error) {
        console.error('Load inbox error:', error);
    }
}

async function loadSent() {
    try {
        const response = await fetch('/api/messages/sent');
        const data = await response.json();
        
        const container = document.getElementById('sentContainer');
        
        if (data.success && data.messages.length > 0) {
            let html = '<div class="list-group">';
            data.messages.forEach(msg => {
                html += `
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <h6 class="mb-1">${msg.subject}</h6>
                                <p class="mb-1 text-muted">To: ${msg.receiver_name}</p>
                                <p class="mb-0">${msg.body.substring(0, 100)}...</p>
                            </div>
                            <small class="text-muted">${formatDateTime(msg.sent_at)}</small>
                        </div>
                    </div>
                `;
            });
            html += '</div>';
            container.innerHTML = html;
        } else {
            container.innerHTML = '<p class="text-muted">No sent messages</p>';
        }
    } catch (error) {
        console.error('Load sent error:', error);
    }
}

async function sendMessage(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        receiver_id: parseInt(formData.get('receiver_id')),
        subject: formData.get('subject'),
        body: formData.get('body')
    };
    
    try {
        const response = await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            bootstrap.Modal.getInstance(document.getElementById('composeModal')).hide();
            e.target.reset();
            alert('Message sent successfully!');
            loadSent();
        } else {
            alert(result.message || 'Failed to send message');
        }
    } catch (error) {
        console.error('Send message error:', error);
        alert('Network error');
    }
}
