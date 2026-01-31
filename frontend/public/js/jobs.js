// Jobs page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    loadJobs();
    
    const postJobForm = document.getElementById('postJobForm');
    if (postJobForm) {
        postJobForm.addEventListener('submit', handlePostJob);
    }
});

async function loadJobs() {
    const company = document.getElementById('filterCompany')?.value || '';
    const location = document.getElementById('filterLocation')?.value || '';
    const branch = document.getElementById('filterBranch')?.value || '';
    
    let url = '/api/jobs?';
    if (company) url += `company=${company}&`;
    if (location) url += `location=${location}&`;
    if (branch) url += `branch=${branch}&`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        const container = document.getElementById('jobsContainer');
        
        if (data.success && data.jobs.length > 0) {
            let html = '';
            data.jobs.forEach(job => {
                const statusBadge = job.status === 'active' ? 
                    '<span class="badge badge-gold">Active</span>' : 
                    '<span class="badge bg-secondary">Closed</span>';
                    
                html += `
                    <div class="job-card">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <h5 class="mb-2">${job.title} ${statusBadge}</h5>
                                <p class="mb-1"><i class="fas fa-building me-2"></i><strong>${job.company}</strong></p>
                                <p class="mb-1 text-muted"><i class="fas fa-map-marker-alt me-2"></i>${job.location}</p>
                                ${job.required_branch ? `<p class="mb-1 text-muted"><i class="fas fa-graduation-cap me-2"></i>${job.required_branch}</p>` : ''}
                                ${job.required_field ? `<p class="mb-1 text-muted"><i class="fas fa-briefcase me-2"></i>${job.required_field}</p>` : ''}
                            </div>
                        </div>
                        <p class="mt-3">${job.description || 'No description provided'}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">Posted by ${job.posted_by_name} on ${formatDate(job.created_at)}</small>
                            ${job.poster_email ? `<small class="text-muted"><i class="fas fa-envelope me-1"></i>${job.poster_email}</small>` : ''}
                        </div>
                    </div>
                `;
            });
            container.innerHTML = html;
        } else {
            container.innerHTML = '<div class="alert alert-info">No jobs found. Try different filters.</div>';
        }
    } catch (error) {
        console.error('Load jobs error:', error);
        document.getElementById('jobsContainer').innerHTML = 
            '<div class="alert alert-danger">Failed to load jobs</div>';
    }
}

async function handlePostJob(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch('/api/jobs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            bootstrap.Modal.getInstance(document.getElementById('postJobModal')).hide();
            e.target.reset();
            showAlert('alert-container', 'success', 'Job posted successfully!');
            loadJobs();
        } else {
            alert(result.message || 'Failed to post job');
        }
    } catch (error) {
        console.error('Post job error:', error);
        alert('Network error. Please try again.');
    }
}
