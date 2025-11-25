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
        <h1>{greeting}!👋</h1>
        <h3>Let's keep track of your medications today.</h3>

  </>
  );
}
