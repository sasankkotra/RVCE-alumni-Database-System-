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
                const messageId = `msg-${msg.message_id}`;
                const truncatedBody = msg.body.length > 150 ? msg.body.substring(0, 150) + '...' : msg.body;
                const needsExpand = msg.body.length > 150;
                
                html += `
                    <div class="list-group-item ${readClass}">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <h6 class="mb-1">${msg.subject}</h6>
                                <p class="mb-1 text-muted">From: ${msg.sender_name}</p>
                                <p class="mb-0" id="${messageId}-preview">${truncatedBody}</p>
                                <p class="mb-0" id="${messageId}-full" style="display: none; white-space: pre-wrap;">${msg.body}</p>
                                ${needsExpand ? `
                                    <button class="btn btn-link btn-sm p-0 mt-1" onclick="toggleMessage('${messageId}')">
                                        <span id="${messageId}-toggle">Show more</span>
                                    </button>
                                ` : ''}
                            </div>
                            <div>
                                <small class="text-muted">${formatDateTime(msg.sent_at)}</small>
                                ${!msg.read_status ? '<span class="badge bg-warning ms-2">New</span>' : ''}
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
                const messageId = `sent-${msg.message_id}`;
                const truncatedBody = msg.body.length > 150 ? msg.body.substring(0, 150) + '...' : msg.body;
                const needsExpand = msg.body.length > 150;
                
                html += `
                    <div class="list-group-item">
                        <div class="d-flex justify-content-between align-items-start">
                            <div class="flex-grow-1">
                                <h6 class="mb-1">${msg.subject}</h6>
                                <p class="mb-1 text-muted">To: ${msg.receiver_name}</p>
                                <p class="mb-0" id="${messageId}-preview">${truncatedBody}</p>
                                <p class="mb-0" id="${messageId}-full" style="display: none; white-space: pre-wrap;">${msg.body}</p>
                                ${needsExpand ? `
                                    <button class="btn btn-link btn-sm p-0 mt-1" onclick="toggleMessage('${messageId}')">
                                        <span id="${messageId}-toggle">Show more</span>
                                    </button>
                                ` : ''}
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

function toggleMessage(messageId) {
    const preview = document.getElementById(`${messageId}-preview`);
    const full = document.getElementById(`${messageId}-full`);
    const toggle = document.getElementById(`${messageId}-toggle`);
    
    if (full.style.display === 'none') {
        preview.style.display = 'none';
        full.style.display = 'block';
        toggle.textContent = 'Show less';
    } else {
        preview.style.display = 'block';
        full.style.display = 'none';
        toggle.textContent = 'Show more';
    }
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
        return 'Today ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
        return 'Yesterday ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days < 7) {
        return days + ' days ago';
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}
