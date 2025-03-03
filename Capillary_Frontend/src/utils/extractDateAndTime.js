export const extractDateAndTime = (inputDate) => {
  const date = new Date(inputDate); // Convert the input to a Date object

  const day = date.getDate(); // Get day
  const month = date.toLocaleString("en-US", { month: "short" }); // Get abbreviated month (e.g., "Feb")
  const year = date.getFullYear(); // Get full year

  const hours = date.getHours().toString().padStart(2, "0"); // Get hours (24-hour format)
  const minutes = date.getMinutes().toString().padStart(2, "0"); // Get minutes
  const seconds = date.getSeconds().toString().padStart(2, "0"); // Get seconds

  return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
};
