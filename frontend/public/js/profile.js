// Profile page JavaScript
document.addEventListener('DOMContentLoaded', () => {
    loadProfile();
    
    document.getElementById('profileForm').addEventListener('submit', updateProfile);
});

async function loadProfile() {
    try {
        const userResponse = await fetch('/api/auth/me');
        const userData = await userResponse.json();
        
        if (!userData.success) {
            window.location.href = '/login';
            return;
        }
        
        const userId = userData.user.id;
        
        const response = await fetch(`/api/alumni/profile/${userId}`);
        const data = await response.json();
        
        if (data.success) {
            const alumni = data.alumni;
            
            // Fill form
            document.getElementById('name').value = alumni.name || '';
            document.getElementById('email').value = alumni.email || '';
            document.getElementById('company').value = alumni.company || '';
            document.getElementById('field').value = alumni.field || '';
            document.getElementById('phone').value = alumni.phone || '';
            document.getElementById('linkedin_url').value = alumni.linkedin_url || '';
            document.getElementById('github_url').value = alumni.github_url || '';
            document.getElementById('city').value = alumni.city || '';
            document.getElementById('state').value = alumni.state || '';
            document.getElementById('country').value = alumni.country || '';
            
            // Fill profile info
            document.getElementById('profileId').textContent = alumni.alumni_id || 'N/A';
            document.getElementById('profileBranch').textContent = alumni.branch;
            document.getElementById('profileYear').textContent = alumni.graduation_year;
            document.getElementById('profileVerified').textContent = alumni.verified ? 
                '✓ Verified' : '✗ Not Verified';
            document.getElementById('profileVerified').className = alumni.verified ? 
                'badge bg-success' : 'badge bg-warning';
        }
    } catch (error) {
        console.error('Load profile error:', error);
        alert('Failed to load profile');
    }
}

async function updateProfile(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    try {
        const response = await fetch('/api/alumni/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if (result.success) {
            alert('Profile updated successfully!');
            loadProfile();
        } else {
            alert(result.message || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Update profile error:', error);
        alert('Network error. Please try again.');
    }
}
