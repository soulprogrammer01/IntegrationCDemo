// Sample data for the integrations table
const integrations = [
    { name: 'Certify', vendor: 'Certify', vendorColor: '#6366f1', category: 'Expense Ma...', spend: '$0', status: 'synced', lastSync: '01/11/2026 0...', usage: 100 },
    { name: 'Docusign', vendor: 'DocuSign', vendorColor: '#f59e0b', category: 'E-Signature ...', spend: '$6,347', status: 'synced', lastSync: '01/11/2026 0...', usage: 60 },
    { name: 'Gong', vendor: 'Gong.io', vendorColor: '#22c55e', category: 'Conversation...', spend: '$0', status: 'synced', lastSync: '01/11/2026 0...', usage: 100 },
    { name: 'Jira Cloud', vendor: 'Praecipio C...', vendorColor: '#a855f7', category: '', spend: '$49,676', status: 'synced', lastSync: '01/11/2026 0...', usage: 100 },
    { name: 'Miro (formerly Realtim...', vendor: 'Miro', vendorColor: '#3b82f6', category: 'Collaborative...', spend: '$18,300', status: 'synced', lastSync: '01/11/2026 0...', usage: 100 },
    { name: 'Salesforce-IN', vendor: 'Salesforce', vendorColor: '#22c55e', category: 'CRM Software', spend: '$0', status: 'synced', lastSync: '01/11/2026 0...', usage: 100 },
    { name: 'Salesforce-US', vendor: 'Salesforce', vendorColor: '#22c55e', category: 'CRM Software', spend: '$0', status: 'synced', lastSync: '01/11/2026 0...', usage: 100 },
    { name: 'TeamViewer', vendor: 'TeamViewer', vendorColor: '#0ea5e9', category: 'Remote Desk...', spend: '$0', status: 'synced', lastSync: '01/11/2026 0...', usage: 100 },
    { name: 'Confluence Cloud', vendor: 'Atlassian', vendorColor: '#a855f7', category: '', spend: '$4,676', status: 'synced', lastSync: '01/11/2026 0...', usage: 55 }
];

// DOM Elements
const tableBody = document.getElementById('tableBody');
const addIntegrationBtn = document.getElementById('addIntegrationBtn');
const modalOverlay = document.getElementById('modalOverlay');
const closeModalBtn = document.getElementById('closeModal');
const prevStepBtn = document.getElementById('prevStepBtn');
const nextStepBtn = document.getElementById('nextStepBtn');

// State
let currentStep = 1;
const totalSteps = 5;
let aiBuilderCompleted = false;
let dryTestCompleted = false;

// Initialize table
function initTable() {
    tableBody.innerHTML = integrations.map(integration => createTableRow(integration)).join('');
}

// Create a table row for an integration
function createTableRow(integration) {
    const getStatusDisplay = (status) => {
        switch (status) {
            case 'synced': return 'Synced';
            case 'failed': return 'FAILED ⚠';
            case 'not-connected': return 'Not Connected';
            default: return status;
        }
    };

    const getActionButton = (status) => {
        if (status === 'not-connected') {
            return '<button class="action-btn connect">Connect</button>';
        }
        return '<button class="action-btn sync">Sync Now</button>';
    };

    return `
        <tr>
            <td><a href="#" class="app-name">${integration.name}</a></td>
            <td>
                <div class="vendor-cell">
                    <div class="vendor-logo" style="background: ${integration.vendorColor}">
                        ${integration.vendor.charAt(0)}
                    </div>
                    <span class="vendor-name">${integration.vendor}</span>
                </div>
            </td>
            <td>${integration.category}</td>
            <td>${integration.spend}</td>
            <td>
                <span class="status-badge ${integration.status}">
                    ${getStatusDisplay(integration.status)}
                </span>
            </td>
            <td>${integration.lastSync}</td>
            <td>
                <div class="usage-bar-container">
                    <div class="usage-bar">
                        <div class="usage-fill ${getUsageClass(integration.usage)}" style="width: ${integration.usage}%"></div>
                    </div>
                </div>
            </td>
            <td>
                <div class="actions-cell">
                    ${getActionButton(integration.status)}
                    <button class="more-actions">
                        <span class="material-icons-outlined">more_vert</span>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Add new integration to top of table
function addNewIntegrationToTable() {
    const integrationName = document.getElementById('integrationName').value || 'Customer-Internal-CRM';

    // Generate a random color for the vendor logo
    const colors = ['#6366f1', '#f59e0b', '#22c55e', '#a855f7', '#3b82f6', '#0ea5e9', '#ec4899', '#14b8a6'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    // Create new integration object
    const newIntegration = {
        name: integrationName,
        vendor: integrationName.split(' ')[0], // Use first word as vendor
        vendorColor: randomColor,
        category: 'Custom Integration',
        spend: '$0',
        status: 'not-connected',
        lastSync: '-',
        usage: 0
    };

    // Add to beginning of integrations array
    integrations.unshift(newIntegration);

    // Create new row HTML
    const newRowHTML = createTableRow(newIntegration);

    // Insert at top of table with animation
    tableBody.insertAdjacentHTML('afterbegin', newRowHTML);

    // Add highlight animation to new row
    const newRow = tableBody.querySelector('tr:first-child');
    newRow.classList.add('new-row-highlight');

    // Update app count
    const appCountEl = document.querySelector('.app-count');
    const currentCount = parseInt(appCountEl.textContent) || 235;
    appCountEl.textContent = `${currentCount + 1} Applications`;

    // Remove highlight after animation
    setTimeout(() => {
        newRow.classList.remove('new-row-highlight');
    }, 3000);
}

function getUsageClass(usage) {
    if (usage <= 25) return 'low';
    if (usage <= 50) return 'medium';
    if (usage <= 75) return 'high';
    return 'full';
}

// Modal functions
function openModal() {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    currentStep = 1;
    aiBuilderCompleted = false;
    dryTestCompleted = false;
    updateStepUI();
}

function closeModal() {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    resetModal();
}

function resetModal() {
    currentStep = 1;
    updateStepUI();

    // Reset AI builder steps
    document.querySelectorAll('.ai-step').forEach(step => {
        step.classList.remove('active', 'completed');
        step.querySelector('.progress-fill').style.width = '0';
        const statusIcon = step.querySelector('.ai-step-status .material-icons-outlined');
        statusIcon.className = 'material-icons-outlined status-pending';
        statusIcon.textContent = 'hourglass_empty';
    });

    // Hide manifest preview
    document.getElementById('manifestPreview').style.display = 'none';

    // Hide dry run section
    document.getElementById('dryRunSection').style.display = 'none';

    // Reset audit status
    const auditStatus = document.getElementById('auditStatus');
    auditStatus.innerHTML = `
        <div class="audit-waiting">
            <div class="audit-spinner"></div>
            <span>Waiting for Backend Engineer Review</span>
        </div>
    `;

    // Reset form values
    document.getElementById('integrationName').value = '';
    document.getElementById('apiUrl').value = '';
    document.getElementById('testApiKey').value = '';
    document.getElementById('testBaseUrl').value = '';
}

function updateStepUI() {
    // Update step indicators
    document.querySelectorAll('.step-indicator .step').forEach((step, index) => {
        const stepNum = index + 1;
        step.classList.remove('active', 'completed');
        if (stepNum === currentStep) {
            step.classList.add('active');
        } else if (stepNum < currentStep) {
            step.classList.add('completed');
        }
    });

    // Update step lines
    document.querySelectorAll('.step-line').forEach((line, index) => {
        line.classList.toggle('completed', index < currentStep - 1);
    });

    // Update step content
    document.querySelectorAll('.step-content').forEach(content => {
        content.classList.remove('active');
    });
    document.querySelector(`.step-content[data-step="${currentStep}"]`).classList.add('active');

    // Update buttons
    prevStepBtn.style.display = currentStep > 1 ? 'block' : 'none';

    if (currentStep === totalSteps) {
        nextStepBtn.textContent = 'Done';
    } else if (currentStep === 3) {
        nextStepBtn.textContent = 'Run Dry Test';
    } else if (currentStep === 4) {
        nextStepBtn.textContent = 'Simulate Approval';
    } else {
        nextStepBtn.textContent = 'Continue';
    }
}

function goToNextStep() {
    if (currentStep === 2) {
        if (!aiBuilderCompleted) {
            // Run AI Builder animation
            runAIBuilderAnimation();
            return;
        }
        // If already completed, just advance
    }

    if (currentStep === 3) {
        if (!dryTestCompleted) {
            // Run dry test
            runDryTest();
            return;
        }
        // If already completed, just advance
    }

    if (currentStep === 4) {
        // Simulate audit approval
        simulateAuditApproval();
        return;
    }

    if (currentStep === totalSteps) {
        // Add the new integration to the table before closing
        addNewIntegrationToTable();
        closeModal();
        return;
    }

    currentStep++;
    updateStepUI();
}

function goToPrevStep() {
    if (currentStep > 1) {
        currentStep--;
        updateStepUI();
    }
}

// AI Builder Animation
async function runAIBuilderAnimation() {
    nextStepBtn.disabled = true;
    prevStepBtn.disabled = true;

    const steps = [
        { id: 'aiAnalyze', duration: 2000, message: 'Detected OAuth2 (Authorization Code Flow), REST API with JSON responses' },
        { id: 'aiGenerate', duration: 2500, message: 'Generated authentication handlers, endpoint mappings, and capability configs' },
        { id: 'aiValidate', duration: 1500, message: 'Schema validation passed, no security issues detected' }
    ];

    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        const element = document.getElementById(step.id);
        const progressFill = element.querySelector('.progress-fill');
        const statusIcon = element.querySelector('.ai-step-status .material-icons-outlined');

        // Set to active
        element.classList.add('active');
        statusIcon.className = 'material-icons-outlined status-active';
        statusIcon.textContent = 'sync';

        // Animate progress bar
        await animateProgress(progressFill, step.duration);

        // Mark as completed
        element.classList.remove('active');
        element.classList.add('completed');
        statusIcon.className = 'material-icons-outlined status-complete';
        statusIcon.textContent = 'check_circle';

        await sleep(300);
    }

    // Show manifest preview
    const manifestPreview = document.getElementById('manifestPreview');
    const manifestCode = document.getElementById('manifestCode');
    const integrationName = document.getElementById('integrationName').value || 'Customer-Internal-CRM';

    manifestCode.textContent = JSON.stringify({
        "name": integrationName,
        "version": "1.0.0",
        "auth": {
            "type": "oauth2",
            "flow": "authorization_code",
            "authorization_url": "/oauth/authorize",
            "token_url": "/oauth/token",
            "scopes": ["users:read", "licenses:read"]
        },
        "capabilities": {
            "user_management": {
                "endpoints": {
                    "list_users": "GET /api/v1/users",
                    "get_user": "GET /api/v1/users/{id}"
                },
                "pagination": "cursor"
            },
            "license_tracking": {
                "endpoints": {
                    "list_licenses": "GET /api/v1/licenses"
                }
            }
        }
    }, null, 2);

    manifestPreview.style.display = 'block';

    // Scroll to show the manifest preview
    const modalBody = document.querySelector('.modal-body');
    if (modalBody) {
        modalBody.scrollTop = modalBody.scrollHeight;
    }

    nextStepBtn.disabled = false;
    prevStepBtn.disabled = false;
    nextStepBtn.textContent = 'Continue';
    aiBuilderCompleted = true;
}

function animateProgress(element, duration) {
    return new Promise(resolve => {
        let progress = 0;
        const interval = 50;
        const increment = (100 / duration) * interval;

        const timer = setInterval(() => {
            progress += increment;
            if (progress >= 100) {
                progress = 100;
                clearInterval(timer);
                resolve();
            }
            element.style.width = progress + '%';
        }, interval);
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Dry Test
async function runDryTest() {
    nextStepBtn.disabled = true;
    nextStepBtn.innerHTML = '<span class="material-icons-outlined" style="font-size: 18px; animation: spin 1s linear infinite;">sync</span> Running...';

    await sleep(2000);

    const dryRunSection = document.getElementById('dryRunSection');
    const dryRunResults = document.getElementById('dryRunResults');

    // Sample users for demo
    const sampleUsers = [
        { name: 'Alice Johnson', email: 'alice.johnson@company.com', initials: 'AJ' },
        { name: 'Bob Smith', email: 'bob.smith@company.com', initials: 'BS' },
        { name: 'Carol Williams', email: 'carol.williams@company.com', initials: 'CW' },
        { name: 'David Brown', email: 'david.brown@company.com', initials: 'DB' },
        { name: 'Eva Martinez', email: 'eva.martinez@company.com', initials: 'EM' }
    ];

    dryRunResults.innerHTML = `
        <div style="margin-bottom: 12px; padding: 12px; background: rgba(34, 197, 94, 0.1); border-radius: 8px; display: flex; align-items: center; gap: 8px;">
            <span class="material-icons-outlined" style="color: #22c55e;">check_circle</span>
            <span style="color: #22c55e; font-weight: 500;">Successfully fetched 5 users from API</span>
        </div>
        ${sampleUsers.map(user => `
            <div class="user-card">
                <div class="user-avatar">${user.initials}</div>
                <div class="user-info">
                    <div class="name">${user.name}</div>
                    <div class="email">${user.email}</div>
                </div>
                <span class="user-status">Active</span>
            </div>
        `).join('')}
    `;

    dryRunSection.style.display = 'block';

    // Scroll to show the results
    const modalBody = document.querySelector('.modal-body');
    if (modalBody) {
        modalBody.scrollTop = modalBody.scrollHeight;
    }

    nextStepBtn.disabled = false;
    nextStepBtn.textContent = 'Continue';
    dryTestCompleted = true;
}

// Simulate Audit Approval
async function simulateAuditApproval() {
    nextStepBtn.disabled = true;
    prevStepBtn.disabled = true;

    await sleep(2000);

    // Update pending item to approved
    const pendingItem = document.querySelector('.audit-item.pending');
    if (pendingItem) {
        pendingItem.classList.remove('pending');
        pendingItem.innerHTML = `
            <span class="material-icons-outlined check">check_circle</span>
            <span>Engineer approved: All checks passed</span>
        `;
    }

    // Update audit status
    const auditStatus = document.getElementById('auditStatus');
    auditStatus.innerHTML = `
        <div class="audit-approved">
            <span class="material-icons-outlined">verified</span>
            <span>Approved by Backend Engineer (John D.)</span>
        </div>
    `;

    await sleep(1000);

    // Update final integration name
    const finalName = document.getElementById('integrationName').value || 'Customer-Internal-CRM';
    document.getElementById('finalIntegrationName').textContent = finalName;

    nextStepBtn.disabled = false;
    prevStepBtn.disabled = false;
    currentStep++;
    updateStepUI();
}

// Event Listeners
addIntegrationBtn.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
prevStepBtn.addEventListener('click', goToPrevStep);
nextStepBtn.addEventListener('click', goToNextStep);

modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// Escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
        closeModal();
    }
});

// Capability Dropdown functionality
const capabilityDropdownBtn = document.getElementById('capabilityDropdownBtn');
const capabilityDropdownMenu = document.getElementById('capabilityDropdownMenu');
const selectedCapabilities = document.getElementById('selectedCapabilities');

const capabilityNames = {
    'user_management': 'User Management',
    'license_tracking': 'License Tracking',
    'activity_logs': 'Activity Logs'
};

// Toggle dropdown menu
capabilityDropdownBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    capabilityDropdownBtn.classList.toggle('active');
    capabilityDropdownMenu.classList.toggle('open');
});

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (!capabilityDropdownBtn.contains(e.target) && !capabilityDropdownMenu.contains(e.target)) {
        capabilityDropdownBtn.classList.remove('active');
        capabilityDropdownMenu.classList.remove('open');
    }
});

// Update tags when checkbox changes
function updateCapabilityTags() {
    const checkboxes = capabilityDropdownMenu.querySelectorAll('input[type="checkbox"]');
    const selectedValues = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => cb.value);

    selectedCapabilities.innerHTML = selectedValues.map(value => `
        <span class="capability-tag" data-value="${value}">
            ${capabilityNames[value]}
            <button type="button" class="remove-tag">&times;</button>
        </span>
    `).join('');

    // Add event listeners to remove buttons
    selectedCapabilities.querySelectorAll('.remove-tag').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const tag = e.target.closest('.capability-tag');
            const value = tag.dataset.value;
            // Uncheck the corresponding checkbox
            const checkbox = capabilityDropdownMenu.querySelector(`input[value="${value}"]`);
            if (checkbox) {
                checkbox.checked = false;
            }
            updateCapabilityTags();
        });
    });
}

// Listen for checkbox changes
capabilityDropdownMenu.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', updateCapabilityTags);
});

// Initialize remove tag listeners on page load
document.querySelectorAll('.remove-tag').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tag = e.target.closest('.capability-tag');
        const value = tag.dataset.value;
        const checkbox = capabilityDropdownMenu.querySelector(`input[value="${value}"]`);
        if (checkbox) {
            checkbox.checked = false;
        }
        updateCapabilityTags();
    });
});

// Initialize
initTable();
