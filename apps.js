// app.js - Export and Display Functions for Budget Timeline Visualization

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', function() {
    initializeControls();
});

function initializeControls() {
    // Add control buttons after visualization loads
    const checkVisualization = setInterval(() => {
        const viz = document.getElementById('visualization');
        if (!viz.classList.contains('u-hidden')) {
            clearInterval(checkVisualization);
            addControlButtons();
        }
    }, 500);
}

function addControlButtons() {
    // Create controls container
    const controlsHTML = `
        <div class="export-controls">
            <button onclick="exportToPNG()" class="export-btn">
                <span class="btn-icon">📷</span> Export as PNG
            </button>
            <button onclick="exportToPDF()" class="export-btn">
                <span class="btn-icon">📄</span> Export as PDF
            </button>
            <button onclick="window.print()" class="export-btn">
                <span class="btn-icon">🖨️</span> Print
            </button>
            <button onclick="openFullscreen()" class="export-btn">
                <span class="btn-icon">⛶</span> View Fullscreen
            </button>
        </div>
    `;
    
    // Insert controls before the graph
    const graph = document.querySelector('.graph');
    if (graph) {
        graph.insertAdjacentHTML('beforebegin', controlsHTML);
    }
}

// Export to PNG using html2canvas
async function exportToPNG() {
    showExportMessage('Generating PNG...');
    
    try {
        // Load html2canvas from CDN if not already loaded
        if (typeof html2canvas === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        }
        
        const element = document.querySelector('.container');
        
        // Temporarily hide controls for export
        const controls = document.querySelector('.export-controls');
        if (controls) controls.style.display = 'none';
        
        const canvas = await html2canvas(element, {
            backgroundColor: '#37373d',
            scale: 2, // Higher quality
            logging: false,
            useCORS: true
        });
        
        // Restore controls
        if (controls) controls.style.display = 'flex';
        
        // Convert to blob and download
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            const timestamp = new Date().toISOString().split('T')[0];
            link.download = `budget-timeline-${timestamp}.png`;
            link.href = url;
            link.click();
            URL.revokeObjectURL(url);
            showExportMessage('PNG exported successfully!', 'success');
        });
        
    } catch (error) {
        console.error('PNG export error:', error);
        showExportMessage('Error exporting PNG. Please try again.', 'error');
    }
}

// Export to PDF using jsPDF and html2canvas
async function exportToPDF() {
    showExportMessage('Generating PDF...');
    
    try {
        // Load required libraries from CDN if not already loaded
        if (typeof html2canvas === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js');
        }
        if (typeof jspdf === 'undefined') {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        }
        
        const element = document.querySelector('.container');
        
        // Temporarily hide controls for export
        const controls = document.querySelector('.export-controls');
        if (controls) controls.style.display = 'none';
        
        const canvas = await html2canvas(element, {
            backgroundColor: '#37373d',
            scale: 2,
            logging: false,
            useCORS: true
        });
        
        // Restore controls
        if (controls) controls.style.display = 'flex';
        
        const imgData = canvas.toDataURL('image/png');
        
        // Create PDF
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        
        const timestamp = new Date().toISOString().split('T')[0];
        pdf.save(`budget-timeline-${timestamp}.pdf`);
        
        showExportMessage('PDF exported successfully!', 'success');
        
    } catch (error) {
        console.error('PDF export error:', error);
        showExportMessage('Error exporting PDF. Please try again.', 'error');
    }
}

// Open visualization in fullscreen window
function openFullscreen() {
    const width = window.screen.width * 0.9;
    const height = window.screen.height * 0.9;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    
    const fullscreenWindow = window.open(
        '',
        'Budget Timeline Fullscreen',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
    
    if (fullscreenWindow) {
        // Get current page HTML
        const currentHTML = document.documentElement.outerHTML;
        
        // Modify HTML for fullscreen (remove controls, adjust styling)
        const fullscreenHTML = currentHTML.replace(
            '<div class="export-controls">',
            '<div class="export-controls" style="display:none;">'
        );
        
        fullscreenWindow.document.write(fullscreenHTML);
        fullscreenWindow.document.close();
        
        // Add a close button to the fullscreen window
        setTimeout(() => {
            const closeBtn = fullscreenWindow.document.createElement('button');
            closeBtn.innerHTML = '✕ Close';
            closeBtn.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 10px 20px;
                background: #d47371;
                color: white;
                border: none;
                border-radius: 4px;
                font-family: 'Gotham-Medium', sans-serif;
                font-size: 1rem;
                cursor: pointer;
                z-index: 10000;
                box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            `;
            closeBtn.onclick = () => fullscreenWindow.close();
            fullscreenWindow.document.body.appendChild(closeBtn);
        }, 500);
    } else {
        alert('Please allow pop-ups to view in fullscreen mode.');
    }
}

// Show export status message
function showExportMessage(message, type = 'info') {
    // Remove existing message if any
    const existingMsg = document.querySelector('.export-message');
    if (existingMsg) existingMsg.remove();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `export-message export-message--${type}`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        messageDiv.style.opacity = '0';
        setTimeout(() => messageDiv.remove(), 300);
    }, 3000);
}

// Utility function to load external scripts dynamically
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Print-specific adjustments
window.addEventListener('beforeprint', function() {
    // Hide controls when printing
    const controls = document.querySelector('.export-controls');
    if (controls) controls.style.display = 'none';
    
    // Ensure all tooltips are hidden
    const tooltips = document.querySelectorAll('.tooltip, .tooltip-xaxis');
    tooltips.forEach(t => t.style.display = 'none');
});

window.addEventListener('afterprint', function() {
    // Restore controls after printing
    const controls = document.querySelector('.export-controls');
    if (controls) controls.style.display = 'flex';
});
