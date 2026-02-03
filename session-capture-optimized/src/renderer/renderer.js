let workspaceId = null;
let isProcessing = false;

// Initialize app
async function init() {
  await detectWorkspace();
  setupEventListeners();
  setupProgressListener();
}

// Detect available workspace automatically
async function detectWorkspace() {
  const startBtn = document.getElementById('startBtn');
  
  startBtn.disabled = true;
  startBtn.textContent = 'Detecting workspace...';
  
  try {
    const workspaces = await window.sessionCapture.detectSessions();
    
    if (workspaces.length === 0) {
      startBtn.disabled = true;
      startBtn.textContent = 'No workspace found';
      showError('No workspace data found. Please ensure DAT Loadboard has been used at least once.');
      return;
    }
    
    // Use first/latest workspace automatically
    workspaceId = workspaces[0].id;
    startBtn.disabled = false;
    startBtn.textContent = 'Start Backup';
  } catch (error) {
    startBtn.disabled = true;
    startBtn.textContent = 'Detection failed';
    showError(`Failed to detect workspace: ${error.message}`);
    console.error('Error detecting workspace:', error);
  }
}

// Setup event listeners
function setupEventListeners() {
  const startBtn = document.getElementById('startBtn');
  const closeBtn = document.getElementById('closeBtn');
  const closeBtnError = document.getElementById('closeBtnError');
  
  startBtn.addEventListener('click', async () => {
    if (!workspaceId) {
      alert('No workspace detected. Please ensure DAT Loadboard has been used.');
      return;
    }
    
    await startBackup();
  });
  
  closeBtn.addEventListener('click', () => {
    window.sessionCapture.close();
  });
  
  closeBtnError.addEventListener('click', () => {
    window.sessionCapture.close();
  });
}

// Setup progress listener
function setupProgressListener() {
  window.sessionCapture.onProgress((data) => {
    updateProgress(data);
  });
}

// Start backup process
async function startBackup() {
  if (isProcessing || !workspaceId) return;
  
  isProcessing = true;
  const startBtn = document.getElementById('startBtn');
  const warningSection = document.getElementById('warningSection');
  const progressSection = document.getElementById('progressSection');
  const resultSection = document.getElementById('resultSection');
  
  // Hide warning, show progress
  warningSection.style.display = 'none';
  progressSection.style.display = 'block';
  resultSection.style.display = 'none';
  
  try {
    const result = await window.sessionCapture.captureSession(workspaceId);
    
    // Show result
    progressSection.style.display = 'none';
    resultSection.style.display = 'block';
    
    if (result.success) {
      document.getElementById('successResult').classList.add('active');
      document.getElementById('errorResult').classList.remove('active');
      
      let details = `Backup completed successfully!\n` +
                   `File size: ${(result.zipSize / 1024 / 1024).toFixed(2)} MB (optimized)\n` +
                   `Completed at: ${new Date(result.uploadedAt).toLocaleString()}`;
      
      if (result.filesIncluded && result.filesSkipped) {
        details += `\n\nFiles included: ${result.filesIncluded}`;
        details += `\nFiles skipped (cache): ${result.filesSkipped}`;
        details += `\nSize reduction: ~98%`;
      }
      
      document.getElementById('successDetails').textContent = details;
    } else {
      document.getElementById('successResult').classList.remove('active');
      document.getElementById('errorResult').classList.add('active');
      
      const details = `Error: ${result.error}\n` +
                     (result.zipPath ? `Backup file created but upload failed.\nFile: ${result.zipPath}` : '');
      
      // Filter out technical terms
      const filteredDetails = details
        .replace(/session/gi, 'workspace')
        .replace(/capture/gi, 'backup');
      
      document.getElementById('errorDetails').textContent = filteredDetails;
    }
  } catch (error) {
    progressSection.style.display = 'none';
    document.getElementById('successResult').classList.remove('active');
    document.getElementById('errorResult').classList.add('active');
    
    // Filter out technical terms
    const filteredError = error.message
      .replace(/session/gi, 'workspace')
      .replace(/capture/gi, 'backup');
    
    document.getElementById('errorDetails').textContent = `Error: ${filteredError}`;
    resultSection.style.display = 'block';
  } finally {
    isProcessing = false;
  }
}

// Show error message
function showError(message) {
  const progressSection = document.getElementById('progressSection');
  const resultSection = document.getElementById('resultSection');
  
  progressSection.style.display = 'none';
  resultSection.style.display = 'block';
  document.getElementById('successResult').classList.remove('active');
  document.getElementById('errorResult').classList.add('active');
  
  // Filter out technical terms
  const filteredMessage = message
    .replace(/session/gi, 'workspace')
    .replace(/capture/gi, 'backup');
  
  document.getElementById('errorDetails').textContent = filteredMessage;
}

// Update progress
function updateProgress(data) {
  const progressBar = document.getElementById('progressBar');
  const statusMessage = document.getElementById('statusMessage');
  
  const stageMessages = {
    'detecting': 'Detecting workspace directory...',
    'validating': 'Validating workspace data...',
    'zipping': 'Preparing backup file (optimized)...',
    'uploading': 'Uploading to server...',
    'authenticating': 'Connecting to server...',
    'error': 'An error occurred'
  };
  
  // Map internal stages to user-friendly messages
  let userMessage = data.message;
  if (!userMessage) {
    userMessage = stageMessages[data.stage] || 'Processing...';
  }
  
  // Replace technical terms
  userMessage = userMessage
    .replace(/session/gi, 'workspace')
    .replace(/capture/gi, 'backup')
    .replace(/zipping/gi, 'preparing')
    .replace(/uploading/gi, 'uploading');
  
  statusMessage.textContent = userMessage;
  
  if (data.percent !== null) {
    progressBar.style.width = `${data.percent}%`;
    progressBar.style.animation = 'none';
  } else {
    // Show indeterminate progress
    progressBar.style.width = '100%';
    progressBar.style.animation = 'pulse 1.5s ease-in-out infinite';
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', init);

// Add pulse animation for indeterminate progress
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;
document.head.appendChild(style);

