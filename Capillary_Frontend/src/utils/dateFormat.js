export const formatDateToDDMMYY = (inputDate) => {
  const date = new Date(inputDate); // Convert the input to a Date object

  const day = date.getDate(); // Get day
  const month = date.toLocaleString("en-US", { month: "short" }); // Get abbreviated month (e.g., "Mar")
  const year = date.getFullYear(); // Get full year

  return `${day} ${month} ${year}`;
};
