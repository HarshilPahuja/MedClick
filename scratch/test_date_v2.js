const today = "2026-05-13";
const timeStr = "15:30:45";
const dateStr = `${today}T${timeStr}`;
console.log("Date string:", dateStr);
const date = new Date(dateStr);
console.log("Date object:", date.toString());
console.log("Is invalid:", isNaN(date.getTime()));

const timeStr2 = "15:30";
const dateStr2 = `${today}T${timeStr2}:00`;
console.log("Date string 2:", dateStr2);
const date2 = new Date(dateStr2);
console.log("Date object 2:", date2.toString());
console.log("Is invalid 2:", isNaN(date2.getTime()));
