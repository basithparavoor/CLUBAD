// ==========================================
// CLUBAD - GLOBAL CORE ENGINE & UTILITIES
// ==========================================

/**
 * 1. SYSTEM INITIALIZATION
 * Ensures all required database keys exist in localStorage on first load.
 * Prevents "null" array errors across the application.
 */
function initializeSystem() {
    const defaultKeys = {
        "customers": [],
        "services": [],
        "orders": [],
        "settings": {
            name: "ClubAd Travels & Online Services",
            currency: "₹"
        }
    };

    Object.keys(defaultKeys).forEach(key => {
        if (!localStorage.getItem(key)) {
            localStorage.setItem(key, JSON.stringify(defaultKeys[key]));
            console.log(`[ClubAd DB] Initialized missing key: ${key}`);
        }
    });
}

/**
 * 2. GLOBAL UTILITIES
 * Safe currency formatter used across reports and summaries.
 */
function formatCurrency(amount) {
    let settings = JSON.parse(localStorage.getItem("settings")) || {};
    let symbol = settings.currency || "₹";
    let safeAmount = parseFloat(amount) || 0;
    return symbol + safeAmount.toFixed(2);
}

/**
 * 3. DATABASE BACKUP SYSTEM
 * Bundles all independent localStorage keys into a single JSON file for download.
 */
function exportDatabase() {
    try {
        let dbSnapshot = {
            customers: JSON.parse(localStorage.getItem("customers")) || [],
            services: JSON.parse(localStorage.getItem("services")) || [],
            orders: JSON.parse(localStorage.getItem("orders")) || [],
            settings: JSON.parse(localStorage.getItem("settings")) || {},
            meta: {
                exportedAt: new Date().toISOString(),
                version: "1.0.0"
            }
        };

        let blob = new Blob([JSON.stringify(dbSnapshot, null, 2)], { type: "application/json" });
        let url = URL.createObjectURL(blob);

        let a = document.createElement("a");
        a.href = url;
        let dateStr = new Date().toISOString().split('T')[0];
        a.download = `ClubAd_Backup_${dateStr}.json`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        alert("Database Backup Downloaded Successfully!");
    } catch (error) {
        console.error("Backup Failed:", error);
        alert("Failed to export database. Check console for details.");
    }
}

/**
 * 4. DATABASE RESTORE SYSTEM
 * Allows the user to upload a previous .json backup to restore their system.
 * (You can trigger this by adding a file input in settings.html if desired)
 */
function importDatabase(event) {
    let file = event.target.files[0];
    if (!file) return;

    let reader = new FileReader();
    reader.onload = function(e) {
        try {
            let data = JSON.parse(e.target.result);

            // Validate that this is actually a ClubAd backup file
            if(data.customers !== undefined && data.orders !== undefined) {
                
                if(confirm("WARNING: This will overwrite your current database. Proceed?")) {
                    localStorage.setItem("customers", JSON.stringify(data.customers || []));
                    localStorage.setItem("services", JSON.stringify(data.services || []));
                    localStorage.setItem("orders", JSON.stringify(data.orders || []));
                    localStorage.setItem("settings", JSON.stringify(data.settings || {}));

                    alert("Database Restored Successfully! The page will now reload.");
                    window.location.reload();
                }
            } else {
                alert("Invalid Backup File format.");
            }
        } catch (error) {
            console.error("Restore Failed:", error);
            alert("Failed to read the backup file. It might be corrupted.");
        }
    };
    reader.readAsText(file);
}

// ==========================================
// AUTO-RUN ON PAGE LOAD
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    initializeSystem();
    console.log("ClubAd Global System Ready. All DB keys verified.");
});