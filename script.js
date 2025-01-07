// Initialize local storage
if (!localStorage.getItem('jobs')) {
    localStorage.setItem('jobs', JSON.stringify([]));
}

if (!localStorage.getItem('pendingJobs')) {
    localStorage.setItem('pendingJobs', JSON.stringify([]));
}

if (!localStorage.getItem('applications')) {
    localStorage.setItem('applications', JSON.stringify([]));
}

// Function to display approved job listings
function displayJobs() {
    const jobListings = document.getElementById('job-listings');
    if (jobListings) {
        const jobs = JSON.parse(localStorage.getItem('jobs'));
        jobListings.innerHTML = jobs.map((job, index) => `
            <div class="job-listing">
                <h3>${job.title}</h3>
                <p><strong>Company:</strong> ${job.company}</p>
                <p>${job.description}</p>
                <a href="apply.html?id=${index}">Apply Now</a>
            </div>
        `).join('');
    }
}

// Function to handle job submission
function submitJob(event) {
    event.preventDefault();
    const title = document.getElementById('title').value;
    const company = document.getElementById('company').value;
    const description = document.getElementById('description').value;
    
    const pendingJobs = JSON.parse(localStorage.getItem('pendingJobs'));
    pendingJobs.push({ title, company, description });
    localStorage.setItem('pendingJobs', JSON.stringify(pendingJobs));
    
    alert('Job posting submitted for approval');
    event.target.reset();
}

// Function to display pending jobs in admin panel
function displayPendingJobs() {
    const pendingJobsDiv = document.getElementById('pending-jobs');
    if (pendingJobsDiv) {
        const pendingJobs = JSON.parse(localStorage.getItem('pendingJobs'));
        pendingJobsDiv.innerHTML = pendingJobs.map((job, index) => `
            <div class="pending-job">
                <h3>${job.title}</h3>
                <p><strong>Company:</strong> ${job.company}</p>
                <p>${job.description}</p>
                <button onclick="approveJob(${index})">Approve</button>
                <button onclick="deleteJob(${index})">Delete</button>
            </div>
        `).join('');
    }
}

// Function to approve a job
function approveJob(index) {
    const pendingJobs = JSON.parse(localStorage.getItem('pendingJobs'));
    const approvedJob = pendingJobs.splice(index, 1)[0];
    
    const jobs = JSON.parse(localStorage.getItem('jobs'));
    jobs.push(approvedJob);
    
    localStorage.setItem('pendingJobs', JSON.stringify(pendingJobs));
    localStorage.setItem('jobs', JSON.stringify(jobs));
    
    displayPendingJobs();
}

// Function to delete a job
function deleteJob(index) {
    const pendingJobs = JSON.parse(localStorage.getItem('pendingJobs'));
    pendingJobs.splice(index, 1);
    localStorage.setItem('pendingJobs', JSON.stringify(pendingJobs));
    displayPendingJobs();
}

// Function to display job details on application page
function displayJobDetails() {
    const jobDetails = document.getElementById('job-details');
    if (jobDetails) {
        const urlParams = new URLSearchParams(window.location.search);
        const jobId = urlParams.get('id');
        const jobs = JSON.parse(localStorage.getItem('jobs'));
        const job = jobs[jobId];
        
        jobDetails.innerHTML = `
            <h3>${job.title}</h3>
            <p><strong>Company:</strong> ${job.company}</p>
            <p>${job.description}</p>
        `;
    }
}
// Function to convert file to base64
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

// Function to handle job application submission
async function submitApplication(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const resumeFile = document.getElementById('resume').files[0];
    const urlParams = new URLSearchParams(window.location.search);
    const jobId = urlParams.get('id');

    if (!resumeFile) {
        alert('Please upload a resume');
        return;
    }

    try {
        const resumeBase64 = await fileToBase64(resumeFile);
        
        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        applications.push({ 
            name, 
            email, 
            resume: resumeBase64, 
            jobId,
            status: 'pending'
        });
        localStorage.setItem('applications', JSON.stringify(applications));

        alert('Application submitted successfully');
        event.target.reset();
    } catch (error) {
        console.error('Error processing file:', error);
        alert('Error submitting application. Please try again.');
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    displayJobs();
    displayPendingJobs();
    displayJobDetails();
    displayJobApplications();

    const jobForm = document.getElementById('job-form');
    if (jobForm) {
        jobForm.addEventListener('submit', submitJob);
    }

    const applicationForm = document.getElementById('application-form');
    if (applicationForm) {
        applicationForm.addEventListener('submit', submitApplication);
    }
});
    // Initialize local storage for applications
if (!localStorage.getItem('applications')) {
    localStorage.setItem('applications', JSON.stringify([]));
}

// Function to handle job application submission
function submitApplication(event) {
    event.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const resume = document.getElementById('resume').value;
    const jobId = new URLSearchParams(window.location.search).get('id');
    
    const applications = JSON.parse(localStorage.getItem('applications'));
    applications.push({ name, email, resume, jobId });
    localStorage.setItem('applications', JSON.stringify(applications));
    
    alert('Application submitted successfully');
    event.target.reset();
}

// Function to display job applications in admin panel
function displayJobApplications() {
    const applicationsDiv = document.getElementById('job-applications');
    if (applicationsDiv) {
        const applications = JSON.parse(localStorage.getItem('applications') || '[]');
        const jobs = JSON.parse(localStorage.getItem('jobs') || '[]');

        applicationsDiv.innerHTML = applications.map((app, index) => {
            const job = jobs[app.jobId];
            return `
                <div class="application ${app.status}">
                    <h4>${job ? job.title : 'Unknown Job'} - ${job ? job.company : 'Unknown Company'}</h4>
                    <p><strong>Applicant:</strong> ${app.name}</p>
                    <p><strong>Email:</strong> ${app.email}</p>
                    <p><strong>Status:</strong> ${app.status}</p>
                    <p><strong>Resume:</strong> <a href="${app.resume}" target="_blank">View Resume</a></p>
                    ${app.status === 'pending' ? `
                        <button onclick="updateApplicationStatus(${index}, 'accepted')" class="btn btn-success">Accept</button>
                        <button onclick="updateApplicationStatus(${index}, 'declined')" class="btn btn-danger">Decline</button>
                    ` : ''}
                </div>
            `;
        }).join('');
    }
}

// Function to update application status
function updateApplicationStatus(index, status) {
    const applications = JSON.parse(localStorage.getItem('applications'));
    applications[index].status = status;
    localStorage.setItem('applications', JSON.stringify(applications));
    displayJobApplications();
}
// Make updateApplicationStatus function global
window.updateApplicationStatus = function(index, status) {
    const applications = JSON.parse(localStorage.getItem('applications'));
    applications[index].status = status;
    localStorage.setItem('applications', JSON.stringify(applications));
    displayJobApplications();
}

// Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    displayJobs();
    displayPendingJobs();
    displayJobDetails();
    displayJobApplications();
    
    const jobForm = document.getElementById('job-form');
    if (jobForm) {
        jobForm.addEventListener('submit', submitJob);
    }
    
    const applicationForm = document.getElementById('application-form');
    if (applicationForm) {
        applicationForm.addEventListener('submit', submitApplication);
    }
});
document.addEventListener('DOMContentLoaded', () => {
    displayJobApplications();
});
// ... (keep existing initialization code)

// Function to display job listings
function displayJobs() {
    const jobList = document.getElementById('job-list');
    if (jobList) {
        const jobs = JSON.parse(localStorage.getItem('jobs'));
        jobList.innerHTML = jobs.map((job, index) => `
            <div class="job-card">
                <h3>${job.title}</h3>
                <p><strong>Company:</strong> ${job.company}</p>
                <p>${job.description}</p>
                <a href="apply.html?id=${index}" class="btn">Apply Now</a>
            </div>
        `).join('');
    }
}

// Function to display job applications in admin panel
function displayJobApplications() {
    const applicationsDiv = document.getElementById('job-applications');
    if (applicationsDiv) {
        const applications = JSON.parse(localStorage.getItem('applications'));
        const jobs = JSON.parse(localStorage.getItem('jobs'));

        applicationsDiv.innerHTML = applications.map((app, index) => {
            const job = jobs[app.jobId];
            return `
                <div class="application ${app.status || 'pending'}">
                    <h4>${job ? job.title : 'Unknown Job'} - ${job ? job.company : 'Unknown Company'}</h4>
                    <p><strong>Applicant:</strong> ${app.name}</p>
                    <p><strong>Email:</strong> ${app.email}</p>
                    <p><strong>Status:</strong> ${app.status || 'Pending'}</p>
                    ${app.status ? '' : `
                        <button onclick="updateApplicationStatus(${index}, 'accepted')" class="btn">Accept</button>
                        <button onclick="updateApplicationStatus(${index}, 'declined')" class="btn">Decline</button>
                    `}
                </div>
            `;
        }).join('');
    }
}

// ... (keep other existing functions)

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    displayJobs();
    displayJobApplications();
    displayPendingJobs();

    const jobForm = document.getElementById('job-form');
    if (jobForm) {
        jobForm.addEventListener('submit', submitJob);
    }

    const applicationForm = document.getElementById('application-form');
    if (applicationForm) {
        applicationForm.addEventListener('submit', submitApplication);
    }
});