const today = "2026-05-13";
const timeStr = "15:30:45";
const dateStr = `${today}T${timeStr}:00`;
console.log("Date string:", dateStr);
const date = new Date(dateStr);
console.log("Date object:", date.toString());
console.log("Is invalid:", isNaN(date.getTime()));
