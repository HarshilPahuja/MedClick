import { useState, useEffect } from "react";

export default function Hero() {
  const [greeting, setGreeting] = useState("");
  const [hour, setHour] = useState(new Date().getHours());

  useEffect(() => {
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, [hour]); 

  // Update hour every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setHour(new Date().getHours());
    }, 60000); // every minute
    return () => clearInterval(interval);
  }, []);

  return( <>
        <h1 className="text-3xl text-red-600">Please keep at least 6 hours between two doses of the same medicine.</h1>
        <h2 className="text-2xl text-red-600">All medications listed below are either due now or scheduled soon. If they are shown, you may take them.</h2>

        <h1>{greeting}!👋</h1>
        <h3>Let's keep track of your medications today.</h3>

  </>
  );
}
