/**
 * Simplified Vietnamese Lunar Calendar conversion logic
 * Based on the algorithm by Ho Ngoc Duc
 */

const LunarCalendar = (() => {
    // A simplified table for lunar months and years around 2026
    // Format: [Year, LeapMonth, MonthData]
    // MonthData is a bitmask where 1 is 30 days, 0 is 29 days
    const LUNAR_DATA = {
        2025: [0, 0x152A], // 2025: No leap, ...
        2026: [0, 0x1255], // 2026: No leap, ...
        2027: [6, 0x0A95]  // 2027: Leap month 6
    };

    // For the purpose of this demo, we'll use a more direct mapping for 2026
    // 2026 Lunar New Year starts on Feb 17, 2026 (Solar)
    const LUNAR_NEW_YEAR_2026 = new Date(2026, 1, 17); // Month is 0-indexed

    // Solar to Lunar conversion for 2026
    function getLunarDate(day, month, year) {
        // Special case for Jan/Feb 2026 which might belong to Lunar 2025
        const date = new Date(year, month - 1, day);
        
        // This is a simplified mockup of the lunar calculation
        // In a real app, we'd use the full Ho Ngoc Duc algorithm
        // Here we approximate for 2026
        
        if (year === 2026) {
            // Feb 17, 2026 is 1/1 Lunar 2026
            const diffTime = date - LUNAR_NEW_YEAR_2026;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) {
                // Before Lunar New Year 2026 (belongs to Lunar 2025)
                // Jan 1, 2026 is 12/12/2025 Lunar
                // Approx mapping
                return { day: day + 11, month: month === 1 ? 11 : 12, year: 2025 };
            }

            // Simple month lengths for 2026 (approximate for display)
            const monthLengths = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];
            let currentDiff = diffDays;
            let m = 0;
            while (currentDiff >= monthLengths[m]) {
                currentDiff -= monthLengths[m];
                m++;
            }
            return { day: currentDiff + 1, month: m + 1, year: 2026 };
        }
        
        return { day: day, month: month, year: year }; // Fallback
    }

    return { getLunarDate };
})();
