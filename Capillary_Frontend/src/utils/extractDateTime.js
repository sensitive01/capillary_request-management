export const extractDateTime = (isoString) => {
    if (!isoString) return { date: "-", time: "-" };
  
    const dateObj = new Date(isoString);
    const date = dateObj.toISOString().split("T")[0]; 
    const time = dateObj.toTimeString().split(" ")[0]; 
  
    return { date, time };
  };
  