const fs = require("fs");

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {

    function toSeconds(timeStr) {
        let [time, period] = timeStr.trim().split(" ");
        let [h, m, s] = time.split(":").map(Number);

        if (period === "pm" && h !== 12) h += 12;
        if (period === "am" && h === 12) h = 0;

        return h * 3600 + m * 60 + s;
    }

    let start = toSeconds(startTime);
    let end = toSeconds(endTime);

    if (end < start) {
        end += 24 * 3600;  
    }

    let diff = end - start;

    let h = Math.floor(diff / 3600);
    let m = Math.floor((diff % 3600) / 60);
    let s = diff % 60;

    m = String(m).padStart(2, "0");
    s = String(s).padStart(2, "0");

    return `${h}:${m}:${s}`;

   // TODO: Implement this function 
}


// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
    
    function toSeconds(timeStr) {
        let [time, period] = timeStr.trim().split(" ");
        let [h, m, s] = time.split(":").map(Number);

        if (period === "pm" && h !== 12) h += 12;
        if (period === "am" && h === 12) h = 0;

        return h * 3600 + m * 60 + s;
    }

    let start = toSeconds(startTime);
    let end = toSeconds(endTime);

    const deliveryStart = 8 * 3600;
    const deliveryEnd = 22 * 3600;

    let idle = 0;

    if (start < deliveryStart) {
        idle += deliveryStart - start;
    }

    if (end > deliveryEnd) {
        idle += end - deliveryEnd;
    }

    if (start >= deliveryStart && end <= deliveryEnd) {
        idle = 0;
    }

    let h = Math.floor(idle / 3600);
    let m = Math.floor((idle % 3600) / 60);
    let s = idle % 60;

    m = String(m).padStart(2, "0");
    s = String(s).padStart(2, "0");

    return `${h}:${m}:${s}`;


    // TODO: Implement this function
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {

    function toSeconds(timeStr) {
        let [h, m, s] = timeStr.split(":").map(Number);
        return h * 3600 + m * 60 + s;
    }

    let shift = toSeconds(shiftDuration);
    let idle = toSeconds(idleTime);

    let active = shift - idle;

    let h = Math.floor(active / 3600);
    let m = Math.floor((active % 3600) / 60);
    let s = active % 60;

    m = String(m).padStart(2, "0");
    s = String(s).padStart(2, "0");

    return `${h}:${m}:${s}`;

    // TODO: Implement this function
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
   
    function toSeconds(timeStr) {
        let [h, m, s] = timeStr.split(":").map(Number);
        return h * 3600 + m * 60 + s;
    }

    let active = toSeconds(activeTime);

    let quota;

    if (date >= "2025-04-10" && date <= "2025-04-30") {
        quota = 6 * 3600; // 6 hours
    } else {
        quota = (8 * 3600) + (24 * 60); // 8:24:00
    }

    return active >= quota;

    // TODO: Implement this function
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    

    const fs = require("fs");

    let data = fs.readFileSync(textFile, "utf8").trim();
    let lines = data ? data.split("\n") : [];

    // check duplicate
    for (let line of lines) {
        let parts = line.split(",");
        if (parts[0] === shiftObj.driverID && parts[2] === shiftObj.date) {
            return {};
        }
    }

    let shiftDuration = getShiftDuration(shiftObj.startTime, shiftObj.endTime);
    let idleTime = getIdleTime(shiftObj.startTime, shiftObj.endTime);
    let activeTime = getActiveTime(shiftDuration, idleTime);
    let met = metQuota(shiftObj.date, activeTime);

    let newRecord = {
        driverID: shiftObj.driverID,
        driverName: shiftObj.driverName,
        date: shiftObj.date,
        startTime: shiftObj.startTime,
        endTime: shiftObj.endTime,
        shiftDuration: shiftDuration,
        idleTime: idleTime,
        activeTime: activeTime,
        metQuota: met,
        hasBonus: false
    };

    let newLine = [
        newRecord.driverID,
        newRecord.driverName,
        newRecord.date,
        newRecord.startTime,
        newRecord.endTime,
        newRecord.shiftDuration,
        newRecord.idleTime,
        newRecord.activeTime,
        newRecord.metQuota,
        newRecord.hasBonus
    ].join(",");

    fs.appendFileSync(textFile, "\n" + newLine);

    return newRecord;

    // TODO: Implement this function
} 

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    
    const fs = require("fs");

    let data = fs.readFileSync(textFile, "utf8").trim();
    let lines = data.split("\n");

    for (let i = 0; i < lines.length; i++) {
        let parts = lines[i].split(",");

        if (parts[0] === driverID && parts[2] === date) {
            parts[9] = newValue; // hasBonus column
            lines[i] = parts.join(",");
        }
    }

    fs.writeFileSync(textFile, lines.join("\n"));
}
    // TODO: Implement this function


// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
  
    const fs = require("fs");

    let data = fs.readFileSync(textFile, "utf8").trim();
    let lines = data.split("\n");

    let count = 0;
    let driverExists = false;

    let targetMonth = parseInt(month);

    for (let line of lines) {
        let parts = line.split(",");

        if (parts[0] === driverID) {
            driverExists = true;

            let recordMonth = parseInt(parts[2].split("-")[1]);

            if (recordMonth === targetMonth && parts[9] === "true") {
                count++;
            }
        }
    }

    if (!driverExists) {
        return -1;
    }

    return count;
}
    // TODO: Implement this function


// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {



    const fs = require("fs");

    let data = fs.readFileSync(textFile, "utf8").trim();
    let lines = data.split("\n");

    let totalSeconds = 0;

    for (let line of lines) {
        let parts = line.split(",");

        if (parts[0] === driverID) {
            let recordMonth = parseInt(parts[2].split("-")[1]);

            if (recordMonth === month) {

                let [h, m, s] = parts[7].split(":").map(Number);
                totalSeconds += h * 3600 + m * 60 + s;

            }
        }
    }

    let h = Math.floor(totalSeconds / 3600);
    let m = Math.floor((totalSeconds % 3600) / 60);
    let s = totalSeconds % 60;

    m = String(m).padStart(2, "0");
    s = String(s).padStart(2, "0");

    return `${h}:${m}:${s}`;
}
    // TODO: Implement this function


// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    
    const fs = require("fs");

    let shiftData = fs.readFileSync(textFile, "utf8").trim().split("\n");
    let rateData = fs.readFileSync(rateFile, "utf8").trim().split("\n");

    let dayOff = "";

    for (let line of rateData) {
        let parts = line.split(",");
        if (parts[0] === driverID) {
            dayOff = parts[1];
        }
    }

    let totalSeconds = 0;

    for (let line of shiftData) {
        let parts = line.split(",");

        if (parts[0] === driverID) {

            let recordMonth = parseInt(parts[2].split("-")[1]);

            if (recordMonth === month) {

                let date = new Date(parts[2]);
                let dayName = date.toLocaleDateString("en-US", { weekday: "long" });

                if (dayName === dayOff) continue;

                if (parts[2] >= "2025-04-10" && parts[2] <= "2025-04-30") {
                    totalSeconds += 6 * 3600;
                } else {
                    totalSeconds += (8 * 3600) + (24 * 60);
                }
            }
        }
    }

    totalSeconds -= bonusCount * 2 * 3600;

    let h = Math.floor(totalSeconds / 3600);
    let m = Math.floor((totalSeconds % 3600) / 60);
    let s = totalSeconds % 60;

    m = String(m).padStart(2, "0");
    s = String(s).padStart(2, "0");

    return `${h}:${m}:${s}`;
}
    // TODO: Implement this function


// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
   
    
}
    // TODO: Implement this function


module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
